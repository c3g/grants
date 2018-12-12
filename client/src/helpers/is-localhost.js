/*
 * is-localhost.js
 */

module.exports = function isLocalhost(ip) {
  return ip === 'localhost' || ip.includes('127.0.0.1')
}
