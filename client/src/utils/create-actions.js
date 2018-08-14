/*
 * create-actions.js
 */

import isObject from 'is-object'

import store from '../store/index.js'

const A = (state, ...args) => args
const identity = x => x
const isFunction = x => typeof x === 'function'
const isNull = x => x == null

export function createModelConstants(namespace, others = []) {
  const constants = {
    FETCH:  createNetworkConstants(`${namespace}.FETCH`),
    CREATE: createNetworkConstants(`${namespace}.CREATE`),
    UPDATE: createNetworkConstants(`${namespace}.UPDATE`),
    DELETE: createNetworkConstants(`${namespace}.DELETE`),
  }
  others.forEach(k => {
    constants[k] = createNetworkConstants(`${namespace}.${k}`)
  })

  return constants
}
export function createNetworkConstants(namespace) {
  return {
    REQUEST: `${namespace}.REQUEST`,
    RECEIVE: `${namespace}.RECEIVE`,
    ERROR:   `${namespace}.ERROR`,
  }
}

export function createConstants(namespace, others = []) {
  const constants = {}
  others.forEach(k => {
    constants[k] = `${namespace}.${k}`
  })

  const handler = {
    get: (target, name) => {
      if (name in target)
        return target[name]
      throw new Error(`accessing undefined constant: ${name}`)
    }
  }

  return new Proxy(constants, handler)
}


export function createModelActions(namespace, fns) {
  return {
    fetch:  createFetchActions(namespace.FETCH,  fns.fetch),
    create: createFetchActions(namespace.CREATE, fns.create,
      (key, value) => ({ key, value }),
      (res, key, value) => ({ key, value })),
    update: createFetchActions(namespace.UPDATE, fns.update,
      (key, value) => ({ key, value }),
      (res, key, value) => ({ key, value }),
      (err, key, value) => ({ key, value })),
    delete: createFetchActions(namespace.DELETE, fns.delete),
  }
}

export function createFetchActions(namespace, fn, contraMapFn, mapFn, errorMapFn, fnMap) {
  if (fn === undefined) {
    console.warn('Received undefined function for namespace:', namespace)
    return undefined
  }

  if (isObject(contraMapFn)) {
    const options = contraMapFn
    contraMapFn = options.contraMap
    mapFn       = options.map
    errorMapFn  = options.errorMap
    fnMap       = options.fnMap
  }

  const action = createFetchFunction(fn, fnMap)
  action.request = createAction(namespace.REQUEST, contraMapFn)
  action.receive = createAction(namespace.RECEIVE, undefined, mapFn)
  action.error   = createAction(namespace.ERROR, undefined, errorMapFn)
  return action
}

export function createFetchFunction(fn, fnMap = A) {
  function self(...args) {
    return (dispatch, getState) => {

      dispatch(self.request(...args))

      return fn(...fnMap(getState(), ...args))
      .then(result => {
        dispatch(self.receive(result, ...args))
        return result
      })
      .catch(err =>   dispatch(self.error(err, ...args)))
    }
  }
  return self
}

/* taken from redux-actions */
export function createAction(type, payloadCreator = identity, metaCreator) {
  console.assert(
    isFunction(payloadCreator) || isNull(payloadCreator),
    'Expected payloadCreator to be a function, undefined or null'
  )

  const finalPayloadCreator = isNull(payloadCreator) || payloadCreator === identity
    ? identity
    : (head, ...args) => (head instanceof Error
      ? head : payloadCreator(head, ...args));

  const hasMeta = isFunction(metaCreator);
  const typeString = type.toString();

  const actionCreator = (...args) => {
    const action = { type }
    const payload = finalPayloadCreator(...args)

    if (payload instanceof Error) {
      action.payload = asMessage(payload)
      action.isError = true;
      action.error = payload
    } else if (payload !== undefined) {
      action.payload = payload;
    }

    if (hasMeta)
      action.meta = metaCreator(...args);

    return action;
  };

  actionCreator.toString = () => typeString;

  return (...args) => store.dispatch(actionCreator(...args))
}

export function createAsyncAction(fn) {
  return (...args) => store.dispatch(fn(...args))
}


export function asMessage(error) {
  if (typeof error === 'string')
    return error
  if (error.fromAPI)
    return [error.message, error.details].join(': ')
  return error.message
}

export function isLoading() {
  return Promise.reject(new Error('Already loading'))
}
