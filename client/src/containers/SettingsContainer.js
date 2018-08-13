import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector, createSelector } from 'reselect'

import { fromLoadable } from '../utils/to-loadable'
import Settings from '../components/Settings'
import GlobalActions from '../actions/global'
import SettingsActions from '../actions/settings'
import UserActions from '../actions/users'

class SettingsContainer extends React.Component {
  render() {
    return (
      <Settings
        isLoading={this.props.settings.isLoading}
        data={this.props.settings.data}
        users={this.props.users}
        onChange={this.props.update}
        onError={this.props.showError}
        updateUser={this.props.updateUser}
        deleteUser={this.props.deleteUser}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  settings: createSelector(state => state.settings, state => state),
  users: createSelector(state => Object.values(fromLoadable(state.users.data)), state => state),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...SettingsActions,
    ...GlobalActions,
    updateUser: UserActions.update,
    deleteUser: UserActions.delete,
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer)
