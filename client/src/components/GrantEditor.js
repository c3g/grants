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
import { over, lensPath, set } from 'ramda'
import cx from 'classname'

import Status from '../constants/status'
import Applicant from '../actions/applicants'

import {formatISO} from '../helpers/time'
import Button from './Button'
import Dropdown from './Dropdown'
import EditableLabel from './EditableLabel'
import FilteringDropdown from './FilteringDropdown'
import Input from './Input'
import Label from './Label'
import Modal from './Modal'
import Text from './Text'
import Title from './Title'


const formatAmount = n => `${Number(n).toLocaleString()}`
const parseAmount = s => typeof s === 'number' ? s : parseInt(s.replace(/,/g, ''), 10)



const EMPTY_GRANT = {
  data: {
    applicants: [],
    fields: [],
  },
}


class GrantEditor extends React.Component {
  static propTypes = {
    open: Prop.bool.isRequired,
    grant: Prop.object.isRequired,
    categories: Prop.object.isRequired,
    applicants: Prop.object.isRequired,
    onDone: Prop.func.isRequired,
    onCancel: Prop.func.isRequired,
  }

  constructor(props) {
    super(props)

    const grant = this.getGrant(props)

    this.state = {
      errorMessage: undefined,
      fieldName: '',
      fieldAmount: '',
      grant: grant,
      start: formatISO(grant.data.start),
      end: formatISO(grant.data.end),
    }
  }

  componentWillReceiveProps(props, state) {
    if (props.grant && props.grant !== this.props.grant)
      this.setState({
        grant: props.grant,
        start: formatISO(props.grant.data.start),
        end: formatISO(props.grant.data.end)
      })
  }

  getGrant(props = this.props) {
    const grant = props.open ? this.props.grant : EMPTY_GRANT
    return grant
  }

  getGrantColor(grant) {
    const category = this.props.categories.data[grant.data.categoryID]
    if (!category)
      return '#f7f7f7'
    return category.data.color
  }

  validate() {
    const start = new Date(this.state.start)
    const end = new Date(this.state.end)

    if (+start === +end) {
      this.setState({ errorMessage: 'Start date must be different than end date'})
      return false
    }

    if (start > end) {
      this.setState({ errorMessage: 'Start date must be before end date'})
      return false
    }

    this.setState({ errorMessage: undefined })

    return true
  }

  onChangeName = name => {
    this.setState({ grant: set(lensPath(['data', 'name']), name, this.state.grant) })
  }

  onChangeStart = start => {
    this.setState({ start })
  }

  onBlurStart = () => {
    const date = new Date(this.state.start)
    if (Number.isNaN(date.getTime()))
      return
    this.setState({ grant: set(lensPath(['data', 'start']), date.toISOString(), this.state.grant) })
  }

  onChangeEnd = end => {
    this.setState({ end })
  }

  onBlurEnd = () => {
    const date = new Date(this.state.end)
    if (Number.isNaN(date.getTime()))
      return
    this.setState({ grant: set(lensPath(['data', 'end']), date.toISOString(), this.state.grant) })
  }

  onChangeNewFieldName = fieldName => {
    this.setState({ fieldName })
  }

  onChangeNewFieldAmount = fieldAmount => {
    this.setState({ fieldAmount })
  }

  onChangeStatus = status => {
    this.setState({ grant: set(lensPath(['data', 'status']), status, this.state.grant) })
  }

  onChangeCategory = category => {
    this.setState({ grant: set(lensPath(['data', 'categoryID']), category.data.id, this.state.grant) })
  }

  onChangeTotal = total => {
    this.setState({ grant: set(lensPath(['data', 'total']), total, this.state.grant) })
  }

  onChangeCofunding = cofunding => {
    this.setState({ grant: set(lensPath(['data', 'cofunding']), cofunding, this.state.grant) })
  }

