import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import classname from 'classname'

import arrayEquals from '../helpers/array-equals'
import Button from './Button'
import Help from './Help'
import Icon from './Icon'
import Input from './Input'
import Spinner from './Spinner'

class EditableList extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    values: PropTypes.array.isRequired,
    help: PropTypes.string,
    control: PropTypes.element,
    render: PropTypes.func,
    emptyMessage: PropTypes.element,
    onAdd: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  }

  constructor() {
    super()
    this.state = {
      value: '',
    }
  }

  onChange = (ev) => {
    this.props.onChange && this.props.onChange(ev.target.value, ev)
  }

  onKeyDown = (ev) => {
    if (ev.code === 13 /* Enter */) {
      this.props.onEnter && this.props.onEnter(ev.target.value, ev)
    }
  }

  componentWillReceiveProps(props) {
    if (!arrayEquals(props.values, this.props.values))
      this.setState({ value: '' })
  }

  render() {
    const { values, loading, placeHolder, className } = this.props
    const { value } = this.state

    const control = this.props.control ||
      <Input
        placeHolder={placeHolder}
        loading={loading}
        disabled={loading}
        value={value}
        onChange={value => this.setState({ value })}
        onEnter={value => this.props.onAdd(value)}
      />

    const listClassName = classname('EditableList', className)

    return (
      <table className={listClassName}>
      <tbody>
        {
          values.map(value =>
            <tr key={value.id || value} className='EditableList__item'>
              <td className='EditableList__value'>{ this.props.render ? this.props.render(value) : value }</td>
              <td>
                {
                  value.isLoading ?
                    <Spinner /> :
                    <Button flat square icon='close' onClick={() => this.props.onDelete(value)}/>
                }
              </td>
            </tr>
          )
        }
        {
          values.length === 0 && this.props.emptyMessage &&
            <tr key={value} className='EditableList__item'>
              <td className='EditableList__value empty'>
                { this.props.emptyMessage }
              </td>
              <td>
              </td>
            </tr>
        }
        <tr className='EditableList__item'>
          <td className='EditableList__control' colSpan='2'>
            { control } { this.props.help && <Help>{ this.props.help }</Help> }
          </td>
        </tr>
      </tbody>
      </table>
    )
  }
}

export default EditableList
