
/**
 * DemolishedLoad contains methods for loading assets such as music, textures etc
 * using fetch fails due to insecure file:// scheme access.
 * there is a few different, fat, astute pollyfills  avaiable, but i prefere this .
 * .fetch ( that dont work out-of-the-box) in electron, as well as electron-fetch is 
 * not suitiable in "my" case
 * @export
 * @param {string} file 
 * @returns {Promise<any>} 
 */
export default 
      // fetch(..) 
      function loadResource(file:string):Promise<any>{
        let promise = new Promise((resolve, reject) =>{
            let wrapper = new XMLHttpRequestWrapper(file,resolve,reject);
            return wrapper;
        });
        return promise;
     }
class XMLHttpRequestWrapper{    
    private xhr:XMLHttpRequest;
    constructor(private file,resolve,reject){
        let xhr = new XMLHttpRequest(); 
            xhr.open("GET", file); 
            xhr.responseType = "blob";
            xhr.onloadend =function(evt:any){
                try{
                     if(xhr.status == 404) throw "failed to loadResource " +file
                     resolve(new ResponseWrapper(xhr.response));
                }catch(err){
                     reject(xhr.statusText);
                }
            }
            xhr.onerror = function(err){
                reject(err);
            };
            xhr.send();
            this.xhr = xhr;        
    }
}
    export class ResponseWrapper{
       constructor(private blobData: Blob) {      
    }

    public arrayBuffer():Promise<ArrayBuffer>{
             return new Promise((resolve, reject) =>{
                    let reader = new FileReader();
                        reader.onload = () => {   
                            resolve(reader.result);                     
                        }
                reader.readAsArrayBuffer(this.blobData);
             });
    }

    public blob():Promise<any>{
             return new Promise((resolve, reject) =>{
                    resolve(this.blobData);
             });
    }
    public text():Promise<any>{
            let promise = new Promise((resolve, reject) =>{
                let reader = new FileReader();
                reader.onload = () => {   
                    resolve(reader.result);                     
                }
                reader.readAsText(this.blobData);
            });
            return promise;
    }
    public json():Promise<any>{
            let promise = new Promise((resolve, reject) =>{
                let reader = new FileReader();
                reader.onload = () => {   
                    resolve(JSON.parse(reader.result));                     
                }
                reader.readAsText(this.blobData);
            });
            return promise;
    }
}


