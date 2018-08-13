import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

import Icon from './Icon'
import Label from './Label'

class EditableText extends React.Component {
  constructor() {
    super()
    this.state = {
      editing: false,
    }
  }

  onChange = (ev) => {
    this.props.onChange && this.props.onChange(ev.target.value, ev)
  }

  onKeyDown = (ev) => {
    if (ev.ctrlKey && ev.which === 13 /* Enter */) {
      ev.preventDefault()
      this.accept(ev)
    }
    if (ev.which === 27 /* Escape */) {
      ev.preventDefault()
      ev.stopPropagation()
      this.setNotEditing()
    }
  }

  accept = (ev) => {
    if (ev.target.value !== this.props.value)
      this.props.onEnter && this.props.onEnter(ev.target.value, ev)
    this.setNotEditing()
  }

  setNotEditing = () => {
    this.setState({ editing: false })
  }

  setEditing = () => {
    this.setState({ editing: true })
  }

  render() {
    const {
      value,
      className,
      children,
      placeHolder,
      onEnter,
      inline,
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

    const textClassName = classname(
      'text editable',
      size,
      className,
      {
        'small': small,
        'large': large,
        'inline': inline,
        'text-info': info,
        'text-success': success,
        'text-warning': warning,
        'text-error': error,
        'text-muted': muted,
        'text-subtle': subtle,
        'text-highlight': highlight,
      }
    )

    if (editing) {
      return (
        <textarea type='text'
          className={textClassName}
          { ...rest }
          defaultValue={value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onBlur={this.accept}
          ref={ref => ref ? ref.select() : undefined}
        />
      )
    }

    return (
      <div className={textClassName}
          { ...rest }
          onClick={this.setEditing}
        >
        <Icon name='pencil' className='EditableText__icon' />
        <div>{ value || <Label muted>{ placeHolder || 'Empty' }</Label> }</div>
      </div>
    )
  }
}

export default EditableText
