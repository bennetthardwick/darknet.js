import * as ffi from 'ffi';
import * as ref from 'ref';
import * as Struct from 'ref-struct';
import { readFileSync } from 'fs';

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

const library = __dirname + "/libdarknet";

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
        if (!config.names && !config.namefile) throw new Error("Config must include detection class names");
        if (!config.names && config.namefile) config.names = readFileSync(config.namefile, 'utf8').split('\n');
        if (!config.names) throw new Error("No names detected.");
        if (!config.config) throw new Error("Config must include location to yolo config file");
        if (!config.weights) throw new Error("config must include the path to trained weights");

        this.names = config.names.filter(a => a.split("").length > 0);

        this.meta = new METADATA;
        this.meta.classes = this.names.length;
        this.meta.names = this.names.join('\n');

        this.darknet = ffi.Library(library, {
            'float_to_image': [ IMAGE, [ 'int', 'int', 'int', float_pointer ]],
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
            let det = ref.get(ref.reinterpret(buffer, 48, i * DETECTION.size), 0, DETECTION);
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

    private _detectSync(net: any, meta: any, image: any, thresh?: number, hier_thresh?: number, nms?: number): Detection[] {
        if (!thresh) thresh = 0.5;
        if (!hier_thresh) hier_thresh = 0.5;
        if (!nms) nms = 0.45;

        this.darknet.network_predict_image(net, image);

        let pnum = ref.alloc('int');

        let dets = this.darknet.get_network_boxes(net, image.w, image.h, thresh, hier_thresh, ref.NULL_POINTER, 0, pnum);
        let num = (pnum as any).deref();
        this.darknet.do_nms_obj(dets, num, meta.classes, nms);

        let detections = this.bufferToDetections(dets, num);

        this.darknet.free_detections(dets, num);

        return detections;
    }

    private async _detectAsync(net: any, meta: any, image: any, thresh?: number, hier_thresh?: number, nms?: number): Promise<Detection[]> {

        await new Promise((res, rej) =>
            this.darknet.network_predict_image.async(net, image, (e: any) => e ? rej(e) : res())
        );
        let pnum = ref.alloc('int');

        const dets = await new Promise<Buffer>((res, rej) =>
            this.darknet.get_network_boxes.async(
                net,
                image.w, image.h,
                thresh, hier_thresh,
                ref.NULL_POINTER, 0, pnum,
                (err: any, dets: any) => err ? rej(err) : res(dets))
        );
        const num = (pnum as any).deref();

        await new Promise((res, rej) =>
            this.darknet.do_nms_obj.async(
                dets, num, meta.classes, nms,
                (e: any) => e ? rej(e) : res()
            )
        );

        const detections = this.bufferToDetections(dets, num);
        this.darknet.free_detections(dets, num);
        return detections;
    }

    /**
     * Synchronously detect objects in an image.
     * @param image the destination of the image to be detected
     * @param config optional configuration (threshold, etc.)
     */
    detect(image: string | IBufferImage, config?: IConfig) {
        if (!config) config = {};

        const darkNetLoadedImage = typeof image === 'string';

        const imageData = typeof image === 'string' ?
            this.getImageFromPath(image) :
            this.RGBBufferToImage(image.b, image.w, image.h, image.c);

        const detection = this._detectSync(this.net, this.meta, imageData, config.thresh, config.hier_thresh, config.nms);

        if (darkNetLoadedImage) {
            // memory is owned by the darknet lib
            this.darknet.free_image(imageData);
        } else {
            // memory is owned by JS and will GC eventually
        }
        return detection;
    }

    /**
     * Get a Darknet Image from path
     * @param path
     * @returns IMAGE
     */
    getImageFromPath(path: string) {
        return this.darknet.load_image_color(path, 0, 0);
    }

    /**
     * Get a Darknet Image async from path
     * @param path
     * @returns Promise<IMAGE>
     */
    async getImageFromPathAsync(path: String) {
        return new Promise((res, rej) =>
            this.darknet.load_image_color.async(
                path, 0, 0,
                (e: any, image: any) => e ? rej(e) : res(image)
            )
        );
    }

    /**
     * convert darknet image to rgb buffer
     * @param {IMAGE} image
     * @returns {Buffer}
     */
    imageToRGBBuffer(image: any) {
        const w = image.w;
        const h = image.h;
        const c = image.c;

        const imageElements = w * h * c;

        const imageData = new Float32Array(
            image.data.reinterpret(imageElements * Float32Array.BYTES_PER_ELEMENT, 0).buffer,
            0,
            imageElements
        );

        const rgbBuffer = Buffer.allocUnsafe(imageData.length);

        const step = c * w;
        let i, k, j;

        for (i = 0; i < h; ++i) {
            for (k = 0; k < c; ++k) {
                for (j = 0; j < w; ++j) {
                    rgbBuffer[i * step + j * c + k] = imageData[k * w * h + i * w + j] * 255;
                }
            }
        }

        return rgbBuffer;
    }

    private rgbToDarknet(buffer: Buffer, w: number, h: number, c: number): Float32Array {
        const imageElements = w * h * c;
        const floatBuff = new Float32Array(imageElements);
        const step = w * c;

        let i, k, j;

        for (i = 0; i < h; ++i) {
            for (k = 0; k < c; ++k) {
                for (j = 0; j < w; ++j) {
                    floatBuff[k * w * h + i * w + j] = buffer[i * step + j * c + k] / 255;
                }
            }
        }

        return floatBuff;
    }

    /**
     * Transform an RGB buffer to a darknet encoded image
     * @param buffer - rgb buffer
     * @param w - width
     * @param h - height
     * @param c - channels
     * @returns {IMAGE}
     */
    RGBBufferToImage(buffer: Buffer, w: number, h: number, c: number) {
        const floatBuff = this.rgbToDarknet(buffer, w, h, c);

        return this.darknet.float_to_image(
            w, h, c,
            new Uint8Array(
                floatBuff.buffer,
                0,
                floatBuff.length * Float32Array.BYTES_PER_ELEMENT
            )
        );
    }

    /**
     * Transform an RGB buffer to a darknet encoded image
     * @param buffer - rgb buffer
     * @param w - width
     * @param h - height
     * @param c - channels
     * @returns {Promise<IMAGE>}
     */
    async RGBBufferToImageAsync(buffer: Buffer, w: number, h: number, c: number): Promise<any> {
        const floatBuff = this.rgbToDarknet(buffer, w, h, c);

        return new Promise((res, rej) => this.darknet.float_to_image.async(
            w, h, c,
            new Uint8Array(
                floatBuff.buffer,
                0,
                floatBuff.length * Float32Array.BYTES_PER_ELEMENT
            ),
            (e: any, image: any) => e ? rej(e) : res(image)
        ));
    }

    /**
     * Asynchronously detect objects in an image.
     * @param image
     * @param config
     * @returns A promise
     */
    async detectAsync(image: string | IBufferImage, config?: IConfig): Promise<Detection[]> {
        if (!config) config = {};
        let thresh = (config.thresh) ? config.thresh : 0.5;
        let hier_thresh = (config.hier_thresh) ? config.hier_thresh : 0.5;
        let nms = (config.nms) ? config.nms : 0.5;

        const darkNetLoadedImage = typeof image === 'string';

        const imageData = typeof image === 'string' ?
            await this.getImageFromPathAsync(image) :
            await this.RGBBufferToImageAsync(image.b, image.w, image.h, image.c);

        const detection = await this._detectAsync(this.net, this.meta, imageData, thresh, hier_thresh, nms);

        if (darkNetLoadedImage) {
            // memory is owned by the darknet lib
            await new Promise((res, rej) =>
                this.darknet.free_image.async(imageData, (e: any) => e ? rej(e) : res())
            );
        } else {
            // memory is owned by JS and will GC eventually
        }
        return detection;
    }

}

export interface IConfig {
    thresh?: number;
    hier_thresh?: number;
    nms?: number;
}

export interface IBufferImage {
    b: Buffer,
    w: number,
    h: number,
    c: number
}

export type IClasses = string[]

export interface IDarknetConfig {
    weights: string;
    config: string;
    names?: string[];
    namefile?: string;
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
