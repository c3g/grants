import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector, createSelector } from 'reselect'

import History from '../components/History'

class HistorysContainer extends React.Component {
  render() {
    return (
      <History
        isLoading={this.props.history.isLoading}
        range={this.props.history.range}
        data={this.props.history.data}
        users={this.props.users}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  history: createSelector(state => state.history, state => state),
  users: createSelector(state => state.users, state => state),
})

export default connect(mapStateToProps)(HistorysContainer)
