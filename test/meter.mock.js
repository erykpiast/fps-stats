import sinon from 'sinon';

let callbacks = [];
export let spies = {
    dispose: sinon.spy(),
    constructor: sinon.spy(),
    registerCallback: sinon.spy(),
    unregisterCallback: sinon.spy()
};
let beforeUnregisterEntry = null;
let afterRegisterEntry = null;

class FpsMeter {
    constructor(avgRange) {
        spies.constructor(avgRange);
    }

    registerCallback(cb) {
        spies.registerCallback();
        callbacks.push(cb);

        if(afterRegisterEntry) {
            let entry = afterRegisterEntry;

            process.nextTick(() => {
                cb(entry);
            });
        }

        return () => {
            if(beforeUnregisterEntry) {
                cb(beforeUnregisterEntry);
            }

            spies.unregisterCallback();

            callbacks.splice(callbacks.indexOf(cb), 1);
        };
    }

    dispose() {
        spies.dispose();
    }
}

export function pushFpsEntry(currentTime, avgFps = 60) {
    callbacks.forEach((cb) => {
        cb({ currentTime, avgFps });
    });
}

export function setBeforeUnregisterEntry(currentTime, avgFps) {
    if(currentTime === null) {
        beforeUnregisterEntry = null;
    } else {
        beforeUnregisterEntry = { currentTime, avgFps, last: true };
    }
}

export function setAfterRegisterEntry(currentTime, avgFps) {
    if(currentTime === null) {
        afterRegisterEntry = null;
    } else {
        afterRegisterEntry = { currentTime, avgFps, first: true };
    }
}

export { FpsMeter as mock };
