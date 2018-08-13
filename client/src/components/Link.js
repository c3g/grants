import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

function Link(props) {
  const {
    children,
    className,
    small,
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

  const linkClassName = classname(
    'link',
    className,
    {
      'small': small,
      'large': large,
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
    <a className={linkClassName} { ...rest }>
      { children }
    </a>
  )
}

export default pure(Link)