  onBlurTotal = () => {
    this.setState({ grant: over(lensPath(['data', 'total']), parseAmount, this.state.grant) })
  }

  onBlurCofunding = () => {
    this.setState({ grant: over(lensPath(['data', 'cofunding']), parseAmount, this.state.grant) })
  }

  onAddField = () => {
    const {fieldName, fieldAmount} = this.state
    if (!fieldName || !fieldAmount)
      return

    const amount = parseAmount(fieldAmount)

    if (Number.isNaN(amount)) {
      this.setState({ errorMessage: 'Invalid amount' })
      return
    }

    this.setState({
      fieldName: '',
      fieldAmount: '',
      errorMessage: '',
      grant: over(
        lensPath(['data', 'fields']),
        fields => fields.concat({ name: fieldName, amount: amount }),
        this.state.grant
      )
    })

    this.name.focus()
  }

  onDeleteField = (index) => {
    this.setState({
      grant: over(lensPath(['data', 'fields']), fields => fields.filter((_, i) => i !== index), this.state.grant)
    })
  }

  onChangeFieldName = (index, name) => {
    this.setState({
      grant: set(lensPath(['data', 'fields', index, 'name']), name, this.state.grant)
    })
  }

  onChangeFieldAmount = (index, string) => {
    const amount = parseAmount(string)
    if (Number.isNaN(amount))
      return
    this.setState({
      grant: set(lensPath(['data', 'fields', index, 'amount']), amount, this.state.grant)
    })
  }

  onChangeApplicants = (applicants) => {
    this.setState({
      grant: set(lensPath(['data', 'applicants']), applicants, this.state.grant)
    })
  }

  onSelectApplicant = (applicantID) => {
    this.setState({
      grant: over(
        lensPath(['data', 'applicants']),
        applicants => applicants.concat(applicantID),
        this.state.grant
      )
    })
  }

  onDeselectApplicant = (applicantID) => {
    this.setState({
      grant: over(
        lensPath(['data', 'applicants']),
        applicants => applicants.filter(id => id !== applicantID),
        this.state.grant
      )
    })
  }

  onDone = () => {
    const {fieldName, fieldAmount} = this.state
    let {grant} = this.state

    if (fieldName && fieldAmount) {
      const amount = parseAmount(fieldAmount)

      if (Number.isNaN(amount)) {
        this.setState({ errorMessage: 'Invalid amount' })
        return
      }

      grant = over(
        lensPath(['data', 'fields']),
        fields => fields.concat({ name: fieldName, amount: amount }),
        grant
      )

      this.setState({
        fieldName: '',
        fieldAmount: '',
        grant: grant,
      })
    }

    if (!this.validate())
      return

    this.props.onDone(grant)
  }

  onCancel = () => {
    this.props.onCancel()
  }

  onCreateApplicant = name => {
    Applicant.create({ name })
    .then(applicant => {
      this.onSelectApplicant(applicant.id)
    })
  }

