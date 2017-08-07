import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'rstate'
import { Provider } from 'react-redux'
import App from './containers/App'
import handlers from './handlers'
import 'todomvc-app-css/index.css'

const store = createStore(handlers, {
  todos: [
    {
      text: 'Use Redux',
      completed: false,
      id: 0
    }
  ]
})

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
