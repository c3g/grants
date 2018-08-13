import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import { set, lensPath } from 'ramda'
import { withRouter } from 'react-router'

import * as _ from '../constants/text'
import { getNewTemplateStep } from '../models'
import Button from './Button'
import Dropdown from './Dropdown'
import EditableLabel from './EditableLabel'
import Help from './Help'
import Icon from './Icon'
import Input from './Input'
import IntervalInput from './IntervalInput'
import Label from './Label'
import Spinner from './Spinner'
import Tooltip from './Tooltip'


class Template extends React.Component {
  static propTypes = {
    template: PropTypes.object.isRequired,
  }

  constructor(props) {
    super()

    this.focusLastStep = false
    this.didReceiveStep = false

    const { data } = props.template
    const { name, steps } = data

    this.state = {
      data: {
        ...data,
        name: name || '',
        steps: steps || [],
      },
    }
  }

  componentWillReceiveProps(props) {
    const { data } = props.template
    this.setState({ data })
    if (props.template.data.steps.length > this.props.template.data.steps.length)
      this.didReceiveStep = true
  }

  componentDidUpdate() {
    if (this.focusLastStep && this.didReceiveStep && this.lastStepInput) {
      this.focusLastStep = false
      this.didReceiveStep = false
      this.lastStepInput.setEditing()
    }
  }

  update(data) {
    this.setState({ data })
    this.props.onChange(data.id, data)
  }

  setName = name => {
    const data = { ...this.state.data, name }
    this.update(data)
  }

  setStepName = (i, name) => {
    const data = set(lensPath(['steps', i, 'name']), name,  this.state.data)
    this.update(data)
  }

  setStepCompletion = (i, completionFn) => {
    const data = set(lensPath(['steps', i, 'completionFn']), completionFn,  this.state.data)
    this.update(data)
  }

  setStepAlertDelay = (i, alertDelay) => {
    const data = set(lensPath(['steps', i, 'alertDelay']), alertDelay,  this.state.data)
    this.update(data)
  }

  addStep = () => {
    const data = { ...this.state.data, steps:
      this.state.data.steps.concat(getNewTemplateStep(this.props.settings.alertDelay))
    }
    this.focusLastStep = true
    this.update(data)
  }

  deleteStep = (index) => {
    const data = { ...this.state.data, steps:
      this.state.data.steps.filter((_, i) => i !== index)
    }
    this.update(data)
  }

  deleteTemplate = () => {
    this.props.onDelete(this.state.data.id)
  }

  setLastStepInput = ref => {
    if (ref)
      this.lastStepInput = ref
  }

  createNewFunction = () => {
    this.props.history.push('/completions/new')
  }

  editFunction = (id) => {
    this.props.history.push(`/completions/${id}`)
  }

  render() {
    const { template, completionFunctions, onChange, onCreate, onError } = this.props
    const { data: { name, steps } } = this.state

    const isLoading = template ? template.isLoading : false

    return (
      <div className='Template'>
        <div className='Template__info vcenter'>
          <EditableLabel
            className='fill'
            value={name}
            onEnter={this.setName}
          />
          {
            !isLoading &&
              <Button flat square icon='trash' className='delete' onClick={this.deleteTemplate} />
          }
          {
            isLoading &&
              <Spinner />
          }
        </div>
        <div className='Steps'>
          {
            steps.map((step, i) =>
              <div className='TemplateStep center' key={step.id}>
                <EditableLabel
                  value={step.name}
                  onEnter={value => this.setStepName(i, value)}
                  ref={this.setLastStepInput}
                >
                  { step.completionFn &&
                      <span className='text-info'> *</span>
                  }
                </EditableLabel>
                <Dropdown position='bottom left' trigger={<Button square center flat icon='ellipsis-v' />} icons>
                  <Dropdown.Item icon='trash' onClick={() => this.deleteStep(i)}>
                    Delete
                  </Dropdown.Item>
                  <Dropdown.Separator />
                  <Dropdown.Group>
                    Set alert delay <Help>{ _.INTERVAL_FORMAT }</Help>
                  </Dropdown.Group>
                  <Dropdown.Group>
                    <IntervalInput
                      defaultValue={step.alertDelay}
                      onAccept={alertDelay => this.setStepAlertDelay(i, alertDelay)}
                    />
                  </Dropdown.Group>
                  <Dropdown.Separator />
                  <Dropdown.Group>
                    Set completion function
                  </Dropdown.Group>
                  <Dropdown.Item
                    icon={ step.completionFn === null ? 'dot-circle-o' : 'circle-o'}
                    onClick={() => this.setStepCompletion(i, null)}
                  >
                    <em className='text-muted'>None</em>
                  </Dropdown.Item>
                  {
                    completionFunctions.map(completion =>
                      <Dropdown.SegmentedItem>
                        <Dropdown.SegmentMain
                          icon={ step.completionFn === completion.id ? 'dot-circle-o' : 'circle-o'}
                          onClick={() => this.setStepCompletion(i, completion.id)}>
                          { completion.name }
                        </Dropdown.SegmentMain>

                        <Dropdown.Segment tooltip='Edit' onClick={() => this.editFunction(completion.id)}>
                          <Icon name='pencil-square-o' />
                        </Dropdown.Segment>
                      </Dropdown.SegmentedItem>
                    )
                  }
                  <Dropdown.Item icon='plus' onClick={this.createNewFunction}>
                    Create new
                  </Dropdown.Item>
                </Dropdown>
              </div>
            )
          }
          <button className='TemplateStep add center activable' onClick={this.addStep}>
            <Icon name='plus' />
          </button>
        </div>
      </div>
    )
  }
}

export default withRouter(pure(Template))
