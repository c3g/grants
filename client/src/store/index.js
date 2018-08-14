/* eslint-disable global-require */

const configureStore = (process.env.NODE_ENV === 'production' ? require('./store.prod') : require('./store.dev')).default

const store = configureStore()

export default store
