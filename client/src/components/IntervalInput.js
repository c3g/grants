import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

import * as Interval from '../helpers/postgres-interval'
import Input from './Input'

class IntervalInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.defaultValue || props.value || '',
    }
  }

  componentWillReceiveProps(props) {
    let value

    if (props.defaultValue !== this.props.defaultValue)
      value = props.defaultValue

    if (('value' in props) && !('defaultValue' in props))
      value = props.value

    this.setState({ value })

    if (this.lastAcceptedValue === undefined)
      this.lastAcceptedValue = value
  }

  onAccept = (ev) => {
    if (this.props.value) {
      if (this.props.value === this.lastAcceptedValue)
        return;
      if (Interval.isValid(this.props.value)) {
        this.props.onAccept && this.props.onAccept(this.props.value)
        this.lastAcceptedValue = this.props.value
      } else {
        this.props.onError && this.props.onError(this.props.value)
      }
    }
    else {
      if (this.state.value === this.lastAcceptedValue)
        return;
      if (Interval.isValid(this.state.value)) {
        this.props.onAccept && this.props.onAccept(this.state.value)
        this.lastAcceptedValue = this.state.value
      } else {
        this.props.onError && this.props.onError(this.state.value)
      }
    }
  }

  onChange = (value) => {
    this.setState({ value })
    this.props.onChange && this.props.onChange(value)
  }

  render() {
    const {
      className,
      value,
      defaultValue,
      onAccept,
      placeHolder,
      ...rest
    } = this.props

    const valueInProps = 'value' in this.props

    const inputClassName = classname('IntervalInput', className)

    let inputValue = value ? value : defaultValue ? defaultValue : this.state.value
    let hasError = !Interval.isValid(inputValue)

    if (valueInProps && this.props.value === undefined) {
      inputValue = ''
      hasError = false
    }

    return (
      <Input
        { ...rest }
        placeHolder={placeHolder || 'Interval...'}
        autoSelect
        className={inputClassName}
        value={inputValue}
        defaultValue={defaultValue}
        hasError={hasError}
        onChange={this.onChange}
        onEnter={this.onAccept}
        onBlur={this.onAccept}
      />
    )
  }
}



export default pure(IntervalInput)
