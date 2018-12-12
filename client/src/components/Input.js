import React from 'react'
import Prop from 'prop-types'
import classname from 'classname'
import { equals } from 'ramda'

import Button from './Button'
import Icon from './Icon'

class Input extends React.Component {
  static propTypes = {
    status: Prop.oneOf(['info', 'warning', 'error', 'success']),
    validate: Prop.func,
  }

  state = {
    value: '',
  }

  shouldComponentUpdate(nextProps) {
    return !equals(this.props, nextProps)
  }

  accept(ev) {
    this.props.onEnter && this.props.onEnter(ev.target.value, ev)
    if (this.props.clearOnEnter)
      ev.target.value = ''
  }

  isControlled() {
    return this.props.value !== undefined
  }

  getValue() {
    if (this.isControlled())
      return this.props.value
    return this.state.value
  }

  change(value) {
    if (this.props.onChange)
      this.props.onChange(value)
    if (!this.isControlled()) {
      this.setState({ value })
      this.forceUpdate()
    }
  }

  onChange = (ev) => {
    this.change(ev.target.value)
  }

  onKeyDown = (ev) => {
    if (ev.which === 13 /* Enter */) {
      if (this.props.validate && !this.props.validate(this.getValue()))
        return
      this.accept(ev)
    }
    if (ev.which === 32 /* Space */) {
      if (this.props.acceptOnSpace)
        this.accept(ev)
      else if (this.props.onSpace)
        this.props.onSpace(ev.target.value, ev)
    }
  }

  onFocus = (ev) => {
    if (this.props.autoSelect)
      ev.target.select()
    if (this.props.onFocus)
      this.props.onFocus(ev)
  }

  onBlur = (ev) => {
    if (this.props.clearOnBlur)
      ev.target.value = ''
    if (this.props.onBlur)
      this.props.onBlur(ev)
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      className,
      icon,
      small,
      large,
      value,
      loading,
      status,
      autoSelect,
      showClearButton,
      clearOnEnter,
      clearOnBlur,
      onEnter,
      validate,
      disabled,
      forwardedRef,
      ...rest
    } = this.props
    /* eslint-enable no-unused-vars */

    const actualValue = this.getValue()

    const actualStatus = status || ((validate && actualValue) ?
      (validate(actualValue) ? 'success' : 'error') :
      undefined)

    const inputClassName = classname(
      'Input',
      className,
      actualStatus,
      {
        small,
        large,
        'has-icon': icon !== undefined,
        disabled,
      }
    )

    return (
      <div className={inputClassName}>
        { icon && <Icon name={icon} className='Input__icon' /> }
        <input type='text'
          { ...rest }
          className='Input__element'
          value={actualValue}
          disabled={disabled}
          onChange={this.onChange}
          onKeyDown={this.props.onKeyDown || this.onKeyDown}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          ref={forwardedRef}
        />
        { loading && <span className='loading-spinner-tiny'/> }
        { showClearButton && actualValue &&
          <Button
            iconButton
            className='Input__clearButton'
            icon='times-circle'
            onClick={() => this.change('')}
          />
        }
      </div>
    )
  }
}


function forwardRef(props, ref) {
  return <Input {...props} forwardedRef={ref} />
}
forwardRef.displayName = 'Input'

export default React.forwardRef(forwardRef)
