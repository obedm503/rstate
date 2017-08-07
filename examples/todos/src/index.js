import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'rstate'
import { Provider } from 'react-redux'
import App from './components/App'
import handlers from './handlers'

const store = createStore(handlers, {
  todos: [],
  visibilityFilter: 'SHOW_ALL',
})

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
