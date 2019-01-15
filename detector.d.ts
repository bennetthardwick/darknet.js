import { IDarknetConfig, IBufferImage, Detection, IConfig, DarknetBase } from './darknet';
export declare class Darknet extends DarknetBase {
    private images$;
    private completion$;
    private detection$;
    constructor(config: IDarknetConfig);
    private doAsyncDetection;
    private subscribeToDetections;
    detectAsync(image: string | IBufferImage, options?: IConfig): Promise<Detection[]>;
}
