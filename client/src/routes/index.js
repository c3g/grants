import React from 'react'
import prop from 'prop-types'
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
import Navbar from '../components/Navbar'
// import CompletionFunctionsContainer from '../containers/CompletionFunctionsContainer'
// import FAQContainer from '../containers/FAQContainer'
// import IndexContainer from '../containers/IndexContainer'
// import NotificationsContainer from '../containers/NotificationsContainer'
// import SamplesContainer from '../containers/SamplesContainer'
import SettingsContainer from '../containers/SettingsContainer'
// import TemplatesContainer from '../containers/TemplatesContainer'

const items = [
  { type: 'item', icon: 'cogs',  label: 'Settings', path: '/settings' },
  { type: 'item', icon: 'flask', label: 'Grants',   path: '/grants', index: true },
]
const indexRoute = items.find(i => i.index).path

function Routes({ isLoggedIn, isLoggingIn, logOut, showFAQ }) {

  // Redirect on certain conditions
  const checkLocation = (props) =>
    (!isLoggedIn && !isLoggingIn && props.location.pathname !== '/') ?
      <Redirect to='/' /> :
    (isLoggedIn && props.location.pathname === '/') ?
      <Redirect to={indexRoute} /> :
      null

  return (
    <Router>
      <div className='App vbox'>

        <Route render={checkLocation}/>

        <div className='App__navbar'>
          <Route render={(props) =>

            <Navbar
              direction='horizontal'
              visible={isLoggedIn}
              index={items.findIndex(i => props.location.pathname.startsWith(i.path))}
              items={items}
            >
              <Navbar.Title>
                Grants Application
              </Navbar.Title>
              <Navbar.Button icon='question-circle' title='Help'    onClick={showFAQ} />
              <Navbar.Button icon='sign-out'        title='Log Out' onClick={logOut} />
            </Navbar>

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

            document.title = `${activeItem.title} - Grants`

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

Routes.propTypes = {
  location: prop.object.isRequired,
}

const mapStateToProps = createStructuredSelector({
  isLoggedIn: createSelector(state => state.ui.loggedIn.value, state => state),
  isLoggingIn: createSelector(state => state.ui.loggedIn.isLoading, state => state),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(GlobalActions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Routes)
