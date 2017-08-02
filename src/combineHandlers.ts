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
export function combineHandlers( handlers: object ): object {
  if( !isObject( handlers ) ){
    throw new Error( 'combineHandlers expected action handlers to be object literal' );
  }

  function recursive( obj: object, name?: string, stem?: string ): object {
    let out = {};
    const stateStem = stem ? `${stem}.${name}` : name;

    Object.keys( obj ).forEach( key => {
      const value = obj[key];
      let prop;
      if( isObject( value ) ){
        prop = recursive( value, key, stateStem );
      } else {
        const handlerStem = stateStem ? `${key}@${stateStem}` : key;
        prop = {
          [handlerStem]: value,
        };
      }

      out = {
        ...out,
        ...prop,
      };
    });
    return out;
  }

  return recursive( handlers );
}
