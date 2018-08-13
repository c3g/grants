import React from 'react'
import { findDOMNode, createPortal } from 'react-dom'
import classname from 'classname'
import { equals } from 'ramda'

import Button from './Button'
import Icon from './Icon'

const EMPTY_BOX = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
}

class Tooltip extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      visible: false,
      style: this.getStyle()
    }
  }

  componentWillMount() {
    this.mountNode = this.props.mountNode || document.body
    this.domNode = document.createElement('div')
    this.mountNode.appendChild(this.domNode)
  }

  componentWillUnmount() {
    this.mountNode.removeChild(this.domNode)
  }

  componentDidUpdate() {
    const style = this.getStyle()

    if (!equals(style, this.state.style))
      this.setState({ style })
  }

  onMouseOver = ev => {
    ev.stopPropagation()

    if (this.timeout)
      return;

    if (this.props.delay)
      this.timeout = setTimeout(() =>
        this.setState({ visible: true })
        , this.props.delay)
    else
      this.setState({ visible: true })
  }

  onMouseOut = ev => {
    ev.stopPropagation()

    if (this.timeout)
      this.timeout = clearTimeout(this.timeout)

    this.setState({ visible: false })
  }

  onRefTarget = ref => {
    if (ref === null) {
      if (this.target) {
        this.target.removeEventListener('mouseover', this.onMouseOver)
        this.target.removeEventListener('mouseout', this.onMouseOut)
      }
      return
    }
    this.target = findDOMNode(ref)
    this.target.addEventListener('mouseover', this.onMouseOver)
    this.target.addEventListener('mouseout', this.onMouseOut)
  }

  onRefElement = ref => {
    if (ref === null) {
      return
    }
    this.element = findDOMNode(ref)
  }

  getStyle() {
    if (!this.target)
      return { top: 0, left: 0 }

    const target  = this.target.getBoundingClientRect()
    const element = this.element ? this.element.getBoundingClientRect() : EMPTY_BOX

    const position = this.props.position || 'top'
    const height = this.props.height || element.height

    let style

    if (position === 'bottom')
      style = {
        top:  target.top + target.height,
        left: target.left,
      }
    else if (position === 'right')
      style = {
        top:  target.top,
        left: target.left + target.width,
      }
    else // default: if (position === 'top')
      style = {
        top:  target.top - height,
        left: target.left,
      }

    if (this.props.height)
      style.height = this.props.height

    if (this.props.minWidth === 'parent')
      style.minWidth = target.width
    else if (this.props.minWidth)
      style.minWidth = this.props.minWidth

    if (this.props.minHeight === 'parent')
      style.minHeight = target.height
    else if (this.props.minHeight)
      style.minHeight = this.props.minHeight

    return style
  }

  render() {
    const {
      className,
      value,
      loading,
      children,
      content,
      ...rest
    } = this.props

    const tooltipClassName = classname(
      'Tooltip',
      className,
      {
        visible: this.state.visible
      }
    )

    const child = children
    const childChildren = !child.props.children ?
        [] :
      Array.isArray(child.props.children) ?
        [...child.props.children] :
        [child.props.children]

    childChildren.push(
      createPortal(
        <div className={tooltipClassName} style={this.state.style} ref={this.onRefElement}>
          { content }
        </div>,
        this.domNode
      )
    )

    return React.cloneElement(child, {
      ref: ref => {
        this.onRefTarget(ref)
        child.ref && child.ref(ref)
      },
      onMouseOver: this.onMouseOver,
      onMouseOut: this.onMouseOut,
    }, childChildren)

  }
}

export default Tooltip
