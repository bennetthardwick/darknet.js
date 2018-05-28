"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ffi = require("ffi");
var ref = require("ref");
var Struct = require("ref-struct");
var fs_1 = require("fs");
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
var Darknet = /** @class */ (function () {
    /**
     * A new instance of rjreddie's darknet. Create an instance as soon as possible in your app, because it takes a while to init.
     * @param config
     */
    function Darknet(config) {
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
    Darknet.prototype.getArrayFromBuffer = function (buffer, length, type) {
        var array = [];
        for (var i = 0; i < length; i++) {
            array.push(ref.get(ref.reinterpret(buffer, type.size, i * type.size), 0, type));
        }
        return array;
    };
    Darknet.prototype.bufferToDetections = function (buffer, length) {
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
    Darknet.prototype._detectSync = function (net, meta, image, thresh, hier_thresh, nms) {
        if (!thresh)
            thresh = 0.5;
        if (!hier_thresh)
            hier_thresh = 0.5;
        if (!nms)
            nms = 0.45;
        var _image = this.darknet.load_image_color(image, 0, 0);
        this.darknet.network_predict_image(net, _image);
        var pnum = ref.alloc('int');
        var dets = this.darknet.get_network_boxes(net, _image.w, _image.h, thresh, hier_thresh, ref.NULL_POINTER, 0, pnum);
        var num = pnum.deref();
        this.darknet.do_nms_obj(dets, num, meta.classes, nms);
        var detections = this.bufferToDetections(dets, num);
        this.darknet.free_image(_image);
        this.darknet.free_detections(dets, num);
        return detections;
    };
    /**
     * Synchronously detect objects in an image.
     * @param image the destination of the image to be detected
     * @param config optional configuration (threshold, etc.)
     */
    Darknet.prototype.detect = function (image, config) {
        if (!config)
            config = {};
        return this._detectSync(this.net, this.meta, image, config.thresh, config.hier_thresh, config.nms);
    };
    /**
     * Asynchronously detect objects in an image.
     * @param image
     * @param config
     * @returns A promise
     */
    Darknet.prototype.detectAsync = function (image, config) {
        var _this = this;
        if (!config)
            config = {};
        var thresh = (config.thresh) ? config.thresh : 0.5;
        var hier_thresh = (config.hier_thresh) ? config.hier_thresh : 0.5;
        var nms = (config.nms) ? config.nms : 0.5;
        return new Promise(function (resolve, reject) {
            _this.darknet.load_image_color.async(image, 0, 0, function (err, _image) {
                _this.darknet.network_predict_image.async(_this.net, _image, function () {
                    var pnum = ref.alloc('int');
                    _this.darknet.get_network_boxes.async(_this.net, _image.w, _image.h, thresh, hier_thresh, ref.NULL_POINTER, 0, pnum, function (err, dets) {
                        var num = pnum.deref();
                        _this.darknet.do_nms_obj.async(dets, num, _this.meta.classes, nms, function () {
                            var detections = _this.bufferToDetections(dets, num);
                            _this.darknet.free_image(_image);
                            _this.darknet.free_detections(dets, num);
                            resolve(detections);
                        });
                    });
                });
            });
        });
    };
    return Darknet;
}());
exports.Darknet = Darknet;
