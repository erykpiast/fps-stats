/* global suite, test, setup, teardown, suiteTeardown */
import chai from 'chai';
import { assert } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
sinon.assert.expose(chai.assert, { prefix: '' });

import proxyquire from 'proxyquire';

import requestAnimationFrameMock from 'request-animation-frame-mock';

import { mock as pageVisibilityMock, changePageVisibility } from './page-visibility.mock';

requestAnimationFrameMock.setMode(requestAnimationFrameMock.modes.MANUAL);

proxyquire.noCallThru();
const FpsMeter = proxyquire('../src/meter', {
    'request-animation-frame': requestAnimationFrameMock.mock,
    './page-visibility': pageVisibilityMock
});


suite('FpsMeter API test', () => {
    let fpsMeter;

    teardown(() => {
        try { // may be already disposed in test
            fpsMeter.dispose();
        } catch(err) {}

        fpsMeter = null;
    });

    suiteTeardown(() => {
        requestAnimationFrameMock.getQueue().clear();
    });


    test('it should be a function and can be instantiated', () => {
        assert.isFunction(FpsMeter);

        assert.doesNotThrow(() => {
            fpsMeter = new FpsMeter();
        });

        assert.instanceOf(fpsMeter, FpsMeter);
    });

    test('it should has registerCallback method', () => {
        fpsMeter = new FpsMeter();

        assert.isFunction(fpsMeter.registerCallback);
    });

    test(`it should registerCallback method throw if passed argument
          is not a function`, () => {
        fpsMeter = new FpsMeter();

        assert.throws(() => {
            fpsMeter.registerCallback();
        },  /has to be a function/);

        assert.throws(() => {
            fpsMeter.registerCallback(null);
        },  /has to be a function/);

        assert.throws(() => {
            fpsMeter.registerCallback({ call: () => { } });
        },  /has to be a function/);
    });

    test('it should has dispose method', () => {
        fpsMeter = new FpsMeter();

        assert.isFunction(fpsMeter.dispose);
    });

    test('it should throw an Error when methods called after disposing', () => {
        let fpsMeter = new FpsMeter();
        fpsMeter.dispose();

        assert.throws(() => {
            fpsMeter.registerCallback();
        },  /destroyed/);

        assert.throws(() => {
            fpsMeter.dispose();
        },  /destroyed/);
    });
});


suite('creating and disposing instance', () => {
    let fpsMeter;

    setup(() => {
        fpsMeter = new FpsMeter();
    });

    teardown(() => {
        try { // may be already disposed in test
            fpsMeter.dispose();
        } catch(err) {}
        fpsMeter = null;

        requestAnimationFrameMock.getQueue().clear();
    });


    test('should register requestAnimationFrame handler on create', () => {
        assert.equal(requestAnimationFrameMock.getQueue().length, 1);
    });

    test('should unregister requestAnimationFrame handler on dispose', () => {
        fpsMeter.dispose();

        assert.equal(requestAnimationFrameMock.getQueue().length, 0);
    });
});


suite('yielding FPS values', () => {
    let initialTime = 1000;
    let frameTime = 16;
    let fpsMeter;
    let fpsCallback;

    setup(() => {
        fpsCallback = sinon.spy();
        fpsMeter = new FpsMeter();
        fpsMeter.registerCallback(fpsCallback);

        requestAnimationFrameMock.trigger(initialTime); // initial
        requestAnimationFrameMock.trigger(initialTime + frameTime); // this will save time
    });

    teardown(() => {
        fpsMeter.dispose();
        fpsMeter = fpsCallback = null;
    });

    suiteTeardown(() => {
        requestAnimationFrameMock.getQueue().clear();
    });


    test(`should call registered callback once when right after callback
          is registered`, (done) => {
        setTimeout(() => {
            assert.calledOnce(fpsCallback);

            done();
        }, 10);
    });

    test(`should call registered callback every time animation frame is
          triggered`, () => {
        requestAnimationFrameMock.trigger(initialTime + frameTime*2);
        assert.called(fpsCallback, 2);

        requestAnimationFrameMock.trigger(initialTime + frameTime*3);
        assert.called(fpsCallback, 3);
    });

    test(`should yielded entry have 'avgFps' and 'currentTime' properties`,
    () => {
        let arg = fpsCallback.getCall(0).args[0];

        assert.isObject(arg);
        assert.isNumber(arg.avgFps);
    });

    test(`should 'currentTime' be a time passed to animation frame handler`,
    () => {
        let time = fpsCallback.getCall(0).args[0].currentTime;

        assert.equal(time, initialTime + frameTime);
    });

    test(`should 'avgFps' be correctly calculated for last 'avgRange'`,
    () => {
        // ~50 fps for the first second
        for(var i = 0; i < 1000; i += (1000 / 50)) {
            requestAnimationFrameMock.trigger(initialTime + i);
        }

        let avgFps = fpsCallback.lastCall.args[0].avgFps;
        assert.isAbove(avgFps, 50); // ~52 fps because of the first frame is ~60 fps

        // 40 fps for a second we are interested in
        for(; i <= 2000; i += (1000 / 40)) {
            requestAnimationFrameMock.trigger(initialTime + i);
        }

        avgFps = fpsCallback.lastCall.args[0].avgFps;
        assert.equal(avgFps, 40);
    });

});


suite('page visibility change', () => {
    let initialTime = 1000;
    let frameTime = 1000/50;
    let fpsMeter;
    let fpsCallback;

    setup(() => {
        fpsCallback = sinon.spy();
        fpsMeter = new FpsMeter();
        fpsMeter.registerCallback(fpsCallback);

        requestAnimationFrameMock.trigger(initialTime); // initial

        changePageVisibility(true);
    });

    teardown(() => {
        fpsMeter.dispose();
        fpsMeter = fpsCallback = null;
    });

    suiteTeardown(() => {
        requestAnimationFrameMock.getQueue().clear();
    });


    test(`should not emit fps entries when page is not visible`, () => {
        changePageVisibility(false);

        requestAnimationFrameMock.trigger(initialTime + frameTime);

        assert.notCalled(fpsCallback);
    });

    test(`should not start emitting fps entries right after
          page became visible`, () => {
        changePageVisibility(false);
        changePageVisibility(true);
        requestAnimationFrameMock.trigger(initialTime + frameTime*4);
        assert.notCalled(fpsCallback);
    });

    test(`should start emitting fps entries when second animation frame
          after page became visible is emitted`, () => {
        changePageVisibility(false);
        changePageVisibility(true);

        requestAnimationFrameMock.trigger(initialTime + frameTime*4);
        requestAnimationFrameMock.trigger(initialTime + frameTime*5);
        assert.called(fpsCallback);
    });

    test(`should take values for 'avgFps' from the second animation frame
          after page became visible`, () => {
        requestAnimationFrameMock.trigger(initialTime + frameTime);
        requestAnimationFrameMock.trigger(initialTime + frameTime*3);
        requestAnimationFrameMock.trigger(initialTime + frameTime*5);

        changePageVisibility(false);
        changePageVisibility(true);

        requestAnimationFrameMock.trigger(initialTime + frameTime*10);
        requestAnimationFrameMock.trigger(initialTime + frameTime*10 + 10);
        requestAnimationFrameMock.trigger(initialTime + frameTime*10 + 30);
        requestAnimationFrameMock.trigger(initialTime + frameTime*10 + 60);

        let avgFps = fpsCallback.lastCall.args[0].avgFps;
        assert.equal(avgFps, 50);
    });

});
