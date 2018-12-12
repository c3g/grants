import React from 'react'
import prop from 'prop-types'
import classname from 'classname'

import Icon from './Icon'

class EditableLabel extends React.Component {
  static propTypes = {
    value: prop.string.isRequired,
    onChange: prop.func,
    onEnter: prop.func,
  }

  constructor() {
    super()
    this.state = {
      editing: false,
    }
  }

  onChange = (ev) => {
    if (this.props.onChange)
      this.props.onChange(ev.target.value, ev)
  }

  onKeyDown = (ev) => {
    if (ev.which === 13 /* Enter */) {
      ev.preventDefault()
      this.accept(ev)
    }
    if (ev.which === 27 /* Escape */) {
      ev.preventDefault()
      this.setNotEditing()
    }
  }

  onRefInput = (ref) => {
    if (!ref)
      return

    this.input = ref
    this.input.select()
  }

  onRefButton = (ref) => {
    if (!ref)
      return

    this.button = ref

    if (this.shouldFocusButton) {
      this.shouldFocusButton = false
      this.button.focus()
    }
  }

  accept = (ev) => {
    if (ev.target.value !== this.props.value && this.props.onEnter)
      this.props.onEnter(ev.target.value, ev)
    this.setNotEditing()
    this.shouldFocusButton = true
  }

  setNotEditing = () => {
    this.setState({ editing: false })
  }

  setEditing = (ev) => {
    if (ev)
      ev.stopPropagation()
    this.setState({ editing: true })
  }

  render() {
    const {
      value,
      className,
      children,
      onEnter,
      inline,
      block,
      size,
      small,
      large,
      info,
      success,
      warning,
      error,
      muted,
      subtle,
      highlight,
      ...rest
    } = this.props
    const { editing } = this.state

    const labelClassName = classname(
      'label editable vcenter activable',
      size,
      className,
      {
        'small': small,
        'large': large,
        'inline': inline,
        'block': block,
        'text-info': info,
        'text-success': success,
        'text-warning': warning,
        'text-error': error,
        'text-muted': muted,
        'text-subtle': subtle,
        'text-highlight': highlight,
      }
    )

    const labelProps = {}

    if (editing) {
      return (
        <input type='text'
          className={labelClassName}
          { ...rest }
          defaultValue={value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onBlur={this.accept}
          ref={this.onRefInput}
        />
      )
    }

    return (
      <button className={labelClassName}
          { ...rest }
          onClick={this.setEditing}
          ref={this.onRefButton}
        >
        <span>{ value || <span>&nbsp;</span> }{ children }</span> <Icon name='pencil' />
      </button>
    )
  }
}

export default EditableLabel
