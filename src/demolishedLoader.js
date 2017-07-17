"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function loadResource(file) {
    var promise = new Promise(function (resolve, reject) {
        var wrapper = new XMLHttpRequestWrapper(file, resolve, reject);
        return wrapper;
    });
    return promise;
}
exports.default = loadResource;
var XMLHttpRequestWrapper = (function () {
    function XMLHttpRequestWrapper(file, resolve, reject) {
        this.file = file;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", file);
        xhr.responseType = "blob";
        xhr.onloadend = function (evt) {
            try {
                if (xhr.status == 404)
                    throw "failed to loadResource " + file;
                resolve(new ResponseWrapper(xhr.response));
            }
            catch (err) {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = function (err) {
            reject(err);
        };
        xhr.send();
        this.xhr = xhr;
    }
    return XMLHttpRequestWrapper;
}());
var ResponseWrapper = (function () {
    function ResponseWrapper(blobData) {
        this.blobData = blobData;
    }
    ResponseWrapper.prototype.arrayBuffer = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.readAsArrayBuffer(_this.blobData);
        });
    };
    ResponseWrapper.prototype.blob = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this.blobData);
        });
    };
    ResponseWrapper.prototype.text = function () {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.readAsText(_this.blobData);
        });
        return promise;
    };
    ResponseWrapper.prototype.json = function () {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                resolve(JSON.parse(reader.result));
            };
            reader.readAsText(_this.blobData);
        });
        return promise;
    };
    return ResponseWrapper;
}());
exports.ResponseWrapper = ResponseWrapper;
