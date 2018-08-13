import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

function Spinner(props) {
  let {
    className,
    size = 'tiny',
    tiny,
    small,
    medium,
    large,
    visible,
    ...rest
  } = props

  const spinnerClassName = classname(
    'Spinner Icon',
    `loading-spinner-${size}`,
    size,
    className,
    {
      hidden: visible === false,
      tiny,
      small,
      medium,
      large,
    }
  )

  return (
    <i className={spinnerClassName} { ...rest } />
  )
}

function has(props, name) {
  if (((name in props) && props[name] === undefined) || props[name] === true)
    return true
  return false
}


export default pure(Spinner)
