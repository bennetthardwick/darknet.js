/// <reference types="node" />
export declare class DarknetBase {
    darknet: any;
    meta: any;
    net: any;
    names: string[];
    /**
     * A new instance of pjreddie's darknet. Create an instance as soon as possible in your app, because it takes a while to init.
     * @param config
     */
    constructor(config: IDarknetConfig);
    private getArrayFromBuffer;
    private bufferToDetections;
    private _detectSync;
    protected _detectAsync(net: any, meta: any, image: any, thresh?: number, hier_thresh?: number, nms?: number): Promise<Detection[]>;
    /**
     * Synchronously detect objects in an image.
     * @param image the destination of the image to be detected
     * @param config optional configuration (threshold, etc.)
     */
    detect(image: string | IBufferImage, config?: IConfig): Detection[];
    /**
     * Get a Darknet Image from path
     * @param path
     * @returns IMAGE
     */
    getImageFromPath(path: string): any;
    /**
     * Get a Darknet Image async from path
     * @param path
     * @returns Promise<IMAGE>
     */
    getImageFromPathAsync(path: String): Promise<{}>;
    /**
     * convert darknet image to rgb buffer
     * @param {IMAGE} image
     * @returns {Buffer}
     */
    imageToRGBBuffer(image: any): Buffer;
    private rgbToDarknet;
    /**
     * Transform an RGB buffer to a darknet encoded image
     * @param buffer - rgb buffer
     * @param w - width
     * @param h - height
     * @param c - channels
     * @returns {IMAGE}
     */
    RGBBufferToImage(buffer: Buffer, w: number, h: number, c: number): any;
    /**
     * Transform an RGB buffer to a darknet encoded image
     * @param buffer - rgb buffer
     * @param w - width
     * @param h - height
     * @param c - channels
     * @returns {Promise<IMAGE>}
     */
    RGBBufferToImageAsync(buffer: Buffer, w: number, h: number, c: number): Promise<any>;
    /**
     * Asynchronously detect objects in an image.
     * @param image
     * @param config
     * @returns A promise
     */
    detectAsync(image: string | IBufferImage, config?: IConfig): Promise<Detection[]>;
}
export interface IConfig {
    thresh?: number;
    hier_thresh?: number;
    nms?: number;
}
export interface IBufferImage {
    b: Buffer;
    w: number;
    h: number;
    c: number;
}
export declare type IClasses = string[];
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
export { Darknet } from './detector';
export { Darknet as DarknetExperimental } from './detector';
