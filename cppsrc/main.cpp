/* cppsrc/main.cpp */
#include <napi.h>

#include "detector.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  return Detector::Init(env, exports);
}

NODE_API_MODULE(darknet, InitAll)
