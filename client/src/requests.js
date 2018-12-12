/*
 * requests.js
 */


import axios from 'axios'

import queryString from './helpers/query-string'



export const isLoggedIn = () => GET('/is-logged-in')

export const settings = {
  list: () => GET('/settings/list'),
  update: (key, value) => POST(`/settings/update/${key}`, { value }),
}

export const users = {
  list: () => GET('/user/list'),
  get: (id) => GET(`/user/get/${id}`),
  update: (id, data) => POST(`/user/update/${id}`, data),
  delete: (id) => POST(`/user/delete/${id}`),
}

export const applicants = {
  list: () => GET('/applicant/list'),
  get: (id) => GET(`/applicant/get/${id}`),
  create: (data) => POST(`/applicant/create`, data),
  update: (id, data) => POST(`/applicant/update/${id}`, data),
  delete: (id) => POST(`/applicant/delete/${id}`),
}

export const grants = {
  list: () => GET('/grant/list'),
  get: (id) => GET(`/grant/get/${id}`),
  create: (data) => POST(`/grant/create`, data),
  update: (id, data) => POST(`/grant/update/${id}`, data),
  delete: (id) => POST(`/grant/delete/${id}`),
}

export const fundings = {
  list: () => GET('/funding/list'),
  get: (id) => GET(`/funding/get/${id}`),
  create: (data) => POST(`/funding/create`, data),
  update: (id, data) => POST(`/funding/update/${id}`, data),
  delete: (id) => POST(`/funding/delete/${id}`),
}

export const categories = {
  list: () => GET('/category/list'),
  get: (id) => GET(`/category/get/${id}`),
  create: (data) => POST(`/category/create`, data),
  update: (id, data) => POST(`/category/update/${id}`, data),
  delete: (id) => POST(`/category/delete/${id}`),
}

export const history = {
  list: () => GET('/history/list'),
  findByEntity: (table, id) => GET(`/history/find-by-entity/${table}/${id}`),
  findByRange: (start, end) => GET(`/history/find-by-range/${start}/${end}`),
}




function fetchAPI(url, params, options = {}) {
  let { method = 'get', ...other } = options

  let finalURL = process.env.PUBLIC_URL + '/api' + url
  let data = undefined

  if (method === 'post' && params)
    data = params

  if (method === 'get' && params)
    finalURL += `?${queryString(params)}`

  const config = {
    method: method,
    url: finalURL,
    data: data,
    ...other
  }

  return axios(config).then(({ data }) => {
    if (data.ok)
      return Promise.resolve(data.data)
    else
      return Promise.reject(createError(data))
  })
}

function GET(url, params, options = {})  { return fetchAPI(url, params, { method: 'get', ...options }) }
function POST(url, params, options = {}) { return fetchAPI(url, params, { method: 'post', ...options }) }

function createError(data) {
  const e = new Error(data.message)
  e.type  = data.type
  e.stack = data.stack
  e.fromServer = true
  return e
}
