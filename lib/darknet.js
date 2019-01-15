var _this = this;
var ffi = require('ffi');
var ref = require('ref');
var Struct = require('ref-struct');
var fs_1 = require('fs');
var char_pointer = ref.refType('char');
var float_pointer = ref.refType('float');
var int_pointer = ref.refType('int');
var BBOX = Struct({
    'x': 'float',
    'y': 'float',
    'w': 'float',
    'h': 'float'
});
var DETECTION = Struct({
    'bbox': BBOX,
    'classes': 'int',
    'prob': float_pointer,
    'mask': float_pointer,
    'objectness': 'float',
    'sort_class': 'int'
});
var IMAGE = Struct({
    'w': 'int',
    'h': 'int',
    'c': 'int',
    'data': float_pointer
});
var METADATA = Struct({
    'classes': 'int',
    'names': 'string'
});
var detection_pointer = ref.refType(DETECTION);
var library = __dirname + "/libdarknet";
var DarknetBase = (function () {
    /**
     * A new instance of pjreddie's darknet. Create an instance as soon as possible in your app, because it takes a while to init.
     * @param config
     */
    function DarknetBase(config) {
        this.async = _detectAsync(net, any, meta, any, image, any, thresh ?  : number, hier_thresh ?  : number, nms ?  : number);
        if (!config)
            throw new Error("A config file is required");
        if (!config.names && !config.namefile)
            throw new Error("Config must include detection class names");
        if (!config.names && config.namefile)
            config.names = fs_1.readFileSync(config.namefile, 'utf8').split('\n');
        if (!config.names)
            throw new Error("No names detected.");
        if (!config.config)
            throw new Error("Config must include location to yolo config file");
        if (!config.weights)
            throw new Error("config must include the path to trained weights");
        this.names = config.names.filter(function (a) { return a.split("").length > 0; });
        this.meta = new METADATA;
        this.meta.classes = this.names.length;
        this.meta.names = this.names.join('\n');
        this.darknet = ffi.Library(library, {
            'float_to_image': [IMAGE, ['int', 'int', 'int', float_pointer]],
            'load_image_color': [IMAGE, ['string', 'int', 'int']],
            'network_predict_image': [float_pointer, ['pointer', IMAGE]],
            'get_network_boxes': [detection_pointer, ['pointer', 'int', 'int', 'float', 'float', int_pointer, 'int', int_pointer]],
            'do_nms_obj': ['void', [detection_pointer, 'int', 'int', 'float']],
            'free_image': ['void', [IMAGE]],
            'free_detections': ['void', [detection_pointer, 'int']],
            'load_network': ['pointer', ['string', 'string', 'int']],
            'get_metadata': [METADATA, ['string']],
        });
        this.net = this.darknet.load_network(config.config, config.weights, 0);
    }
    DarknetBase.prototype.getArrayFromBuffer = function (buffer, length, type) {
        var array = [];
        for (var i = 0; i < length; i++) {
            array.push(ref.get(ref.reinterpret(buffer, type.size, i * type.size), 0, type));
        }
        return array;
    };
    DarknetBase.prototype.bufferToDetections = function (buffer, length) {
        var detections = [];
        for (var i = 0; i < length; i++) {
            var det = ref.get(ref.reinterpret(buffer, 48, i * DETECTION.size), 0, DETECTION);
            var prob = this.getArrayFromBuffer(det.prob, this.meta.classes, ref.types.float);
            for (var j = 0; j < this.meta.classes; j++) {
                if (prob[j] > 0) {
                    var b = det.bbox;
                    detections.push({
                        name: this.names[j],
                        prob: prob[j],
                        box: {
                            x: b.x,
                            y: b.y,
                            w: b.w,
                            h: b.h
                        }
                    });
                }
            }
        }
        return detections;
    };
    DarknetBase.prototype._detectSync = function (net, meta, image, thresh, hier_thresh, nms) {
        if (!thresh)
            thresh = 0.5;
        if (!hier_thresh)
            hier_thresh = 0.5;
        if (!nms)
            nms = 0.45;
        this.darknet.network_predict_image(net, image);
        var pnum = ref.alloc('int');
        var dets = this.darknet.get_network_boxes(net, image.w, image.h, thresh, hier_thresh, ref.NULL_POINTER, 0, pnum);
        var num = (pnum), as = any, deref = ();
        this.darknet.do_nms_obj(dets, num, meta.classes, nms);
        var detections = this.bufferToDetections(dets, num);
        this.darknet.free_detections(dets, num);
        return detections;
    };
    DarknetBase.prototype.Promise = ;
    return DarknetBase;
})();
exports.DarknetBase = DarknetBase;
 > {
    await: new Promise(function (res, rej) {
        return _this.darknet.network_predict_image.async(net, image, function (e) { return e ? rej(e) : res(); });
    }),
    let: pnum = ref.alloc('int'),
    const: dets = await, new: Promise(function (res, rej) {
        return _this.darknet.get_network_boxes.async(net, image.w, image.h, thresh, hier_thresh, ref.NULL_POINTER, 0, pnum, function (err, dets) { return err ? rej(err) : res(dets); });
    }),
    const: num = (pnum), as: any, deref: function () { },
    await: new Promise(function (res, rej) {
        return _this.darknet.do_nms_obj.async(dets, num, meta.classes, nms, function (e) { return e ? rej(e) : res(); });
    }),
    const: detections = this.bufferToDetections(dets, num),
    this: .darknet.free_detections(dets, num),
    return: detections
};
/**
 * Synchronously detect objects in an image.
 * @param image the destination of the image to be detected
 * @param config optional configuration (threshold, etc.)
 */
