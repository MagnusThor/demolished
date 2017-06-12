declare var MediaRecorder: any;
export class DemolishedRecorder{
    data: Array<Blob>;
    recorder: any;
    mediaStream: MediaStream;
    constructor(public videoTrack:MediaStreamTrack,public audioTrack:MediaStreamTrack){
        this.mediaStream = new MediaStream([videoTrack,audioTrack]);
        this.recorder = new MediaRecorder(this.mediaStream,{
            mimeType:'video/webm;codecs=vp9'});
        
        this.recorder.ondataavailable = (e) =>{
                this.data.push(e.data);
                console.log(this.data.length);
        }        
    }
    stop(){
        this.recorder.stop();
    }
    start(n:number){
            this.data = new Array<Blob>();
            this.recorder.start(n)
    }
}