var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { isObject } from "./util";
/**
 * based on https://coderwall.com/p/w22s0w/recursive-merge-flatten-objects-in-plain-old-vanilla-javascript
 *
 * {
 *   INCREMENT_MESSAGE_COUNT(){},
 *   users: {
 *     ADD_USER(){}
 *   }
 * }
 * =>
 * {
 *   INCREMENT_MESSAGE_COUNT(){},
 *   ADD_USER@users(){}
 * }
 *
 * @export
 * @param {object} obj
 * @returns {object}
 */
export function combineHandlers(handlers) {
    if (!isObject(handlers)) {
        throw new Error('combineHandlers expected action handlers to be object literal');
    }
    function recursive(obj, name, stem) {
        var out = {};
        var stateStem = stem ? stem + "." + name : name;
        Object.keys(obj).forEach(function (key) {
            var value = obj[key];
            var prop;
            if (isObject(value)) {
                prop = recursive(value, key, stateStem);
            }
            else {
                var handlerStem = stateStem ? key + "@" + stateStem : key;
                prop = (_a = {},
                    _a[handlerStem] = value,
                    _a);
            }
            out = __assign({}, out, prop);
            var _a;
        });
        return out;
    }
    return recursive(handlers);
}