detect(image, string | IBufferImage, config ?  : IConfig);
{
    if (!config)
        config = {};
    var darkNetLoadedImage_1 = typeof image === 'string';
    var imageData_1 = typeof image === 'string' ?
        this.getImageFromPath(image) :
        this.RGBBufferToImage(image.b, image.w, image.h, image.c);
    var detection_1 = this._detectSync(this.net, this.meta, imageData_1, config.thresh, config.hier_thresh, config.nms);
    if (darkNetLoadedImage_1) {
        // memory is owned by the darknet lib
        this.darknet.free_image(imageData_1);
    }
    else {
    }
    return detection_1;
}
/**
 * Get a Darknet Image from path
 * @param path
 * @returns IMAGE
 */
getImageFromPath(path, string);
{
    return this.darknet.load_image_color(path, 0, 0);
}
/**
 * Get a Darknet Image async from path
 * @param path
 * @returns Promise<IMAGE>
 */
async;
getImageFromPathAsync(path, String);
{
    return new Promise(function (res, rej) {
        return _this.darknet.load_image_color.async(path, 0, 0, function (e, image) { return e ? rej(e) : res(image); });
    });
}
/**
 * convert darknet image to rgb buffer
 * @param {IMAGE} image
 * @returns {Buffer}
 */
imageToRGBBuffer(image, any);
{
    var w = image.w;
    var h = image.h;
    var c = image.c;
    var imageElements = w * h * c;
    var imageData_2 = new Float32Array(image.data.reinterpret(imageElements * Float32Array.BYTES_PER_ELEMENT, 0).buffer, 0, imageElements);
    var rgbBuffer = Buffer.allocUnsafe(imageData_2.length);
    var step = c * w;
    var i, k, j;
    for (i = 0; i < h; ++i) {
        for (k = 0; k < c; ++k) {
            for (j = 0; j < w; ++j) {
                rgbBuffer[i * step + j * c + k] = imageData_2[k * w * h + i * w + j] * 255;
            }
        }
    }
    return rgbBuffer;
}
rgbToDarknet(buffer, Buffer, w, number, h, number, c, number);
Float32Array;
{
    var imageElements = w * h * c;
    var floatBuff = new Float32Array(imageElements);
    var step = w * c;
    var i, k, j;
    for (i = 0; i < h; ++i) {
        for (k = 0; k < c; ++k) {
            for (j = 0; j < w; ++j) {
                floatBuff[k * w * h + i * w + j] = buffer[i * step + j * c + k] / 255;
            }
        }
    }
    return floatBuff;
}
/**
 * Transform an RGB buffer to a darknet encoded image
 * @param buffer - rgb buffer
 * @param w - width
 * @param h - height
 * @param c - channels
 * @returns {IMAGE}
 */
RGBBufferToImage(buffer, Buffer, w, number, h, number, c, number);
{
    var floatBuff = this.rgbToDarknet(buffer, w, h, c);
    return this.darknet.float_to_image(w, h, c, new Uint8Array(floatBuff.buffer, 0, floatBuff.length * Float32Array.BYTES_PER_ELEMENT));
}
/**
 * Transform an RGB buffer to a darknet encoded image
 * @param buffer - rgb buffer
 * @param w - width
 * @param h - height
 * @param c - channels
 * @returns {Promise<IMAGE>}
 */
async;
RGBBufferToImageAsync(buffer, Buffer, w, number, h, number, c, number);
Promise < any > {
    const: floatBuff = this.rgbToDarknet(buffer, w, h, c),
    return: new Promise(function (res, rej) { return _this.darknet.float_to_image.async(w, h, c, new Uint8Array(floatBuff.buffer, 0, floatBuff.length * Float32Array.BYTES_PER_ELEMENT), function (e, image) { return e ? rej(e) : res(image); }); })
};
/**
 * Asynchronously detect objects in an image.
 * @param image
 * @param config
 * @returns A promise
 */
async;
detectAsync(image, string | IBufferImage, config ?  : IConfig);
Promise < Detection[] > {
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
var detector_1 = require('./detector');
exports.Darknet = detector_1.Darknet;
var detector_2 = require('./detector');
exports.DarknetExperimental = detector_2.Darknet;
