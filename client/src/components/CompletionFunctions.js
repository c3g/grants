import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'

import { getNewCompletionFunction, testingSample } from '../models'
import Button from './Button'
import EditableLabel from './EditableLabel'
import Editor from './Editor'
import Gap from './Gap'
import Icon from './Icon'
import Label from './Label'
import Spinner from './Spinner'
import Title from './Title'

class CompletionFunctions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedFunction: undefined,
      testingPanelOpen: false,
      testingSample: testingSample,
    }
    this.componentWillReceiveProps(props)
  }

  componentWillReceiveProps(props) {
    if (props.selectedId !== undefined) {
      if (props.selectedId === 'new' && !this.props.isCreating) {
        this.props.history.push('/completions')
        this.createFunction()
      }
      else {
        setTimeout(() =>
          this.setState({
            selectedFunction: props.data[props.selectedId]
          })
        , 10)
      }
    }
  }

  componentDidUpdate() {
    this.codeEditor && this.codeEditor.updateDimensions()
    this.dataEditor && this.dataEditor.updateDimensions()
  }

  onClickTestingPanel = (ev) => {
    if (isButtonClick(ev))
      return

    this.setState({ testingPanelOpen: !this.state.testingPanelOpen })
  }

  update(selectedFunction) {
    this.setState({ isLoading: true, data: selectedFunction })
    this.props.onChange(selectedFunction.id, selectedFunction)
  }

  getSelectedFunction() {
    return this.props.data[this.props.selectedId]
  }

  setSelectedFunction(selectedId) {
    this.props.history.push(`/completions/${selectedId}`)
  }

  createFunction = () => {
    this.props.onCreate(getNewCompletionFunction())
      .then(({ id }) =>
        this.props.history.push(`/completions/${id}`)
      )
  }

  deleteFunction(id) {
    this.props.onDelete(id)
  }

  setName = (name) => {
    const completion = this.getSelectedFunction().data
    this.update({ ...completion, name })
  }

  setCode = () => {
    const code = this.codeEditor.getValue()
    const completion = this.getSelectedFunction().data
    this.update({ ...completion, code })
  }

  runTest = () => {
    const code = this.codeEditor.getValue()
    const data = this.dataEditor.getValue()

    let result
    try {
      eval(data)
    } catch(err) {
      this.props.onError(`Got an error while evaluating the data:`, err.message)
      return
    }

    try {
      result = eval(`(function() {
          ${data}
          return (${code})(sample.steps[stepIndex], sample, user, stepIndex)
        })()
      `)
    } catch(err) {
      this.props.onError(`Got an error while evaluating the code:`, err.message)
      return
    }

    if (result === true) {
      this.props.onSuccess('Function completed successfully')
      return
    }

    this.props.onInfo(`Function completed with message:`, result)

    if (!this.state.testingPanelOpen)
      this.setState({ testingPanelOpen: true })
  }

  render() {
    const {
      isLoading,
      isCreating,
      data,
      selectedId,
      onError,
      onInfo,
      onSuccess,
    } = this.props

    const completionFunctions = Object.values(data)

    const {
      selectedFunction,
      testingPanelOpen,
      testingSample,
    } = this.state

    return (
      <section className='CompletionFunctions hbox'>

        <div className='vbox'>
          <div className='HeaderBar'>
            <Title large keepCase muted>
              GenAP FOLLOW
            </Title>
          </div>

          <div className='CompletionFunctions__list list fill'>

            <div className='group'>
              Completion Functions
            </div>
            {
              completionFunctions.map(({ isLoading, data: { id, name }}) =>
                <a key={id} href='#'
                  className={'item' + (id === +selectedId ? ' active' : '')}
                  onClick={ev => (ev.preventDefault(), this.setSelectedFunction(id))}
                >
                  <div className='content'>
                    <Label inline>{ name }</Label>
                  </div>
                  {
                    isLoading &&
                      <Spinner />
                  }
                  {
                    !isLoading &&
                      <Icon
                        className='delete-icon'
                        name='trash'
                        onClick={() => this.deleteFunction(id)}
                      />
                  }
                </a>
              )
            }
            {
              completionFunctions.length === 0 &&
                <div className='item disabled'>
                  <Label muted>
                    No completion functions yet
                  </Label>
                </div>
            }
            <div className='separator' />
            <div className='item'>
              <Button info onClick={this.createFunction} loading={isCreating}>
                Create
              </Button>
            </div>
          </div>
        </div>

        <div className='CompletionFunctions__editor vbox'>
          <div className='row'>
            <div className='CompletionFunctions__name fill hbox'>
              {
                selectedFunction !== undefined &&
                <EditableLabel
                  className='fill'
                  block
                  value={selectedFunction.data.name}
                  onEnter={this.setName}
                />
              }
              {
                selectedFunction === undefined &&
                <Label muted>No completion function selected</Label>
              }
            </div>

            <Button info
              disabled={selectedFunction === undefined}
              loading={selectedFunction ? selectedFunction.isLoading : false}
              onClick={this.setCode}
            >
              Save
            </Button>
          </div>

          <Editor
            className='fill'
            ref={ref => ref && (this.codeEditor = ref)}
            value={selectedFunction ? selectedFunction.data.code : ''}
            onSave={this.setCode}
          />

          <div className='row vcenter clickable' onClick={this.onClickTestingPanel}>
            <Gap fill={5}/>
            <Icon name={ testingPanelOpen ? 'chevron-down' : 'chevron-up' } />

            <div className='fill' />

            <Button info onClick={this.runTest} disabled={selectedId === undefined}>
              Test it
            </Button>
          </div>

          <Editor
            className={testingPanelOpen ? 'fill' : 'flex-hidden'}
            ref={ref => ref && (this.dataEditor = ref)}
            value={testingSample}
            onSave={testingSample => this.setState({ testingSample })}
          />

        </div>

      </section>
    )
  }
}

function isButtonClick(ev) {
  let target = ev.target
  do {
    if (target.tagName === 'BUTTON')
      return true
  }
  while(target = target.parentNode)

  return false
}

CompletionFunctions.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  onCreate: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default withRouter(CompletionFunctions)
