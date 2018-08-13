import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector, createSelector } from 'reselect'

import CompletionFunctions from '../components/CompletionFunctions'
import GlobalActions from '../actions/global'
import CompletionFunctionActions from '../actions/completion-functions'

class CompletionFunctionsContainer extends React.Component {
  render() {
    return (
      <CompletionFunctions
        isLoading={this.props.completionFunctions.isLoading}
        isCreating={this.props.completionFunctions.isCreating}
        data={this.props.completionFunctions.data}
        selectedId={this.props.match.params.id}
        onCreate={this.props.create}
        onChange={this.props.update}
        onDelete={this.props.delete}
        onError={this.props.showError}
        onInfo={this.props.showInfo}
        onSuccess={this.props.showSuccess}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  completionFunctions: createSelector(state => state.completionFunctions, state => state),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...CompletionFunctionActions, ...GlobalActions }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(CompletionFunctionsContainer)
