import React from 'react'
import { findDOMNode } from 'react-dom'
import pure from 'recompose/pure'
import { set, lensPath } from 'ramda'
import { withRouter } from 'react-router'
import classname from 'classname'

import humanReadableTime from '../utils/human-readable-time'
import openFile from '../utils/open-file'
import uniq from '../utils/uniq'
import * as MimeType from '../utils/mime-type'
import Status from '../constants/status'
import Badge from './Badge'
import Button from './Button'
import Dropdown from './Dropdown'
import DropZone from 'react-drop-zone'
import EditableLabel from './EditableLabel'
import EditableList from './EditableList'
import EditableText from './EditableText'
import Gap from './Gap'
import Help from './Help'
import Icon from './Icon'
import Input from './Input'
import IntervalInput from './IntervalInput'
import Label from './Label'
import Link from './Link'
import Modal from './Modal'
import Sample from './Sample'
import Spinner from './Spinner'
import StatusIcon from './StatusIcon'
import Text from './Text'
import Time from './Time'
import Title from './Title'
import Tooltip from './Tooltip'

class SampleModal extends React.Component {
  constructor(props) {
    super(props)

    this.lastMouseOver = undefined
    this.canMouseOver = true

    this.modalWidth = 800
    this.stepWidth = this.modalWidth + 100

    this.state = this.getStateFromProps(props)
    this.state.badgeDropdownOpen = false
    this.state.confirmDeletion = false

    this.buttons = {}
  }

  componentWillReceiveProps(props) {
    this.setState(this.getStateFromProps(props))
  }

  getStateFromProps(props) {
    const state = this.state || {}
    let { id, stepIndex, sample, step } = state

    if (props.id !== state.id
    || props.stepIndex !== state.stepIndex) {
      id = props.id
      stepIndex = props.stepIndex
    }

    if (props.sample !== state.sample && props.sample !== undefined) {
      if (props.sample.isLoading) {
        sample = { isLoading: true, data: sample.data }
      } else {
        sample = props.sample
      }
    }

    if (props.id !== undefined) {

      if (stepIndex === undefined)
        stepIndex = 0

      // Sample might be undefined if we're loading the page
      if (sample !== undefined) {
        if (stepIndex > sample.data.steps.length - 1)
          stepIndex = sample.data.steps.length - 1

        step = sample.data.steps[stepIndex]
      }

      if (this.props.id === undefined) {
        this.canMouseOver = false
        setTimeout(() => this.canMouseOver = true, 500)
      }
    }

    return {
      id,
      stepIndex,
      sample,
      step,
    }
  }

  onAddFile = (stepIndex, file) => {
    this.props.addFile(this.state.id, stepIndex, file)
  }

  onDeleteFile = (stepIndex, file) => {
    this.props.deleteFile(this.state.id, stepIndex, file.id)
  }

  onMouseOverStep(stepIndex) {
    if (
      stepIndex !== this.state.stepIndex
      && this.lastMouseOver !== stepIndex
      && this.canMouseOver
    ) {
      this.gotoStep(stepIndex)
      this.lastMouseOver = this.state.stepIndex
      setTimeout(() => this.lastMouseOver = undefined, 250)
    }
  }

  onBlurBadgeInput = (ev) => {
    if (ev.target.value !== '') {
      this.addTag(ev.target.value, false)
      ev.target.value = ''
    }
    else {
      this.closeBadgeDropdown()
    }
  }

  onClickDelete = () => {
    this.setState({ confirmDeletion: true })
  }

  closeModal = () => {
    this.props.history.push('/samples')
  }

  closeConfirmModal = () => {
    this.setState({ confirmDeletion: false })
  }

  gotoStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex <= this.state.sample.data.steps.length - 1) {
      this.props.history.push(`/samples/${this.state.id}/${stepIndex}`)
      this.canMouseOver = false
      setTimeout(() => this.canMouseOver = true, 750)
      this.buttons[stepIndex] && this.buttons[stepIndex].scrollIntoView()
    }
  }

  update = (data = this.state.sample.data) => {
    this.props.onChange(data.id, data)
  }

  deleteSample = () => {
    this.props.onDelete(this.props.id)
      .then(() => this.closeConfirmModal())
      .then(() => this.closeModal())
  }

  setData = (data) => {
    this.setState({ sample: { ...this.state.sample, data }})
  }

  createNewFunction = () => {
    this.props.history.push('/completions/new')
  }

  editFunction = (id) => {
    this.props.history.push(`/completions/${id}`)
  }

  removeTag(tag) {
    const data = this.state.sample.data
    const newData = { ...data, tags: data.tags.filter(v => v !== tag) }
    this.update(newData)
  }

  addTag = (tag, refocus = true) => {
    const data = this.state.sample.data
    const newData = { ...data, tags: uniq(data.tags.concat(tag)) }
    this.update(newData)

    if (refocus) {
      this.badgeInput.element.focus()
      this.openBadgeDropdown()
    } else {
      this.closeBadgeDropdown()
    }
  }

  setName = (name) => {
    const data = this.state.sample.data
    const newData = { ...data, name }
    this.update(newData)
  }

  setNotes = (notes) => {
    const data = this.state.sample.data
    const newData = { ...data, notes }
    this.update(newData)
  }

  setAlertDelay = (stepIndex, alertDelay) => {
    const data = this.state.sample.data
    const steps = [ ...data.steps ]
    steps[stepIndex] = { ...steps[stepIndex], alertDelay }
    const newData = { ...data, steps }
    this.setData(newData)
  }

  setStepNotes = (stepIndex, notes) => {
    const data = this.state.sample.data
    const steps = [ ...data.steps ]
    steps[stepIndex] = { ...steps[stepIndex], notes }
    const newData = { ...data, steps }
    this.update(newData)
  }

  setStepStarted = (stepIndex) => {
    const data = this.state.sample.data
    const steps = [ ...data.steps ]
    steps[stepIndex] = { ...steps[stepIndex], started: new Date() }
    const newData = { ...data, steps }
    this.update(newData)
  }

  setStepCompletion = (stepIndex, completionFn) => {
    const data = set(lensPath(['steps', stepIndex, 'completionFn']), completionFn,  this.state.sample.data)
    this.update(data)
  }

  setStepStatus = (stepIndex, status) => {
    this.props.onChangeStatus(this.state.id, stepIndex, status)
  }

  getUserName(userId) {
    if (userId === null)
      return ''

    if (this.props.users.isLoading)
      return '[loading]'

    return this.props.users.data[userId].name
  }

  openBadgeDropdown = () => {
    this.setState({ badgeDropdownOpen: true })
  }

  closeBadgeDropdown = () => {
    setTimeout(() => {
      if (this.badgeInput.element !== document.activeElement) {
        console.log(document.activeElement)
        this.setState({ badgeDropdownOpen: false })
      }
    }, 200)
  }

  render() {
    const {
      completionFunctions,
      onChange,
      onChangeStatus,
      onDelete,
      onError
    } = this.props
    const {
      id,
      stepIndex,
      sample,
      step,
      badgeDropdownOpen,
      confirmDeletion,
    } = this.state

    const tags = sample ? this.props.tags.filter(t => !sample.data.tags.includes(t)) : []

    return (
      <Modal
        className='SampleModal'
        title={
          <div className='fill hbox'>
            <span>Sample:</span>
            <Gap fill={10}/>
            <EditableLabel
              className='fill'
              value={sample ? sample.data.name : ''}
              onEnter={this.setName}
            />
          </div>
        }
        width={this.modalWidth}
        open={id !== undefined}
        onClose={this.closeModal}
      >
        <Modal.Content>
        {
          sample !== undefined &&
            <div className='vbox'>
              <div className='SampleModal__badges'>
                {
                  sample.data.tags.map(tag =>
                    <Badge info key={tag} button={
                      <Button round flat icon='close' onClick={() => this.removeTag(tag)} />
                    }>
                      { tag }
                    </Badge>
                  )
                }
                <Dropdown inline open={badgeDropdownOpen && tags.length > 0}
                  onClose={this.closeBadgeDropdown}
                  trigger={
                    <Input
                      className='badge'
                      icon='plus-circle'
                      clearOnEnter
                      onEnter={this.addTag}
                      onFocus={this.openBadgeDropdown}
                      onBlur={this.onBlurBadgeInput}
                      ref={ref => ref && (this.badgeInput = ref)}
                    />
                  }
                >
                  {
                    tags.map(tag =>
                      <Dropdown.Item key={tag} onClick={() => this.addTag(tag)}>
                        <Badge info>{tag}</Badge>
                      </Dropdown.Item>
                    )
                  }
                </Dropdown>
              </div>

              <div className='hbox'>
                <div className='fill'>
                  <EditableText
                    placeHolder='Enter sample notes...'
                    value={sample.data.notes}
                    onEnter={this.setNotes}
                  />
                </div>

                <div className='hpadded'>
                  <Button error onClick={this.onClickDelete} >
                    Delete Sample
                  </Button>
                </div>
              </div>

              { /* Steps Button Bar */ }
              <div className='ButtonBar'>
                <div className='ButtonGroup flex-fill'>
                  {
                    sample.data.steps.map((step, stepIndex) =>
                      <Tooltip key={stepIndex} content={step.name} delay={500} minWidth='parent'>
                        <Button
                          small
                          normal
                          highlight={stepIndex === this.state.stepIndex}
                          onClick={() => this.gotoStep(stepIndex)}
                          ref={ref => ref && (this.buttons[stepIndex] = findDOMNode(ref))}
                        >
                          { step.name } { step.isOverdue && <Icon name='warning' warning /> }
                        </Button>
                      </Tooltip>
                    )
                  }
                </div>
              </div>

              <div className='StepsModal'>
                <div className='StepsModal__content hbox' style={contentStyle(stepIndex, this.stepWidth)}>
                  {
                    /* Steps sub-modals */
                    sample.data.steps.map(this.renderStepModal)
                  }
                </div>
              </div>

            </div>
        }
        </Modal.Content>

        <Modal minimal
          title={<span><Icon name='warning' error/> Confirm Deletion</span>}
          open={confirmDeletion}
          onClose={this.closeConfirmModal}>

          <Modal.Content>
            <Text large block>
              Do you want to delete this sample permanently?
            </Text>
          </Modal.Content>

          <Modal.Actions>
            <Button onClick={this.closeConfirmModal}>
              No, keep this sample
            </Button>
            <Button error onClick={this.deleteSample}>
              Yes, delete this sample
            </Button>
          </Modal.Actions>

        </Modal>

      </Modal>
    )
  }

  renderStepModal = (step, stepIndex) => {
    const {
      completionFunctions,
      onChange,
      onChangeStatus,
      onDelete,
      onError
    } = this.props
    const { sample } = this.state

    const history = sample.data.history.filter(entry => entry.stepIndex === null || entry.stepIndex === stepIndex)

    return (
      <DropZone key={ `${sample.id}:${stepIndex}`} onDrop={(file) => this.onAddFile(stepIndex, file)}>
        {
          ({ dragOver, dragOverDocument }) =>

          <div
            className={ classname('StepsModal__step drop-zone hbox', {
              'over': dragOver,
              'over-document': dragOverDocument,
            }) }
            onMouseOver={() => this.onMouseOverStep(stepIndex)}
            style={{ width: this.modalWidth, marginRight: 100 }}
            >

              <div className='StepsModalStep__controls'>
                <table className='StepsModalStep__table'>
                  <tbody>
                    <tr>
                      <td>
                        <Label>Status</Label>
                      </td>
                      <td>
                        <Dropdown label={
                          <span className='StepsModalStep__icon'>
                            <StatusIcon name={step.status} size='lg' showInProgress />&nbsp;&nbsp; <Text bold>{ step.status }</Text>
                          </span>
                        }>
                          {
                            Object.values(Status)
                              .filter(status => status !== step.status
                                            && status !== Status.IN_PROGRESS)
                              .map((status, i) =>
                                <Dropdown.Item key={i} onClick={() => this.setStepStatus(stepIndex, status)}>
                                  <StatusIcon name={status} />&nbsp;&nbsp; <Text normal>{ status }</Text>
                                </Dropdown.Item>
                              )
                          }
                        </Dropdown>
                      </td>

                    </tr>

                    {
                      step.status === Status.IN_PROGRESS &&
                        <tr>
                          <td>
                              <Label>Since</Label>
                          </td>
                          <td>
                            <Time>{ step.started }</Time> <Button
                              small
                              normal
                              onClick={() => this.setStepStarted(stepIndex)}>Reset</Button>
                          </td>
                        </tr>
                    }

                    {
                      (step.isOverdue || step.isOverdue === false) &&
                        <tr>
                          <td>
                            {
                              step.isOverdue &&
                                <Label>Overdue since</Label>
                            }
                            {
                              step.isOverdue === false &&
                                <Label>Will be overdue on</Label>
                            }
                          </td>
                          <td>
                            {
                              step.isOverdue &&
                                <Time>{ step.overdueAt }</Time>
                            }
                            {
                              step.isOverdue === false &&
                                <Time>{ step.overdueAt }</Time>
                            }
                          </td>
                        </tr>
                    }

                    <tr>
                      <td>
                        <Label>Alert delay</Label>
                      </td>
                      <td>
                        <IntervalInput
                          value={step.alertDelay}
                          onChange={(alertDelay) => this.setAlertDelay(stepIndex, alertDelay)}
                          onAccept={() => this.update()}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Label>Completion Function</Label>
                      </td>
                      <td>
                        <Dropdown label={
                          step.completionFn ?
                            completionFunctions.data[step.completionFn] ?
                              completionFunctions.data[step.completionFn].name
                              :
                              (() => { debugger; return step.completionFn })
                            :
                            <em>None</em>
                        } icons>
                          <Dropdown.Item
                            icon={ step.completionFn === null ? 'dot-circle-o' : 'circle-o'}
                            onClick={() => this.setStepCompletion(stepIndex, null)}
                          >
                            <em className='text-muted'>None</em>
                          </Dropdown.Item>
                          {
                            Object.values(completionFunctions.data).map(completion =>
                              <Dropdown.SegmentedItem>
                                <Dropdown.SegmentMain
                                  icon={ step.completionFn === completion.id ? 'dot-circle-o' : 'circle-o'}
                                  onClick={() => this.setStepCompletion(stepIndex, completion.id)}>
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
                      </td>
                    </tr>

                  </tbody>
                </table>

                <div className='row'>
                  <EditableText
                    placeHolder='Enter step notes...'
                    value={step.notes}
                    onEnter={(notes) => this.setStepNotes(stepIndex, notes)}
                  />
                </div>

                <div className='row'>
                  <Title>Files</Title>
                </div>

                <div className='row'>
                  <EditableList
                    className='full-width'
                    values={step.files}
                    onAdd={() => {/* nop */}}
                    onDelete={file => this.onDeleteFile(stepIndex, file)}
                    render={renderFile}
                    emptyMessage={<Label small muted>No files attached</Label>}
                    control={
                      <div>
                        <Button
                          normal
                          style={{ marginTop: 'var(--padding)' }}
                          onClick={() => openFile().then(file => this.onAddFile(stepIndex, file))}>
                          Add file
                        </Button> <Help marginLeft={10}>You can also drag-and-drop a file on this step</Help>
                      </div>
                    }
                  />
                </div>

              </div>

              <div className='StepsModalStep__history'>
                <div className='History'>
                  <div className='History__title'>
                    History
                  </div>
                  {
                    sample.data.history
                      .filter(entry => entry.stepIndex === null || entry.stepIndex === stepIndex)
                      .map(entry =>
                        <div className='History__entry'>
                          <span className='History__date'>
                            { humanReadableTime(entry.date) }
                          </span>
                          <span className='History__description'>
                            <span className='History__username'>
                              {this.getUserName(entry.userId)}
                            </span> { entry.description }
                          </span>
                        </div>
                      )
                  }
                </div>
              </div>


            </div>
        }
      </DropZone>
    )
  }
}


function renderFile(file) {
  const element = (
    <span>
      {
        !file.hasError ?
        <Icon name={MimeType.iconFor(file.mime)} /> :
        <Icon name='warning' error />
      } <Link href={`/api/file/download/${file.id}`} normal>
        { file.name }
      </Link>
    </span>
  )

  if (!MimeType.isImage(file.mime))
    return element

  return (
    <Tooltip content={<img src={`/api/file/read/${file.id}`} height={300} />} height={320}>
      { element }
    </Tooltip>
  )
}

function contentStyle(stepIndex, stepWidth) {
  return {
    left: `${-stepIndex * stepWidth}px`
  }
}

export default withRouter(pure(SampleModal))
