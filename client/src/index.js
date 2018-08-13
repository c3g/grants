import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import configureStore from './store'
import Routes from './routes'
import registerServiceWorker from './utils/registerServiceWorker'

import 'font-awesome/css/font-awesome.min.css'
import './styles/export-variables.css'
import './styles/reset.css'
import './styles/spinner.css'
import './styles/button.css'
import './styles/badges.css'
import './styles/notifications.css'
import './styles/modal.css'
import './styles/global-styles.css'

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
  module.hot.accept(['./routes'], () => {
    const NextRoutes = require('./routes').default;
    render(
      <Provider store={store}>
        <NextRoutes />
      </Provider>,
      document.querySelector('#root')
    )
  })
  /* eslint-disable global-require */
  module.hot.accept('./styles/global-styles.css', () => require('styles/global-styles.css'))
  module.hot.accept('./styles/reset.css', () => require('./styles/reset.css'))
  module.hot.accept('./styles/button.css', () => require('./styles/button.css'))
  module.hot.accept('./styles/badges.css', () => require('./styles/badges.css'))
}
