import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

function Icon(props) {
  const {
    name,
    type,
    size,
    className,
    small,
    large,
    info,
    success,
    warning,
    error,
    muted,
    subtle,
    highlight,
    spin,
    marginLeft,
    marginRight,
    ...rest
  } = props

  const iconClassName = classname(
    'Icon fa',
    `fa-${name}`,
    size ? `fa-${size}` : '',
    className,
    {
      [`text-${type}`] : type !== undefined,
      'small': small,
      'large': large,
      'text-info': info,
      'text-success': success,
      'text-warning': warning,
      'text-error': error,
      'text-muted': muted,
      'text-subtle': subtle,
      'text-highlight': highlight,
      'fa-spin': spin,
    }
  )

  const style = {
    marginLeft: marginLeft,
    marginRight: marginRight,
    ...props.style
  }

  return (
    <i className={iconClassName} {...rest} style={style} />
  )
}

export default pure(Icon)
