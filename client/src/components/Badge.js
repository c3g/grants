import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

import Tooltip from './Tooltip'

function Badge(props) {
  const {
    children,
    button,
    tooltip = true,
    className,
    type,
    size,
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
    ...rest
  } = props

  const badgeClassName = classname(
    'Badge',
    size,
    type,
    className,
    {
      'small': small,
      'large': large,
      'info': info,
      'success': success,
      'warning': warning,
      'error': error,
      'muted': muted,
      'subtle': subtle,
      'highlight': highlight,
    }
  )

  const element =
    <span className={badgeClassName} { ...rest }>
      <span>
        { children }
      </span>
      { button }
    </span>

  if (!tooltip)
    return element

  return (
    <Tooltip content={children} delay={500}>
      { element }
    </Tooltip>
  )
}

export default pure(Badge)
