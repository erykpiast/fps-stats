/* global suite, test, setup, teardown */
import chai from 'chai';
import { assert } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
sinon.assert.expose(chai.assert, { prefix: '' });

import proxyquire from 'proxyquire';

import requestAnimationFrameMock from 'request-animation-frame-mock';

import { mock as fpsMeterMock, spies as fpsMeterSpies, pushFpsEntry, setBeforeUnregisterEntry, setAfterRegisterEntry } from './fps-meter.mock';

requestAnimationFrameMock.setMode(requestAnimationFrameMock.modes.MANUAL);

proxyquire.noCallThru();
const FpsAggregator = proxyquire('../src/fps-aggregator', {
    './fps-meter': fpsMeterMock
});


suite('FpsAggregator API test', () => {
    let fpsAggregator;

    teardown(() => {
        try { // may be already finished in test
            fpsAggregator.finish();
        } catch(err) {}

        fpsAggregator = null;
    });

    test('it should be a function and can be instantiated', () => {
        assert.isFunction(FpsAggregator);

        assert.doesNotThrow(() => {
            fpsAggregator = new FpsAggregator();
        });

        assert.instanceOf(fpsAggregator, FpsAggregator);
    });

    test('it should has start method', () => {
        fpsAggregator = new FpsAggregator();

        assert.isFunction(fpsAggregator.start);
    });

    test('it should has finish method', () => {
        fpsAggregator = new FpsAggregator();

        assert.isFunction(fpsAggregator.finish);
    });

    test('it should has times property', () => {
        fpsAggregator = new FpsAggregator();

        assert.isArray(fpsAggregator.times);
    });
});


suite('creating and disposing instance', () => {
    let avgRange = 2000;
    let fpsAggregator;

    setup(() => {
        fpsMeterSpies.constructor.reset();
        fpsMeterSpies.registerCallback.reset();
        fpsMeterSpies.unregisterCallback.reset();
        fpsMeterSpies.dispose.reset();

        fpsAggregator = new FpsAggregator(2, avgRange);
        fpsAggregator.start();
    });

    teardown(() => {
        try { // may be already finished in test
            fpsAggregator.finish();
        } catch(err) {}
        fpsAggregator = null;
    });


    test('should create new instance of FpsMeter when start method is called', () => {
        assert.calledOnce(fpsMeterSpies.constructor);
    });

    test('should create new instance of FpsMeter with avgRange value', () => {
        let arg = fpsMeterSpies.constructor.getCall(0).args[0];

        assert.equal(arg, avgRange);
    });

    test('should register FpsMeter callback when start method is called', () => {
        assert.calledOnce(fpsMeterSpies.registerCallback);
    });

    test('should dispose instance of FpsMeter when finish method is called', () => {
        fpsAggregator.finish();

        assert.calledOnce(fpsMeterSpies.dispose);
    });

    test('should unregister FpsMeter callback when start method is called', () => {
        fpsAggregator.finish();

        assert.calledOnce(fpsMeterSpies.unregisterCallback);
    });
});


suite('gathering times', () => {
    let minFpsDifference = 5;
    let fpsAggregator;

    setup(() => {
        setAfterRegisterEntry(0, 60);
        setBeforeUnregisterEntry(10000, 60);

        fpsAggregator = new FpsAggregator(minFpsDifference);
        fpsAggregator.start();
    });

    teardown(() => {
        try { // may be already finished in test
            fpsAggregator.finish();
        } catch(err) {}
        fpsAggregator = null;

        setAfterRegisterEntry(null);
        setBeforeUnregisterEntry(null);
    });


    test(`should be at least two FPS values saved when gathering is finished,
          even if they don't differ`,
    (done) => {
        setTimeout(() => {
            fpsAggregator.finish();

            assert.deepEqual(
                fpsAggregator.times.map(({ y }) => y),
                [ 60, 60 ]
            );

            done();
        }, 10);
    });

    test(`should save FPS only if it differs significantly from previous one`,
    (done) => {
        setTimeout(() => {
            pushFpsEntry(100, 30);
            pushFpsEntry(200, 60);
            pushFpsEntry(500, 10);
            pushFpsEntry(1000, 40);

            fpsAggregator.finish();

            assert.deepEqual(
                fpsAggregator.times.map(({ y }) => y),
                [ 60, 30, 60, 10, 40, 60 ]
            );

            done();
        }, 10);
    });

    test(`should save FPS if difference between it and previous one is exactly
          minFpsDifference`,
    (done) => {
        setTimeout(() => {
            pushFpsEntry(100, 30 + minFpsDifference);
            pushFpsEntry(200, 30 + minFpsDifference*2);
            pushFpsEntry(500, 30 + minFpsDifference);
            pushFpsEntry(1000, 30 - minFpsDifference);

            fpsAggregator.finish();

            assert.equal(
                fpsAggregator.times.length,
                6
            );

            done();
        }, 10);
    });

    test(`should not save FPS if it not differ significantly from previous one`,
    (done) => {
        setTimeout(() => {
            pushFpsEntry(100, 60 + minFpsDifference - 0.0001);
            pushFpsEntry(200, 60 + minFpsDifference - 1);
            pushFpsEntry(500, 60 + minFpsDifference - 0.0001);
            pushFpsEntry(1000, 60 + minFpsDifference - 1);

            fpsAggregator.finish();

            assert.deepEqual(
                fpsAggregator.times.map(({ y }) => y),
                [ 60, 60 ]
            );

            done();
        }, 10);
    });

    test(`should save not significantly different value if one after it qualifies
          to saving`,
    (done) => {
        setTimeout(() => {
            pushFpsEntry(100, 51);
            pushFpsEntry(200, 52);
            pushFpsEntry(300, 53);
            pushFpsEntry(400, 58);
            pushFpsEntry(500, 59);
            pushFpsEntry(600, 60);
            pushFpsEntry(900, 50);

            fpsAggregator.finish();

            assert.deepEqual(
                fpsAggregator.times.map(({ y }) => y),
                [ 60, 51, 53, 58, 60, 50, 60 ]
            );

            done();
        }, 10);
    });
});
