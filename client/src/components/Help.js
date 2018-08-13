import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

import Icon from './Icon'
import Tooltip from './Tooltip'

function Help(props) {
  const {
    children,
    className,
    ...rest
  } = props

  const helpClassName = classname(
    'Help',
    className
  )

  return (
    <Tooltip content={children} offset='15px 0'>
      <Icon marginLeft={10} className={helpClassName} name='question-circle' {...rest} />
    </Tooltip>
  )
}

export default pure(Help)
