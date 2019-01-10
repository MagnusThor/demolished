import ColorPicker from './pickers/ColorPicker';
import FloatPicker from './pickers/FloatPicker';
import Picker from './pickers/Picker';
import Vec2Picker from './pickers/Vec2Picker';
import Vec3Picker from './pickers/Vec2Picker';
import Modal from './modals/Modal'
import Color from './pickers/types/Color';
import * as CodeMirror from 'codemirror';



export class DemoishedEditorHelper{

        private properties:any;
        private wrapper:Element;
        private activeModal:any;

        constructor(private editor:any){

            this.wrapper = editor.getWrapperElement();
        
            let style = window.getComputedStyle(this.wrapper, null);


            let bgColor = new Color(style.background !== '' ? style.background : style.backgroundColor);
            let fgColor = new Color(style.color);

            this.properties = {
                bgColor: bgColor.getString('rgb'),
                fnColor: fgColor.getString('rgb'),
                dimColor: 'rgb(127, 127, 127)',
                selColor: 'rgb(40, 168, 107)',
                link_button: true
            };
            this.wrapper.addEventListener('contextmenu', (event) =>  {
                event.preventDefault();
                let cursor = this.editor.getCursor(true);
                let token = this.editor.getTokenAt(cursor);
              
            });
            this.wrapper.addEventListener('mouseup', (event) => {
                if (this.editor.somethingSelected()) {
                    return;
                } 
                let cursor = this.editor.getCursor(true);
                let match = this.getMatch(cursor);
                let token = this.editor.getTokenAt(cursor);
                if (match) {
                    if (this.activeModal && this.activeModal.isVisible) {
                        this.activeModal.removeModal();
                        return;
                    }
    
                    if (match.type === 'color') {
                        this.activeModal = new ColorPicker(match.string, this.properties);
                        this.activeModal.showAt(this.editor);
                        this.activeModal.on('changed', (color) => {
                            let newColor = color.getString('vec');
                            let start = { line: cursor.line, ch: match.start };
                            let end = { line: cursor.line, ch: match.end };
                            match.end = match.start + newColor.length;
                            this.editor.replaceRange(newColor, start, end);
                        });
    
                        this.activeModal.on('link_button', (color) => {
                            this.activeModal = new Vec3Picker(color.getString('vec'), this.properties);
                            this.activeModal.showAt(this.editor);
                            this.activeModal.on('changed', (dir) => {
                                let newDir = dir.getString('vec3');
                                let start = { line: cursor.line, ch: match.start };
                                let end = { line: cursor.line, ch: match.end };
                                match.end = match.start + newDir.length;
                                this.editor.replaceRange(newDir, start, end);
                            });
                        });
                    }
                    if (match.type === 'vec3') {
                        this.activeModal = new Vec3Picker(match.string, this.properties);
                        this.activeModal.showAt(this.editor);
                        this.activeModal.on('changed', (dir) => {
                            let newDir = dir.getString('vec3');
                            let start = { line: cursor.line, ch: match.start };
                            let end = { line: cursor.line, ch: match.end };
                            match.end = match.start + newDir.length;
                            this.editor.replaceRange(newDir, start, end);
                        });
                    }
                    else if (match.type === 'vec2') {
                        this.activeModal = new Vec2Picker(match.string, this.properties);
                        this.activeModal.showAt(this.editor);
                        this.activeModal.on('changed', (pos) => {
                            let newpos = pos.getString();
                            let start = { line: cursor.line, ch: match.start };
                            let end = { line: cursor.line, ch: match.end };
                            match.end = match.start + newpos.length;
                            this.editor.replaceRange(newpos, start, end);
                        });
                    }
                    else if (match.type === 'number') {
                        this.activeModal = new FloatPicker(match.string, this.properties);
                        this.activeModal.showAt(this.editor);
                        this.activeModal.on('changed', (number) => {
                            let newNumber = number.getString();
                            let start = { line: cursor.line, ch: match.start };
                            let end = { line: cursor.line, ch: match.end };
                            match.end = match.start + newNumber.length;
                            this.editor.replaceRange(newNumber, start, end);
                        });
                    }
                }
            });




        } 

        getMatch (cursor) {
            let types = ['color', 'vec3' ,'vec2', 'number'];
            let rta;
            for (let i in types) {
                rta = this.getTypeMatch(cursor, types[i]);
                if (rta) {
                    return rta;
                }
            }
            return;
        }
    
        getTypeMatch (cursor, type) {
            if (!type) {
                return;
            }
            let re;
            switch(type.toLowerCase()) {
                case 'color':
                    re = /vec[3|4]\([\d|.|,\s]*\)/g;
                    break;
                case 'vec3':
                    re = /vec3\([-|\d|.|,\s]*\)/g;
                    break;
                case 'vec2':
                    re = /vec2\([-|\d|.|,\s]*\)/g;
                    break;
                case 'number':
                    re = /[-]?\d+\.\d+|\d+\.|\.\d+/g;
                    break;
                default:
                    console.error('invalid match selection');
                    return;
            }
            let line = this.editor.getLine(cursor.line);
            let matches = re.execAll(line);
    
            if (matches) {
                for (let i = 0; i < matches.length; i++) {
                    let val = matches[i][0];
                    let len = val.length;
                    let start = matches[i].index;
                    let end = matches[i].index + len;
                    if (cursor.ch >= start && cursor.ch <= end) {
                        return {
                            type: type,
                            start: start,
                            end: end,
                            string: val
                        };
                    }
                }
            }
            return;
        }

 }
