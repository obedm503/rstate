"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var isObject = function (item) { return (item && typeof item === 'object' && !Array.isArray(item)); };
/**
 * allows for nested state branch handlers
 * https://github.com/reactjs/redux/issues/738
 *
 * @export
 * @param {Object} handlers
 * @param {String} stateKey
 * @returns {Object[]}
 */
function processHandlers(handlers, stateKey) {
    if (!isObject(handlers)) {
        throw new Error('Handlers should be an object literal');
    }
    return Object.keys(handlers).reduce(function (acc, key) {
        var handler = handlers[key];
        if (typeof handler === 'function') {
            acc.push({
                type: key,
                handler: handler,
                stateKey: stateKey,
            });
        }
        else {
            acc.concat.apply(acc, processHandlers(handler, stateKey ? stateKey + "." + key : key));
        }
        return acc;
    }, []);
}
var Store = (function () {
    function Store(handlers, initialState) {
        this.handlers = {};
        if (typeof handlers === 'undefined') {
            throw new Error('Rstate: no action handlers provided');
        }
        this.handlers = handlers;
        this.bhs$ = new BehaviorSubject_1.BehaviorSubject(initialState);
        this.state = this.bhs$.asObservable();
        // reduc-like api
        this.subscribe = this.state.subscribe.bind(this.state);
    }
    Store.prototype.dispatch = function (action) {
        var _this = this;
        if (typeof action === 'undefined') {
            throw new Error('No Action Given');
        }
        var handler = this.handlers[action.type];
        if (typeof handler === 'undefined') {
            var handlerNames = Object.keys(this.handlers).map(function (name) { return "  \"" + name + "\""; }).join(', \n');
            throw new Error("Action handler of type \"" + action.type + "\" does not exist. It is possible that you mispelled the action type.\n\nThe currently registered action types are: \n" + handlerNames + "\n");
        }
        var dispatched = false;
        var newState = handler(
        // current state
        this.getState(), 
        // action dispatched
        action, 
        // dispatch()
        function (action) {
            dispatched = true;
            _this.dispatch(action);
        });
        if (typeof newState === 'undefined') {
            return;
        }
        if (dispatched) {
            throw new Error('You may not return new state AND dispatch in the same handler. Consider dividing your logic between a Procedure and a Reducer.');
        }
        this.bhs$.next(newState);
    };
    // redux-like api
    Store.prototype.getState = function () {
        return this.bhs$.getValue();
    };
    // redux-like api
    Store.prototype.replaceHandlers = function (handlers) {
        if (handlers === void 0) { handlers = {}; }
        this.handlers = __assign({}, this.handlers, handlers);
    };
    return Store;
}());
exports.Store = Store;
function createStore(handlers, initialState) {
    return new Store(handlers, initialState);
}
exports.createStore = createStore;
function combineHandlers(_a) {
    // should throw if duplicate handlers in functions and procedures
    var _b = _a.functions, functions = _b === void 0 ? {} : _b, _c = _a.procedures, procedures = _c === void 0 ? {} : _c;
    // const handlers = [
    //   ...Object.keys(functions).map(name => ({
    //     name: name,
    //     type: 'function',
    //   })),
    //   ...Object.keys(procedures).map(name => ({
    //     name: name,
    //     type: 'procedure',
    //   })),
    // ];
    return __assign({}, functions, procedures);
}
exports.combineHandlers = combineHandlers;
