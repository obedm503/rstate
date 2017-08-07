import React from 'react'
import ReactDOM from 'react-dom'
import Counter from './components/Counter'
import { createStore } from 'rstate'
import counter from './handlers'

const store = createStore(counter, 0)
const rootEl = document.getElementById('root')

const render = () => ReactDOM.render(
  <Counter
    value={store.getState()}
    onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
    onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
    onIncrementAsync={() => store.dispatch({ type: 'INCREMENT_ASYNC' })}
    onIncrementIfOdd={() => store.dispatch({ type: 'INCREMENT_IF_ODD' })}
  />,
  rootEl
)

store.subscribe(render)
