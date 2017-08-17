import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { Subscriber } from "rxjs/Subscriber";
import { set, get } from 'dot-prop-immutable';

export interface Action {
  type: string;
}
export type Dispatch = <A extends Action>( action: A ) => A;
export type Reducer<T> = <A extends Action>( state: T, action: A ) => T;
export type Procedure<T> = <A extends Action>( state: T, action: A, dispatch: Dispatch ) => void;
export type Handler<T> = Reducer<T> & Procedure<T>;
export interface Handlers<T> {
  [actionType: string]: Handler<T>;
}

export interface Store<S> {
  state: Observable<S>;
  subscribe: ( subscriber: Subscriber<S> ) => Subscription;
  dispatch: Dispatch;
  getState: () => S;
  replaceHandlers: ( newHandlers: Handlers<S> ) => void;
}

export function createStore<S>( handlers: Handlers<S>, initialState: S, enhancer? ): Store<S> {
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
        ( handlerKeys.length )
        ? 'There are no registered action types.'
        : `The currently registered action types are: \n${handlerNames}\n`,
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
      const handlerState: S = dotPropKey ? get( finalState, dotPropKey ) as S : finalState;

      if( typeof handlerState === 'undefined' ){
        throw new Error(
          `It seems you forgot to define the initial state at "state.${dotPropKey}"` +
          `when the action "${action.type}" was dispatched`,
        );
      }

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
          return dispatch( a );
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
  function getState(): S {
    return state$.getValue();
  }

  // redux-like api
  // instead of replaceReducers
  function replaceHandlers( newHandlers: Handlers<S> ): void {
    if( typeof newHandlers === 'undefined' ){
      throw new Error( 'you can\'t replace old handlers with nothing.' );
    }
    handlers = {
      ...handlers,
      ...newHandlers,
    };
  }

  const state: Observable<S> = state$.asObservable();
  // redux-like api
  const subscribe: ( subscriber: Subscriber<S> ) => Subscription = state.subscribe.bind( state );
  return {
    state,
    getState,
    dispatch,
    subscribe,
    replaceHandlers,
  };
}
