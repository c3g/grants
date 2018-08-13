import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

function Label(props) {
  const {
    children,
    className,
    inline,
    size,
    small,
    medium,
    large,
    info,
    success,
    warning,
    error,
    muted,
    subtle,
    highlight,
    ...rest
  } = props

  const labelClassName = classname(
    'label',
    size,
    className,
    {
      'small': small,
      'medium': medium,
      'large': large,
      'inline': inline,
      'text-info': info,
      'text-success': success,
      'text-warning': warning,
      'text-error': error,
      'text-muted': muted,
      'text-subtle': subtle,
      'text-highlight': highlight,
    }
  )

  return (
    <label className={labelClassName} { ...rest }>
      { children }
    </label>
  )
}

export default pure(Label)
