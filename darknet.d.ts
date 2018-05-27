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
    private getArrayFromBuffer(buffer, length, type);
    private bufferToDetections(buffer, length);
    private _detectSync(net, meta, image, thresh?, hier_thresh?, nms?);
    /**
     * Synchronously detect objects in an image.
     * @param image the destination of the image to be detected
     * @param config optional configuration (threshold, etc.)
     */
    detect(image: string, config?: IConfig): Detection[];
    /**
     * Asynchronously detect objects in an image.
     * @param image
     * @param config
     * @returns A promise
     */
    detectAsync(image: string, config?: IConfig): Promise<Detection[]>;
}
export interface IConfig {
    thresh?: number;
    hier_thresh?: number;
    nms?: number;
}
export declare type IClasses = string[];
export interface IDarknetConfig {
    weights: string;
    config: string;
    names: string[];
    library: string;
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
