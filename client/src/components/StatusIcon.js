import React from 'react'
import prop from 'prop-types'
import pure from 'recompose/pure'

import STATUS from '../constants/status'
import Icon from './Icon'
import Spinner from './Spinner'

const StatusIcon = ({ name, isLoading, size }) =>
  isLoading                     ?  <Spinner /> :
  name === STATUS.ACCEPTED      ?  <Icon name='check' success size={size} /> :
  name === STATUS.NOT_ACCEPTED  ?  <Icon name='warning' error size={size} /> :
  name === STATUS.SUBMITTED     ?  <Icon name='hourglass-2' warning size={size} /> :
  name === STATUS.FINISHED      ?  <Icon name='forward' muted size={size} /> : null

StatusIcon.propTypes = {
  name: prop.string,
  isLoading: prop.bool,
  size: prop.string,
}

export default pure(StatusIcon)
