import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

import Icon from './Icon'
import Spinner from './Spinner'


function Button(props) {
  const {
    className,
    type,
    size,
    active,
    flat,
    round,
    iconButton,
    square,
    center,
    small,
    large,
    // Styles:
    default: default_,
    normal,
    info,
    success,
    warning,
    error,
    muted,
    subtle,
    highlight,
    // Other:
    loading,
    disabled,
    children,
    icon,
    iconAfter,
    onClick,
    ...rest
  } = props

  const buttonClassName = classname(
    'Button',
    className,
    type,
    size,
    {
      'active': active,
      'flat': flat,
      'round': round,
      'square': square,
      'iconButton': iconButton,
      'center': center,
      'small': small,
      'large': large,
      // Styles:
      'default': default_,
      'normal': normal,
      'info': info,
      'success': success,
      'warning': warning,
      'error': error,
      'muted': muted,
      'subtle': subtle,
      'highlight': highlight,
    }
  )

  return (
    <button className={buttonClassName}
      onClick={onClick}
      disabled={loading || disabled}
      {...rest}
    >
      { icon !== undefined && <Icon name={icon} marginRight={(round || square) ? 0 : 5} className='Button__icon' /> }
      {
        children &&
          <span>{ children }</span>
      }
      {
        loading &&
          <Spinner />
      }
      { iconAfter !== undefined && !loading &&
        <Icon name={iconAfter} className='Button__iconAfter' />
      }
    </button>
  )
}

export default pure(Button)
