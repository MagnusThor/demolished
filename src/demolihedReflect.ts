// export const GL_TO_GLSL_TYPES = {
//     'FLOAT': 'float',
//     'FLOAT_VEC2': 'vec2',
//     'FLOAT_VEC3': 'vec3',
//     'FLOAT_VEC4': 'vec4',
//     'INT': 'int',
//     'INT_VEC2': 'ivec2',
//     'INT_VEC3': 'ivec3',
//     'INT_VEC4': 'ivec4',
//     'BOOL': 'bool',
//     'BOOL_VEC2': 'bvec2',
//     'BOOL_VEC3': 'bvec3',
//     'BOOL_VEC4': 'bvec4',
//     'FLOAT_MAT2': 'mat2',
//     'FLOAT_MAT3': 'mat3',
//     'FLOAT_MAT4': 'mat4',
//     'SAMPLER_2D': 'sampler2D',
//     'SAMPLER_CUBE': 'samplerCube'
// }

// export class GLHelper {
//     GL_TABLE: any;
//     constructor() { }
//     getType(gl, type) {
//         if (!this.GL_TABLE) {
//             var typeNames = Object.keys(GL_TO_GLSL_TYPES)
//             this.GL_TABLE = {}
//             for (var i = 0; i < typeNames.length; ++i) {
//                 var tn = typeNames[i]
//                 this.GL_TABLE[gl[tn]] = GL_TO_GLSL_TYPES[tn]
//             }
//         }
//     }
//     runtimeUniforms(gl, program) {
//         let numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
//         const result = []
//         for (var i = 0; i < numUniforms; ++i) {
//             var info = gl.getActiveUniform(program, i)
//             if (info) {
//                 var type = this.getType(gl, info.type)
//                 if (info.size > 1) {
//                     for (var j = 0; j < info.size; ++j) {
//                         result.push({
//                             name: info.name.replace('[0]', '[' + j + ']'),
//                             type: type
//                         })
//                     }
//                 } else {
//                     result.push({
//                         name: info.name,
//                         type: type
//                     })
//                 }
//             }
//         }
//         return result
//     }     
// }

// export class GLError{

//         constructor(a,b){

//         }
// }


// export class GLUniformWrapper{
//         coallesced: object;
//         makeReflectTypes(uniforms, useIndex):object {
//         var obj = {}
//         for(var i=0; i<uniforms.length; ++i) {
//           var n = uniforms[i].name
//           var parts = n.split(".")
//           var o = obj
//           for(var j=0; j<parts.length; ++j) {
//             var x = parts[j].split("[")
//             if(x.length > 1) {
//               if(!(x[0] in o)) {
//                 o[x[0]] = []
//               }
//               o = o[x[0]]
//               for(var k=1; k<x.length; ++k) {
//                 var y = parseInt(x[k])
//                 if(k<x.length-1 || j<parts.length-1) {
//                   if(!(y in o)) {
//                     if(k < x.length-1) {
//                       o[y] = []
//                     } else {
//                       o[y] = {}
//                     }
//                   }
//                   o = o[y]
//                 } else {
//                   if(useIndex) {
//                     o[y] = i
//                   } else {
//                     o[y] = uniforms[i].type
//                   }
//                 }
//               }
//             } else if(j < parts.length-1) {
//               if(!(x[0] in o)) {
//                 o[x[0]] = {}
//               }
//               o = o[x[0]]
//             } else {
//               if(useIndex) {
//                 o[x[0]] = i
//               } else {
//                 o[x[0]] = uniforms[i].type
//               }
//             }
//           }
//         }
//         return obj
//       }
//       identity(x) {
//         var c = new Function('y', 'return function(){return y}')
//         return c(x)
//       }
      
//       makeVector(length, fill) {
//         var result = new Array(length)
//         for(var i=0; i<length; ++i) {
//           result[i] = fill
//         }
//         return result
//       }

//        makeGetter(index) {
//         var proc = new Function(
//             'gl'
//           , 'wrapper'
//           , 'locations'
//           , 'return function(){return gl.getUniform(wrapper.program,locations[' + index + '])}')
//         return proc(this.gl, this.wrapper, this.locations)
//       }

