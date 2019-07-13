// @ts-ignore
import {Detector} from './build/Release/darknet.node';
import {readFileSync} from 'fs';

export interface IBufferImage {
    b: Buffer,
    w: number,
    h: number,
    c: number
}

export interface IDarknetConfig {
    weights: string;
    config: string;
    names?: string[];
    namefile?: string;
    processes?: number;
}

export interface IConfig {
    thresh?: number;
    hier_thresh?: number;
    nms?: number;
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
        classes: number
    ): Detector;

    detectImagePath(
        path: string,
        thresh: number,
        heir: number,
        nms: number
    ): Detection[];
}

export class Darknet {

    private detector: Detector;
    private names: string[];

    constructor(config: IDarknetConfig) {
        if (!config) throw new Error("A config file is required");
        if (!config.names && !config.namefile) throw new Error("Config must include detection class names");
        if (!config.names && config.namefile) config.names = readFileSync(config.namefile, 'utf8').split('\n').filter(x => !!x);
        if (!config.names) throw new Error("No names detected.");
        if (!config.config) throw new Error("Config must include location to yolo config file");
        if (!config.weights) throw new Error("config must include the path to trained weights");

        this.names = config.names;

        this.detector = new Detector(
            config.weights,
            config.config,
            config.names.join('\n')
        );
    }

    detect(path: string, config: IConfig = {}): Detection[] {
        const thresh = (config.thresh !== undefined) ? config.thresh : 0.5;
        const hier = (config.hier_thresh !== undefined) ? config.hier_thresh : 0.5;
        const nms = (config.nms !== undefined) ? config.nms : 0.5;

        return this.detector.detectImagePath(path, thresh, hier, nms)
    }

}
