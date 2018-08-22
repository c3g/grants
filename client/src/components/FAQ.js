import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import styled from 'styled-components'
import { withRouter } from 'react-router'

import Button from './Button'
import Checkbox from './Checkbox'
import Dropdown from './Dropdown'
import EditableLabel from './EditableLabel'
import Gap from './Gap'
import Icon from './Icon'
import Image from './Image'
import Input from './Input'
import Label from './Label'
import Link from './Link'
import Modal from './Modal'
import Spinner from './Spinner'
import Text from './Text'
import Title from './Title'

const Images = {
}

function Question({ children }) {
  return (
    <div className='Question'>
      <Icon name='question-circle' />
      { children }
    </div>
  )
}

class FAQ extends React.Component {

  render() {
    const {
      isOpen,
      show,
      close
    } = this.props

    return (
      <Modal width='900px' open={isOpen} onClose={close}
        title='Help & Frequently Asked Questions'
      >
        <Modal.Content>

          <Title>Grants</Title>

          <div className='row'>
            <Text medium block>
            </Text>
          </div>

          <hr/>

          <Title>Questions</Title>
          <Gap v={10}/>

          <Question>
            <Label medium>What is a “completion function”?</Label>
            <Text medium block>
              A completion function is a snippet of code that is run when a user wants to set a step status
              to “DONE”. It can either succeed or return an error message.<br/>
              You can edit any completion function by clicking on the <Icon name='code' highlight/> icon on the sidebar.
            </Text>
          </Question>

          <Question>
            <Label medium>I have another question</Label>
            <Text medium block>
              <Link href='mailto:support@genap.ca'>Contact us</Link>
            </Text>
          </Question>

        </Modal.Content>
      </Modal>
    )
  }
}

export default pure(FAQ)
