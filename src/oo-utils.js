/**
 * @function createEnsureAvailabilityFn - creates function that throws error if instance was destroyed
 * @param {String} key - key that is truthy when object is destroyed
 * @param {String} [customMessage] - custom message for the error
 * @access public
 * @returns {Function} ensureAvailability
 */
export function createEnsureAvailabilityFn(key, customMessage) {
    var message = (customMessage || 'instance was destroyed and it is useless now');

    /**
     * @function ensureAvailability - throws error if object (or non-window this context if not provided) says it was destroyed
     * @param {Object} object - object to check
     */
    return function ensureAvailability(object) {
        var o = object;
        if('undefined' === typeof o) {
            if(this !== window) {
                o = this;
            }
        }

        if(o[key]) {
            throw new Error(message);
        }
    };
}


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
export function defineProperty(object, publicName, conf) {
    var get = ('function' === typeof conf.get ? conf.get : () => {
        return object[conf.get];
    });
    var set = ('function' === typeof conf.set ? conf.set : () => {
        return object[conf.set];
    });
    var before = ('function' === typeof conf.before ? conf.before : () => { });

    Object.defineProperty(object, publicName, {
        get: () => {
            before.apply(object, arguments);

            return get.apply(object, arguments);
        },
        set: () => {
            before.apply(object, arguments);

            return set.apply(object, arguments);
        }
    });
}
