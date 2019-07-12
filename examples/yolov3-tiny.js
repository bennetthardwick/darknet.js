const { Darknet } = require('../darknet');

const darknet = new Darknet({
    weights: 'yolov3-tiny.weights',
    config: 'yolov3-tiny.cfg',
    namefile: 'coco.names'
});

darknet.detectAsync('./dog.jpg')
    .then(console.log);


setTimeout(() => {darknet.detectAsync('./dog.jpg')
    .then(console.log)}, 5000);


// console.log("Dog:", darknet.detect('./dog.jpg'));
// console.log("Eagle:", darknet.detect('./eagle.jpg'));
// console.log("Giraffe:", darknet.detect('./giraffe.jpg'));
