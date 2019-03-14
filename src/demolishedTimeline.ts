import { TimeFragment } from './demolishedModels';
import { Utils } from './demolishedUtils';
import { DemolishedEd } from '../index';
type ResizeCallback = (...args: any) => any;
let _highestZ: number = 100000;


export class Timeline {

    public Segments: Array<Segment> = new Array<Segment>();
    private containerId: string;
    constructor(containerId: string, totalTime: number) {
        this.containerId = containerId;
    }
    createSegment(title: string, start: number, end: number, updateCallback?: ResizeCallback): Segment {
        let segment = new Segment(title, start, end, this.containerId, updateCallback);
        this.Segments.push(segment);
        return segment;
    }
    multiline() {
        var _allSegments = Utils.$$(".segment");
        for (var i = 0; i < _allSegments.length; i++) {
            (<HTMLElement>_allSegments[i]).style.top = i * (<HTMLElement>_allSegments[i]).clientHeight + "px";
        }
    }
    singleline() {
        var _allSegments =  Utils.$$("segment");
        for (var i = 0; i < _allSegments.length; i++) {
            (<HTMLElement>_allSegments[i]).style.top = "0px";
        }
    }

    get totalTime(): number {
        return this.Segments.reduce((x: any, y: any) => {
            return x.start + y.start;
        }, 0);
    }
}

export class Segment extends TimeFragment {
    // title: string = "";
    // start: number = 0;
    // end: number = 0;

    private container: HTMLElement | Element;
    private hostElement: HTMLElement | HTMLDivElement;

    /**
     * Scale the time relative to container size
     *
     * @private
     * @param {number} v
     * @returns {number}
     * @memberof Segment
     */
    private scaleToFit(v: number): number {
        //console.log("scaleToFit:",v,this.containerWidth  / 6250200);
        return (this.containerWidth / 6250200) * v; // todo : fix time based on graph duration / totals time of segs..
    }
    scaleToGraph(v: number): number {
        // todo: should use prop insetad of const.. Gee!  
        let d = v / (this.containerWidth / 6250200);
        return d;
    }

    get length(): number {
        let l = this.scaleToFit(this.end - this.start);
        return l;
    }
    // updateCallback maybe implement an event, or use Observable, more overhead on observable
    // compared to trad.
    get containerWidth(): number {
        return this.container.clientWidth;
    }

    constructor(public title: string, public start: number, public end: number, public containerId: string, public updateCallback?: ResizeCallback) {

        super(title, start, end);
        this.container = Utils.$(containerId);
        let _segmentElement = Utils.el("div");
        _segmentElement.classList.add("segment");


        let _leftDragElement = Utils.el("div"); //document.createElement("div");
        _leftDragElement.setAttribute("class", "segment-left-handle");

        let _centerDragElement = Utils.el("div");
        _centerDragElement.classList.add("segment-center-handle");

        let _rightDragElement = Utils.el("div");
        _rightDragElement.classList.add("segment-right-handle");

    
        _segmentElement.appendChild(_rightDragElement);
        _segmentElement.appendChild(_centerDragElement);
        _segmentElement.appendChild(_leftDragElement);

        let _segmentTitleElement = Utils.el("span", this.title);
        _segmentTitleElement.classList.add("segment-details");
        _centerDragElement.appendChild(_segmentTitleElement);

        this.hostElement = _segmentElement

        this.hostElement.style.backgroundColor = this.getRandomColor();

        this.container.appendChild(this.hostElement);

        let _dragging: boolean = false;
        let _resizingLeft: boolean = false;
        let _resizingRight: boolean = false;

        let _lastX: number;
        let _lastLeftX: number;
        let _lastRightX: number;

        _segmentElement.onmousedown = (ev: MouseEvent) => {
            _dragging = true;
            _lastX = ev.clientX;
            _highestZ += 10;
            _segmentElement.style.zIndex = _highestZ.toString();
        };

        _leftDragElement.addEventListener("mousedown", (ev: MouseEvent) => {
            _resizingLeft = true;
            _lastLeftX = ev.clientX;
            _highestZ += 10;

            ev.stopPropagation();
        });

        _leftDragElement.addEventListener("mouseup", (ev: MouseEvent) => {
            _resizingLeft = false;
            //this.updateInfo();
        });

        _rightDragElement.addEventListener("mousedown", (ev: MouseEvent) => {
            _resizingRight = true;
            _lastRightX = ev.clientX;
            _highestZ += 10;
            ev.stopPropagation();
        });

        _rightDragElement.addEventListener("mouseup", (ev: MouseEvent) => {
            _resizingRight = false;
            //this.updateInfo();
        });

        this.container.addEventListener("mousemove", (ev: MouseEvent) => {
            if (_dragging) {
                _segmentElement.style.left = (_segmentElement.offsetLeft - (_lastX - ev.clientX)).toString() + "px";

                _lastX = ev.clientX;
            }
            if (_resizingLeft) {
                _segmentElement.style.width = (_segmentElement.offsetWidth + (_lastLeftX - ev.clientX)).toString() + "px";
                _segmentElement.style.left = (_segmentElement.offsetLeft - (_lastLeftX - ev.clientX)).toString() + "px";

                _lastLeftX = ev.clientX;
            }
            if (_resizingRight) {
                _segmentElement.style.width = (_segmentElement.offsetWidth - (_lastRightX - ev.clientX)).toString() + "px";

                _lastRightX = ev.clientX;
            }
        });

        this.container.addEventListener("mouseup", (ev: MouseEvent) => {
            _dragging = false;
            _resizingLeft = false;
            _resizingRight = false;
            //   this.updateInfo();
        });

        _segmentElement.addEventListener("mouseup", (ev: MouseEvent) => {
            _dragging = false;
            _resizingLeft = false;
            _resizingRight = false
            this.updateInfo();

        });

        this.init();

        //        this.updateInfo();
    }

    init() {
        this.hostElement.style.width = this.length.toString();
        this.hostElement.style.left = this.scaleToFit(this.start).toString();
    }

    updateInfo(): void {

        let x = Math.ceil(this.scaleToGraph(parseInt(this.hostElement.style.left)));
        let w = Math.ceil(this.scaleToGraph(parseInt(this.hostElement.style.width)))

        x < 0 ? x = 0 : x = x;

        let evt = {
            name: this.title,
            start: x,
            stop: x+w,
            length: w,
        };

        DemolishedEd.showJSON(evt, Utils.$(".dlg-timeline"));

        if (this.updateCallback)
            this.updateCallback(evt);
    }

    getRandomColor(): string {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}