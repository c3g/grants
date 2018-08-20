import React from 'react'
import Prop from 'prop-types'
import pure from 'recompose/pure'
import {
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfDay,
  addDays,
  addYears,
  addMonths,
  format,
  differenceInCalendarDays
} from 'date-fns'
import Color from 'color'
import { over, lensPath, set } from 'ramda'

import Status from '../constants/status'
import Global from '../actions/global'
import UI from '../actions/ui'
import Grant from '../actions/grants'
import Funding from '../actions/fundings'
import Category from '../actions/categories'

import {formatISO} from '../utils/time'
import filterTags from '../utils/filter-tags'
import uniq from '../utils/uniq'
import { getNewGrant, getNewFunding } from '../models'
import Button from './Button'
import Checkbox from './Checkbox'
import Dropdown from './Dropdown'
import EditableLabel from './EditableLabel'
import FilterCategoriesDropdown from './FilterCategoriesDropdown'
import Gap from './Gap'
import Input from './Input'
import Label from './Label'
import Spinner from './Spinner'
import StatusIcon from './StatusIcon'
import Title from './Title'


const formatAmount = n => `$ ${Number(n).toLocaleString()}`
const parseAmount = s => parseInt(s.replace(/,/g, ''))




class GrantEditor extends React.Component {
  static propTypes = {
    grant: Prop.object.isRequired,
    categories: Prop.object.isRequired,
    onDone: Prop.func.isRequired,
    onCancel: Prop.func.isRequired,
  }

  static getDerivedStateFromProps(props, state) {
    debugger
    return null
  }

  constructor(props) {
    super(props)

    this.state = {
      fieldName: '',
      fieldAmount: '',
      grant: props.grant,
    }
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(props, state) {
    if (props.grant !== this.props.grant)
      this.setState({ grant: props.grant })
  }

  getGrantColor(grant) {
    if (this.props.categories.isLoading || !grant.data.categoryID)
      return '#f7f7f7'
    return this.props.categories.data[grant.data.categoryID].data.color
  }

  onChangeStart = start => {
    const date = new Date(start)
    if (Number.isNaN(date.getTime()))
      return
    this.setState({ grant: set(lensPath(['data', 'start']), date.toISOString(), this.state.grant) })
  }

  onChangeEnd = end => {
    const date = new Date(end)
    if (Number.isNaN(date.getTime()))
      return
    this.setState({ grant: set(lensPath(['data', 'end']), date.toISOString(), this.state.grant) })
  }

  onChangeFieldName = fieldName => {
    this.setState({ fieldName })
  }

  onChangeFieldAmount = fieldAmount => {
    this.setState({ fieldAmount })
  }

  onChangeStatus = status => {
    this.setState({ grant: set(lensPath(['data', 'status']), status, this.state.grant) })
  }

  onChangeCategory = category => {
    this.setState({ grant: set(lensPath(['data', 'categoryID']), category.data.id, this.state.grant) })
  }

  onAddField = (index) => {
    const {fieldName, fieldAmount} = this.state
    if (!fieldName || !fieldAmount)
      return
    this.setState({
      fieldName: '',
      fieldAmount: '',
      grant: over(
        lensPath(['data', 'fields']),
        fields => fields.concat({ name: fieldName, amount: Number(fieldAmount) }),
        this.state.grant
      )
    })
  }

  onDeleteField = (index) => {
    this.setState({
      grant: over(lensPath(['data', 'fields']), fields => fields.filter((_, i) => i !== index), this.state.grant)
    })
  }

  onDone = () => {
    this.props.onDone(this.state.grant)
  }

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    const {fieldName, fieldAmount, grant} = this.state

    const category = this.props.categories.data[grant.data.categoryID]
    const color = this.getGrantColor(grant)

    return (
      <div className='GrantEditor vbox' style={{ borderColor: color }}>
        <div className='GrantEditor__name'>
          <EditableLabel
            className='fill-width'
            value={grant.data.name}
          />
        </div>
        <table className='GrantEditor__table'>
        <tbody>
          <tr>
            <td><Label>Category:</Label></td>
            <td>
              <Dropdown
                className='full-width'
                label={
                  <span className={!category ? 'text-muted' : ''}>
                    {category ? category.data.name : 'Empty'}
                  </span>
                }
              >
                {
                  Object.values(this.props.categories.data).map(category =>
                    <Dropdown.Item onClick={() => this.onChangeCategory(category)}>
                       <span
                         className='color'
                         style={{ backgroundColor: category.data.color }}
                       /> { category.data.name }
                    </Dropdown.Item>
                  )
                }
              </Dropdown>
            </td>
          </tr>
          <tr>
            <td><Label>Status:</Label></td>
            <td>
              <Dropdown
                className='full-width'
                label={<span>{grant.data.status}</span>}
              >
                {
                  Object.values(Status).map(status =>
                    <Dropdown.Item onClick={() => this.onChangeStatus(status)}>
                      { status }
                    </Dropdown.Item>
                  )
                }
              </Dropdown>
            </td>
          </tr>
          <tr>
            <td><Label>Start:</Label></td>
            <td>
              <EditableLabel
                className='fill-width'
                value={formatISO(grant.data.start)}
                onEnter={this.onChangeStart}
              />
            </td>
          </tr>
          <tr>
            <td><Label>End:</Label></td>
            <td>
              <EditableLabel
                className='fill-width'
                value={formatISO(grant.data.end)}
                onEnter={this.onChangeEnd}
              />
            </td>
          </tr>
          <tr>
            <td><Label>Total:</Label></td>
            <td>
              <EditableLabel
                className='fill-width'
                value={''+grant.data.total}
                onEnter={this.onChangeTotal}
              />
            </td>
          </tr>
          <tr>
            <td><Label>Co-funding:</Label></td>
            <td>
              <EditableLabel
                className='fill-width'
                value={''+grant.data.cofunding}
                onEnter={this.onChangeCofunding}
              />
            </td>
          </tr>
        </tbody>
        </table>
        <br/>
        <table className='GrantEditor__fields'>
        <thead>
          <tr>
            <th colSpan='3'>
              Fields:
            </th>
          </tr>
        </thead>
        <tbody>
          {
            grant.data.fields.map((field, i) =>
              <tr>
                <td>
                  <EditableLabel
                    className='fill-width'
                    value={field.name}
                  />
                </td>
                <td>
                  <EditableLabel
                    className='fill-width'
                    value={field.amount}
                  />
                </td>
                <td>
                  <Button
                    flat
                    square
                    small
                    icon='close'
                    onClick={() => this.onDeleteField(i)}
                  />
                </td>
              </tr>
            )
          }
          <tr>
            <td>
              <Input
                placeholder='Name'
                value={fieldName}
                onChange={this.onChangeFieldName}
                onEnter={this.onAddField}
              />
            </td>
            <td>
              <Input
                placeholder='Amount'
                value={fieldAmount}
                onChange={this.onChangeFieldAmount}
                onEnter={this.onAddField}
              />
            </td>
            <td>
              <Button
                flat
                square
                small
                icon='plus'
                onClick={this.onAddField}
              />
            </td>
          </tr>
        </tbody>
        </table>

        <div className='fill' />

        <div className='row'>
          <div className='fill' />
          <Button onClick={this.onCancel}>
            Cancel
          </Button>
          <Button success onClick={this.onDone}>
            Done
          </Button>
        </div>

      </div>
    )
  }
}

export default pure(GrantEditor)
