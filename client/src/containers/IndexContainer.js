import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector, createSelector } from 'reselect'

import Index from '../components/Index'
import GlobalActions from '../actions/global'

class IndexContainer extends React.Component {
  render() {
    return (
      <Index
        isLoading={this.props.isLoading}
        isLoggedIn={this.props.isLoggedIn}
        logIn={this.props.logIn}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  isLoading: createSelector(state => state.ui.loggedIn.isLoading, state => state),
  isLoggedIn: createSelector(state => state.ui.loggedIn.value, state => state),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(GlobalActions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(IndexContainer)
