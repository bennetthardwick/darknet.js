# Darknet.JS
Just when you thought the world was beautiful, I put YOLO into JavaScript.

## Installation
Note: due to some [node ffi](https://github.com/node-ffi/node-ffi/issues/468) issues, this project only works with Node version `<=8.11.2`. If you're happy with that, go ahead and run the command: 
```
npm install darknet
```

If've cloned the repo and you want to run the examples, issue the command:
```
npm install
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

## Built-With
- [Node FFI](https://github.com/node-ffi/node-ffi)
- [Ref](https://github.com/TooTallNate/ref)
- [Darknet](https://github.com/pjreddie/darknet)
