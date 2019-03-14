// export class DemolishedPlayer {
//     p: WebGLProgram;
//     t: any;
//     f: Array<any>;
//     g: WebGLProgram
//     S(a: number, b: string) {
//         let s = this.c.createShader(a);
//         this.c.shaderSource(s, b);
//         this.c.compileShader(s);
//         return s;
//     }
//     D(b) {
//         this.g.attachShader(this.p, b);
//     }
//     E(b: any) {
//         this.c.bindFramebuffer(36160, b);
//     }
//     P(b: number) {
//         this.c.texParameteri(3553, b, 9729);
//     }
//     R(b, j) {
//         let g = this.c;
//         g.activeTexture(33984 + j);
//         g.bindTexture(3553, this.f[j].t);
//         this.E(b);
//         g.drawArrays(4, 0, 3);
//     }
//     constructor(public w: number, public h: number, public graph: any, public shaders: any) {

//         let i = 0;

//         this.f = new Array<any>();
//         this.t = new Array<any>();

//         let canvas = document.createElement("canvas") as HTMLCanvasElement;
//         document.querySelector("body").appendChild(canvas);

        
       
//         let contextAttributes = {
//             preserveDrawingBuffer: true
//         };


//         let g:any =
//         canvas.getContext('webgl2', contextAttributes) ||
//         canvas.getContext('webgl', contextAttributes) ||
//         canvas.getContext('experimental-webgl', contextAttributes);

//         g.getExtension('OES_standard_derivatives');
//         g.getExtension('OES_texture_float_linear');
//         g.getExtension('OES_texture_half_float_linear');
//         g.getExtension('EXT_texture_filter_anisotropic');
//         g.getExtension('EXT_color_buffer_float');
//         g.getExtension("WEBGL_depth_texture");
//                 g.getExtension("EXT_shader_texture_lod");


//         let p = g.createProgram();

//         this.p = p;
//         this.g = g;

//         // set up an array of "program's", fragment and vertex will be provided by shaders object 

//         this.D(this.S(35633, "attribute vec3 b;varying vec2 u;void main(){gl_Position=vec4(b,1.);u=(b.xy+1.)/2.;}"));
//         this.D(this.S(35632, "precision highp float;uniform vec2 p;varying vec2 u;uniform sampler2D s;void main(){gl_FragColor=texture2D(s,u)*.98+vec4(clamp(1.-length(u-p)*9.,0.,1.))+vec4(0,0,0,1);}"));

//         g.linkProgram(p);

//         g.useProgram(p);
//         g.bindBuffer(34962, g.createBuffer());
//         g.bufferData(34962, new Float32Array([-1, -1, 3, -1, -1, 3]), 35044);
//         g.enableVertexAttribArray(0);
//         g.vertexAttribPointer(0, 2, 5126, false, 8, 0);

//         for (; i < this.w * this.h * 4; i++) this.t[i] = 0;
        
//         for (i = 0; i < 2; i++) {
//             this.f[i] = g.createFramebuffer();
//             this.f[i].t = g.createTexture();
//             g.bindTexture(3553, this.f[i].t);
//             g.pixelStorei(3317, 1);
//             g.texImage2D(3553, 0, 6408, w, h, 0, 6408, 5126, new Float32Array(this.t));
//             this.P(10241);
//             this.P(10240);
//             this.E(this.f[i]);
//             g.framebufferTexture2D(36160, 36064, 3553, this.f[i].t, 0);
//         }

//         i = 1;
//         let an = (t: number) => {
//             let j = 1 - i;
//             g.uniform1i(g.getUniformLocation(p, "time"), j);
//             g.uniform2f(g.getUniformLocation(p, "resolution"), w, h);
//             g.viewport(0, 0, w, h);
//             this.R(this.f[i], 1);
//             i = j;
//             requestAnimationFrame(an);
//         };
//         an(0);
//     }
// }