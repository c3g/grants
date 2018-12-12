import React from 'react'
import Prop from 'prop-types'
import { createPortal, findDOMNode } from 'react-dom'
import pure from 'recompose/pure'
import classname from 'classname'
import objectEquals from 'object-equals'
import Color from 'color'

import isColor from '../helpers/is-color'
import COLORS from '../constants/colors'
import size from '../helpers/size'
import Button from './Button'
import Icon from './Icon'
import Input from './Input'
import Tooltip from './Tooltip'
import Text from './Text'

const TRACK_BACKGROUND = (() => {
  const n = 10
  const hueStep = 360 / n
  const steps = Array(n).fill(0).map((_, i) => Color.hsl(i * hueStep, 80, 60).hex())
  return `linear-gradient(to left, ${steps.join(', ')})`
})()

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
      value: props.value || '',
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

    if (!objectEquals(position, this.state.position)) {
      this.setState({ position })
    }
  }

  componentWillReceiveProps(props, state) {
    if (props.value !== this.props.value)
      this.setState({ value: props.value })
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

    const gap = 5
    const colorSize = 4
    const element = this.element.getBoundingClientRect()
    const inner   = this.inner.getBoundingClientRect()

    let menu
    let arrow

    if (this.props.position === 'bottom left') {
      menu = {
        top:  element.top + element.height + gap,
        left: element.left - inner.width + element.width,
      }
      arrow = {
        top:  -8,
        left: element.left - inner.left + colorSize,
      }
    }
    else if (this.props.position === 'right') {
      menu = {
        top:  element.top,
        left: element.right,
      }
      arrow = {
        top: element.top,
        left: element.left,
      }
    }
    else {
      menu = {
        top:  element.top + element.height,
        left: element.left,
      }
      arrow = {
        top: element.top,
        left: element.left,
      }
    }

    return { menu, arrow }
  }

  open = (ev) => {
    this.setState({ open: true })
  }

  close = (ev) => {
    this.setState({ open: false })
  }

  toggle = () => {
    const open = !this.state.open
    this.setState({ open })
  }

  change(color) {
    this.props.onChange(color)
    this.close()
  }

  onChangeInput = (value) => {
    this.setState({ value })
  }

  onBlurInput = (event) => {
    if (this.state.value !== this.props.value)
      this.props.onChange(this.state.value)
  }

  onAcceptInput = (event) => {
    this.change(this.state.value)
  }

  onClickColor = (event) => {
    this.input.focus()
    this.input.select()
  }

  render() {
    const {
      className,
      position,
      loading,
    } = this.props
    const { value } = this.state

    const isControlled = 'open' in this.props
    const open = isControlled ? this.props.open : this.state.open

    const colorPickerClassName = classname(
      'ColorPicker',
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
        <span
          className={colorPickerClassName}
          ref={this.onRef}
        >
          <button
            className='ColorPicker__color ColorPicker__color--main'
            style={{ backgroundColor: isColor(value) ? value : 'transparent' }}
            onClick={this.onClickColor}
          />{' '}
          <Input
            className='ColorPicker__input'
            value={value}
            onFocus={this.open}
            onChange={this.onChangeInput}
            onBlur={this.onBlurInput}
            onEnter={this.onAcceptInput}
            ref={ref => ref && (this.input = ref)}
          />
        </span>,

        createPortal(
          <div className={menuClassName}
              style={this.state.position.menu}
              ref={ref => ref && (this.menu = findDOMNode(ref))}
          >
            <div
              className='ColorPicker__inner'
              ref={ref => ref && (this.inner = findDOMNode(ref))}
            >
              <div
                style={this.state.position.arrow}
                className='ColorPicker__arrow'
              />

              {
                groupByNumber(COLORS, 4).map((colors, i) =>
                  <div key={i}>
                    {
                      colors.map(color =>
                        <button
                          key={color}
                          className='ColorPicker__color ColorPicker__color--button'
                          style={{ backgroundColor: color }}
                          onClick={() => this.change(color)}
                        />
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
