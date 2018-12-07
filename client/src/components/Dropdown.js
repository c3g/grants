import React from 'react'
import Prop from 'prop-types'
import { createPortal, findDOMNode } from 'react-dom'
import pure from 'recompose/pure'
import classname from 'classname'

import Button from './Button'
import Icon from './Icon'
import Tooltip from './Tooltip'

const dropdowns = []

document.addEventListener('click', ev => {
  dropdowns.forEach(d => d.onDocumentClick(ev))
})



class Dropdown extends React.Component {
  static propTypes = {
    className: Prop.string,
    position: Prop.oneOf(['bottom left', 'right']),
    mountNode: Prop.node,
  }

  static defaultProps = {
    mountNode: document.body,
  }

  constructor(props) {
    super(props)
    this.state = {
      open: false,
      close: false,
      position: {
        top: 0,
        left: 0
      },
    }
  }

  componentWillMount() {
    this.mountNode = this.props.mountNode
    this.domNode = document.createElement('div')
    this.mountNode.appendChild(this.domNode)
  }

  componentDidMount() {
    dropdowns.push(this)
  }

  componentWillUnmount() {
    dropdowns.splice(dropdowns.findIndex(x => x === this), 1)
    this.mountNode.removeChild(this.domNode)
  }

  componentDidUpdate() {
    const position = this.getPosition()

    if (position.left !== this.state.position.left
      || position.top !== this.state.position.top)
      this.setState({ position })
  }

  componentWillReceiveProps(props) {
    if (this.props.open === true && props.open === false) {
      this.setState({ close: true })
      setTimeout(() => this.setState({ close: false }), 250)
    }
  }

  onDocumentClick(ev) {
    if (
         !this.element.contains(ev.target)
      && !this.menu.contains(ev.target)
      && (this.state.open || this.props.open)
    ) {
      this.close(ev)
    }
  }

  onRef = ref => {
    if (ref === null)
      return

    this.element = findDOMNode(ref)
  }

  getPosition() {
    if (!this.element)
      return { top: 0, left: 0 }

    const element = this.element.getBoundingClientRect()
    const inner   = this.inner.getBoundingClientRect()

    let style

    if (this.props.position === 'bottom left')
      style = {
        top:  element.top  + element.height,
        left: element.left - (inner.width - element.width),
      }
    else if (this.props.position === 'right')
      style = {
        top:  element.top,
        left: element.right,
      }
    else
      style = {
        top:  element.top + element.height,
        left: element.left,
      }

    style.left += this.props.offset ? (this.props.offset.left || 0) : 0
    style.top  += this.props.offset ? (this.props.offset.top || 0) : 0
    style.width = element.width

    return style
  }

  close = (ev) => {
    const isControlled = 'open' in this.props

    if (isControlled) {
      this.props.onClose && this.props.onClose(ev)
    } else {
      this.setState({ open: false, close: true })
      setTimeout(() => this.setState({ close: false }), 250)
    }
  }

  toggle = () => {
    const open = !this.state.open
    this.setState({ open, close: open === false })

    if (open && this.props.onOpen)
      this.props.onOpen()
  }

  render() {
    const {
      className,
      position,
      compact,
      value,
      loading,
      inline,
      trigger = <Button default iconAfter='chevron-down'>{ this.props.label }</Button>,
      closeOnClick = true,
    } = this.props

    const isControlled = 'open' in this.props
    const open = isControlled ? this.props.open : this.state.open
    const close = this.state.close

    const dropdownClassName = classname(
      'Dropdown',
      className,
      {
        'open': open,
        'with-icons': this.props.icons,
        'inline': inline,
      })

    const menuClassName = classname(
      'Dropdown__menu',
      className,
      position,
      {
        'open': open,
        'close': close,
        'compact': compact,
        'with-icons': this.props.icons,
      })

    const button =
      React.cloneElement(
        trigger,
        {
          ref: ref => {
            this.onRef(ref)
            if (trigger && typeof trigger.ref === 'function')
              trigger.ref(ref)
          },
          ...(isControlled ? { } : { onClick: this.toggle }),
        }
      )

    const children = recursiveMap(this.props.children, child => {
      return child === null || (child.type !== Item && child.type !== SegmentedItem) ?
        child :
        React.cloneElement(
          child,
          { onClick: (ev) => {
              child.props.onClick && child.props.onClick(ev)
              if ((ev.target.className.includes('segment')
                  || ev.target.className.includes('item'))
                && closeOnClick
              ) {
                this.close(ev)
              }
            }
          }
        )
    })

    return (
      <div className={dropdownClassName}>
        { button }
        {
          createPortal(
            <div className={menuClassName}
                style={this.state.position}
                ref={ref => ref && (this.menu = findDOMNode(ref))}
            >
              <div
                className='Dropdown__inner'
                style={{ width: this.state.position.width }}
                ref={ref => ref && (this.inner = findDOMNode(ref))}
              >
                { children }
              </div>
            </div>
            , this.domNode)
        }
      </div>
    )
  }
}

function Item({ icon, disabled, className, children, ...rest }) {
  return (
    <button className={classname('item', className, { disabled })} disabled={disabled} { ...rest }>
      { icon && <Icon name={icon} className='menu' /> }
      { children }
    </button>
  )
}

function SegmentedItem({ icon, children, className, ...rest }) {
  return (
    <div className={classname('item segmented hbox', className)} { ...rest }>
      { children }
    </div>
  )
}

function SegmentMain({ icon, className, children, disabled, ...rest }) {
  return (
    <button className={classname('main-button segment fill', className, { disabled })} disabled={disabled} {...rest}>
      { icon && <Icon name={icon} className='menu' /> }
      { children }
    </button>
  )
}

function Segment({ icon, className, children, center, tooltip, disabled, ...rest }) {
  const segment = (
    <button className={classname('segment', className, { 'text-center': center, disabled })} disabled={disabled} { ...rest }>
      { icon && <Icon name={icon} className='menu' /> }
      { children }
    </button>
  )

  if (!tooltip)
    return segment

  return (
    <Tooltip content={tooltip}>
      { segment }
    </Tooltip>
  )
}

function Content({ icon, className, text, children, ...rest }) {
  const contentClassName = classname(
    'content',
    className,
    {
      'text-overflow': text || typeof children === 'string',
    }
  )
  return (
    <div className={contentClassName} { ...rest }>
      { icon && <Icon name={icon} className='menu' /> }
      { children }
    </div>
  )
}

function Group({ className, children }) {
  return (
    <div className={classname('group', className)}>
      { children }
    </div>
  )
}

function Separator() {
  return (
    <div className='separator' />
  )
}

function recursiveMap(children, fn) {
  return React.Children.map(children, child => {
    if (!React.isValidElement(child)) {
      return child;
    }

    if (child.props.children) {
      child = React.cloneElement(child, {
        children: recursiveMap(child.props.children, fn)
      });
    }

    return fn(child);
  });
}


const defaultExport = pure(Dropdown)
export default defaultExport

defaultExport.Item          = Item
defaultExport.SegmentedItem = SegmentedItem
defaultExport.SegmentMain   = SegmentMain
defaultExport.Segment       = Segment
defaultExport.Content       = Content
defaultExport.Group         = Group
defaultExport.Separator     = Separator
