import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector, createSelector } from 'reselect'

import Notifications from '../components/Notifications'

class NotificationsContainer extends React.Component {
  render() {
    return (
      <Notifications list={this.props.list} />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  list: createSelector(state => state.ui.notifications, state => state),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsContainer)
