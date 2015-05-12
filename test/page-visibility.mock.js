import chai from 'chai';
import chaiSpies from 'chai-spies';

chai.use(chaiSpies);

import proxyquire from 'proxyquire';


const documentMock = (function() {
    const pageVisibilityListeners = [ ];
    const mock = {
        hidden: false
    };


    mock.addEventListener = function(eventName, handler) {
        pageVisibilityListeners.push(handler);
    };

    mock.removeEventListener = function(eventName, handler) {
        pageVisibilityListeners.splice(
            pageVisibilityListeners.indexOf(handler),
            1
        );
    };

    function changeVisibility(visible) {
        mock.hidden = !visible;

        pageVisibilityListeners.forEach((handler) => {
            handler();
        });
    }


    return {
        mock: mock,
        changeVisibility: changeVisibility
    };
})();
const changePageVisibility = documentMock.changeVisibility;

const windowMock = (function() {
    const unloadHandlers = [ ];
    const mock = { };

    mock.addEventListener = function(eventName, handler) {
        unloadHandlers.push(handler);
    };

    mock.removeEventListener = function(eventName, handler) {
        unloadHandlers.splice(
            unloadHandlers.indexOf(handler),
            1
        );
    };

    function unload() {
        unloadHandlers.forEach((handler) => {
            handler();
        });
    }


    return {
        mock: mock,
        unload: unload
    };
})();
const unloadWindow = windowMock.unload;

proxyquire.noCallThru();
const PageVisibility = proxyquire('../src/page-visibility', {
    './document': documentMock.mock,
    './window': windowMock.mock
});

export { PageVisibility as mock, unloadWindow, changePageVisibility };
