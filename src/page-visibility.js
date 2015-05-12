import { EventEmitter } from 'events';
import document from './document';
import addEventListener from './add-event-listener';
import { createEnsureAvailabilityFn } from './oo-utils';

let ensureAvailability = createEnsureAvailabilityFn('_isDisposed');

let shimvis = true;
let changeEventName, hiddenPropertyName;

if ('undefined' !== typeof document.hidden) {
    hiddenPropertyName = 'hidden';
    changeEventName = 'visibilitychange';
} else if ('undefined' !== typeof document.mozHidden) {
    hiddenPropertyName = 'mozHidden';
    changeEventName = 'mozvisibilitychange';
} else if ('undefined' !== typeof document.webkitHidden) {
    hiddenPropertyName = 'webkitHidden';
    changeEventName = 'webkitvisibilitychange';
} else if ('undefined' !== typeof document.webkitHidden) {
    hiddenPropertyName = 'webkitHidden';
    changeEventName = 'webkitvisibilitychange';
}

export default class PageVisibility extends EventEmitter {
    constructor() {
        super();

        let removeChangeListener;

        if (PageVisibility.supported) {
            removeChangeListener = addEventListener(document, changeEventName, () => {
                let visible = !document[hiddenPropertyName];

                this.emit('change', visible);
                this.emit(visible ? 'show' : 'hide');
            }, false);
        } else {
            let removeFocusoutListener = addEventListener(document, 'focusout', () => {
                shimvis = false;

                this.emit('change', false);
                this.emit('hide');
            }, false);

            let removeFocusinListener = addEventListener(document, 'focusin', () => {
                shimvis = true;

                this.emit('change', true);
                this.emit('show');
            }, false);

            removeChangeListener = () => {
                removeFocusinListener();
                removeFocusoutListener();
            };
        }

        this.dispose = () => {
            ensureAvailability(this);

            this._isDisposed = true;

            removeChangeListener();
        };
    }

    static get supported() {
        return ('undefined' !== typeof hiddenPropertyName);
    }

    isHidden() {
        ensureAvailability(this);

        return (PageVisibility.supported ?
            !!document[hiddenPropertyName] :
            !shimvis);
    }

    isVisible() {
        ensureAvailability(this);

        return (PageVisibility.supported ?
            !document[hiddenPropertyName] :
            shimvis);
    }
}
