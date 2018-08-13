import React from 'react'
import pure from 'recompose/pure'
import MonacoEditor from 'react-monaco-editor'
import classname from 'classname'

import { DECLARATIONS } from '../models'

class Editor extends React.Component {
  constructor() {
    super()

    this.options = {
      minimap: { enabled: false },
    }
    this.config = {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
      paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.10.1/min/vs' },
    }

    this.state = {
      width: 600,
      height: 500,
    }
  }

  componentDidUpdate() {
    this.updateDimensions()
    if (this.editor) {
      this.editor.layout()
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const state = this.state
    const props = this.props

    const stateEqual = state === nextState
    const propsEqual = props.value === nextProps.value
                    && props.className === nextProps.className

    const shouldUpdate = !stateEqual || !propsEqual

    return shouldUpdate
  }

  editorDidMount = (editor, monaco) => {
    this.editor = editor
    this.monaco = monaco

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.onSave)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, this.onSave)
  }

  editorWillMount = (monaco) => {
    if ('facts.d.ts' in monaco.languages.typescript.javascriptDefaults.getExtraLibs())
      return

    // Validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    })

    // Compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES6,
      allowNonTsExtensions: true,
      allowJs: true,
    })

    // Add type hints
    monaco.languages.typescript.javascriptDefaults.addExtraLib(DECLARATIONS, 'facts.d.ts')
  }

  updateDimensions() {
    if (this.element) {
      const width  = this.element.clientWidth
      const height = Math.max(this.element.clientHeight, 500)

      if (width !== this.state.width || height !== this.state.height)
        this.setState({ width, height })
    }
  }

  getValue() {
    return this.editor.getModel().getValue()
  }

  onSave = (ev) => {
    this.props.onSave && this.props.onSave(this.getValue(), ev)
  }

  onRef = (ref) => {
    if (ref) {
      this.element = ref
      this.componentDidUpdate()
    }
  }

  render() {
    const {
      className,
      value,
      ...rest
    } = this.props
    const { width, height } = this.state

    const editorClassName = classname('Editor', className)

    return (
      <div className={editorClassName} ref={this.onRef}>
        <MonacoEditor
          width={width}
          height={height}
          theme='vs-dark'
          language='javascript'
          value={value}
          options={this.options}
          requireConfig={this.config}
          editorWillMount={this.editorWillMount}
          editorDidMount={this.editorDidMount}
          {...rest}
        />
      </div>
    )
  }
}



export default Editor
