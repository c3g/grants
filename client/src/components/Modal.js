import React from 'react'
import { createPortal } from 'react-dom'
import pure from 'recompose/pure'
import classname from 'classname'

import size from '../utils/size'
import Button from './Button'
import Icon from './Icon'


class Modal extends React.Component {
  constructor(props) {
    super(props)

    const {
      open = false,
    } = props

    this.state = {
      open,
    }

    if (props.open === true)
      this.didOpen = true
  }

  componentWillMount() {
    this.mountNode = this.props.mountNode || document.body
    this.domNode = document.createElement('div')
    this.mountNode.appendChild(this.domNode)
  }

  componentWillUnmount() {
    this.mountNode.removeChild(this.domNode)
  }

  componentWillReceiveProps(props) {
    if (props.open && !this.props.open)
      this.didOpen = true

    if (!props.open && this.props.open) {
      if (this.previousElement) {
        this.previousElement.focus()
        this.previousElement = undefined
      }
    }
  }

  componentDidUpdate() {
    if (this.didOpen) {
      this.didOpen = false
      this.previousElement = document.activeElement
      this.element.focus()
    }
  }

  onKeyDown = (ev) => {
    if (ev.which === 27 /* Escape */) {
      ev.preventDefault()
      ev.stopPropagation()
      this.props.onClose && this.props.onClose()
    }
  }

  onClickBackground = (ev) => {
    this.props.onClose && this.props.onClose()
  }

  onRef = (ref) => {
    if (!ref)
      return
    this.element = ref
  }

  render() {
    const {
      className,
      title,
      open,
      small,
      large,
      width,
      height,
      showHeader = true,
      showClose = true,
      minimal = false,
    } = this.props

    const modalClassName = classname(
      'Modal',
      className,
      {
        open: open,
        small: small,
        large: large,
        minimal: minimal,
      })

    const style = {
      width:  size(width),
      height: size(height),
    }

    return createPortal(
      <div id={this.id} className={modalClassName} ref={this.onRef} tabIndex='-1' onKeyDown={this.onKeyDown}>
        <div className='Modal__background' onClick={this.onClickBackground} />
        <div className='Modal__scrollArea' onClick={this.onClickBackground}>
          <div className='Modal__container vbox' style={style} onClick={ev => ev.stopPropagation()}>

            {
              showHeader &&
                <div className='Modal__header hbox'>
                  <div className='Modal__title title fill hbox'>
                    { title }
                  </div>
                  {
                    showClose &&
                      <Button
                        className='Modal__close'
                        round
                        flat
                        icon='close'
                        onClick={this.props.onClose}
                      />
                  }
                </div>
            }

            { this.props.children }

          </div>
        </div>
      </div>
      , this.domNode)
  }
}

const defaultExport = pure(Modal)
export default defaultExport

defaultExport.Title = function Title({ children, ...rest }) {
  return (
    <div className='Modal__title' { ...rest }>
      { children }
    </div>
  )
}

defaultExport.Content = function Content({ children }) {
  return (
    <div className='Modal__content'>
      { children }
    </div>
  )
}

defaultExport.Actions = function Actions({ children }) {
  return (
    <div className='Modal__actions'>
      { children }
    </div>
  )
}

