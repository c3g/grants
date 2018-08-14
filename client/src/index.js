import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import configureStore from './store'
import Routes from './routes'
import registerServiceWorker from './utils/registerServiceWorker'

import 'font-awesome/css/font-awesome.min.css'
import './styles/badges.css'
import './styles/button.css'
import './styles/export-variables.css'
import './styles/global-styles.css'
import './styles/modal.css'
import './styles/notifications.css'
import './styles/reset.css'
import './styles/spinner.css'

import global from './actions/global'

const store = configureStore()

render(
  <Provider store={store}>
    <Routes />
  </Provider>,
  document.getElementById('root')
)



if (process.env.NODE_ENV === 'development') {
  store.dispatch(global.checkIsLoggedIn.receive(true))
  store.dispatch(global.fetchAll())
}
else /* production */ {
  store.dispatch(global.checkIsLoggedIn())
  .then(() => store.dispatch(global.fetchAll()))
}

setInterval(() => store.dispatch(global.fetchAll()), 60 * 1000)



// Register service worker

//registerServiceWorker()



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
