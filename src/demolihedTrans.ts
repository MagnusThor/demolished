// export class DemolishedTrans {
//     private parent: Element;
//     constructor(public parentEl: string, public graph: any) {
//         this.parent = document.querySelector(parentEl) as Element;
//     }
//     createTimeout(name, start, classes) {
//         let i = setTimeout( () => {
//            classes.forEach((cssClass: string) => {
//                 this.parent.classList.add(cssClass);
             
//             });
//             this.parent.addEventListener("animationend", () => {
//                 this.parent.classList.remove(classes);
          
//             });
//         }, start);
//     }
//     start(n: number) {
//         this.graph.timeLine.forEach((el: any, i: number) => {
//             this.createTimeout(el.name, el.start, el.classes);
//         });
//     }
// }
// export class Trans {
//     name: string;
//     start: number;
//     classes: Array < string > 
// }