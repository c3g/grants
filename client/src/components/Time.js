import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

import humanReadableTime, { humanDetailedTime } from '../utils/human-readable-time'
import Tooltip from './Tooltip'

function Time(props) {
  const {
    children,
    className,
    inline,
    small,
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

  const timeClassName = classname(
    'Time',
    className,
    {
      'small': small,
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
    <Tooltip content={humanDetailedTime(children)} offset='15px 0'>
      <abbr className={timeClassName} { ...rest }>
        { humanReadableTime(children) }
      </abbr>
    </Tooltip>
  )
}

export default pure(Time)
