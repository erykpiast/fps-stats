"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = addEventListener;

function addEventListener(object, eventName, handler, bubble) {
    object.addEventListener(eventName, handler, bubble);

    return function removeEventListener() {
        object.removeEventListener(eventName, handler, bubble);
    };
}

module.exports = exports["default"];