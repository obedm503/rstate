import React from 'react'
import { render } from 'react-dom'
// the only use of redux
import { applyMiddleware } from 'redux'
import { createStore } from 'rstate'
import { Provider } from 'react-redux'
import { createLogger } from 'redux-logger'
import handler from './handlers'
import App from './containers/App'

const middleware = []
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger())
}

const store = createStore(
  handler,
  {
    selectedReddit: 'reactjs',
    postsByReddit: {},
  },
  applyMiddleware(...middleware)
)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
