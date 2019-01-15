var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _this = this;
var darknet_1 = require('./darknet');
var rxjs_1 = require('rxjs');
var operators_1 = require('rxjs/operators');
var shortid_1 = require('shortid');
var Darknet = (function (_super) {
    __extends(Darknet, _super);
    function Darknet(config) {
        _super.call(this, config);
        this.images$ = new rxjs_1.Subject();
        this.completion$ = new rxjs_1.Subject();
        this.detection$ = new rxjs_1.Subject();
        this.async = doAsyncDetection(image, string | IBufferImage, config ?  : IConfig);
        this.subscribeToDetections();
        this.completion$.next();
    }
    Darknet.prototype.Promise = ;
    return Darknet;
})(darknet_1.DarknetBase);
exports.Darknet = Darknet;
 > {
    if: function () { } };
!config;
config = {};
var thresh = (config.thresh) ? config.thresh : 0.5;
var hier_thresh = (config.hier_thresh) ? config.hier_thresh : 0.5;
var nms = (config.nms) ? config.nms : 0.5;
var darkNetLoadedImage = typeof image === 'string';
var imageData = typeof image === 'string' ?
    await : this.getImageFromPathAsync(image), await = this.RGBBufferToImageAsync(image.b, image.w, image.h, image.c);
var detection = await;
this._detectAsync(this.net, this.meta, imageData, thresh, hier_thresh, nms);
if (darkNetLoadedImage) {
    // memory is owned by the darknet lib
    await;
    new Promise(function (res, rej) {
        return _this.darknet.free_image.async(imageData, function (e) { return e ? rej(e) : res(); });
    });
}
else {
}
return detection;
subscribeToDetections();
{
    rxjs_1.zip(this.images$, this.completion$)
        .subscribe(function (x) {
        _this.doAsyncDetection(x[0].image)
            .then(function (dets) {
            _this.completion$.next();
            _this.detection$.next({
                id: x[0].id,
                detections: dets
            });
        }).catch(function (er) { return console.log(er); });
    });
}
detectAsync(image, string | IBufferImage, options ?  : IConfig);
Promise < Detection[] > {
    const: id = shortid_1.generate(),
    this: .images$.next({ id: id, image: image, options: options }),
    return: new Promise(function (resolve) {
        _this.detection$
            .pipe(operators_1.filter(function (det) { return det.id === id; }), operators_1.take(1)).subscribe(function (det) { return resolve(det.detections); });
    })
};
