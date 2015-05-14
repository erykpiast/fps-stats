import FpsMeter from './meter';


export default class FpsAggregator {
    /**
     * @constructor FpsMeter - saves distinct (difference greater than `minFpsDifference`)
     *     average FPS values from calling start to finish
     * @param {Number} [minFpsDifference=5] - minimal difference between subsequent FPS values to trigger saving
     * @param {Number} [avgRange=1000] - last time to calculate average fps
     * @access public
     */
    constructor(minFpsDifference = 5, avgRange = 1000) {
        this._times = [];
        this._minFpsDifference = minFpsDifference;
        this._avgRange = avgRange;
    }

    /**
     * @method start - starts saving FPS
     * @access public
     */
    start() {
        if(!this._started) {
            this._started = true;

            this._fpsMeter = new FpsMeter(this._avgRange);

            var lastE;
            var lastSavedE;
            this._unregisterFpsMeterCallback = this._fpsMeter.registerCallback((currentE) => {
                // FPS values difference between current and last saved entry
                var fpsDiff = ((lastSavedE && Math.abs((lastSavedE.avgFps - currentE.avgFps))) || 0);
                var significantChange = (fpsDiff >= this._minFpsDifference);

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
                if((lastE !== lastSavedE) && significantChange) {
                    this._times.push({
                        y: parseFloat(lastE.avgFps.toFixed(2), 10),
                        x: Math.round(lastE.currentTime)
                    });

                    lastSavedE = lastE;
                }

                // pass the first and the last FPS entry, and also significan ones
                if((currentE.first && (this._times.length === 0)) ||
                    currentE.last ||
                    significantChange
                ) {
                    this._times.push({
                        y: parseFloat(currentE.avgFps.toFixed(2), 10),
                        x: Math.round(currentE.currentTime)
                    });

                    lastSavedE = currentE;
                }

                lastE = currentE;
            });
        }
    }

    /**
     * @method finish - stops saving FPS
     * @access public
     */
    finish() {
        if(this._started) {
            this._finished = true;

            this._unregisterFpsMeterCallback();
            this._fpsMeter.dispose();
        }
    }

    /**
     * @method getTimes - returns saved FPS values
     * @access public
     * @returns {Array} saved FPS values
     *     @property {Object} [n] saved FPS value
     *         @property {Object} [n].x - time of creating entry
     *         @property {Object} [n].y - average FPS value for given time
     */
    get times() {
        return this._times.slice();
    }
}
