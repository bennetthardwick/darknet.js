# Darknet.JS

A Node wrapper of pjreddie's open source neural network framework Darknet, using the Foreign Function Interface Library. Read: YOLOv3 in JavaScript.

## Prerequisites

- Linux, Mac, Windows (Linux sub-system),
- Node
- Build tools (make, gcc, etc.)

## Examples

To run the examples, run the following commands:

```sh
# Clone the repositorys
git clone https://github.com/bennetthardwick/darknet.js.git darknet && cd darknet
# Install dependencies and build Darknet
npm install
# Compile Darknet.js library
npx tsc
# Run examples
./examples/example
```

Note: The example weights are quite large, the download might take some time

## Installation

You can install darknet with npm using the following command:

```
npm install darknet
```

If you'd like to enable CUDA and/or CUDANN, export the flags `DARKNET_BUILD_WITH_GPU=1` for CUDA, and `DARKNET_BUILD_WITH_CUDNN=1` for CUDANN, and rebuild:

```
export DARKNET_BUILD_WITH_GPU=1
export DARKNET_BUILD_WITH_CUDNN=1
npm rebuild darknet
```

You can enable OpenMP by also exporting the flag `DARKNET_BUILD_WITH_OPENMP=1`;

You can also build for a different architecture by using the `DARKNET_BUILD_WITH_ARCH` flag.

## Usage

To create an instance of darknet.js, you need a three things. The trained weights, the configuration file they were trained with and a list of the names of all the classes.

```typescript
import { Darknet } from "darknet";

// Init
let darknet = new Darknet({
  weights: "./cats.weights",
  config: "./cats.cfg",
  names: ["dog", "cat"],
});

// Detect
console.log(darknet.detect("/image/of/a/dog.jpg"));
```

In conjuction with [opencv4nodejs](https://github.com/justadudewhohacks/opencv4nodejs), Darknet.js can also be used to detect objects inside videos.

```javascript
const fs = require("fs");
const cv = require("opencv4nodejs");
const { Darknet } = require("darknet");

const darknet = new Darknet({
  weights: "yolov3.weights",
  config: "cfg/yolov3.cfg",
  namefile: "data/coco.names",
});

const cap = new cv.VideoCapture("video.mp4");

let frame;
let index = 0;
do {
  frame = cap.read().cvtColor(cv.COLOR_BGR2RGB);
  console.log(darknet.detect(frame));
} while (!frame.empty);
```

### Example Configuration

You can download pre-trained weights and configuration from pjreddie's website. The latest version (yolov3-tiny) is linked below:

- [weights](https://pjreddie.com/media/files/yolov3-tiny.weights)
- [config](https://github.com/pjreddie/darknet/blob/master/cfg/yolov3-tiny.cfg)
- [names](https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names)

If you don't want to download that stuff manually, navigate to the `examples` directory and issue the `./example` command. This will download the necessary files and run some detections.

## Built-With

- [Darknet](https://github.com/pjreddie/darknet)
