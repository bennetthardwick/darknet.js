import { IDarknetConfig, IBufferImage, Detection, IConfig, DarknetBase } from './darknet';
import { zip, Subject } from 'rxjs';
import { filter, map, tap, take } from 'rxjs/operators';
import { generate } from 'shortid';

interface IDetectMe {
    id: string;
    image: string | IBufferImage
    options?: IConfig
}

interface IDetection {
    id: string;
    detections: Detection[]
}

export class Darknet extends DarknetBase {

    private images$ = new Subject<IDetectMe>();
    private completion$ = new Subject();
    private detection$ = new Subject<IDetection>();

    constructor(config: IDarknetConfig) {
        super(config);
        this.subscribeToDetections();
        this.completion$.next();
    }

    private async doAsyncDetection(image: string | IBufferImage, config?: IConfig): Promise<Detection[]> {
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

    private subscribeToDetections() {
        zip(this.images$, this.completion$)
            .subscribe(x => {
                this.doAsyncDetection(x[0].image)
                    .then(dets => {
                        this.completion$.next();
                        this.detection$.next({
                            id: x[0].id,
                            detections: dets
                        });
                    }).catch(er => console.log(er));
            })
    }

    detectAsync(image: string | IBufferImage, options?: IConfig): Promise<Detection[]> {
        const id = generate();
        this.images$.next({ id, image, options });
        return new Promise(resolve => {
            this.detection$
                .pipe(
                    filter(det => det.id === id),
                    take(1),
                ).subscribe(det => resolve(det.detections));
        });
    }

}