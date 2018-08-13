import React from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import { withRouter } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector, createSelector } from 'reselect'
import classname from 'classname'

import UIActions from '../actions/ui'
import SampleActions from '../actions/samples'

import STATUS from '../constants/status'
import Badge from './Badge'
import Button from './Button'
import EditableLabel from './EditableLabel'
import Icon from './Icon'
import Input from './Input'
import Label from './Label'
import Spinner from './Spinner'
import StatusIcon from './StatusIcon'
import Tooltip from './Tooltip'

const { updateSelectedStepsStatus } = SampleActions


// This is a global click listener, to close the popup menu
const steps = []

document.addEventListener('click', ev => {
  const isContained =
    steps.map(d => d.onDocumentClick(ev))
         .some(Boolean)

  if (ev.ctrlKey === false && !isContained && steps.length > 0) {
    if (steps[0].props.selectedSteps.size !== 0)
      steps[0].props.deselectAllSteps()
  }
})


class Step extends React.Component {
  constructor(props) {
    super()
    this.state = {
      contextMenuOpen: false,
    }
  }

  componentWillReceiveProps(props) {
  }

  componentWillMount() {
    this.mountNode = this.props.mountNode || document.body
    this.domNode = document.createElement('div')
    this.mountNode.appendChild(this.domNode)
  }

  componentDidMount() {
    steps.push(this)
  }

  componentWillUnmount() {
    steps.splice(steps.findIndex(x => x === this), 1)
    this.mountNode.removeChild(this.domNode)
  }

  onDocumentClick(ev) {
    if (this.isContextMenuOpen()
      && !this.popup.contains(ev.target)
      && !this.button.contains(ev.target))
      this.props.closeStepContextMenu()

    return this.button.contains(ev.target) || this.popup.contains(ev.target)
  }

  onClick = (ev) => {
    ev.stopPropagation()
    ev.preventDefault()

    // Open sample modal
    if (ev.ctrlKey === false) {
      this.props.history.push(`/samples/${this.props.sampleId}/${this.props.index}`)
    }
    // Step selection
    else {
      if (this.isSelected())
        this.props.deselectStep(this.getIdentifier())
      else
        this.props.selectStep(this.getIdentifier())
    }
  }

  onMouseMove = (ev) => {
    if (ev.ctrlKey && ev.buttons === 1 && !this.isSelected())
      this.props.selectStep(this.getIdentifier())
  }

  onContextMenu = (ev) => {
    ev.preventDefault()

    this.props.openStepContextMenu(this.getIdentifier())
  }

  onRefButton = (ref) => {
    if (ref === null)
      return
    this.button = ref
  }

  onRefPopup = (ref) => {
    if (ref === null)
      return
    this.popup = ref
  }

  onClickStatus = (status) => {
    this.props.updateSelectedStepsStatus(status)
  }

  getPosition() {
    if (!this.button)
      return { top: 0, left: 0 }

    const box = this.button.getBoundingClientRect()

    return {
      top:  box.top,
      left: box.left + 40,
    }
  }

  getIdentifier() {
    return `${this.props.sampleId}:${this.props.index}`
  }

  isContextMenuOpen() {
    const { contextMenu } = this.props
    const id = this.getIdentifier()
    return contextMenu.open && contextMenu.step === id
  }

  isSelected() {
    const { selectedSteps } = this.props
    const id = this.getIdentifier()
    return selectedSteps.has(id)
  }

  render() {
    const { step, selectedSteps, contextMenu } = this.props

    const tooltip = (
      <span>
        { step.name } - <small>{ step.status.isLoading ? 'updating...' : step.status }</small>
      </span>
    )

    const className = classname('Step block', {
      selected: this.isSelected() && !(selectedSteps.size === 1 && contextMenu.open)
    })
    const menuClassName = classname('Step__menu Popup', {
      open: this.isContextMenuOpen()
    })

    return (
      <Tooltip position='top' content={tooltip}>
        <button
          className={className}
          onContextMenu={this.onContextMenu}
          onClick={this.onClick}
          onMouseMove={this.onMouseMove}
          ref={this.onRefButton}
        >
          <span className='content'>
            <StatusIcon name={step.status} />
          </span>
          {
            step.files.length > 0 &&
              <span className='file-marker' />
          }
          {
            step.notes.length > 0 &&
              <span className='notes-marker' />
          }

          {
            createPortal(
              <div
                ref={this.onRefPopup}
                className={menuClassName}
                style={this.getPosition()}
              >
                {
                  Object.values(STATUS)
                  .filter(status =>
                    (status !== step.status || selectedSteps.size > 1)
                    && status !== STATUS.IN_PROGRESS
                  )
                  .map((status, i) =>
                    <button key={i}
                      className='item'
                      onClick={ev => ev.stopPropagation() || this.onClickStatus(status)}>
                      <StatusIcon name={status} />
                    </button>
                  )
                }
              </div>,
              this.domNode
            )
          }

        </button>
      </Tooltip>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  selectedSteps: createSelector(state => state.ui.selectedSteps, state => state),
  contextMenu: createSelector(state => state.ui.stepContextMenu, state => state),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...UIActions, updateSelectedStepsStatus }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(pure(Step)))
