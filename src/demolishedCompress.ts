// export class DemolishedCompressor {
//         LZG_HEADER_SIZE: number = 16;
//         LZG_METHOD_COPY: number = 0;
//         LZG_METHOD_LZG1: number = 1;

//         private LZG_LENGTH_DECODE_LUT: Array<number> = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
//                 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 35, 48, 72, 128];
        
//         public arrayBuffer(blob:Blob):Promise<string>{
//                 return new Promise((resolve, reject) =>{
//                         let reader = new FileReader();
//                                 reader.onload = () => {   
//                                 resolve(reader.result);                     
//                                 }
                        
//                         reader.readAsBinaryString(blob);
//                 });
//         }

//         load(file:string):Promise<any>{
//                 return new Promise((resolve, reject) =>{
//                         let xhr = new XMLHttpRequest(); 
//                         xhr.open("GET", file); 
//                         xhr.responseType = "blob";
//                         xhr.onloadend =function(evt:any){
//                             try{
//                                  if(xhr.status == 404) throw "failed to loadResource " +file
//                                  resolve(xhr.response);
//                             }catch(err){
//                                  reject(xhr.statusText);
//                             }
//                         }
//                         xhr.onerror = function(err){
//                             reject(err);
//                         };
//                         xhr.send();
//                 });  
//              }
        
//         constructor() {
               
//         }
//         outdata: any;
//         calcChecksum(data: string) {
//                 var a = 1;
//                 var b = 0;
//                 var i = this.LZG_HEADER_SIZE;
//                 while (i < data.length) {
//                         a = (a + (data.charCodeAt(i) & 0xff)) & 0xffff;
//                         b = (b + a) & 0xffff;
//                         i++;
//                 }
//                 return (b << 16) | a;
//         }

//         decode(data:string) {
//                 this.outdata = null;
//                 if ((data.length < this.LZG_HEADER_SIZE) || (data.charCodeAt(0) != 76) ||
//                         (data.charCodeAt(1) != 90) || (data.charCodeAt(2) != 71)) {
//                         return 0;
//                 }
//                 var checksum = ((data.charCodeAt(11) & 0xff) << 24) |
//                         ((data.charCodeAt(12) & 0xff) << 16) |
//                         ((data.charCodeAt(13) & 0xff) << 8) |
//                         (data.charCodeAt(14) & 0xff);
//                 if (this.calcChecksum(data) != checksum) {
//                         return 0;
//                 }
//                 var method = data.charCodeAt(15) & 0xff;
//                 if (method == this.LZG_METHOD_LZG1) {
//                         var m1 = data.charCodeAt(16) & 0xff;
//                         var m2 = data.charCodeAt(17) & 0xff;
//                         var m3 = data.charCodeAt(18) & 0xff;
//                         var m4 = data.charCodeAt(19) & 0xff;
//                         var symbol, b, b2, b3, len, offset;
//                         var dst = new Array();
//                         var dstlen = 0;
//                         var k = this.LZG_HEADER_SIZE + 4;
//                         var datalen = data.length;
//                         while (k <= datalen) {
//                                 symbol = data.charCodeAt(k++) & 0xff;
//                                 if ((symbol != m1) && (symbol != m2) && (symbol != m3) && (symbol != m4)) {
//                                         dst[dstlen++] = symbol;
//                                 }
//                                 else {
//                                         b = data.charCodeAt(k++) & 0xff;
//                                         if (b != 0) {
//                                                 if (symbol == m1) {
//                                                         // marker1 - "Distant copy"
//                                                         len = this.LZG_LENGTH_DECODE_LUT[b & 0x1f];
//                                                         b2 = data.charCodeAt(k++) & 0xff;
//                                                         b3 = data.charCodeAt(k++) & 0xff;
//                                                         offset = (((b & 0xe0) << 11) | (b2 << 8) | b3) + 2056;
//                                                 }
//                                                 else if (symbol == m2) {
//                                                         // marker2 - "Medium copy"
//                                                         len = this.LZG_LENGTH_DECODE_LUT[b & 0x1f];
//                                                         b2 = data.charCodeAt(k++) & 0xff;
//                                                         offset = (((b & 0xe0) << 3) | b2) + 8;
//                                                 }
//                                                 else if (symbol == m3) {
//                                                         // marker3 - "Short copy"
//                                                         len = (b >> 6) + 3;
//                                                         offset = (b & 63) + 8;
//                                                 }
//                                                 else {
//                                                         // marker4 - "Near copy (incl. RLE)"
//                                                         len = this.LZG_LENGTH_DECODE_LUT[b & 0x1f];
//                                                         offset = (b >> 5) + 1;
//                                                 }
//                                                 for (i = 0; i < len; i++) {
//                                                         dst[dstlen] = dst[dstlen - offset];
//                                                         dstlen++;
//                                                 }
//                                         }
//                                         else {
//                                                 dst[dstlen++] = symbol;
//                                         }
//                                 }
//                         }
//                         // Store the decompressed data in the lzgmini object for later retrieval
//                         this.outdata = dst;
//                         return dstlen;
//                 }
//                 else if (method == this.LZG_METHOD_COPY) {
//                         // Plain copy
//                         var dst = new Array();
//                         var dstlen = 0;
//                         var datalen = data.length;
//                         for (var i = this.LZG_HEADER_SIZE; i < datalen; i++) {
//                                 dst[dstlen++] = data.charCodeAt(i) & 0xff;
//                         }
//                         this.outdata = dst;
//                         return dstlen;
//                 }
//                 else {
//                         // Unknown method
//                         return 0;
//                 }
//         }
//         getByteArray() {
//                 return this.outdata;
//         }

//         getStringLatin1(): string {
//                 var str = "";
//                 if (this.outdata != null) {
//                         var charLUT = new Array();
//                         for (var i = 0; i < 256; ++i)
//                                 charLUT[i] = String.fromCharCode(i);
//                         var outlen = this.outdata.length;
//                         for (var i = 0; i < outlen; i++)
//                                 str += charLUT[this.outdata[i]];
//                 }
//                 return str;
//         }

//         getStringUTF8(): string {
//                 var str = "";
//                 if (this.outdata != null) {
//                         var charLUT = new Array<string>();
//                         for (var i = 0; i < 128; ++i)
//                                 charLUT[i] = String.fromCharCode(i);
//                         var c;
//                         var outlen = this.outdata.length;
//                         for (var i = 0; i < outlen;) {
//                                 c = this.outdata[i++];
//                                 if (c < 128) {
//                                         str += charLUT[c];
//                                 }
//                                 else {
//                                         if ((c > 191) && (c < 224)) {
//                                                 c = ((c & 31) << 6) | (this.outdata[i++] & 63);
//                                         }
//                                         else {
//                                                 c = ((c & 15) << 12) | ((this.outdata[i] & 63) << 6) | (this.outdata[i + 1] & 63);
//                                                 i += 2;
//                                         }
//                                         str += String.fromCharCode(c);
//                                 }
//                         }
//                 }
//                 return str;
//         }

// }



