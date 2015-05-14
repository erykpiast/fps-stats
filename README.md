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
// `y` is average FPS value
// [ { x: 0, y: 60 }, { x: 1500, y: 58 }, { x: 5000, y: 60 }, { x: 7000, y: 55 }, { x: 10000, y: 50 } ]

```
