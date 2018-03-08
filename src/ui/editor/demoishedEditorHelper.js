"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ColorPicker_1 = require("./pickers/ColorPicker");
var FloatPicker_1 = require("./pickers/FloatPicker");
var Vec2Picker_1 = require("./pickers/Vec2Picker");
var Vec2Picker_2 = require("./pickers/Vec2Picker");
var Color_1 = require("./pickers/types/Color");
var DemoishedEditorHelper = (function () {
    function DemoishedEditorHelper(editor) {
        var _this = this;
        this.editor = editor;
        this.wrapper = editor.getWrapperElement();
        var style = window.getComputedStyle(this.wrapper, null);
        var bgColor = new Color_1.default(style.background !== '' ? style.background : style.backgroundColor);
        var fgColor = new Color_1.default(style.color);
        this.properties = {
            bgColor: bgColor.getString('rgb'),
            fnColor: fgColor.getString('rgb'),
            dimColor: 'rgb(127, 127, 127)',
            selColor: 'rgb(40, 168, 107)',
            link_button: true
        };
        this.wrapper.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            var cursor = _this.editor.getCursor(true);
            var token = _this.editor.getTokenAt(cursor);
        });
        this.wrapper.addEventListener('mouseup', function (event) {
            if (_this.editor.somethingSelected()) {
                return;
            }
            var cursor = _this.editor.getCursor(true);
            var match = _this.getMatch(cursor);
            var token = _this.editor.getTokenAt(cursor);
            if (match) {
                if (_this.activeModal && _this.activeModal.isVisible) {
                    _this.activeModal.removeModal();
                    return;
                }
                if (match.type === 'color') {
                    _this.activeModal = new ColorPicker_1.default(match.string, _this.properties);
                    _this.activeModal.showAt(_this.editor);
                    _this.activeModal.on('changed', function (color) {
                        var newColor = color.getString('vec');
                        var start = { line: cursor.line, ch: match.start };
                        var end = { line: cursor.line, ch: match.end };
                        match.end = match.start + newColor.length;
                        _this.editor.replaceRange(newColor, start, end);
                    });
                    _this.activeModal.on('link_button', function (color) {
                        _this.activeModal = new Vec2Picker_2.default(color.getString('vec'), _this.properties);
                        _this.activeModal.showAt(_this.editor);
                        _this.activeModal.on('changed', function (dir) {
                            var newDir = dir.getString('vec3');
                            var start = { line: cursor.line, ch: match.start };
                            var end = { line: cursor.line, ch: match.end };
                            match.end = match.start + newDir.length;
                            _this.editor.replaceRange(newDir, start, end);
                        });
                    });
                }
                if (match.type === 'vec3') {
                    _this.activeModal = new Vec2Picker_2.default(match.string, _this.properties);
                    _this.activeModal.showAt(_this.editor);
                    _this.activeModal.on('changed', function (dir) {
                        var newDir = dir.getString('vec3');
                        var start = { line: cursor.line, ch: match.start };
                        var end = { line: cursor.line, ch: match.end };
                        match.end = match.start + newDir.length;
                        _this.editor.replaceRange(newDir, start, end);
                    });
                }
                else if (match.type === 'vec2') {
                    _this.activeModal = new Vec2Picker_1.default(match.string, _this.properties);
                    _this.activeModal.showAt(_this.editor);
                    _this.activeModal.on('changed', function (pos) {
                        var newpos = pos.getString();
                        var start = { line: cursor.line, ch: match.start };
                        var end = { line: cursor.line, ch: match.end };
                        match.end = match.start + newpos.length;
                        _this.editor.replaceRange(newpos, start, end);
                    });
                }
                else if (match.type === 'number') {
                    _this.activeModal = new FloatPicker_1.default(match.string, _this.properties);
                    _this.activeModal.showAt(_this.editor);
                    _this.activeModal.on('changed', function (number) {
                        var newNumber = number.getString();
                        var start = { line: cursor.line, ch: match.start };
                        var end = { line: cursor.line, ch: match.end };
                        match.end = match.start + newNumber.length;
                        _this.editor.replaceRange(newNumber, start, end);
                    });
                }
            }
        });
    }
    DemoishedEditorHelper.prototype.getMatch = function (cursor) {
        var types = ['color', 'vec3', 'vec2', 'number'];
        var rta;
        for (var i in types) {
            rta = this.getTypeMatch(cursor, types[i]);
            if (rta) {
                return rta;
            }
        }
        return;
    };
    DemoishedEditorHelper.prototype.getTypeMatch = function (cursor, type) {
        if (!type) {
            return;
        }
        var re;
        switch (type.toLowerCase()) {
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
        var line = this.editor.getLine(cursor.line);
        var matches = re.execAll(line);
        if (matches) {
            for (var i = 0; i < matches.length; i++) {
                var val = matches[i][0];
                var len = val.length;
                var start = matches[i].index;
                var end = matches[i].index + len;
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
    };
    return DemoishedEditorHelper;
}());
exports.DemoishedEditorHelper = DemoishedEditorHelper;
