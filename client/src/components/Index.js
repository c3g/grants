import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'

import Global from '../actions/global'
import Button from './Button'
import Modal from './Modal'
import Text from './Text'
import Title from './Title'


class Index extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    isLoggedIn: PropTypes.any.isRequired,
  }

  render() {
    const {
      isLoading,
      isLoggedIn,
    } = this.props

    return (
      <Modal width='900px' height='60%' open={!isLoggedIn} showHeader={false}>
        <div className='vbox fill full padded'>

          <h1 className='hcenter'>
            <Title large keepCase muted>
              Grants Application
            </Title>
          </h1>

          <div className='fill center flex-column'>
            <Button icon='google' error onClick={Global.logIn} loading={isLoading}>
              Log in with Google
            </Button>
          </div>

        </div>
      </Modal>
    )
  }
}

export default pure(Index)
