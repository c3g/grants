/*
 * open-centered.js
 */

export default function openCentered(url, height, width) {
  const left = window.screen.width / 2  - width / 2
  const top  = window.screen.height / 2 - height / 2
  return window.open(url, '_blank', `height=${height},width=${width},left=${left},top=${top}`)
}
