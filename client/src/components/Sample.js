import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import classname from 'classname'
import { withRouter } from 'react-router'

import getStatus from '../utils/get-status'
import humanReadableTime from '../utils/human-readable-time'
import STATUS from '../constants/status'
import Badge from './Badge'
import Button from './Button'
import EditableLabel from './EditableLabel'
import Icon from './Icon'
import Input from './Input'
import Label from './Label'
import Spinner from './Spinner'
import Step from './Step'
import Tooltip from './Tooltip'

class Sample extends React.Component {
  constructor(props) {
    super()

    this.state = {
      data: props.sample.data || {}
    }
  }

  componentWillReceiveProps(props) {
    if (props.sample !== this.state.sample) {
      const { data } = props.sample
      this.setState({ data })
    }
  }

  onClick = (ev) => {
    // To avoid opening the modal while the user wants to select steps
    if (ev.ctrlKey === false)
      this.props.history.push(`/samples/${this.state.data.id}`)
  }

  update(data) {
    this.props.onChange(data.id, data)
    this.setState({ data })
  }

  updateStep(index, step) {
    const steps = [ ...this.state.data.steps ]
    steps[index]= step
    const data = { ...this.state.data, steps }
    this.update(data)
  }

  updateStepStatus(index, status) {
    this.props.onChangeStatus(this.state.data.id, index, status)
  }

  setName = (name) => {
    const data = { ...this.state.data, name }
    this.update(data)
  }

  setNotes = (notes) => {
    const data = { ...this.state.data, notes }
    this.update(data)
  }

  render() {
    const { isLoading } = this.props.sample
    const sample = this.state.data
    const status = getStatus(sample)
    const isOverdue = sample.steps.some(step => step.isOverdue)

    const className = classname('Sample', status, {
      'overdue': isOverdue,
    })

    return (
      <tr className={className} onClick={this.onClick}>
        <td className='Sample__icon'>
        {
          isLoading || (!isLoading && !isOverdue) ?
            <Spinner visible={isLoading} />
            :
            <Icon name='warning' warning marginRight={5} marginLeft={5} />
        }
        </td>
        <td className='Sample__name'>
          <EditableLabel small inline
            className='full-width'
            value={sample.name}
            onEnter={this.setName}
          />
        </td>
        <Tooltip content={sample.tags.join(', ')}>
        <td className='Sample__badges'>
          {
            sample.tags.map(tag =>
              <Badge tooltip={false} info>{tag}</Badge>
            )
          }
        </td>
        </Tooltip>
        <td className='Sample__steps'>
          <div>
          {
            sample.steps.map((step, index) =>
              <Step key={index}
                step={step}
                sampleId={sample.id}
                index={index}
                onChange={data => this.updateStep(index, data)}
                onChangeStatus={status => this.updateStepStatus(index, status)}
              />
            )
          }
          </div>
        </td>
        <td className='Sample__created'>
          <small>{ humanReadableTime(sample.created) }</small>
        </td>
        <td className='Sample__modified'>
          <small>{ humanReadableTime(sample.modified) }</small>
        </td>
        <td className='Sample__notes'>
          <Label small>
            { sample.notes }
          </Label>
        </td>
      </tr>
    )
  }
}

export default withRouter(pure(Sample))