  render() {
    const {open} = this.props
    const {errorMessage, fieldName, fieldAmount} = this.state
    const grant = this.state.grant ? this.state.grant : EMPTY_GRANT

    const category = this.props.categories.data[grant.data.categoryID]
    const color = this.getGrantColor(grant)

    return (
      <Modal
        className='GrantEditor vbox'
        showHeader={false}
        open={open}
        onClose={this.onCancel}
      >

        <div className='GrantEditor__top' style={{ backgroundColor: color }}>
          <Title className='GrantEditor__title'>{ grant.data.name }&nbsp;</Title>
        </div>
        <div className='GrantEditor__inner vbox'>
          <table className='GrantEditor__table'>
          <tbody>
            <tr>
              <td><Label>Title:</Label></td>
              <td>
                <Input
                  className='fill-width'
                  value={grant.data.name}
                  onChange={this.onChangeName}
                />
              </td>
            </tr>
            <tr>
              <td><Label>Funding source:</Label></td>
              <td>
                <Dropdown
                  className='full-width input-like'
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
                  className='full-width input-like'
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
                <Input
                  className='fill-width'
                  value={this.state.start}
                  onChange={this.onChangeStart}
                  onBlur={this.onBlurStart}
                />
              </td>
            </tr>
            <tr>
              <td><Label>End:</Label></td>
              <td>
                <Input
                  className='fill-width'
                  value={this.state.end}
                  onChange={this.onChangeEnd}
                  onBlur={this.onBlurEnd}
                />
              </td>
            </tr>
            <tr>
              <td><Label>Total:</Label></td>
              <td>
                <Input
                  className='fill-width'
                  value={typeof grant.data.total === 'number' ? formatAmount(grant.data.total) : grant.data.total}
                  onChange={this.onChangeTotal}
                  onBlur={this.onBlurTotal}
                />
              </td>
            </tr>
            <tr>
              <td><Label>Co-funding:</Label></td>
              <td>
                <Input
                  className='fill-width'
                  value={typeof grant.data.cofunding === 'number' ? formatAmount(grant.data.cofunding) : grant.data.cofunding}
                  onChange={this.onChangeCofunding}
                  onBlur={this.onBlurCofunding}
                />
              </td>
            </tr>
            <tr>
              <td><Label>Applicants:</Label></td>
              <td>
                <FilteringDropdown
                  className='full-width input-like'
                  label={grant.data.applicants.map(id => this.props.applicants.data[id].data.name).join(', ')}
                  items={Object.values(this.props.applicants.data).map(a => a.data.id)}
                  selectedItems={grant.data.applicants}
                  getItemText={id => this.props.applicants.data[id].data.name}
                  setItems={this.onChangeApplicants}
                  selectItem={this.onSelectApplicant}
                  deselectItem={this.onDeselectApplicant}
                  onCreate={this.onCreateApplicant}
                />
              </td>
            </tr>
          </tbody>
          </table>

          <br/>

          <Title>Fields</Title>
          <table className='table GrantEditor__fields'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th/>
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
                      onEnter={name => this.onChangeFieldName(i, name)}
                    />
                  </td>
                  <td>
                    <EditableLabel
                      className='fill-width'
                      value={formatAmount(field.amount)}
                      onEnter={amount => this.onChangeFieldAmount(i, amount)}
                    />
                  </td>
                  <td>
                    <Button
                      flat
                      square
                      icon='close'
                      onClick={() => this.onDeleteField(i)}
                    />
                  </td>
                </tr>
              )
            }
            {
              grant.data.fields.length === 0 &&
                <tr className='empty'>
                  <td colSpan='3'>
                    <Text medium muted>
                      No fields
                    </Text>
                  </td>
                </tr>
            }
            <tr>
              <td className='input-cell'>
                <Input
                  placeholder='Name'
                  className='fill-width'
                  value={fieldName}
                  ref={ref => ref && (this.name = ref)}
                  onChange={this.onChangeNewFieldName}
                  onEnter={this.onAddField}
                />
              </td>
              <td className='input-cell'>
                <Input
                  placeholder='Amount'
                  className='fill-width'
                  value={fieldAmount}
                  onChange={this.onChangeNewFieldAmount}
                  onEnter={this.onAddField}
                />
              </td>
              <td>
                <Button
                  flat
                  square
                  icon='plus'
                  onClick={this.onAddField}
                />
              </td>
            </tr>
          </tbody>
          </table>

          <div className='fill' />

          {
            errorMessage &&
              <div className='row alert error'>
                {errorMessage}
              </div>
          }

          <div className='row no-padding'>
            <div className='fill' />
            <Button muted onClick={this.onCancel} disabled={grant.isLoading}>
              Cancel
            </Button>
            <Button className='default' onClick={this.onDone} loading={grant.isLoading}>
              Done
            </Button>
          </div>

        </div>
      </Modal>
    )
  }
}

export default pure(GrantEditor)
