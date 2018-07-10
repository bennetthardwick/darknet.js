const { Darknet, DarknetExperimental } = require('../darknet');
const path = require('path');

const config = {
    weights: path.resolve(__dirname + '/../examples/yolov3-tiny.weights'),
    config: path.resolve(__dirname + '/../examples/yolov3-tiny.cfg'),
    namefile: path.resolve(__dirname + '/../examples/coco.names')
};

const DOG_RESULT = 
[ 
    { 
        name: 'car',
        prob: 0.6152912378311157,
        box: 
        { 
            x: 572.1994018554688,
            y: 120.48184204101562,
            w: 214.3546600341797,
            h: 98.72494506835938 
        } 
    },
    { 
        name: 'bicycle',
        prob: 0.5850223302841187,
        box: 
        {
            x: 390.94427490234375,
            y: 300.541259765625,
            w: 369.40216064453125,
            h: 299.3248291015625 
        } 
    },
    { name: 'dog',
        prob: 0.5707316994667053,
        box: 
        { 
            x: 249.094970703125,
            y: 352.12335205078125,
            w: 239.8490753173828,
            h: 330.763671875 
        } 
    }
];

const EAGLE_RESULT =
[ 
    { 
        name: 'bird',
        prob: 0.7649939656257629,
        box: 
        { 
            x: 379.6971130371094,
            y: 260.68951416015625,
            w: 486.4349365234375,
            h: 322.6314392089844 
        } 
    } 
];

const GIRAFFE_RESULT =
[ 
    { 
        name: 'zebra',
        prob: 0.5318787097930908,
        box: 
        { 
            x: 359.7569885253906,
            y: 326.3610534667969,
            w: 109.50553894042969,
            h: 242.93246459960938 
        } 
    },
    { 
        name: 'giraffe',
        prob: 0.528597891330719,
        box: 
        { 
            x: 296.3047180175781,
            y: 210.2434844970703,
            w: 285.6275329589844,
            h: 504.72705078125 
        } 
    } 
];

describe('darknet', () => {

    let darknet;

    it('detects various images', () => {
        darknet = new Darknet(config);
        const dog = darknet.detect(image('dog.jpg'));
        expect(JSON.stringify(dog)).toBe(JSON.stringify(DOG_RESULT));
        const eagle = darknet.detect(image('eagle.jpg'));
        expect(JSON.stringify(eagle)).toBe(JSON.stringify(EAGLE_RESULT));
        const giraffe = darknet.detect(image('giraffe.jpg'));
        expect(JSON.stringify(giraffe)).toBe(JSON.stringify(GIRAFFE_RESULT));
    });

    it('detects various images async (concurrent)', async () => {
        darknet_a = new Darknet(config);
        darknet_b = new Darknet(config);
        darknet_c = new Darknet(config);

        return Promise.all([
            darknet_a.detectAsync(image('dog.jpg')),
            darknet_b.detectAsync(image('eagle.jpg')),
            darknet_c.detectAsync(image('giraffe.jpg'))
        ]).then(values => {
                expect(JSON.stringify(values[0])).toBe(JSON.stringify(DOG_RESULT));
                expect(JSON.stringify(values[1])).toBe(JSON.stringify(EAGLE_RESULT));
                expect(JSON.stringify(values[2])).toBe(JSON.stringify(GIRAFFE_RESULT));
            });
    });

    describe('experimental', () => {
        it('detects images async', async () => {
            darknet = new DarknetExperimental(config);
            return Promise.all([
                darknet.detectAsync(image('dog.jpg')),
                darknet.detectAsync(image('eagle.jpg')),
                darknet.detectAsync(image('giraffe.jpg'))
            ]).then(values => {
                expect(JSON.stringify(values[0])).toBe(JSON.stringify(DOG_RESULT));
                expect(JSON.stringify(values[1])).toBe(JSON.stringify(EAGLE_RESULT));
                expect(JSON.stringify(values[2])).toBe(JSON.stringify(GIRAFFE_RESULT));
            });
        });

    })

});

function image(location) {
    return path.resolve(__dirname + '/../examples/' + location);
}