# Darknet.JS
Just when you thought the world was beautiful, I put YOLO into JavaScript.

## Installation
To install, first clone your favourite blend of the pjreddie's [darknet](https://github.com/pjreddie/darknet) repository, and build it. Once it's built, there should be a file called `libdarknet` in the root directory. This is the file that darknet.js needs to work.

If you've built darknet, you can go ahead and install darknet.js by running:
```
npm install darknet
```

## Usage
To create an instance of darknet.js, you need a four things. The trained weights, the configuration file they were trained with, a list of the names of all the objects (in order), and the `libdarknet.so` file.

### Example
```typescript
import { Darknet } from 'darknet';

// Init
let darknet = new Darknet({
    weights: './cats.weights',
    config: './cats.cfg',
    names: [ 'dog', 'cat' ]
    library: './libdarknet'
});

// Detect
console.log(darknet.detect('/image/of/a/dog/.jpg'));
```
### Example configuration
You can download pre-trained weights and configuration from pjreddie's website. The latest version (yolov3-tiny) is linked below: 
- [weights](https://pjreddie.com/media/files/yolov3-tiny.weights)
- [config](https://github.com/pjreddie/darknet/blob/master/cfg/yolov3-tiny.cfg)
- [names](https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names)

### Async
By default, darknet.js will run the detections synchronously. If this isn't your style, you can run detections asynchronously, using the `detectAsync` method.
```typescript
darknet.detectAsync('/image/of/a/dog/.jpg')
    .then(detections => console.log(detections));
```
Unfortunately only Promises are supported at this time, but support for callbacks will be coming soon.

## Built-With
- [Node FFI](https://github.com/node-ffi/node-ffi)
- [Ref](https://github.com/TooTallNate/ref)
- [Darknet](https://github.com/pjreddie/darknet)
