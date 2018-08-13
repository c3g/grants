
const INPUT_ENCODING = 'ISO-8859-1'
const DEFAULT_SIZE = 100 /* MB */ * 1024 * 1024

const requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
const requestQuota = (...args) => navigator.webkitPersistentStorage.requestQuota(...args)

let fsHandle
let grantedSize

export function canUseFileSystem() {
  return (requestFileSystem !== undefined
    && navigator.webkitPersistentStorage !== undefined)
}

export function isFileSystemInitialized() {
  return fsHandle !== undefined
}

/**
 * Initialize the FileSystem with some initial size
 * @param {number} maxSize size in bytes (default 100 MB)
 */
export function initFs(size = DEFAULT_SIZE) {
  if (fsHandle)
    return Promise.resolve(fsHandle)

  return new Promise((resolve, reject) => {
    requestQuota(size, grantedBytes => {
      grantedSize = grantedBytes
      if (grantedBytes > 0) {
        requestFileSystem(window.PERSISTENT, grantedBytes, fs => {
          fsHandle = fs
          resolve(fsHandle)
        }, reject)
      } else {
        reject('Granted 0 bytes')
      }
    }, reject)
  })
}

/**
 * Read a file
 * @param {string} fileName - path to the file to read
 * Usage:
 *
 *  readFile('file.txt')
 *  .then(content => console.log('File content: ' + content))
 *  .catch(err => console.error(err))
 */
export function readFile(fileName) {
  return initFs().then(fs => new Promise((resolve, reject) => {
    fs.root.getFile(fileName, {}, fileEntry => {
      // fileEntry.isFile === true
      // fileEntry.name == fileName (?)

      fileEntry.file(file => {

        readFileAsText(file)
          .then(resolve)
          .catch(reject)

      }, reject);
    }, reject);
  }))
}

/**
 * Write a file
 * @param {string} fileName - path to the file to write
 * @param {string} content - content to write
 * Usage:
 *
 *  writeFile('file.txt', 'Hello!')
 *  .then(() => console.log('Ok'))
 *  .catch(err => console.error(err))
 */
export function writeFile(fileName, content) {
  return initFs().then(fs => new Promise((resolve, reject) => {
    fs.root.getFile(fileName, { create: true }, fileEntry => {
      fileEntry.createWriter(fileWriter => {

        fileWriter.onwriteend = resolve
        fileWriter.onerror    = reject

        fileWriter.write(asBlob(content))

      }, reject)
    }, reject)
  }))
}

/**
 * Deletes a file
 * @param {string} fileName - path to the file to write
 * @param {string} content - content to write
 * Usage:
 *
 *  deleteFile('file.txt')
 *  .then(() => console.log('Ok'))
 *  .catch(err => console.error(err))
 */
export function deleteFile(fileName) {
  return initFs().then(fs => new Promise((resolve, reject) => {
    fs.root.getFile(fileName, {}, fileEntry => {
      fileEntry.remove(resolve, reject)
    }, reject)
  }))
}

/**
 * Reads a FileSystem file as text
 * @param {File} file
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(file, INPUT_ENCODING)
  })
}


function asBlob(content, type = 'text/plain') {
  if (content instanceof Blob)
    return content

  return new Blob([content], { type })
}
