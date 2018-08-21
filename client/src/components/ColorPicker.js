import React from 'react'
import Prop from 'prop-types'
import { createPortal, findDOMNode } from 'react-dom'
import pure from 'recompose/pure'
import classname from 'classname'

import COLORS from '../constants/colors'
import size from '../utils/size'
import Button from './Button'
import Icon from './Icon'
import Tooltip from './Tooltip'
import Text from './Text'

const colorPickers = []

document.addEventListener('click', ev => {
  colorPickers.forEach(d => d.onDocumentClick(ev))
})


class ColorPicker extends React.Component {
  static propTypes = {
    onChange: Prop.func.isRequired,
    position: Prop.string,
    open: Prop.bool,
    mountNode: Prop.instanceOf(Element),
  }

  static defaultProps = {
    position: 'bottom left',
  }

  constructor(props) {
    super(props)

    this.state = {
      open: false,
      position: {
        top: 0,
        left: 0
      },
    }
  }

  componentWillMount() {
    this.mountNode = this.props.mountNode || document.body
    this.domNode = document.createElement('div')
    this.mountNode.appendChild(this.domNode)
  }

  componentDidMount() {
    colorPickers.push(this)
  }

  componentWillUnmount() {
    colorPickers.splice(colorPickers.findIndex(x => x === this), 1)
    this.mountNode.removeChild(this.domNode)
  }

  componentDidUpdate() {
    const position = this.getPosition()

    if (position.left !== this.state.position.left
      || position.top !== this.state.position.top) {
      this.setState({ position })
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
        top:  element.top + element.height,
        left: element.left - inner.width + element.width,
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

    return style
  }

  close = (ev) => {
    const isControlled = 'open' in this.props

    if (isControlled)
      this.props.onClose && this.props.onClose(ev)
    else
      this.setState({ open: false })
  }

  toggle = () => {
    const open = !this.state.open
    this.setState({ open })

    if (open && this.props.onOpen)
      this.props.onOpen()
  }

  getColorStyle(color) {
    return {
      backgroundColor: color,
    }
  }

  change(color) {
    const isControlled = 'open' in this.props
    this.props.onChange(color)
    if (isControlled)
      this.props.onClose()
    else
      this.close()
  }

  render() {
    const {
      className,
      position,
      value,
      loading,
      closeOnClick = true,
    } = this.props

    const isControlled = 'open' in this.props
    const open = isControlled ? this.props.open : this.state.open

    const colorPickerClassName = classname(
      'ColorPicker',
      'label',
      className,
      {
        'open': open,
      })

    const menuClassName = classname(
      'ColorPicker__menu',
      className,
      position,
      {
        'open': open,
      })

    return [
        <button
          className={colorPickerClassName}
          onClick={isControlled ? undefined : this.toggle}
          ref={this.onRef}
        >
          <span className='ColorPicker__color' style={{ backgroundColor: value }}/>{' '}
          { value }
        </button>,

        createPortal(
          <div className={menuClassName}
              style={this.state.position}
              ref={ref => ref && (this.menu = findDOMNode(ref))}
          >
            <div
              className='ColorPicker__inner'
              ref={ref => ref && (this.inner = findDOMNode(ref))}
            >
              {
                groupByNumber(COLORS, 4).map(colors =>
                  <div>
                    {
                      colors.map(color =>
                        <Button
                          flat
                          square
                          className='fill center'
                          onClick={() => this.change(color)}
                        >
                          <span className='ColorPicker__color' style={{ backgroundColor: color }}/>
                        </Button>
                      )
                    }
                  </div>
                )
              }
            </div>
          </div>
          , this.domNode)
    ]
  }
}

function groupByNumber(list, n) {
  const groups = []
  let currentGroup = []
  list.forEach(e => {
    currentGroup.push(e)
    if (currentGroup.length === n) {
      groups.push(currentGroup)
      currentGroup = []
    }
  })
  if (currentGroup.length > 0)
    groups.push(currentGroup)
  return groups
}

export default pure(ColorPicker)
