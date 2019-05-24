"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const demolishedSound_1 = require("./demolishedSound");
class DemolishedSonant extends demolishedSound_1.DemolishedSoundBase {
    constructor(song) {
        super();
        this.song = song;
        this.WAVE_SPS = 44100;
        this.WAVE_CHAN = 2;
        this.generate = function (track) {
            var oscillators = [
                this.osc_sin,
                this.osc_square,
                this.osc_saw,
                this.osc_tri
            ];
            var i, j, k, b, p, row, n, currentpos, cp, c1, c2, q, low, band, high, t, lfor, e, x, rsample, f, da, o1t, o2t;
            let chnBuf = this.chnBufWork, mixBuf = this.mixBufWork, waveSamples = this.WAVE_SIZE, waveBytes = this.WAVE_SIZE * this.WAVE_CHAN * 2, instr = this.song.songData[track], rowLen = this.song.rowLen, osc_lfo = oscillators[instr.lfo_waveform], osc1 = oscillators[instr.osc1_waveform], osc2 = oscillators[instr.osc2_waveform], attack = instr.env_attack, sustain = instr.env_sustain, release = instr.env_release, panFreq = Math.pow(2, instr.fx_pan_freq - 8) / rowLen, lfoFreq = Math.pow(2, instr.lfo_freq - 8) / rowLen;
            for (b = 0; b < waveBytes; b += 2) {
                chnBuf[b] = 0;
                chnBuf[b + 1] = 128;
            }
            currentpos = 0;
            for (p = 0; p < this.song.endPattern - 1; ++p) {
                cp = instr.p[p];
                for (row = 0; row < 32; ++row) {
                    if (cp) {
                        n = instr.c[cp - 1].n[row];
                        if (n) {
                            c1 = c2 = 0;
                            o1t = this.getnotefreq(n + (instr.osc1_oct - 8) * 12 + instr.osc1_det) * (1 + 0.0008 * instr.osc1_detune);
                            o2t = this.getnotefreq(n + (instr.osc2_oct - 8) * 12 + instr.osc2_det) * (1 + 0.0008 * instr.osc2_detune);
                            q = instr.fx_resonance / 255;
                            low = band = 0;
                            for (j = attack + sustain + release - 1; j >= 0; --j) {
                                k = j + currentpos;
                                lfor = osc_lfo(k * lfoFreq) * instr.lfo_amt / 512 + 0.5;
                                e = 1;
                                if (j < attack)
                                    e = j / attack;
                                else if (j >= attack + sustain)
                                    e -= (j - attack - sustain) / release;
                                t = o1t;
                                if (instr.lfo_osc1_freq)
                                    t += lfor;
                                if (instr.osc1_xenv)
                                    t *= e * e;
                                c1 += t;
                                rsample = osc1(c1) * instr.osc1_vol;
                                t = o2t;
                                if (instr.osc2_xenv)
                                    t *= e * e;
                                c2 += t;
                                rsample += osc2(c2) * instr.osc2_vol;
                                if (instr.noise_fader)
                                    rsample += (2 * Math.random() - 1) * instr.noise_fader * e;
                                rsample *= e / 255;
                                f = instr.fx_freq;
                                if (instr.lfo_fx_freq)
                                    f *= lfor;
                                f = 1.5 * Math.sin(f * 3.141592 / this.WAVE_SPS);
                                low += f * band;
                                high = q * (rsample - band) - low;
                                band += f * high;
                                switch (instr.fx_filter) {
                                    case 1:
                                        rsample = high;
                                        break;
                                    case 2:
                                        rsample = low;
                                        break;
                                    case 3:
                                        rsample = band;
                                        break;
                                    case 4:
                                        rsample = low + high;
                                    default:
                                }
                                t = this.osc_sin(k * panFreq) * instr.fx_pan_amt / 512 + 0.5;
                                rsample *= 39 * instr.env_master;
                                k <<= 2;
                                x = chnBuf[k] + (chnBuf[k + 1] << 8) + rsample * (1 - t);
                                chnBuf[k] = x & 255;
                                chnBuf[k + 1] = (x >> 8) & 255;
                                x = chnBuf[k + 2] + (chnBuf[k + 3] << 8) + rsample * t;
                                chnBuf[k + 2] = x & 255;
                                chnBuf[k + 3] = (x >> 8) & 255;
                            }
                        }
                    }
                    currentpos += rowLen;
                }
            }
            p = (instr.fx_delay_time * rowLen) >> 1;
            t = instr.fx_delay_amt / 255;
            for (n = 0; n < waveSamples - p; ++n) {
                b = 4 * n;
                k = 4 * (n + p);
                x = chnBuf[k] + (chnBuf[k + 1] << 8) +
                    (chnBuf[b + 2] + (chnBuf[b + 3] << 8) - 32768) * t;
                chnBuf[k] = x & 255;
                chnBuf[k + 1] = (x >> 8) & 255;
                x = chnBuf[k + 2] + (chnBuf[k + 3] << 8) +
                    (chnBuf[b] + (chnBuf[b + 1] << 8) - 32768) * t;
                chnBuf[k + 2] = x & 255;
                chnBuf[k + 3] = (x >> 8) & 255;
            }
            for (b = 0; b < waveBytes; b += 2) {
                x = mixBuf[b] + (mixBuf[b + 1] << 8) + chnBuf[b] + (chnBuf[b + 1] << 8) - 32768;
                mixBuf[b] = x & 255;
                mixBuf[b + 1] = (x >> 8) & 255;
            }
        };
        this.WAVE_SIZE = this.WAVE_SPS * song.songLen;
        let size = Math.ceil(Math.sqrt(this.WAVE_SIZE * this.WAVE_CHAN / 2));
        let ctx = document.createElement('canvas').getContext('2d');
        this.chnBufWork = ctx.createImageData(size, size).data;
        var b, mixBuf = ctx.createImageData(size, size).data;
        for (b = size * size * 4 - 2; b >= 0; b -= 2) {
            mixBuf[b] = 0;
            mixBuf[b + 1] = 128;
        }
        this.mixBufWork = mixBuf;
    }
    createAudio(settings) {
        return new Promise((resolve, reject) => {
            var b, k, x, wave, l1, l2, s, y;
            var mixBuf = this.mixBufWork, waveBytes = this.WAVE_SIZE * this.WAVE_CHAN * 2;
            this.chnBufWork = null;
            l1 = waveBytes - 8;
            l2 = l1 - 36;
            wave = String.fromCharCode(82, 73, 70, 70, l1 & 255, (l1 >> 8) & 255, (l1 >> 16) & 255, (l1 >> 24) & 255, 87, 65, 86, 69, 102, 109, 116, 32, 16, 0, 0, 0, 1, 0, 2, 0, 68, 172, 0, 0, 16, 177, 2, 0, 4, 0, 16, 0, 100, 97, 116, 97, l2 & 255, (l2 >> 8) & 255, (l2 >> 16) & 255, (l2 >> 24) & 255);
            for (b = 0; b < waveBytes;) {
                x = "";
                for (k = 0; k < 256 && b < waveBytes; ++k, b += 2) {
                    y = 4 * (mixBuf[b] + (mixBuf[b + 1] << 8) - 32768);
                    y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
                    x += String.fromCharCode(y & 255, (y >> 8) & 255);
                }
                wave += x;
            }
            s = "data:audio/wav;base64," + btoa(wave);
            wave = null;
            let audioCtx = new AudioContext();
            let audioEl = new Audio();
            audioEl.preload = "auto";
            audioEl.crossOrigin = "anonymous";
            audioEl.src = s;
            const onLoad = () => {
                let source = audioCtx.createMediaElementSource(audioEl);
                let analyser = audioCtx.createAnalyser();
                analyser.smoothingTimeConstant = 0.85;
                analyser.fftSize = 8192;
                this.audio = audioEl;
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                this.audioAnalyser = analyser;
                resolve(true);
            };
            onLoad();
        });
    }
    play() {
        this.audio.play();
    }
    stop() {
        this.audio.pause();
    }
    mute(ismuted) {
        this.audio.muted = ismuted;
    }
    get currentTime() {
        return this.audio.currentTime;
    }
    set currentTime(time) {
        this.audio.currentTime = time;
    }
    getTracks() {
        throw "not yet implemented";
    }
    getFrequenceData() {
        let bufferLength = this.audioAnalyser.frequencyBinCount;
        let freqArray = new Uint8Array(bufferLength);
        this.audioAnalyser.getByteFrequencyData(freqArray);
        return freqArray;
    }
    osc_sin(value) {
        return Math.sin(value * 6.283184);
    }
    osc_square(value) {
        if (this.osc_sin(value) < 0)
            return -1;
        return 1;
    }
    osc_saw(value) {
        return (value % 1) - 0.5;
    }
    osc_tri(value) {
        var v2 = (value % 1) * 4;
        if (v2 < 2)
            return v2 - 1;
        return 3 - v2;
    }
    getnotefreq(n) {
        return 0.00390625 * Math.pow(1.059463094, n - 128);
    }
    getData(t, n) {
        for (var i = Math.floor(t * this.WAVE_SPS), j = 0, d = [], b = this.mixBufWork; j < 2 * n; j += 2) {
            var k = 4 * (i + j) + 1;
            d.push(t > 0 && k < b.length ? (b[k] + b[k - 1] / 256) / 256 : 0.5);
        }
        return d;
    }
    ;
}
exports.DemolishedSonant = DemolishedSonant;
class DemolishedSoundBox extends demolishedSound_1.DemolishedSoundBase {
    getTracks() {
        throw "not yet implemented";
    }
    createAudio(settings) {
        throw new Error("Method not implemented.");
    }
    play(tm) {
        throw new Error("Method not implemented.");
    }
    stop(tm) {
        throw new Error("Method not implemented.");
    }
    mute(ismuted) {
        throw new Error("Method not implemented.");
    }
    getFrequenceData() {
        throw new Error("Method not implemented.");
    }
}
exports.DemolishedSoundBox = DemolishedSoundBox;
