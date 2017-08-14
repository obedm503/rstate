import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { set, get } from 'dot-prop-immutable';

export interface Action {
  type: string;
}

export interface Store {
  state: Observable<any>;
  subscribe: ( observer: ( state: any ) => void ) => Subscription;
  dispatch: <A extends Action>( action: A ) => A;
  getState: () => any;
  replaceHandlers: ( newHandlers: object ) => void;
}

export function createStore( handlers: object, initialState: any, enhancer? ): Store {
  if( typeof handlers === 'undefined' ){
    throw new Error( 'Rstate: no action handlers provided' );
  }

  if( typeof enhancer !== 'undefined' ){
    if ( typeof enhancer !== 'function' ) {
      throw new Error( 'Expected the enhancer to be a function.' );
    }

    return enhancer( createStore )( handlers, initialState );
  }
  const state$: BehaviorSubject<any> = new BehaviorSubject( initialState );

  function dispatch<A extends Action>( action: A ): A {
    if ( typeof action === 'undefined' || typeof action.type === 'undefined' ){
      throw new Error( 'No Action Given' );
    }

    const handlerKeys = Object.keys( handlers );
    const currentHandlers = handlerKeys
      .filter( key => key === action.type || ( key.startsWith( action.type ) && key[action.type.length] === '@' ) );

    if( currentHandlers.length === 0 ){
      const handlerNames = handlerKeys.map( name => `  "${name}"` ).join( ', \n' );
      throw new Error(
        `Action handlers of type "${action.type}" do not exist.\n` +
        'It is possible that you mispelled the action type.\n\n' +
        'The currently registered action types are: \n' +
        `${handlerNames}\n`,
      );
    }

    // reduce state to it's new value and call state$.next just once per dispatch
    // to get better performace, instead of calling state$.next for each handler
    let finalState = getState();
    const beginningState = finalState;
    let i = currentHandlers.length;
    while ( i-- ) {
      const key = currentHandlers[i];
      const dotPropKey = key.split( '@' )[1];
      const handlerState = dotPropKey ? get( finalState, dotPropKey ) : finalState;

      const handler = handlers[key];
      let dispatched = false;
      const newState = handler(
        // current state
        handlerState,
        // action dispatched
        action,
        // dispatch()
        a => {
          dispatched = true;
          dispatch( a );
        },
      );
      if( typeof newState === 'undefined' ){
        continue;
      }
      if( dispatched ){
        throw new Error(
          `"${key}": You may not return new state AND dispatch in the same handler.\n` +
          'Consider dividing your logic between a Procedure and a Reducer.',
        );
      }
      finalState = dotPropKey ? set( finalState, dotPropKey, newState ) : newState;
    }
    // it is possible that none of the handlers updated the state so check if
    // state changed after all the reducing
    if( finalState !== beginningState ){
      state$.next( finalState );
    }

    return action;
  }

  // redux-like api
  function getState() {
    return state$.getValue();
  }

  // redux-like api
  // instead of replaceReducers
  function replaceHandlers( newHandlers: object ): void {
    if( typeof newHandlers === 'undefined' ){
      throw new Error( 'you can\'t replace old handlers with nothing.' );
    }
    handlers = {
      ...handlers,
      ...newHandlers,
    };
  }

  const state: Observable<any> = state$.asObservable();
  // redux-like api
  const subscribe: ( observer: ( state: any ) => void ) => Subscription = state.subscribe.bind( state );
  return {
    state,
    getState,
    dispatch,
    subscribe,
    replaceHandlers,
  };
}
