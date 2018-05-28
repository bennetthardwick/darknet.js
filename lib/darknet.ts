import * as ffi from 'ffi';
import * as ref from 'ref';
import * as Struct from 'ref-struct';

const char_pointer = ref.refType('char');
const float_pointer = ref.refType('float');
const int_pointer = ref.refType('int');

const BBOX = Struct({
    'x': 'float',
    'y': 'float',
    'w': 'float',
    'h': 'float'
});

const DETECTION = Struct({
    'bbox': BBOX,
    'classes': 'int',
    'prob': float_pointer,
    'mask': float_pointer,
    'objectness': 'float',
    'sort_class': 'int'
});

const IMAGE = Struct({
    'w': 'int',
    'h': 'int',
    'c': 'int',
    'data': float_pointer
});

const METADATA = Struct({
    'classes': 'int',
    'names': 'string'
});

const detection_pointer = ref.refType(DETECTION);

const library = "./libdarknet";

export class Darknet {

    darknet: any;
    meta: any;
    net: any;

    names: string[];

    /**
     * A new instance of rjreddie's darknet. Create an instance as soon as possible in your app, because it takes a while to init.
     * @param config
     */
    constructor(config: IDarknetConfig) {

        if (!config) throw new Error("A config file is required");
        if (!config.names) throw new Error("Config must include detection class names");
        if (!config.config) throw new Error("Config must include location to yolo config file");
        if (!config.weights) throw new Error("config must include the path to trained weights");

        this.names = config.names;

        this.meta = new METADATA;
        this.meta.classes = this.names.length;
        this.meta.names = this.names.join('\n');

        this.darknet = ffi.Library(library, {
            'load_image_color': [ IMAGE, [ 'string', 'int', 'int' ]],
            'network_predict_image': [ float_pointer, [ 'pointer', IMAGE ]],
            'get_network_boxes': [ detection_pointer, [ 'pointer', 'int', 'int', 'float', 'float', int_pointer, 'int', int_pointer ]],
            'do_nms_obj': [ 'void', [ detection_pointer, 'int', 'int', 'float' ]],
            'free_image': [ 'void', [ IMAGE ]], 
            'free_detections': [ 'void', [ detection_pointer, 'int' ]],
            'load_network': [ 'pointer', [ 'string', 'string', 'int' ]],
            'get_metadata': [ METADATA, [ 'string' ]],
        });

        this.net = this.darknet.load_network(config.config, config.weights, 0);

    }

    private getArrayFromBuffer(buffer: Buffer, length: number, type: ref.Type): number[] {
        let array = [];
        for (let i = 0; i < length; i++) {
            array.push(ref.get(ref.reinterpret(buffer, type.size, i * type.size), 0, type));                        
        }
        return array;
    }

    private bufferToDetections(buffer: Buffer, length: number): Detection[] {
        let detections: Detection[] = [];
        for (let i = 0; i < length; i++) {
            let det = ref.get(ref.reinterpret(buffer, 48, i * DETECTION.size), 0, DETECTION)
            let prob = this.getArrayFromBuffer(det.prob, this.meta.classes, ref.types.float);

            for (let j = 0; j < this.meta.classes; j++) {
                if (prob[j] > 0) {
                    let b = det.bbox;
                    detections.push({ 
                        name: this.names[j], 
                        prob: prob[j], 
                        box: {
                            x: b.x,
                            y: b.y,
                            w: b.w,
                            h: b.h
                        }
                    });
                }
            }
        }
        return detections;
    }

    private _detectSync(net: any, meta: any, image: string, thresh?: number, hier_thresh?: number, nms?: number): Detection[] {
        if (!thresh) thresh = 0.5;
        if (!hier_thresh) hier_thresh = 0.5;
        if (!nms) nms = 0.45;

        let _image = this.darknet.load_image_color(image, 0, 0);

        this.darknet.network_predict_image(net, _image);
        
        let pnum = ref.alloc('int');
        
        let dets = this.darknet.get_network_boxes(net, _image.w, _image.h, thresh, hier_thresh, ref.NULL_POINTER, 0, pnum)
        let num = (pnum as any).deref();
        this.darknet.do_nms_obj(dets, num, meta.classes, nms);

        let detections = this.bufferToDetections(dets, num);

        this.darknet.free_image(_image);
        this.darknet.free_detections(dets, num);

        return detections;
    }

    /**
     * Synchronously detect objects in an image. 
     * @param image the destination of the image to be detected 
     * @param config optional configuration (threshold, etc.)
     */
    detect(image: string, config?: IConfig) {
        if (!config) config = {};
        return this._detectSync(this.net, this.meta, image, config.thresh, config.hier_thresh, config.nms);
    }

    /**
     * Asynchronously detect objects in an image.
     * @param image 
     * @param config
     * @returns A promise 
     */
    detectAsync(image: string, config?: IConfig): Promise<Detection[]> {
        if (!config) config = {};
        let thresh = (config.thresh) ? config.thresh : 0.5;
        let hier_thresh = (config.hier_thresh) ? config.hier_thresh : 0.5;
        let nms = (config.nms) ? config.nms : 0.5;

        return new Promise<Detection[]>((resolve: any, reject: any) => {
            this.darknet.load_image_color.async(image, 0, 0, (err: any, _image: any) => {
                this.darknet.network_predict_image.async(this.net, _image, () => {
                    let pnum = ref.alloc('int');
                    this.darknet.get_network_boxes.async(this.net, _image.w, _image.h, thresh, hier_thresh, ref.NULL_POINTER, 0, pnum, (err: any, dets: any) => {
                        let num = (pnum as any).deref();
                        this.darknet.do_nms_obj.async(dets, num, this.meta.classes, nms, () => {
                            let detections = this.bufferToDetections(dets, num);
                            this.darknet.free_image(_image);
                            this.darknet.free_detections(dets, num);
                            resolve(detections);
                        });
                    });
                })
            });
        })
    }

}

export interface IConfig {
    thresh?: number;
    hier_thresh?: number;
    nms?: number;
}

export type IClasses = string[]

export interface IDarknetConfig {
    weights: string;
    config: string;
    names: string[];
}

export interface Detection {
    name: string;
    prob: number;
    box: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
}
