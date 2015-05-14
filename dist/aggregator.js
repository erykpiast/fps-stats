'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _meter = require('./meter');

var _meter2 = _interopRequireDefault(_meter);

var FpsAggregator = (function () {
    /**
     * @constructor FpsMeter - saves distinct (difference greater than `minFpsDifference`)
     *     average FPS values from calling start to finish
     * @param {Number} [minFpsDifference=5] - minimal difference between subsequent FPS values to trigger saving
     * @param {Number} [avgRange=1000] - last time to calculate average fps
     * @access public
     */

    function FpsAggregator() {
        var minFpsDifference = arguments[0] === undefined ? 5 : arguments[0];
        var avgRange = arguments[1] === undefined ? 1000 : arguments[1];

        _classCallCheck(this, FpsAggregator);

        this._times = [];
        this._minFpsDifference = minFpsDifference;
        this._avgRange = avgRange;
    }

    _createClass(FpsAggregator, [{
        key: 'start',

        /**
         * @method start - starts saving FPS
         * @access public
         */
        value: function start() {
            var _this = this;

            if (!this._started) {
                this._started = true;

                this._fpsMeter = new _meter2['default'](this._avgRange);

                var lastE;
                var lastSavedE;
                this._unregisterFpsMeterCallback = this._fpsMeter.registerCallback(function (currentE) {
                    // FPS values difference between current and last saved entry
                    var fpsDiff = lastSavedE && Math.abs(lastSavedE.avgFps - currentE.avgFps) || 0;
                    var significantChange = fpsDiff >= _this._minFpsDifference;

                    // if current FPS value in current entry differs significantly from the last one we saved
                    // add last seen entry
                    // we don't want to have plot like this
                    //
                    //            frame here
                    //                |
                    // ____-------¯¯¯¯¯¯¯¯¯-------_____
                    //
                    // rather like that
                    //
                    //            frame here
                    //                |
                    // ______________-¯-______________
                    //              |   |
                    // frames with not significant change
                    //
                    if (lastE !== lastSavedE && significantChange) {
                        _this._times.push({
                            y: parseFloat(lastE.avgFps.toFixed(2), 10),
                            x: Math.round(lastE.currentTime)
                        });

                        lastSavedE = lastE;
                    }

                    // pass the first and the last FPS entry, and also significan ones
                    if (_this._times.length === 0 || currentE.last || significantChange) {
                        _this._times.push({
                            y: parseFloat(currentE.avgFps.toFixed(2), 10),
                            x: Math.round(currentE.currentTime)
                        });

                        lastSavedE = currentE;
                    }

                    lastE = currentE;
                });
            }
        }
    }, {
        key: 'finish',

        /**
         * @method finish - stops saving FPS
         * @access public
         */
        value: function finish() {
            if (this._started) {
                this._finished = true;

                this._unregisterFpsMeterCallback();
                this._fpsMeter.dispose();
            }
        }
    }, {
        key: 'times',

        /**
         * @method getTimes - returns saved FPS values
         * @access public
         * @returns {Array} saved FPS values
         *     @property {Object} [n] saved FPS value
         *         @property {Object} [n].x - time of creating entry
         *         @property {Object} [n].y - average FPS value for given time
         */
        get: function () {
            return this._times.slice();
        }
    }]);

    return FpsAggregator;
})();

exports['default'] = FpsAggregator;
module.exports = exports['default'];