//       makePropSetter(path, index, type) {
//         switch(type) {
//           case 'bool':
//           case 'int':
//           case 'sampler2D':
//           case 'samplerCube':
//             return 'gl.uniform1i(locations[' + index + '],obj' + path + ')'
//           case 'float':
//             return 'gl.uniform1f(locations[' + index + '],obj' + path + ')'
//           default:
//             var vidx = type.indexOf('vec')
//             if(0 <= vidx && vidx <= 1 && type.length === 4 + vidx) {
//               var d = type.charCodeAt(type.length-1) - 48
//               if(d < 2 || d > 4) {
//                 throw new GLError('', 'Invalid data type')
//               }
//               switch(type.charAt(0)) {
//                 case 'b':
//                 case 'i':
//                   return 'gl.uniform' + d + 'iv(locations[' + index + '],obj' + path + ')'
//                 case 'v':
//                   return 'gl.uniform' + d + 'fv(locations[' + index + '],obj' + path + ')'
//                 default:
//                   throw new GLError('', 'Unrecognized data type for vector ' + name + ': ' + type)
//               }
//             } else if(type.indexOf('mat') === 0 && type.length === 4) {
//               var d = type.charCodeAt(type.length-1) - 48
//               if(d < 2 || d > 4) {
//                 throw new GLError('', 'Invalid uniform dimension type for matrix ' + name + ': ' + type)
//               }
//               return 'gl.uniformMatrix' + d + 'fv(locations[' + index + '],false,obj' + path + ')'
//             } else {
//               throw new GLError('', 'Unknown uniform data type for ' + name + ': ' + type)
//             }
//           break
//         }
//       }

//       defaultValue(type) {
//         switch(type) {
//           case 'bool':
//             return false
//           case 'int':
//           case 'sampler2D':
//           case 'samplerCube':
//             return 0
//           case 'float':
//             return 0.0
//           default:
//             var vidx = type.indexOf('vec')
//             if(0 <= vidx && vidx <= 1 && type.length === 4 + vidx) {
//               var d = type.charCodeAt(type.length-1) - 48
//               if(d < 2 || d > 4) {
//                 throw new GLError('', 'Invalid data type')
//               }
//               if(type.charAt(0) === 'b') {
//                 return this.makeVector(d, false)
//               }
//               return this.makeVector(d, 0)
//             } else if(type.indexOf('mat') === 0 && type.length === 4) {
//               var d = type.charCodeAt(type.length-1) - 48
//               if(d < 2 || d > 4) {
//                 throw new GLError('', 'Invalid uniform dimension type for matrix ' + name + ': ' + type)
//               }
//               return this.makeVector(d*d, 0)
//             } else {
//               throw new GLError('', 'Unknown uniform data type for ' + name + ': ' + type)
//             }
//           break
//         }
//       }
    
//       enumerateIndices(prefix, type) {
//         if(typeof type !== 'object') {
//           return [ [prefix, type] ]
//         }
//         var indices = []
//         for(var id in type) {
//           var prop = type[id]
//           var tprefix = prefix
//           if(parseInt(id) + '' === id) {
//             tprefix += '[' + id + ']'
//           } else {
//             tprefix += '.' + id
//           }
//           if(typeof prop === 'object') {
//             indices.push.apply(indices, this.enumerateIndices(tprefix, prop))
//           } else {
//             indices.push([tprefix, prop])
//           }
//         }
//         return indices
//       }
//       makeSetter(type) {
//         var code = [ 'return function updateProperty(obj){' ]
//         var indices =  this.enumerateIndices('', type)
//         for(var i=0; i<indices.length; ++i) {
//           var item = indices[i]
//           var path = item[0]
//           var idx  = item[1]
//           if(this.locations[idx]) {
//             code.push(this.makePropSetter(path, idx, this.uniforms[idx].type))
//           }
//         }
//         code.push('return obj}')
//         var proc = new Function('gl', 'locations', code.join('\n'))
//         return proc(this.gl, this.locations)
//       }

//       storeProperty(obj, prop, type) {
//         if(typeof type === 'object') {
//           var child = this.processObject(type)
//           Object.definePrUniformsBaseoperty(obj, prop, {
//             get: this.identity(child),
//             set: this.makeSetter(type),
//             enumerable: true,
//             configurable: false
//           })
//         } else {
//           if(this.locations[type]) {
//             Object.defineProperty(obj, prop, {
//               get: this.makeGetter(type),
//               set: this.makeSetter(type),
//               enumerable: true,
//               configurable: false
//             })
//           } else {
//             obj[prop] = this.defaultValue(this.uniforms[type].type)
//           }
//         }
//       }

//       processObject(obj) {
//         var result
//         if(Array.isArray(obj)) {
//           result = new Array(obj.length)
//           for(var i=0; i<obj.length; ++i) {
//             this.storeProperty(result, i, obj[i])
//           }
//         } else {
//           result = {}
//           for(var id in obj) {
//             this.storeProperty(result, id, obj[id])
//           }
//         }
//         return result
//       }
    

//       constructor(public gl, public wrapper, public uniforms, public locations){
//             this.coallesced = this.makeReflectTypes(this.uniforms,true);
//       }

//       foo(){
//         return {
//             get: this.identity(this.processObject(this.coallesced)),
//             set: this.makeSetter(this.coallesced),
//             enumerable: true,
//             configurable: true
//           }
//       }
    
       

// }