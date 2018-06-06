declare var MediaRecorder: any;
export class DemolishedRecorder{
    data: Array<Blob>;
    recorder: any;
    mediaStream: MediaStream;

    toBlob():string{
        let blob = new Blob(this.data, {
            type: 'video/webm'
          });

       return URL.createObjectURL(blob);
    }
    constructor(public videoTrack:MediaStreamTrack,public audioTrack:MediaStreamTrack){
        this.mediaStream = new MediaStream([videoTrack,audioTrack]);
        this.recorder = new MediaRecorder(this.mediaStream,{
            mimeType:'video/webm;codecs=vp9'});
        
        this.recorder.ondataavailable = (e:any) =>{
            if(e.data.size > 0)
                this.data.push(e.data);
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