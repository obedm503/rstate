import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { set, get } from 'dot-prop-immutable';

export { combineHandlers } from './combineHandlers';

export class Store {
  private handlers: object = {};
  private bhs$: BehaviorSubject<any>;
  public state: Observable<any>;
  public subscribe: ( state: Observable<any> ) => Subscription;

  constructor( handlers: object, initialState?: any ) {
    if( typeof handlers === 'undefined' ){
      throw new Error( 'Rstate: no action handlers provided' );
    }
    this.handlers = handlers;
    this.bhs$ = new BehaviorSubject( initialState );
    this.state = this.bhs$.asObservable();

    // redux-like api
    this.subscribe = this.state.subscribe.bind( this.state );
  }

  public dispatch( action: { type: string }) {
    if ( typeof action === 'undefined' ){ throw new Error( 'No Action Given' ); }

    const handlerKeys = Object.keys( this.handlers );
    const handlers = handlerKeys
      .filter( key => key === action.type || ( key.startsWith( action.type ) && key[action.type.length] === '@' ) );

    if ( handlers.length === 0 ){
      const handlerNames = handlerKeys.map( name => `  "${name}"` ).join( ', \n' );
      throw new Error(
`Action handler of type "${action.type}" does not exist.
It is possible that you mispelled the action type.

The currently registered action types are:
${handlerNames}
`,
      );
    }

    handlers.forEach( key => {
      const handler = this.handlers[key];
      const stateKey = key.split( '@' )[1];
      const state = stateKey ? get( this.getState(), stateKey ) : this.getState();
      let dispatched = false;
      const newState = handler(
        // current state
        state,
        // action dispatched
        action,
        // dispatch()
        a => {
          dispatched = true;
          this.dispatch( a );
        },
      );
      if ( typeof newState === 'undefined' ) {
        return;
      }
      if( dispatched ){
        throw new Error(
          `"${key}": You may not return new state AND dispatch in the same handler.
Consider dividing your logic between a Procedure and a Reducer.`,
        );
      }
      this.bhs$.next( stateKey ? set( this.getState(), stateKey, newState ) : newState );
    });

  }

  // redux-like api
  public getState() {
    return this.bhs$.getValue();
  }
  // redux-like api
  public replaceHandlers( handlers = {}) {
    this.handlers = {
      ...this.handlers,
      ...handlers,
    };
  }
}

export function createStore( handlers: {}, initialState: any ): Store {
  return new Store( handlers, initialState );
}
