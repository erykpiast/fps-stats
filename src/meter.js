import PageVisibility from './page-visibility';
import { createEnsureAvailabilityFn } from './oo-utils';
import { requestAnimationFrame, cancelAnimationFrame } from 'request-animation-frame';

let ensureAvailability = createEnsureAvailabilityFn('_isDisposed');


export default class FpsMeter {
    /**
     * @constructor FpsMeter
     * @param {Number} avgRange - time span used to calculate average
     *     (each FPS entry is average value from this avgRange)
     */
    constructor(avgRange = 1000) {
        this._avgRange = avgRange;
        this._framesTimes = [];
        this._callbacks = [];

        let pageVisibility = new PageVisibility();
        let requestedAnimationFrame;

        let pageIsNotVisible = pageVisibility.isHidden();
        let pageWasNotVisible;
        pageVisibility.on('hide', function() {
            pageIsNotVisible = true;
        });
        pageVisibility.on('show', function() {
            if(pageIsNotVisible) {
                pageIsNotVisible = false;
                pageWasNotVisible = true;
            }
        });

        let frameHandler = (currentTime) => {
            if('undefined' !== typeof currentTime && !pageIsNotVisible) {
                if(pageWasNotVisible) {
                    pageWasNotVisible = false;

                    this._framesTimes.splice(0, this._framesTimes.length, currentTime);
                } else {
                    this._framesTimes.push(currentTime);

                    var result = this._calculateAvgFps(this._framesTimes);

                    if(result) {
                        // notify listeners about new FPS
                        this._yieldFpsEntry({
                            currentTime: currentTime,
                            avgFps: result.avgFps
                        });

                        // remove frames used to calculate average
                        this._framesTimes.splice(0, result.usedLastFrames - 1);
                    }
                }
            }

            requestedAnimationFrame = requestAnimationFrame(frameHandler);
        };

        frameHandler();

        this.dispose = () => {
            ensureAvailability(this);
            this._isDisposed = true;

            this._callbacks = [];

            cancelAnimationFrame(requestedAnimationFrame);

            pageVisibility.dispose();
        };
    }

    registerCallback(callback) {
        ensureAvailability(this);

        if('function' !== typeof callback) {
            throw new TypeError('callback has to be a function!');
        }

        this._callbacks.push(callback);

        // calculate FPS right after registering callback
        var result = this._calculateAvgFps(this._framesTimes);
        if(result) {
            process.nextTick(() => {
                callback({
                    first: true,
                    avgFps: result.avgFps,
                    currentTime: this._framesTimes[this.framesTimes.length - 1]
                });
            });
        }

        return () => {
            let callbackIndex = this._callbacks.indexOf(callback);

            if(callbackIndex === -1) {
                throw new Error('callback was already removed!');
            }

            this._callbacks.splice(callbackIndex, 1);

            // try to calculate FPS last time before unregistering callback
            let result = this._calculateAvgFps(this._framesTimes);
            if(result) {
                callback({
                    last: true,
                    avgFps: result.avgFps,
                    currentTime: this._framesTimes[this._framesTimes.length - 1]
                });
            }
        };
    }

    /**
     * @method _calculateAvgFps - calculates average FPS value from last `avgRange`
     * @access protected
     * @returns {Object} calculated value plus some useful metadata
     *     @property {Number} avgFps - calculated average FPS
     *     @property {Number} usedLastFrames - number of frames used to calculation (from last `avgRange`)
     */
    _calculateAvgFps() {
        var timesSum = 0;
        var timeDiff;
        var lastTime = this._framesTimes[this._framesTimes.length - 1];

        var framesNumber = 0;
        for(var i = this._framesTimes.length - 1; i > 0; i--) {
            timeDiff = lastTime - this._framesTimes[i - 1];

            timesSum += this._framesTimes[i] - this._framesTimes[i - 1];
            framesNumber++;

            if(timeDiff >= this._avgRange) {
                break;
            }
        }

        if(timesSum) {
            return {
                avgFps: framesNumber * (1000 / timeDiff),
                usedLastFrames: i
            };
        } else {
            return null;
        }
    }

    _yieldFpsEntry(fpsEntry) {
        this._callbacks.forEach((callback) => {
            callback(fpsEntry);
        });
    }
}
