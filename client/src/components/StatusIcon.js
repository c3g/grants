import React from 'react'
import pure from 'recompose/pure'

import STATUS from '../constants/status'
import Icon from './Icon'
import Spinner from './Spinner'

const StatusIcon = ({ name, showInProgress, size }) =>
  name.isLoading              ?  <Spinner /> :
  name === STATUS.NOT_DONE    ?  <Icon name='circle' subtle size={size} /> :
  name === STATUS.IN_PROGRESS ?  (showInProgress ?
                                    <Icon name='circle-o-notch' info size={size} /> :
                                    <Icon name='circle' subtle size={size} />) :
  name === STATUS.DONE        ?  <Icon name='check' success size={size} /> :
  name === STATUS.ERROR       ?  <Icon name='warning' error size={size} /> :
  name === STATUS.ON_HOLD     ?  <Icon name='hourglass-2' warning size={size} /> :
  name === STATUS.SKIP        ?  <Icon name='forward' muted size={size} /> : null

export default pure(StatusIcon)
