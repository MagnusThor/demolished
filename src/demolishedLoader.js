"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function loadResource(file) {
    let promise = new Promise((resolve, reject) => {
        let wrapper = new XMLHttpRequestWrapper(file, resolve, reject);
        return wrapper;
    });
    return promise;
}
exports.default = loadResource;
class XMLHttpRequestWrapper {
    constructor(file, resolve, reject) {
        this.file = file;
        let xhr = new XMLHttpRequest();
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
}
class ResponseWrapper {
    constructor(blobData) {
        this.blobData = blobData;
    }
    arrayBuffer() {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsArrayBuffer(this.blobData);
        });
    }
    blob() {
        return new Promise((resolve, reject) => {
            resolve(this.blobData);
        });
    }
    text() {
        let promise = new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsText(this.blobData);
        });
        return promise;
    }
    json() {
        let promise = new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(JSON.parse(reader.result.toString()));
            };
            reader.readAsText(this.blobData);
        });
        return promise;
    }
}
exports.ResponseWrapper = ResponseWrapper;
