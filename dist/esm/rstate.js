var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { set, get } from 'dot-prop-immutable';
export { combineHandlers } from './combineHandlers';
var Store = (function () {
    function Store(handlers, initialState) {
        this.handlers = {};
        if (typeof handlers === 'undefined') {
            throw new Error('Rstate: no action handlers provided');
        }
        this.handlers = handlers;
        this.bhs$ = new BehaviorSubject(initialState);
        this.state = this.bhs$.asObservable();
        // redux-like api
        this.subscribe = this.state.subscribe.bind(this.state);
    }
    Store.prototype.dispatch = function (action) {
        var _this = this;
        if (typeof action === 'undefined') {
            throw new Error('No Action Given');
        }
        var handlerKeys = Object.keys(this.handlers);
        var handlers = handlerKeys
            .filter(function (key) { return key === action.type || (key.startsWith(action.type) && key[action.type.length] === '@'); });
        if (handlers.length === 0) {
            var handlerNames = handlerKeys.map(function (name) { return "  \"" + name + "\""; }).join(', \n');
            throw new Error("Action handler of type \"" + action.type + "\" does not exist.\nIt is possible that you mispelled the action type.\n\nThe currently registered action types are:\n" + handlerNames + "\n");
        }
        handlers.forEach(function (key) {
            var handler = _this.handlers[key];
            var stateKey = key.split('@')[1];
            var state = stateKey ? get(_this.getState(), stateKey) : _this.getState();
            var dispatched = false;
            var newState = handler(
            // current state
            state, 
            // action dispatched
            action, 
            // dispatch()
            function (a) {
                dispatched = true;
                _this.dispatch(a);
            });
            if (typeof newState === 'undefined') {
                return;
            }
            if (dispatched) {
                throw new Error("\"" + key + "\": You may not return new state AND dispatch in the same\u00A0handler.\nConsider dividing your logic between a Procedure and a Reducer.");
            }
            _this.bhs$.next(stateKey ? set(_this.getState(), stateKey, newState) : newState);
        });
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
export { Store };
export function createStore(handlers, initialState) {
    return new Store(handlers, initialState);
}
