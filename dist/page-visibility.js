'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _events = require('events');

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _addEventListener = require('./add-event-listener');

var _addEventListener2 = _interopRequireDefault(_addEventListener);

var _ooUtils = require('./oo-utils');

var ensureAvailability = (0, _ooUtils.createEnsureAvailabilityFn)('_isDisposed');

var shimvis = true;
var changeEventName = undefined,
    hiddenPropertyName = undefined;

if ('undefined' !== typeof _document2['default'].hidden) {
    hiddenPropertyName = 'hidden';
    changeEventName = 'visibilitychange';
} else if ('undefined' !== typeof _document2['default'].mozHidden) {
    hiddenPropertyName = 'mozHidden';
    changeEventName = 'mozvisibilitychange';
} else if ('undefined' !== typeof _document2['default'].webkitHidden) {
    hiddenPropertyName = 'webkitHidden';
    changeEventName = 'webkitvisibilitychange';
} else if ('undefined' !== typeof _document2['default'].webkitHidden) {
    hiddenPropertyName = 'webkitHidden';
    changeEventName = 'webkitvisibilitychange';
}

var PageVisibility = (function (_EventEmitter) {
    function PageVisibility() {
        var _this = this;

        _classCallCheck(this, PageVisibility);

        _get(Object.getPrototypeOf(PageVisibility.prototype), 'constructor', this).call(this);

        var removeChangeListener = undefined;

        if (PageVisibility.supported) {
            removeChangeListener = (0, _addEventListener2['default'])(_document2['default'], changeEventName, function () {
                var visible = !_document2['default'][hiddenPropertyName];

                _this.emit('change', visible);
                _this.emit(visible ? 'show' : 'hide');
            }, false);
        } else {
            (function () {
                var removeFocusoutListener = (0, _addEventListener2['default'])(_document2['default'], 'focusout', function () {
                    shimvis = false;

                    _this.emit('change', false);
                    _this.emit('hide');
                }, false);

                var removeFocusinListener = (0, _addEventListener2['default'])(_document2['default'], 'focusin', function () {
                    shimvis = true;

                    _this.emit('change', true);
                    _this.emit('show');
                }, false);

                removeChangeListener = function () {
                    removeFocusinListener();
                    removeFocusoutListener();
                };
            })();
        }

        this.dispose = function () {
            ensureAvailability(_this);

            _this._isDisposed = true;

            removeChangeListener();
        };
    }

    _inherits(PageVisibility, _EventEmitter);

    _createClass(PageVisibility, [{
        key: 'isHidden',
        value: function isHidden() {
            ensureAvailability(this);

            return PageVisibility.supported ? !!_document2['default'][hiddenPropertyName] : !shimvis;
        }
    }, {
        key: 'isVisible',
        value: function isVisible() {
            ensureAvailability(this);

            return PageVisibility.supported ? !_document2['default'][hiddenPropertyName] : shimvis;
        }
    }], [{
        key: 'supported',
        get: function () {
            return 'undefined' !== typeof hiddenPropertyName;
        }
    }]);

    return PageVisibility;
})(_events.EventEmitter);

exports['default'] = PageVisibility;
module.exports = exports['default'];