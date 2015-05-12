'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pageVisibility = require('./page-visibility');

var _pageVisibility2 = _interopRequireDefault(_pageVisibility);

var _ooUtils = require('./oo-utils');

var _requestAnimationFrame = require('request-animation-frame');

var ensureAvailability = _ooUtils.createEnsureAvailabilityFn('_isDisposed');

var FpsMeter = (function () {
    /**
     * @constructor FpsMeter
     * @param {Number} avgRange - time span used to calculate average
     *     (each FPS entry is average value from this avgRange)
     */

    function FpsMeter() {
        var _this = this;

        var avgRange = arguments[0] === undefined ? 1000 : arguments[0];

        _classCallCheck(this, FpsMeter);

        this._avgRange = avgRange;
        this._framesTimes = [];
        this._callbacks = [];

        var pageVisibility = new _pageVisibility2['default']();
        var requestedAnimationFrame = undefined;

        var pageIsNotVisible = pageVisibility.isVisible();
        var pageWasNotVisible = undefined;
        pageVisibility.on('hide', function () {
            pageIsNotVisible = true;
        });
        pageVisibility.on('show', function () {
            if (pageIsNotVisible) {
                pageIsNotVisible = false;
                pageWasNotVisible = true;
            }
        });

        var self = this;
        (function frameHandler(currentTime) {
            if ('undefined' !== typeof currentTime) {
                if (pageWasNotVisible) {
                    pageWasNotVisible = false;

                    self._framesTimes.splice(0, self._framesTimes.length, currentTime);
                } else {
                    self._framesTimes.push(currentTime);

                    var result = self._calculateAvgFps(self._framesTimes);

                    if (result) {
                        // notify listeners about new FPS
                        self._yieldFpsEntry({
                            currentTime: currentTime,
                            avgFps: result.avgFps
                        });

                        // remove frames used to calculate average
                        self._framesTimes.splice(0, result.usedLastFrames - 1);
                    }
                }
            }

            requestedAnimationFrame = _requestAnimationFrame.requestAnimationFrame(frameHandler);
        })();

        this.dispose = function () {
            ensureAvailability(_this);
            _this._isDisposed = true;

            _this._callbacks = [];

            _requestAnimationFrame.cancelAnimationFrame(requestedAnimationFrame);

            pageVisibility.dispose();
        };
    }

    _createClass(FpsMeter, [{
        key: 'registerCallback',
        value: function registerCallback(callback) {
            var _this2 = this;

            ensureAvailability(this);

            if ('function' !== typeof callback) {
                throw new TypeError('callback has to be a function!');
            }

            this._callbacks.push(callback);

            // calculate FPS right after registering callback
            var result = this._calculateAvgFps(this._framesTimes);
            if (result) {
                process.nextTick(function () {
                    callback({
                        first: true,
                        avgFps: result.avgFps,
                        currentTime: _this2._framesTimes[_this2.framesTimes.length - 1]
                    });
                });
            }

            return function () {
                var callbackIndex = _this2._callbacks.indexOf(callback);

                if (callbackIndex === -1) {
                    throw new Error('callback was already removed!');
                }

                _this2._callbacks.splice(callbackIndex, 1);

                // try to calculate FPS last time before unregistering callback
                var result = _this2._calculateAvgFps(_this2._framesTimes);
                if (result) {
                    callback({
                        last: true,
                        avgFps: result.avgFps,
                        currentTime: _this2._framesTimes[_this2._framesTimes.length - 1]
                    });
                }
            };
        }
    }, {
        key: '_calculateAvgFps',

        /**
         * @method _calculateAvgFps - calculates average FPS value from last `avgRange`
         * @access protected
         * @returns {Object} calculated value plus some useful metadata
         *     @property {Number} avgFps - calculated average FPS
         *     @property {Number} usedLastFrames - number of frames used to calculation (from last `avgRange`)
         */
        value: function _calculateAvgFps() {
            var timesSum = 0;
            var timeDiff;
            var lastTime = this._framesTimes[this._framesTimes.length - 1];

            var framesNumber = 0;
            for (var i = this._framesTimes.length - 1; i > 0; i--) {
                timeDiff = lastTime - this._framesTimes[i - 1];

                timesSum += this._framesTimes[i] - this._framesTimes[i - 1];
                framesNumber++;

                if (timeDiff >= this._avgRange) {
                    break;
                }
            }

            if (timesSum) {
                return {
                    avgFps: framesNumber * (1000 / timeDiff),
                    usedLastFrames: i
                };
            } else {
                return null;
            }
        }
    }, {
        key: '_yieldFpsEntry',
        value: function _yieldFpsEntry(fpsEntry) {
            this._callbacks.forEach(function (callback) {
                callback(fpsEntry);
            });
        }
    }]);

    return FpsMeter;
})();

exports['default'] = FpsMeter;
module.exports = exports['default'];