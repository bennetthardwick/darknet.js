#include "detector.h"
#include <darknet.h>
#include <napi.h>
#include <vector>

using namespace Napi;

FunctionReference Detector::constructor;

Object Detector::Init(Napi::Env env, Object exports) {
  HandleScope scope(env);

  Function func = DefineClass(
      env, "Detector",
      {
          InstanceMethod("detectImageBuffer", &Detector::detectImageBuffer),
          InstanceMethod("detectImagePath", &Detector::detectImagePath),
      });

  constructor = Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("Detector", func);
  return exports;
}

Detector::Detector(const CallbackInfo &info) : ObjectWrap<Detector>(info) {
  Napi::Env env = info.Env();
  HandleScope scope(env);

  int length = info.Length();

  if (length != 4 || !info[0].IsString() || !info[1].IsString() ||
      !info[2].IsString() || !info[3].IsNumber()) {
    TypeError::New(env, "Please provide correct config!")
        .ThrowAsJavaScriptException();
  }

  std::string weights = info[0].As<String>();
  std::string config = info[1].As<String>();
  std::string names = info[2].As<String>();
  float batchNetwork = info[3].ToNumber();

  std::string::size_type pos = 0;
  std::string::size_type prev = 0;
  while ((pos = names.find("\n", prev)) != std::string::npos) {
    this->names.push_back(names.substr(prev, pos - prev));
    prev = pos + 1;
  }

  // To get the last substring (or only, if delimiter is not found)
  this->names.push_back(names.substr(prev));

  this->weights = const_cast<char *>(weights.c_str());
  this->config = const_cast<char *>(config.c_str());

  this->classes = this->names.size();

  this->net = load_network(this->config, this->weights, 0);

  // if (batchNetwork) {
  //   set_batch_network(this->net, 1);
  // }

}

Value Detector::detectImagePath(const CallbackInfo &info) {
  Napi::Env env = info.Env();
  HandleScope scope(env);

  int length = info.Length();

  if (length != 5 || !info[0].IsString() || !info[1].IsNumber() ||
      !info[2].IsNumber() || !info[3].IsNumber() || !info[4].IsNumber()) {
    TypeError::New(env, "Please provide correct config!")
        .ThrowAsJavaScriptException();
  }

  float thresh = info[1].ToNumber();
  float heir = info[2].ToNumber();
  float nms = info[3].ToNumber();

  int rel = info[4].ToNumber();

  std::string location = info[0].As<String>();

  char* imageLocation = const_cast<char *>(location.c_str());

  image loadedImage = load_image_color(imageLocation, 0, 0);

  Array det = this->detectImageInternal(env, loadedImage, thresh, heir, nms, rel);

  free_image(loadedImage);

  return det;
}

Value Detector::detectImageBuffer(const CallbackInfo &info) {
  Napi::Env env = info.Env();
  HandleScope scope(env);

  int length = info.Length();

  // buffer, w, h, c, thresh, hier, nms

  if (length != 8 || !info[0].IsTypedArray() || !info[1].IsNumber() ||
      !info[2].IsNumber() || !info[3].IsNumber() || !info[4].IsNumber() ||
      !info[5].IsNumber() || !info[6].IsNumber() || !info[7].IsNumber()) {
    TypeError::New(env, "Please provide correct config!")
        .ThrowAsJavaScriptException();
  }

  TypedArray buffer = info[0].As<TypedArray>();

  float w = info[1].ToNumber();
  float h = info[2].ToNumber();
  float c = info[3].ToNumber();

  image i;
  i.h = h;
  i.w = w;
  i.c = c;
  i.data = static_cast<float *>(buffer.ArrayBuffer().Data());

  float thresh = info[4].ToNumber();
  float heir = info[5].ToNumber();
  float nms = info[6].ToNumber();
  
  int rel = info[7].ToNumber();

  Array det = this->detectImageInternal(env, i, thresh, heir, nms, rel);

  return det;
}

Array Detector::detectImageInternal(Napi::Env env, image image, float thresh,
                                    float hier, float nms, int rel) {

  int total;

  network_predict_image(this->net, image);

  detection *dets = get_network_boxes(this->net, image.w, image.h, thresh, hier,
                                      NULL, rel, &total, 0);

  if (nms > 0) {
    do_nms_obj(dets, total, this->classes, nms);
  }

  Array ret = Array::New(env);

  int current = 0;

  for (int i = 0; i < total; i++) {
    detection a = dets[i];
    float *prob = a.prob;

    for (int j = 0; j < this->classes; j++) {
      if (prob[j] > 0) {

        Object box = Object::New(env);

        box.Set("w", Number::New(env, a.bbox.w));
        box.Set("h", Number::New(env, a.bbox.h));
        box.Set("x", Number::New(env, a.bbox.x));
        box.Set("y", Number::New(env, a.bbox.y));

        Object detected = Object::New(env);
        detected.Set("box", box);
        detected.Set("prob", Number::New(env, prob[j]));
        detected.Set("name", String::New(env, this->names[j]));

        ret.Set(current++, detected);
      }
    }
  }

  free_detections(dets, total);

  return ret;
}
