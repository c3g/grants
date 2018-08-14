import React from 'react'
import { bindActionCreators } from 'redux'
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'
import { connect } from 'react-redux'
import { createStructuredSelector, createSelector } from 'reselect'

import GlobalActions from '../actions/global'
import Sidebar from '../components/Sidebar'
// import CompletionFunctionsContainer from '../containers/CompletionFunctionsContainer'
// import FAQContainer from '../containers/FAQContainer'
// import IndexContainer from '../containers/IndexContainer'
// import NotificationsContainer from '../containers/NotificationsContainer'
// import SamplesContainer from '../containers/SamplesContainer'
import SettingsContainer from '../containers/SettingsContainer'
// import TemplatesContainer from '../containers/TemplatesContainer'

const items = [
  { type: 'item', icon: 'cogs',  path: '/settings',    title: 'Settings' },
  { type: 'item', icon: 'flask', path: '/grants',      title: 'Grants',               showTitle: false },
]

function Routes({ isLoggedIn, isLoggingIn, logOut, showFAQ }) {
  return (
    <Router>
      <div className='App hbox'>

        <Route render={(props) =>
          (!isLoggedIn && !isLoggingIn && props.location.pathname !== '/') ?
            <Redirect to='/' /> :
          (isLoggedIn && props.location.pathname === '/') ?
            <Redirect to='/samples' /> :
            null
        }/>

        <div className='App__sidebar'>
          <Route render={(props) =>

            <Sidebar
              visible={isLoggedIn}
              index={items.findIndex(i => props.location.pathname.startsWith(i.path))}
              items={items}
            >
              <Sidebar.Button icon='question-circle' title='Help'    onClick={showFAQ} />
              <Sidebar.Button icon='sign-out'        title='Log Out' onClick={logOut} />
            </Sidebar>

          }/>
        </div>
        <div className='App__content vbox'>

          <Route render={(props) => {
            /*
             * Render document title
             */
            const activeItem = items.find(i => i.path === props.location.pathname)

            if (!activeItem || activeItem.title === undefined)
              return null

            document.title = `Follow - ${activeItem.title}`

            return null
          } }/>

          <Switch>
            <Route path='/settings' component={SettingsContainer} />
            { /* <Route path='/grants/:id?/:stepIndex?' component={SamplesContainer} /> */ }
          </Switch>
        </div>

      </div>
    </Router>
  )
  // <NotificationsContainer />
  // <IndexContainer />
  // <FAQContainer />
}

const mapStateToProps = createStructuredSelector({
  isLoggedIn: createSelector(state => state.ui.loggedIn.value, state => state),
  isLoggingIn: createSelector(state => state.ui.loggedIn.isLoading, state => state),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(GlobalActions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Routes)
