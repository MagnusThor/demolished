# Demolished

Demolished is a WebGL library for browser 'demos' and shader-fun in general. demolished is and will be TypeScript a 
framework thing!

## Install

Todo: publish as a npm package  

## Gettings started

Below you can find a simle guide that shows how you 
create a demolished application (demo) using TypeSctipt and 
GLSL.

### Folders & files

    root
        assets
            song.mp3
        entities
            timeline.json
            


### Create an instance of demolished

TBD


#### Demolished.AudioAnalyzerSettings


#### Demolished.World()




### Create a glsl effect

Each effet constits of a vertex.glsl file and a fragment.glsl file.  To add a new effect
create a folder ( i.e  plasma ) within the entities folder.


    root
        assets
        entities
            plasma
                    vertex.glsl
                    fragment.glsl
            

### Add an effect to the demo timeline / story

The demo timeline is located in the assets folder, each effect of the demo is reptresented by the following JSON.  

        {
        "name": string,
        "description": string,
        "start": number 
        "stop": number,
        "textures": Array<Asset>
        }

#### example
    ..
     "entities": [{
        "name": "boxes",
        "description": "",
        "start": 0,
        "stop": 249600,
        "textures": [
        ]
        ...

### Add textures to shader programs

        ..
        "textures":[
            {
                "url" :"/assets/noise.jpg",
                "uniform" :"uSampler",
                "width": 1024,
                "height": 1024
            },
            {
                "url" :"/assets/noise2.png",
                "uniform" :"uSampler2",
                "width": 512,
                "height": 512
            }
        ]


### DemolishedRecorder

Record the demo playtback as a webm file

    DemolishedRecorder {
        videoTrack: MediaStreamTrack;
        audioTrack: MediaStreamTrack;
        data: Array<Blob>;
        recorder: any;
        mediaStream: MediaStream;
        constructor(videoTrack: MediaStreamTrack, audioTrack: MediaStreamTrack);
        stop(): void;
        start(n: number): void;
    }


#### example 

   let videoStream = this.world.canvas["captureStream"](60) as MediaStream;
                let videoTrack = videoStream.getVideoTracks()[0];
                let audioTrack = this.world.getAudioTracks()[0];

                this.recorder = new DemolishedRecorder(videoTrack, audioTrack);
                this.recorder.start(1000);
            }

