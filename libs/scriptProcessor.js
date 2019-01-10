﻿/**
 * Generic ScriptProcessor based WebAudio player. 
 *
 * 	Copyright (C) 2015 Juergen Wothke
 *
 * Terms of Use: This software is licensed under a CC BY-NC-SA 
 * (http://creativecommons.org/licenses/by-nc-sa/4.0/).
 */
function surrogateCtor() {}

function extend(e, t, i) {
    surrogateCtor.prototype = e.prototype, t.prototype = new surrogateCtor, t.prototype.constructor = t, t.base = e;
    for (var a in i) t.prototype[a] = i[a];
    return t
}
var fetchSamples = function (e) {
        var t = window.player.genSamples.bind(window.player);
        t(e)
    },
    setGlobalWebAudioCtx = function () {
        if ("undefined" == typeof window._gPlayerAudioCtx) try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext, window._gPlayerAudioCtx = new AudioContext
        } catch (e) {
            alert("Web Audio API is not supported in this browser (get Chrome 18 or Firefox 26)" + e)
        }
    },
    SAMPLES_PER_BUFFER = 8192;
AudioBackendAdapterBase = function (e, t) {
    this._resampleBuffer = new Float32Array, this._channels = e, this._bytesPerSample = t, this._sampleRate = 44100, this._inputSampleRate = 44100, this._observer, this._manualSetupComplete = !0
}, AudioBackendAdapterBase.prototype = {
    computeAudioSamples: function () {
        this.error("computeAudioSamples")
    },
    loadMusicData: function () {
        this.error("loadMusicData")
    },
    evalTrackOptions: function () {
        this.error("evalTrackOptions")
    },
    updateSongInfo: function () {
        this.error("updateSongInfo")
    },
    getSongInfoMeta: function () {
        this.error("getSongInfoMeta")
    },
    getAudioBuffer: function () {
        this.error("getAudioBuffer")
    },
    getAudioBufferLength: function () {
        this.error("getAudioBufferLength")
    },
    readFloatSample: function () {
        this.error("readFloatSample")
    },
    getBytesPerSample: function () {
        return this._bytesPerSample
    },
    getChannels: function () {
        return this._channels
    },
    uploadFile: function () {
        return 0
    },
    isManualSetupComplete: function () {
        return this._manualSetupComplete
    },
    teardown: function () {
        this.error("teardown")
    },
    getMaxPlaybackPosition: function () {
        return 0
    },
    getPlaybackPosition: function () {
        return 0
    },
    seekPlaybackPosition: function () {
        return -1
    },
    getPathAndFilename: function () {
        this.error("getPathAndFilename")
    },
    registerFileData: function () {
        this.error("registerFileData")
    },
    mapBackendFilename: function (e) {
        return e
    },
    handleBackendSongAttributes: function () {
        this.error("handleBackendSongAttributes")
    },
    setObserver: function (e) {
        this._observer = e
    },
    error: function (e) {
        alert("fatal error: abstract method '" + e + "' must be defined")
    },
    resetSampleRate: function (e, t) {
        e > 0 && (this._sampleRate = e), t > 0 && (this._inputSampleRate = t);
        var i = Math.round(SAMPLES_PER_BUFFER * this._sampleRate / this._inputSampleRate) * this.getChannels();
        i > this._resampleBuffer.length && (this._resampleBuffer = this.allocResampleBuffer(i))
    },
    allocResampleBuffer: function (e) {
        return new Float32Array(e)
    },
    getCopiedAudio: function (e, t) {
        var i;
        for (i = 0; i < t * this._channels; i++) this._resampleBuffer[i] = this.readFloatSample(e, i);
        return t
    },
    getResampledAudio: function (e, t) {
        if (this._sampleRate == this._inputSampleRate) {
            var i = this.getCopiedAudio(e, t);
            return i
        }
        var a = Math.round(t * this._sampleRate / this._inputSampleRate),
            n = a * this._channels;
        return n > this._resampleBuffer.length && (this._resampleBuffer = new this.allocResampleBuffer(n)), this.resampleChannel(0, e, t, a), 2 == this._channels && this.resampleChannel(1, e, t, a), a
    },
    resampleChannel: function (e, t, i, a) {
        for (var n, r, s = 0, o = 0, d = a - 0, u = i - 0, h = Math.abs(d - s), l = d > s ? 1 : -1, f = -Math.abs(u - o), c = u > o ? 1 : -1, p = h + f; r = s * this._channels + e, this._resampleBuffer[r] = this.readFloatSample(t, o * this._channels + e), !(s >= d && o >= u);) n = 2 * p, n > f && (p += f, s += l), h > n && (p += h, o += c)
    },
    getResampleBuffer: function () {
        return this._resampleBuffer
    }
}, EmsHEAP16BackendAdapter = function () {
    var e = function (t, i) {
        e.base.call(this, i, 2), this.Module = t, window.Math.fround || (window.Math.fround = window.Math.round)
    };
    return extend(AudioBackendAdapterBase, e, {
        registerEmscriptenFileData: function (e, t) {
            try {
                this.Module.FS_createPath("/", e[0], !0, !0)
            } catch (i) {}
            var a;
            try {
                a = this.Module.FS_createDataFile(e[0], e[1], t, !0, !0); {
                    ScriptNodePlayer.getInstance().trace("registerEmscriptenFileData: [" + e[0] + "][" + e[1] + "] size: " + t.length)
                }
            } catch (n) {}
            return a
        },
        readFloatSample: function (e, t) {
            return this.Module.HEAP16[e + t] / 32768
        },
        getCopiedAudio: function (e, t) {
            var i = 0;
            for (i = 0; i < t * this._channels; i++) this._resampleBuffer[i] = this.Module.HEAP16[e + i] / 32768;
            return t
        }
    }), e
}(), EmsHEAP16BackendAdapter_ASM = function () {
    var e = function (t, i) {
        e.base.call(this, t, i), this.em_resampleBufferOffset = 0
    };
    return extend(EmsHEAP16BackendAdapter, e, {
        allocResampleBuffer: function (e) {
            var t = this.Module._malloc(e * this._channels * this._bytesPerSample);
            return this.em_resampleBufferOffset && this.Module._free(this.em_resampleBufferOffset), this.em_resampleBufferOffset = t, new Float32Array(this.Module.HEAPU8.buffer, t, e)
        },
        ASM_copy: function (e, t, i) {
            "use asm";

            function a(e, t, i, a) {
                e |= 0, t |= 0, i |= 0, a |= 0;
                var o = 0,
                    d = 0;
                for (e <<= 1, i <<= 1;
                    (o | 0) < (i | 0); o = (o | 0) + 2 | 0, d = (d | 0) + 4 | 0) r[(t + d | 0) >> 2] = s(~n[(e + o | 0) >> 1]) / s(32768);
                return i >> 1 >> a
            }
            var n = new e.Int16Array(i),
                r = new e.Float32Array(i),
                s = e.Math.fround;
            return {
                copyAudio: a
            }
        },
        getCopiedAudio: function (e, t) {
            var i = this.Module.HEAP16.buffer;
            return this.asm_module || (this.asm_module = this.ASM_copy(window, {}, i)), this.asm_module.copyAudio(e, this.em_resampleBufferOffset, t * this._channels, 2 == this._channels ? 1 : 0)
        }
    }), e
}(), FileCache = function () {
    this._binaryFileMap = {}, this._pendingFileMap = {}, this._isWaitingForFile = !1
}, FileCache.prototype = {
    getFileMap: function () {
        return this._binaryFileMap
    },
    getPendingMap: function () {
        return this._pendingFileMap
    },
    setWaitingForFile: function (e) {
        this._isWaitingForFile = e
    },
    isWaitingForFile: function () {
        return this._isWaitingForFile
    },
    getFile: function (e) {
        var t;
        return e in this._binaryFileMap && (t = this._binaryFileMap[e]), t
    },
    setFile: function (e, t) {
        this._binaryFileMap[e] = t, this._isWaitingForFile = !1
    }
};
var ScriptNodePlayer = function () {
    return PlayerImpl = function (e, t, i, a, n, r, s, o) {
        "undefined" == typeof e && alert("fatal error: backendAdapter not specified"), "undefined" == typeof n && alert("fatal error: onPlayerReady not specified"), "undefined" == typeof r && alert("fatal error: onTrackReadyToPlay not specified"), "undefined" == typeof s && alert("fatal error: onTrackEnd not specified"), e.getChannels() > 2 && alert("fatal error: only 1 or 2 output channels supported"), this._backendAdapter = e, this._backendAdapter.setObserver(this), this._basePath = t, this._traceSwitch = !1, this._spectrumEnabled = a, this._songInfo = {}, this._onTrackReadyToPlay = r, this._onTrackEnd = s, this._onPlayerReady = n, this._onUpdate = o, this._sourceBuffer, this._sourceBufferLen, this._numberOfSamplesRendered = 0, this._numberOfSamplesToRender = 0, this._sourceBufferIdx = 0, this._currentPlaytime = 0, this._currentTimeout = -1, setGlobalWebAudioCtx(), this._sampleRate = window._gPlayerAudioCtx.sampleRate, this._correctSampleRate = this._sampleRate, this._backendAdapter.resetSampleRate(this._sampleRate, -1), this._bufferSource, this._gainNode, this._analyzerNode, this._scriptNode, this._freqByteData = 0, window.fileRequestCallback = this.fileRequestCallback.bind(this), window.fileSizeRequestCallback = this.fileSizeRequestCallback.bind(this), window.songUpdateCallback = this.songUpdateCallback.bind(this), this._isPaused = !1, this._isPlayerReady = !1, this._isSongReady = !1, this._initInProgress = !1, this._preLoadReady = !1, window.player = this;
        var d = window.player.preloadFiles.bind(window.player);
        d(i, function () {
            this._preLoadReady = !0, this._preLoadReady && this._backendAdapter.isManualSetupComplete() && (this._isPlayerReady = !0, this._onPlayerReady())
        }.bind(this))
    }, PlayerImpl.prototype = {
        isReady: function () {
            return this._isPlayerReady
        },
        setTraceMode: function (e) {
            this._traceSwitch = e
        },
        play: function () {
            this.initWebAudio(), this._isPaused = !1, "undefined" == typeof this._bufferSource && (this._bufferSource = window._gPlayerAudioCtx.createBufferSource(), this._bufferSource.start || (this._bufferSource.start = this._bufferSource.noteOn, this._bufferSource.stop = this._bufferSource.noteOff), this._bufferSource.start(0))
        },
        pause: function () {
            this.isWaitingForFile() || this._initInProgress || !this._isSongReady || (this._isPaused = !0)
        },
        resume: function () {
            this.isWaitingForFile() || this._initInProgress || !this._isSongReady || (this._isPaused = !1)
        },
        setVolume: function (e) {
            this._gainNode.gain.value = e
        },
        isStereo: function () {
            return 2 == this._backendAdapter.getChannels()
        },
        getSongInfo: function () {
            return this._songInfo
        },
        getSongInfoMeta: function () {
            return this._backendAdapter.getSongInfoMeta()
        },
        setPlaybackTimeout: function (e) {
            this._currentPlaytime = 0, this._currentTimeout = e / 1e3 * this._sampleRate
        },
        getFreqByteData: function () {
            return this._analyzerNode && (0 === this._freqByteData && (this._freqByteData = new Uint8Array(this._analyzerNode.frequencyBinCount)), this._analyzerNode.getByteFrequencyData(this._freqByteData)), this._freqByteData
        },
        getMaxPlaybackPosition: function () {
            return this._backendAdapter.getMaxPlaybackPosition()
        },
        getPlaybackPosition: function () {
            return this._backendAdapter.getPlaybackPosition()
        },
        seekPlaybackPosition: function (e) {
            return this._backendAdapter.seekPlaybackPosition(e)
        },
        loadMusicFromTmpFile: function (e, t, i, a, n) {
            var r = e.name,
                s = (t.basePath ? t.basePath : this._basePath) + r;
            if (!this.loadMusicDataFromCache(s, t, a)) {
                var o = new FileReader;
                o.onload = function () {
                    var e = this._backendAdapter.getPathAndFilename(r),
                        n = new Uint8Array(o.result),
                        d = this._backendAdapter.registerFileData(e, n);
                    return "undefined" == typeof d ? void a() : (this.getCache().setFile(s, n), this.prepareTrackForPlayback(s, o.result, t), void i(r))
                }.bind(this), o.onprogress = function (e) {
                    n && n(e.total, e.loaded)
                }.bind(this), o.readAsArrayBuffer(e)
            }
        },
        loadMusicFromURL: function (e, t, i, a, n) {
            var r = (t.basePath ? t.basePath : this._basePath) + e;
            if (!this.loadMusicDataFromCache(r, t, a)) {
                var s = new XMLHttpRequest;
                s.open("GET", r, !0), s.responseType = "arraybuffer", s.onload = function () {
                    this.trace("loadMusicFromURL successfully loaded: " + r), this.prepareTrackForPlayback(r, s.response, t) ? i(r) : this.isWaitingForFile() || a()
                }.bind(this), s.onprogress = function (e) {
                    n && n(e.total, e.loaded)
                }.bind(this), s.onreadystatuschange = function () {
                    4 == oReq.readyState && 404 == oReq.status && this.trace("loadMusicFromURL failed to load: " + r)
                }.bind(this), s.send(null)
            }
        },
        uploadFile: function (e, t, i, a, n) {
            var r = new FileReader;
            r.onload = function () {
                var n = this._backendAdapter.getPathAndFilename(e.name),
                    s = new Uint8Array(r.result),
                    o = this._backendAdapter.registerFileData(n, s);
                if ("undefined" == typeof o) return void a();
                var d = this._backendAdapter.uploadFile(e.name, t);
                0 === d ? (i(e.name), this._onPlayerReady()) : 1 == d && i(e.name)
            }.bind(this), r.onprogress = function (e) {
                n && n(e.total, e.loaded)
            }.bind(this), r.readAsArrayBuffer(e)
        },
        prepareTrackForPlayback: function (e, t, i) {
            return this._isPaused = !0, this.lastUsedFilename = e, this.lastUsedData = t, this.lastUsedOptions = i, this._isSongReady = !1, this.setWaitingForFile(!1), this.initIfNeeded(e, t, i)
        },
        trace: function (e) {
            this._traceSwitch && console.log(e)
        },
        setWait: function (e) {
            this.setWaitingForFile(e)
        },
        getDefaultSampleRate: function () {
            return this._correctSampleRate
        },
        initIfNeeded: function (e, t, i) {
            var a = this.loadMusicData(e, t);
            if (0 > a) this._isSongReady = !1, this.setWaitingForFile(!0), this._initInProgress = !1;
            else {
                if (0 === a) {
                    this.isPaused = !1, this.setWaitingForFile(!1), this._isSongReady = !0, this._currentPlaytime = 0, this._initInProgress = !1, this.trace("successfully completed init");
                    var n = this._backendAdapter.evalTrackOptions(i);
                    return 0 !== n ? (this.trace("error preparing track options"), !1) : (this.updateSongInfo(e), this._onTrackReadyToPlay(), this._isPaused = !1, !0)
                }
                this._initInProgress = !1, this.trace("initIfNeeded - fatal error")
            }
            return !1
        },
        loadMusicDataFromCache: function (e, t, i) {
            var a = this.getCache().getFile(e);
            return "undefined" != typeof a ? (this.prepareTrackForPlayback(e, a, t) || this.isWaitingForFile() || i(), !0) : !1
        },
        handleBackendEvent: function () {
            this._backendAdapter.isManualSetupComplete() && this._preLoadReady && (this._isPlayerReady = !0, this._onPlayerReady())
        },
        initWebAudio: function () {
            "undefined" != typeof this._bufferSource ? this._bufferSource.stop(0) : (this._analyzerNode = window._gPlayerAudioCtx.createAnalyser(), this._scriptNode = this.createScriptProcessor(window._gPlayerAudioCtx), this._gainNode = window._gPlayerAudioCtx.createGain(), this._scriptNode.connect(this._gainNode), this._spectrumEnabled ? (this._gainNode.connect(this._analyzerNode), this._analyzerNode.connect(window._gPlayerAudioCtx.destination)) : this._gainNode.connect(window._gPlayerAudioCtx.destination))
        },
        updateSongInfo: function (e) {
            this._songInfo = {}, this._backendAdapter.updateSongInfo(e, this._songInfo)
        },
        loadMusicData: function (e, t) {
            if (this._backendAdapter.teardown(), t) {
                var i = this._backendAdapter.getPathAndFilename(e),
                    a = new Uint8Array(t);
                this._backendAdapter.registerFileData(i, a);
                var n = this._backendAdapter.loadMusicData(this._sampleRate, i[0], i[1], a);
                return 0 === n && this.resetBuffer(), n
            }
        },
        resetBuffer: function () {
            this._numberOfSamplesRendered = 0, this._numberOfSamplesToRender = 0, this._sourceBufferIdx = 0
        },
        resetSampleRate: function (e) {
            this._backendAdapter.resetSampleRate(e, -1), this.resetBuffer()
        },
        createScriptProcessor: function (e) {
            var t = e.createScriptProcessor(SAMPLES_PER_BUFFER, 0, this._backendAdapter.getChannels());
            return t.onaudioprocess = fetchSamples, t
        },
        fillEmpty: function (e, t, a) {
            var n = e - this._numberOfSamplesRendered;
            for (i = 0; i < n; i++) t[i + this._numberOfSamplesRendered] = 0, this.isStereo() && (a[i + this._numberOfSamplesRendered] = 0);
            this._numberOfSamplesToRender = 0, this._numberOfSamplesRendered = e
        },
        fileRequestCallback: function (e) {
            var t = this._backendAdapter.mapBackendFilename(e);
            return this.preloadFile(t, function () {
                this.initIfNeeded(this.lastUsedFilename, this.lastUsedData, this.lastUsedOptions)
            }.bind(this), !1)
        },
        fileSizeRequestCallback: function (e) {
            var t = this._backendAdapter.mapBackendFilename(e),
                i = this.getCache().getFile(t);
            return i.length
        },
        songUpdateCallback: function (e) {
            this._backendAdapter.handleBackendSongAttributes(e, this._songInfo), this._onUpdate && this._onUpdate()
        },
        preload: function (e, t, i) {
            if (0 === t) i();
            else {
                t--;
                var a = function () {
                    this.preload(e, t, i)
                }.bind(this);
                this.preloadFile(e[t], a, !0)
            }
        },
        preloadFile: function (e, t, i) {
            var a = this.getCache().getFile(e);
            if ("undefined" != typeof a) {
                var n = 0;
                return 0 == a && (n = 1, this.trace("error: preloadFile could not get cached: " + e)), i && t(), n
            }
            if (this._isPaused = !0, this.setWaitingForFile(!0), this._isSongReady = !1, !(e in this.getCache().getPendingMap())) {
                this.getCache().getPendingMap()[e] = 1;
                var r = new XMLHttpRequest;
                r.open("GET", e, !0), r.responseType = "arraybuffer", r.onload = function () {
                    var i = r.response;
                    if (i) {
                        this.trace("preloadFile successfully loaded: " + e); {
                            var a = this._backendAdapter.getPathAndFilename(e),
                                n = new Uint8Array(i);
                            this._backendAdapter.registerFileData(a, n)
                        }
                        this.getCache().setFile(e, n)
                    }
                    delete this.getCache().getPendingMap()[e] || this.trace("remove file from pending failed: " + e), t()
                }.bind(this), r.onreadystatuschange = function () {
                    4 == r.readyState && 404 == r.status && (this.trace("preloadFile failed to load: " + e), this.getCache().setFile(e, 0))
                }.bind(this), r.onerror = function () {
                    this.getCache().setFile(e, 0)
                }.bind(this), r.send(null)
            }
            return -1
        },
        genSamples: function (e) {
            var t, i = e.outputBuffer.getChannelData(0);
            if (this.isStereo() && (t = e.outputBuffer.getChannelData(1)), !this._isSongReady || this.isWaitingForFile() || this._isPaused) {
                var a;
                for (a = 0; a < i.length; a++) i[a] = 0, this.isStereo() && (t[a] = 0)
            } else {
                var n = i.length;
                for (this._numberOfSamplesRendered = 0; this._numberOfSamplesRendered < n;) {
                    if (0 === this._numberOfSamplesToRender) {
                        var r;
                        if (this._currentTimeout > 0 && this._currentPlaytime > this._currentTimeout ? (this.trace("'song end' forced after " + this._currentTimeout / this._sampleRate + " secs"), r = 1) : r = this._backendAdapter.computeAudioSamples(), 0 !== r) return this.fillEmpty(n, i, t), 0 > r ? (this._isPaused = !0, this._isSongReady = !1, void this.setWaitingForFile(!0)) : this.isWaitingForFile() ? void 0 : (r > 1 && this.trace("playback aborted with an error"), this._onTrackEnd && this._onTrackEnd(), void(this._isPaused = !0));
                        this._sourceBuffer = this._backendAdapter.getAudioBuffer(), this._sourceBufferLen = this._backendAdapter.getAudioBufferLength(), this._numberOfSamplesToRender = this._backendAdapter.getResampledAudio(this._sourceBuffer, this._sourceBufferLen), this._sourceBufferIdx = 0
                    }
                    var s = this._backendAdapter.getResampleBuffer();
                    this.isStereo() ? this.copySamplesStereo(s, i, t, n) : this.copySamplesMono(s, i, t, n)
                }
                this._currentPlaytime += n
            }
        },
        copySamplesStereo: function (e, t, i, a) {
            var n;
            if (this._numberOfSamplesRendered + this._numberOfSamplesToRender > a) {
                var r = a - this._numberOfSamplesRendered;
                for (n = 0; r > n; n++) t[n + this._numberOfSamplesRendered] = e[this._sourceBufferIdx++], i[n + this._numberOfSamplesRendered] = e[this._sourceBufferIdx++];
                this._numberOfSamplesToRender -= r, this._numberOfSamplesRendered = a
            } else {
                for (n = 0; n < this._numberOfSamplesToRender; n++) t[n + this._numberOfSamplesRendered] = e[this._sourceBufferIdx++], i[n + this._numberOfSamplesRendered] = e[this._sourceBufferIdx++];
                this._numberOfSamplesRendered += this._numberOfSamplesToRender, this._numberOfSamplesToRender = 0
            }
        },
        copySamplesMono: function (e, t, i, a) {
            var n;
            if (this._numberOfSamplesRendered + this._numberOfSamplesToRender > a) {
                var r = a - this._numberOfSamplesRendered;
                for (n = 0; r > n; n++) t[n + this._numberOfSamplesRendered] = e[this._sourceBufferIdx++];
                this._numberOfSamplesToRender -= r, this._numberOfSamplesRendered = a
            } else {
                for (n = 0; n < this._numberOfSamplesToRender; n++) t[n + this._numberOfSamplesRendered] = e[this._sourceBufferIdx++];
                this._numberOfSamplesRendered += this._numberOfSamplesToRender, this._numberOfSamplesToRender = 0
            }
        },
        preloadFiles: function (e, t) {
            this._isPaused = !0, this.preload(e, e.length, t)
        },
        setWaitingForFile: function (e) {
            this.getCache().setWaitingForFile(e)
        },
        isWaitingForFile: function () {
            return this.getCache().isWaitingForFile()
        },
        getCache: function () {
            return "undefined" == typeof window._fileCache && (window._fileCache = new FileCache), window._fileCache
        }
    }, {
        createInstance: function (e, t, i, a, n, r, s, o) {
            var d = !1;
            if ("undefined" != typeof window.player) {
                var u = window.player;
                u._isPaused = !0, "undefined" != typeof u._bufferSource && u._bufferSource.stop(0), u._scriptNode && u._scriptNode.disconnect(0), u._analyzerNode && u._analyzerNode.disconnect(0), u._gainNode && u._gainNode.disconnect(0), d = u._traceSwitch
            }
            var h = new PlayerImpl(e, t, i, a, n, r, s, o);
            h._traceSwitch = d
        },
        getInstance: function () {
            return "undefined" == typeof window.player && alert("fatal error: window.player not defined"), window.player
        }
    }
}();