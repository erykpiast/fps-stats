export default function addEventListener(object, eventName, handler, bubble) {
    object.addEventListener(eventName, handler, bubble);

    return function removeEventListener() {
        object.removeEventListener(eventName, handler, bubble);
    };
}
