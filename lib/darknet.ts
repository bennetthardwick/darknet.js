// @ts-ignore
import {Detector} from './build/Release/darknet.node';
import {readFileSync} from 'fs';

export interface IBufferImage {
    b: Buffer,
    w: number,
    h: number,
    c: number
}

export interface IOpenCVFrame {
    channels: number;
    cols: number;
    rows: number;
    getData: () => Buffer;
}

function isIOpenCVFrame(input: any): input is IOpenCVFrame {
    return (
        'channels' in input &&
        'cols' in input &&
        'rows' in input &&
        'getData' in input &&
        typeof input.channels === 'number' &&
        typeof input.cols === 'number' &&
        typeof input.rows === 'number' &&
        typeof input.getData === 'function'
    );
}

function isIBufferImage(input: any): input is IBufferImage {
    return (
        'b' in input &&
        'w' in input &&
        'h' in input &&
        'c' in input &&
        typeof input.b === 'number' &&
        typeof input.w === 'number' &&
        typeof input.h === 'number' &&
        input.buffer instanceof Buffer
    );
}

interface IDarknetImage {
    w: number;
    h: number;
    c: number;
    buffer: Uint8Array;
}

export interface IDarknetConfig {
    weights: string;
    config: string;
    names?: string[];
    namefile?: string;
    processes?: number;
    batch?: boolean;
}

export interface IConfig {
    thresh?: number;
    hier_thresh?: number;
    nms?: number;
    relative?: boolean;
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

interface Detector {
    new(
        weights: string,
        config: string,
        classes: number,
        batch: boolean
    ): Detector;

    detectImagePath(
        path: string,
        thresh: number,
        heir: number,
        nms: number,
        rel: number
    ): Detection[];

    detectImageBuffer(
        buffer: ArrayBuffer,
        w: number,
        h: number,
        c: number,
        thresh: number,
        heir: number,
        nms: number,
        rel: number
    ): Detection[];
}

export class Darknet {

    private detector: Detector;

    constructor(config: IDarknetConfig) {
        if (!config) throw new Error("A config file is required");
        if (!config.names && !config.namefile) throw new Error("Config must include detection class names");
        if (!config.names && config.namefile) config.names = readFileSync(config.namefile, 'utf8').split('\n').filter(x => !!x);
        if (!config.names) throw new Error("No names detected.");
        if (!config.config) throw new Error("Config must include location to yolo config file");
        if (!config.weights) throw new Error("config must include the path to trained weights");

        this.detector = new Detector(
            config.weights,
            config.config,
            config.names.join('\n'),
            config.batch ? 1 : 0
        );
    }

    private rgbBufferToDarknet(buffer: Buffer, w: number, h: number, c: number): Float32Array {
        const imageElements = w * h * c;
        const floatBuff = new Float32Array(imageElements);
        const step = w * c;

        let i: number, k: number, j: number;
        for (i = 0; i < h; ++i) {
            for (k = 0; k < c; ++k) {
                for (j = 0; j < w; ++j) {
                    floatBuff[k * w * h + i * w + j] = buffer[i * step + j * c + k] / 255;
                }
            }
        }

        return floatBuff;
    }

    private formatIBufferImage(image: IBufferImage): IDarknetImage {
        const {b, w, h, c} = image;
        const floatBuff = this.rgbBufferToDarknet(b, w, h, c);

        return {
            w, h, c,
            buffer: new Uint8Array(
                floatBuff.buffer,
                0,
                floatBuff.length * Float32Array.BYTES_PER_ELEMENT
            )
        }
    }

    detect(input: string | IBufferImage | IOpenCVFrame, config: IConfig = {}): Detection[] {
        const thresh = (config.thresh !== undefined) ? config.thresh : 0.5;
        const hier = (config.hier_thresh !== undefined) ? config.hier_thresh : 0.5;
        const nms = (config.nms !== undefined) ? config.nms : 0.5;
        const rel = config.relative ? 1 : 0;

        if (typeof input === 'string') {
            return this.detector.detectImagePath(input, thresh, hier, nms, rel)
        } else {
            let image: IDarknetImage | undefined;
            if (isIBufferImage(input)) {
                image = this.formatIBufferImage(input);
            } else if (isIOpenCVFrame(input)) {
                const buffer = input.getData();

                if (buffer instanceof Buffer) {
                    image = this.formatIBufferImage({
                        w: input.cols,
                        h: input.rows,
                        c: input.channels,
                        b: buffer
                    });
                } else {
                    throw new Error('getData did not return buffer!');
                }
            }

            if (image) {
                const {buffer, w, h, c} = image;
                return this.detector.detectImageBuffer(buffer, w, h, c, thresh, hier, nms, rel);

            } else {
                throw new Error('Could not get valid image from input!');
            }
        }

    }

}
