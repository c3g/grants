import React from 'react'
import prop from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector, createSelector } from 'reselect'

import { fromLoadable } from '../utils/to-loadable'
import Grants from '../components/Grants'

class GrantsContainer extends React.Component {
  static propTypes = {
    ui: prop.object.isRequired,
    grants: prop.object.isRequired,
    applicants: prop.object.isRequired,
    fundings: prop.object.isRequired,
    categories: prop.object.isRequired,
    users: prop.object.isRequired,
  }

  render() {
    return (
      <Grants
        isLoading={this.props.grants.isLoading}
        isCreating={this.props.grants.isCreating}
        grants={Object.values(this.props.grants.data)}
        ui={this.props.ui}
        applicants={this.props.applicants}
        fundings={this.props.fundings}
        categories={this.props.categories}
        users={this.props.users}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  ui: createSelector(state => state.ui, state => state),
  grants: createSelector(state => state.grants, state => state),
  applicants: createSelector(state => ({
    isLoading: state.applicants.isLoading,
    data: state.applicants.data,
  }), state => state),
  fundings: createSelector(state => ({
    isLoading: state.fundings.isLoading,
    data: state.fundings.data,
  }), state => state),
  categories: createSelector(state => ({
    isLoading: state.categories.isLoading,
    data: state.categories.data,
  }), state => state),
  users: createSelector(state => ({
    isLoading: state.users.isLoading,
    data: fromLoadable(state.users.data),
  }), state => state),
})

export default connect(mapStateToProps)(GrantsContainer)
