import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

function Text(props) {
  const {
    children,
    className,
    inline,
    block,
    bold,
    small,
    medium,
    large,
    normal,
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
    'text',
    className,
    {
      'small': small,
      'large': large,
      'medium': medium,
      'inline': inline,
      'block': block,
      'bold': bold,
      'text-normal': normal,
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
    <span className={labelClassName} { ...rest }>
      { children }
    </span>
  )
}

export default pure(Text)
