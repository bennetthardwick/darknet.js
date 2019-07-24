#include <darknet.h>
#include <napi.h>

using namespace std;

class Detector : public Napi::ObjectWrap<Detector> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  Detector(const Napi::CallbackInfo &info);

private:
  char *weights;
  char *config;
  vector<string> names;

  int classes;

  network *net;

  Napi::Array detectImageInternal(
      Napi::Env env,
      image image,
      float thresh,
      float heir,
      float nms
  );

  static Napi::FunctionReference constructor;
  Napi::Value
  detectImageBuffer(const Napi::CallbackInfo &info); // wrapped add function
  Napi::Value
  detectImagePath(const Napi::CallbackInfo &info); // wrapped add function
};
