/*
 * get-emails.js
 */

const emailRegex = new RegExp('[^\\.\\s@:][^\\s@:]*(?!\\.)@[^\\.\\s@]+(?:\\.[^\\.\\s@]+)*', 'g')

export default function getEmails(value) {
  const emails = value.match(emailRegex) || []
  return emails.map(x => x.trim().replace(/\W+$/, ''))
}
