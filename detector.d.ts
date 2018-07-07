import { Darknet, IDarknetConfig, IBufferImage, Detection, IConfig } from './darknet';
export declare class DarknetExperimental extends Darknet {
    private images$;
    private completion$;
    private detection$;
    constructor(config: IDarknetConfig);
    private doAsyncDetection(image, config?);
    private subscribeToDetections();
    detectAsync(image: string | IBufferImage, options?: IConfig): Promise<Detection[]>;
}
