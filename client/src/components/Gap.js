import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

import size from '../utils/size'

function Gap(props) {
  const { className } = props

  const gapClassName = classname(
    'Gap',
    className
  )

  const style = {
    marginLeft: size(props.h),
    marginBottom: size(props.v),
    flex: props.fill === true ? '1 1' : `0 0 ${size(props.fill)}`
  }

  return (
    <span className={gapClassName} style={style} />
  )
}

export default pure(Gap)
