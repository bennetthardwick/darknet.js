"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var darknet_1 = require("./darknet");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var shortid_1 = require("shortid");
var Darknet = /** @class */ (function (_super) {
    __extends(Darknet, _super);
    function Darknet(config) {
        var _this = _super.call(this, config) || this;
        _this.images$ = new rxjs_1.Subject();
        _this.completion$ = new rxjs_1.Subject();
        _this.detection$ = new rxjs_1.Subject();
        _this.subscribeToDetections();
        _this.completion$.next();
        return _this;
    }
    Darknet.prototype.doAsyncDetection = function (image, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var thresh, hier_thresh, nms, darkNetLoadedImage, imageData, _a, detection;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!config)
                            config = {};
                        thresh = (config.thresh) ? config.thresh : 0.5;
                        hier_thresh = (config.hier_thresh) ? config.hier_thresh : 0.5;
                        nms = (config.nms) ? config.nms : 0.5;
                        darkNetLoadedImage = typeof image === 'string';
                        if (!(typeof image === 'string')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getImageFromPathAsync(image)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.RGBBufferToImageAsync(image.b, image.w, image.h, image.c)];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        imageData = _a;
                        return [4 /*yield*/, this._detectAsync(this.net, this.meta, imageData, thresh, hier_thresh, nms)];
                    case 5:
                        detection = _b.sent();
                        if (!darkNetLoadedImage) return [3 /*break*/, 7];
                        // memory is owned by the darknet lib
                        return [4 /*yield*/, new Promise(function (res, rej) {
                                return _this.darknet.free_image.async(imageData, function (e) { return e ? rej(e) : res(); });
                            })];
                    case 6:
                        // memory is owned by the darknet lib
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, detection];
                }
            });
        });
    };
    Darknet.prototype.subscribeToDetections = function () {
        var _this = this;
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
    };
    Darknet.prototype.detectAsync = function (image, options) {
        var _this = this;
        var id = shortid_1.generate();
        this.images$.next({ id: id, image: image, options: options });
        return new Promise(function (resolve) {
            _this.detection$
                .pipe(operators_1.filter(function (det) { return det.id === id; }), operators_1.take(1)).subscribe(function (det) { return resolve(det.detections); });
        });
    };
    return Darknet;
}(darknet_1.DarknetBase));
exports.Darknet = Darknet;
