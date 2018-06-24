const { Darknet } = require('../darknet');

const darknet = new Darknet({
    weights: 'yolov3-tiny.weights',
    config: 'yolov3-tiny.cfg',
    namefile: 'coco.names'
});

console.log("Dog:", darknet.detect('./dog.jpg'));
console.log("Eagle:", darknet.detect('./eagle.jpg'));
console.log("Giraffe:", darknet.detect('./giraffe.jpg'));
