'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
/**
 * @function createEnsureAvailabilityFn - creates function that throws error if instance was destroyed
 * @param {String} key - key that is truthy when object is destroyed
 * @param {String} [customMessage] - custom message for the error
 * @access public
 * @returns {Function} ensureAvailability
 */
exports.createEnsureAvailabilityFn = createEnsureAvailabilityFn;

/**
 * @function defineProperty - shorthand for Object.defineProperty
 *     mostly for creating public getters and setters
 * @access public
 * @param {Object} object - object to set property on
 * @param {String} publicName - name of property
 * @param {Object} conf - configuration object
 *     @property {String|Function} get - getter function or name of private property that should be returned
 *     @property {Function} [set=defaultSetter] - setter function; if not passed, creates read-only property
 *     @property {Function} [before=noop] - function that has to be called before getter or setter
 *         no matter what it returns, following function will be called (unless it throws error...)
 */
exports.defineProperty = defineProperty;

function createEnsureAvailabilityFn(key, customMessage) {
    var message = customMessage || 'instance was destroyed and it is useless now';

    /**
     * @function ensureAvailability - throws error if object (or non-window this context if not provided) says it was destroyed
     * @param {Object} object - object to check
     */
    return function ensureAvailability(object) {
        var o = object;
        if ('undefined' === typeof o) {
            if (this !== window) {
                o = this;
            }
        }

        if (o[key]) {
            throw new Error(message);
        }
    };
}

function defineProperty(object, publicName, conf) {
    var _arguments = arguments;

    var _get = 'function' === typeof conf.get ? conf.get : function () {
        return object[conf.get];
    };
    var _set = 'function' === typeof conf.set ? conf.set : function () {
        return object[conf.set];
    };
    var before = 'function' === typeof conf.before ? conf.before : function () {};

    Object.defineProperty(object, publicName, {
        get: function get() {
            before.apply(object, _arguments);

            return _get.apply(object, _arguments);
        },
        set: function set() {
            before.apply(object, _arguments);

            return _set.apply(object, _arguments);
        }
    });
}
