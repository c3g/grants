import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector, createSelector } from 'reselect'

import { fromLoadable } from '../helpers/to-loadable'
import Settings from '../components/Settings'

class SettingsContainer extends React.Component {
  render() {
    return (
      <Settings
        isLoading={this.props.settings.isLoading}
        data={this.props.settings.data}
        users={this.props.users}
        applicants={this.props.applicants}
        categories={this.props.categories}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  settings: createSelector(state => state.settings, state => state),
  users: createSelector(state => Object.values(fromLoadable(state.users.data)), state => state),
  applicants: createSelector(state => Object.values(state.applicants.data), state => state),
  categories: createSelector(state => Object.values(state.categories.data), state => state),
})

export default connect(mapStateToProps)(SettingsContainer)
