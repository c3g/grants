import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

import size from '../helpers/size'

function Image(props) {
  const {
    name,
    className,
    src,
    ...rest
  } = props

  const imgClassName = classname(
    'Image',
    className,
  )

  return (
    <img className={imgClassName} src={src} {...rest}/>
  )
}

export default pure(Image)
