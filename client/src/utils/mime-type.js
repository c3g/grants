/*
 * mime-type.js
 */

export function iconFor(mime) {
  if (mime.startsWith('image/'))
    return 'file-image-o'

  if (mime.startsWith('audio/'))
    return 'file-audio-o'

  if (mime.startsWith('video/'))
    return 'file-video-o'

  switch(mime) {
    case 'application/pdf':
      return 'file-pdf-o'

    case 'application/zip':
    case 'application/x-7z-compressed':
    case 'application/x-bzip':
    case 'application/x-bzip2':
      return 'file-archive-o'

    case 'text/html':
    case 'text/javascript':
    case 'application/json':
    case 'application/xml':
      return 'file-code-o'

    case 'application/msword':
      return 'file-word-o'

    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'file-excel-o'

    default: break
  }

  if (mime.startsWith('text/'))
    return 'file-text'

  return 'file'
}

export function isImage(mime) {
  return mime.startsWith('image/')
}
