import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import 'font-awesome/css/font-awesome.min.css'

import store from './store'
import Routes from './routes'
import registerServiceWorker from './utils/registerServiceWorker'
import isLocalhost from './utils/is-localhost.js'

import './styles/badges.css'
import './styles/button.css'
import './styles/export-variables.css'
import './styles/global-styles.css'
import './styles/modal.css'
import './styles/notifications.css'
import './styles/reset.css'
import './styles/spinner.css'

import * as requests from './requests.js'
import global from './actions/global'

render(
  <Provider store={store}>
    <Routes />
  </Provider>,
  document.getElementById('root')
)



if (process.env.NODE_ENV === 'development') {
  global.checkIsLoggedIn.receive(true)
  global.fetchAll()

  window.requests = requests
}
else /* production */ {
  global.checkIsLoggedIn()
  .then(isLoggedIn => {
    if (isLoggedIn)
      global.fetchAll()
  })
}

setInterval(() => {
  const state = store.getState()
  if (state.ui.loggedIn.value)
    global.fetchAll()
}, 60 * 1000)



// Register service worker

if (process.env.NODE_ENV !== 'development'
    && window.location.protocol === 'https:'
    && !isLocalhost(window.location.href))
  registerServiceWorker()



// HMR

if (module.hot) {
  /* eslint-disable global-require */

  module.hot.accept(['./routes'], () => {
    const NextRoutes = require('./routes').default;
    render(
      <Provider store={store}>
        <NextRoutes />
      </Provider>,
      document.querySelector('#root')
    )
  })

  const styles = [
    './styles/badges.css',
    './styles/button.css',
    './styles/export-variables.css',
    './styles/global-styles.css',
    './styles/modal.css',
    './styles/notifications.css',
    './styles/reset.css',
    './styles/spinner.css',
  ]
  styles.forEach(s => {
    module.hot.accept(s, () => require(s))
  })
}
