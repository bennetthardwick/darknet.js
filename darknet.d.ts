/// <reference types="node" />
export declare class Darknet {
    darknet: any;
    meta: any;
    net: any;
    names: string[];
    /**
     * A new instance of rjreddie's darknet. Create an instance as soon as possible in your app, because it takes a while to init.
     * @param config
     */
    constructor(config: IDarknetConfig);
    private getArrayFromBuffer;
    private bufferToDetections;
    private _detectSync;
    private _detectAsync;
    /**
     * Synchronously detect objects in an image.
     * @param image the destination of the image to be detected
     * @param config optional configuration (threshold, etc.)
     */
    detect(image: string | IBufferImage, config?: IConfig): Detection[];
    getImageFromPath(path: string): any;
    getImageFromPathAsync(path: String): Promise<{}>;
    imageToRGBBuffer(image: any): Buffer;
    private rgbToDarknet;
    RGBBufferToImage(buffer: Buffer, w: number, h: number, c: number): any;
    /**
     * Transform an RGB buffer to a darknet encoded image
     * @param buffer - rgb buffer
     * @param w - width
     * @param h - height
     * @param c - channels
     * @returns Promise<IMAGE>
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
