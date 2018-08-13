import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector, createSelector } from 'reselect'

import FAQ from '../components/FAQ'
import GlobalActions from '../actions/global'

class FAQContainer extends React.Component {
  render() {
    return (
      <FAQ
        isOpen={this.props.isOpen}
        show={this.props.showFAQ}
        close={this.props.closeFAQ}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  isOpen: createSelector(state => state.ui.showFAQ, state => state),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(GlobalActions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(FAQContainer)
