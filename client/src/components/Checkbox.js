import React from 'react'
import pure from 'recompose/pure'
import classname from 'classname'

class Checkbox extends React.Component {

  onChange = (ev) => {
    this.props.onChange && this.props.onChange(ev.target.checked, ev)
  }

  render() {
    const {
      children,
      className,
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

    const labelClassName = classname(
      'input-label',
      className,
      {
        'small': small,
        'large': large,
        'text-info': info,
        'text-success': success,
        'text-warning': warning,
        'text-error': error,
        'text-muted': muted,
        'text-subtle': subtle,
        'text-highlight': highlight,
      }
    )

    return (
      <label className={labelClassName}>
        <input type='checkbox' className='Checkbox' { ...rest } onChange={this.onChange} /> { children }
      </label>
    )
  }
}

export default pure(Checkbox)
