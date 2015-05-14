# fps-stats
Modules for measuring average FPS (frames per second) value.

## `FpsMeter`

Calculates average FPS value from last `n` milliseconds, for each frame.

```javascript
import FpsMeter from 'fps-stats/dist/meter';

let meter = new FpsMeter(1000);
let unregister = meter.registerCallback(({ avgFps, currentTime }) => {
  console.log(avgFps); // prints average FPS in last second for each frame
});

// some time later...
unregister();
meter.dispose();
```

## `FpsAggregator`

Saves average FPS value from `FpsMeter` if it differs significantly from previous one.

```javascript
import FpsAggregator from 'fps-stats/dist/meter';

let aggregator = new FpsAggregator(2);
aggregator.start();

// some time later...
aggregator.finish();

console.log(aggregator.getTimes());
// `x` is time of saving result, relative to start
// `y` is noted average FPS value
// [
//    { x: 0, y: 60.12 },
//    { x: 483, y: 58.567 }
//    { x: 500, y: 58.01 },
//    { x: 2982, y: 59.99 },
//    { x: 3000, y: 60.1 },
//    { x: 5984, y: 58.09 },
//    { x: 6000, y: 55.32 },
//    { x: 7975, y: 53.40 },
//    { x: 8000, y: 50.97 }
//  ]
```
With this data you can draw very nice plot of average FPS values.
```
avgFps
   ^
   |
60-|----_________________________------------------------------__________
   |                                                                     ‾‾‾‾‾‾‾‾‾---
   |
   |
   |
   +-----------------------------------------------------------------------------------> time
 0          1000      2000      3000      4000      5000      6000      7000      8000
```
