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

proxyquire.noCallThru();
const PageVisibility = proxyquire('../src/page-visibility', {
    './document': documentMock.mock
});

export { PageVisibility as mock, changePageVisibility };
