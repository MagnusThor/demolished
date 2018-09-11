import { TimeFragment } from './demolishedModels';
import { Utils } from './demolishedUtils';
type ResizeCallback = (s: number, e: number) => any;
let _highestZ : number = 100000;


export class Timeline { 

    public Segments: Array<Segment> = new Array<Segment>();
    private containerId: string;
    constructor(containerId: string){
        this.containerId = containerId;
   }
    createSegment(title: string, start: number, end: number, updateCallback? : ResizeCallback) : Segment
    {
        var segment = new Segment(title, start, end, this.containerId, updateCallback);
        this.Segments.push(segment);
        return segment;
    }
    multiline()
    {
        var _allSegments = document.getElementsByClassName("segment");
        for(var i=0;i<_allSegments.length;i++)
        {
           (<HTMLElement>_allSegments[i]).style.top = i * (<HTMLElement>_allSegments[i]).clientHeight + "px";
        } 
    }
    singleline()
    {
        var _allSegments = document.getElementsByClassName("segment");
        for(var i=0;i<_allSegments.length;i++)
        {
           (<HTMLElement>_allSegments[i]).style.top = "0px";
        } 
    }

    get totalTime():number{
        return this.Segments.reduce( (x:any,y:any) => {
                return x.start + y.start;
          },0);
    }
}

export class Segment extends TimeFragment  {
    title: string = "";
    start: number = 0;
    end: number = 0;

    private container: HTMLElement | Element;
    private hostElement: any;
    public updateCallback: ResizeCallback;




    /**
     * Scale the time relative to container size
     *
     * @private
     * @param {number} v
     * @returns {number}
     * @memberof Segment
     */
    private scaleToFit(v:number):number{
        return (this.containerWidth  / 6250200) * v; // todo : fix time based on graph duration / totals time of segs..
    }

    get length(): number { 
        let l =  this.scaleToFit(this.end-this.start);       
        return l;
    }

    // updateCallback maybe implement an event, or use Observable, more overhead on observable
    // compared to trad.

    get containerWidth():number{
        return this.container.clientWidth;
    }

    constructor(title: string, start: number, end: number, containerId: string, updateCallback? : ResizeCallback) {
      
        super(title,start,end);

        this.title = title;        
        this.start = start;
        this.end = end;
        // document.getElementById(containerId); 
        this.container = Utils.$(containerId);

     
        let _segmentElement = Utils.el("div");
        _segmentElement.classList.add("segment");
        
        // todo: Use Utils.el(...) for element creatation such as above...
    
        let _leftDragElement = Utils.el("div"); //document.createElement("div");
        _leftDragElement.setAttribute("class", "segment-left-handle");

        let _centerDragElement = document.createElement("div");
        _centerDragElement.setAttribute("class", "segment-center-handle");

        let _rightDragElement = document.createElement("div");
        _rightDragElement.setAttribute("class", "segment-right-handle");

        //On purpose... float right..
        _segmentElement.appendChild(_rightDragElement);
        _segmentElement.appendChild(_centerDragElement);
        _segmentElement.appendChild(_leftDragElement);

        /*
        let _segmentTitleElement = document.createElement("span");
        _segmentTitleElement.setAttribute("class", "segment-details");
        _segmentTitleElement.innerHTML = this.title;
        _centerDragElement.appendChild(_segmentTitleElement);
        */


       let _segmentTitleElement = Utils.el("span",this.title);
       _segmentTitleElement.classList.add("segment-details");
       _centerDragElement.appendChild(_segmentTitleElement);

        this.hostElement = _segmentElement

        this.hostElement.style.backgroundColor = this.getRandomColor();
        this.container.appendChild(this.hostElement);

        let _dragging : boolean = false;
        let _resizingLeft : boolean = false; 
        let _resizingRight : boolean = false;

        let _lastX : number;
        let _lastLeftX : number;
        let _lastRightX : number;

        let _initialX : number;

        _segmentElement.onmousedown = (ev:MouseEvent) => {
            _dragging = true;
            _lastX = ev.clientX;
            _highestZ += 10;
            _segmentElement.style.zIndex = _highestZ.toString();
        }; 

        _leftDragElement.addEventListener("mousedown",  (ev:MouseEvent) =>{
            _resizingLeft = true;
            _lastLeftX = ev.clientX;
            _highestZ += 10;

            ev.stopPropagation();
        });

        _leftDragElement.addEventListener("mouseup", (ev:MouseEvent) => {
            _resizingLeft = false;
        });

        _rightDragElement.addEventListener("mousedown",  (ev:MouseEvent) =>{
            _resizingRight = true;
            _lastRightX = ev.clientX;
            _highestZ += 10;

            ev.stopPropagation();
        });

        _rightDragElement.addEventListener("mouseup", (ev:MouseEvent) => {
            _resizingRight = false;
        });

        this.container.addEventListener("mousemove", (ev:MouseEvent) => {
            if (_dragging)
            {
                _segmentElement.style.left = (_segmentElement.offsetLeft - (_lastX - ev.clientX)).toString() + "px";

                _lastX = ev.clientX;
            } 
            if (_resizingLeft)
            {
                _segmentElement.style.width = (_segmentElement.offsetWidth + (_lastLeftX - ev.clientX)).toString() + "px";
                _segmentElement.style.left = (_segmentElement.offsetLeft - (_lastLeftX - ev.clientX)).toString() + "px";

                _lastLeftX = ev.clientX;
            }
            if (_resizingRight)
            {
                _segmentElement.style.width = (_segmentElement.offsetWidth - (_lastRightX - ev.clientX)).toString() + "px";

                _lastRightX = ev.clientX;
            }
        });

        this.container.addEventListener("mouseup", (ev:MouseEvent) =>{
            _dragging = false;
            _resizingLeft = false;
            _resizingRight = false;
        });

        _segmentElement.addEventListener("mouseup",  (ev:MouseEvent)  =>{
            _dragging = false;
            _resizingLeft = false;
            _resizingRight = false;
        });

        if (updateCallback)
            this.updateCallback = updateCallback;
        else
            this.updateCallback = (s,e) => { console.log("start: " + s + ", end:" + e ) };

        this.init();

        this.updateInfo();
    }

    init() {
        this.hostElement.style.width = this.length;
        this.hostElement.style.left = this.scaleToFit( this.start);
    }
 
    updateInfo():void
    {
        if (this.updateCallback)
            this.updateCallback(this.start, this.end);
    }s

    getRandomColor():string {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }
}