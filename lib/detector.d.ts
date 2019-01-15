import { IDarknetConfig, DarknetBase } from './darknet';
export declare class Darknet extends DarknetBase {
    private images$;
    private completion$;
    private detection$;
    constructor(config: IDarknetConfig);
    private async;
    Promise<Detection>(): any;
    []: any;
}
