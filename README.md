# Darknet.JS
A Node wrapper of pjreddie's open source neural network framework Darknet, using the Foreign Function Interface Library. Read: YOLOv3 in JavaScript.

## Prerequisites
- Linux, Mac, Windows (Linux sub-system),
- Node (most versions will work, darknet.js <=1.1.5 only works on node <=8.11.2)
- Build tools (make, gcc, etc.)

## Examples
To run the examples, run the following commands:
```
git clone https://github.com/bennetthardwick/darknet.js.git darknet && cd darknet
npm install
./examples/example
```
Note: The example weights are quite large, the download might take some time

## Installation
Super easy, just install it with npm:
```
npm install darknet
```
If you'd like to enable CUDA and/or CUDANN, export the flags `DARKNET_BUILD_WITH_GPU=1` for CUDA, and `DARKNET_BUILD_WITH_CUDNN=1` for CUDANN, and rebuild:
```
export DARKNET_BUILD_WITH_GPU=1
export DARKNET_BUILD_WITH_CUDNN=1
npm rebuild darknet
```

## Usage
To create an instance of darknet.js, you need a three things. The trained weights, the configuration file they were trained with and a list of the names of all the classes.
```typescript
import { Darknet } from 'darknet';

// Init
let darknet = new Darknet({
    weights: './cats.weights',
    config: './cats.cfg',
    names: [ 'dog', 'cat' ]
});

// Detect
console.log(darknet.detect('/image/of/a/dog.jpg'));
```

In conjuction with [opencv4nodejs](https://github.com/justadudewhohacks/opencv4nodejs), Darknet.js can also be used to detect objects inside videos.
```javascript
const fs = require('fs');
const cv = require('opencv4nodejs');
const { Darknet } = require('darknet');

const darknet = new Darknet({
  weights: 'yolov3.weights',
  config: 'cfg/yolov3.cfg',
  namefile: 'data/coco.names'
});

const cap = new cv.VideoCapture('video.mp4');

let frame;
let index = 0;
do {
  frame = cap.read().cvtColor(cv.COLOR_BGR2RGB);
  console.log('frame', index++); 
  console.log(darknet.detect({
    b: frame.getData(),
    w: frame.cols,
    h: frame.rows,
    c: frame.channels
  }));
} while(!frame.empty);
```

### Example Configuration
You can download pre-trained weights and configuration from pjreddie's website. The latest version (yolov3-tiny) is linked below: 
- [weights](https://pjreddie.com/media/files/yolov3-tiny.weights)
- [config](https://github.com/pjreddie/darknet/blob/master/cfg/yolov3-tiny.cfg)
- [names](https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names)

If you don't want to download that stuff manually, navigate to the `examples` directory and issue the `./example` command. This will download the necessary files and run some detections.

### Async
By default, darknet.js will run the detections synchronously. If this isn't your style, you can run detections asynchronously, using the `detectAsync` method. 
```typescript
darknet.detectAsync('/image/of/a/dog.jpg')
    .then(detections => console.log(detections));
```
At this time, async detections cannot be run in parallel and attempting to will cause your detections to be incorrect. The `DarknetExperimental` class has serial async. It is intended to eventually replace the original `Darknet` class:
```typescript
import { DarknetExperimental } from 'darknet';

const darknet = new DarknetExperimental(config);

darknet.detectAsync('/image/of/a/dog.jpg')
  .then(detections => console.log(detections));
  
darknet.detectAsync('/image/of/a/cat.jpg')
  .then(detections => console.log(detections));

darknet.detectAsync('/image/of/an/eagle.jpg')
  .then(detections => console.log(detections));
```
## Built-With
- [Node FFI](https://github.com/node-ffi/node-ffi)
- [Ref](https://github.com/TooTallNate/ref)
- [Darknet](https://github.com/pjreddie/darknet)
