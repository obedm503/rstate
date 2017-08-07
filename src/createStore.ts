import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { set, get } from 'dot-prop-immutable';

export interface Store {
  state: Observable<any>;
  subscribe: ( observer: ( state: any ) => void ) => Subscription;
  dispatch: ( action: { type: string }) => { type: string };
  getState: () => any;
  replaceHandlers: ( object ) => void;
}

export function createStore( handlers: object, initialState: any, enhancer? ): Store {
  if ( typeof handlers === 'undefined' ){
    throw new Error( 'Rstate: no action handlers provided' );
  }

  if ( typeof enhancer !== 'undefined' ) {
    if ( typeof enhancer !== 'function' ) {
      throw new Error( 'Expected the enhancer to be a function.' );
    }

    return enhancer( createStore )( handlers, initialState );
  }
  const state$: BehaviorSubject<any> = new BehaviorSubject( initialState );
  const state: Observable<any> = state$.asObservable();
  // redux-like api
  const subscribe: ( observer: ( state: any ) => void ) => Subscription = state.subscribe.bind( state );

  function dispatch( action: { type: string }): { type: string } {
    if ( typeof action === 'undefined' ) { throw new Error( 'No Action Given' ); }

    const handlerKeys = Object.keys( handlers );
    const currentHandlers = handlerKeys
      .filter( key => key === action.type || ( key.startsWith( action.type ) && key[action.type.length] === '@' ) );

    if ( currentHandlers.length === 0 ) {
      const handlerNames = handlerKeys.map( name => `  "${name}"` ).join( ', \n' );
      throw new Error(
        `Action handler of type "${action.type}" does not exist.\n` +
        'It is possible that you mispelled the action type.\n\n' +
        'The currently registered action types are: \n' +
        `${handlerNames}\n`,
      );
    }

    let i = currentHandlers.length;
    while ( i-- ) {
      const key = currentHandlers[i];
      const handler = handlers[key];
      const stateKey = key.split( '@' )[1];
      const currentState = stateKey ? get( getState(), stateKey ) : getState();
      let dispatched = false;
      const newState = handler(
        // current state
        currentState,
        // action dispatched
        action,
        // dispatch()
        a => {
          dispatched = true;
          dispatch( a );
        },
      );
      if ( typeof newState === 'undefined' ) {
        continue;
      }
      if ( dispatched ) {
        throw new Error(
          `"${key}": You may not return new state AND dispatch in the same handler.\n` +
          'Consider dividing your logic between a Procedure and a Reducer.',
        );
      }
      state$.next( stateKey ? set( getState(), stateKey, newState ) : newState );
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

  return {
    state,
    getState,
    dispatch,
    subscribe,
    replaceHandlers,
  };
}
