# Darknet.JS
A Node wrapper of pjreddie's open source neural network framework Darknet, using the Foreign Function Interface Library. Read: YOLOv3 in JavaScript.

## Prerequisites
- Linux, Windows (Linux sub-system), Mac (probably)
- Node (most versions will work, darknet.js <=1.1.5 only works on node <=8.11.2)
- Build tools (make, gcc, etc.)

## Installation
Super easy, just install it with npm:
```
npm install darknet
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
console.log(darknet.detect('/image/of/a/dog/.jpg'));
```

### Example configuration
You can download pre-trained weights and configuration from pjreddie's website. The latest version (yolov3-tiny) is linked below: 
- [weights](https://pjreddie.com/media/files/yolov3-tiny.weights)
- [config](https://github.com/pjreddie/darknet/blob/master/cfg/yolov3-tiny.cfg)
- [names](https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names)

If you don't want to download that stuff manually, navigate to the `examples` directory and issue the `./example` command. This will download the necessary files and run some detections.

### Async
By default, darknet.js will run the detections synchronously. If this isn't your style, you can run detections asynchronously, using the `detectAsync` method.
```typescript
darknet.detectAsync('/image/of/a/dog/.jpg')
    .then(detections => console.log(detections));
```
Unfortunately only Promises are supported at this time, but support for callbacks will be coming soon.

## Activating Turbo Mode
If you want to use CUDA, you'll have to enable it yourself. To do this, navigate to the directory where darknet.js is installed (`node_modules/darknet`), and edit the makefile inside the darknet repo, `darknet/Makefile` to say `GPU=1`. With this enabled, issue the command `make && cp libdarknet* ..` to compile darknet library and copy it to the root of darknet.js. After doing this, Darknet.js should work with your CUDA enabled GPU.

## Built-With
- [Node FFI](https://github.com/node-ffi/node-ffi)
- [Ref](https://github.com/TooTallNate/ref)
- [Darknet](https://github.com/pjreddie/darknet)
