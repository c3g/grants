import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

function Title(props) {
  const {
    children,
    className,
    keepCase,
    small,
    large,
    info,
    success,
    warning,
    error,
    muted,
    subtle,
    highlight,
  } = props

  const titleClassName = classname(
    'title',
    className,
    {
      'keep-case': keepCase,
      'small': small,
      'large': large,
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
    <div className={titleClassName}>
      { children }
    </div>
  )
}

export default pure(Title)
