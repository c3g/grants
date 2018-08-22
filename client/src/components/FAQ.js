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

function Question({ label, children }) {
  return (
    <div className='Question'>
      <Icon name='question-circle' />
      <Label medium>{ label }</Label>
      <Text medium block>
        { children }
      </Text>
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

          <Question label='How can I view a different region of time?'>
            You can move the timeline along the X axis by dragging it or
            by <code>Shift</code> + scrolling, and you can move through
            the Y axis by scrolling. <br/>
            You can also zoom in and out by <code>Control</code> + scrolling.
          </Question>

          <Question label='How can I create/delete grants & fundings?'>
            To create a new grant, hold the <code>Shift</code> key down and drag
            over the region for which you want to create the grant.
            <br />
            To delete a grant, hold the <code>Shift</code> key down and delete
            buttons will appear in the top right corners of each grant.
            <br />
            To create a new funding, hold the <code>Control</code> key down and
            click on the grants from then to which you want to create a funding.
            <br />
            To delete a funding, hold the <code>Control</code> key down and close
            buttons will appear.
          </Question>

          <Question label='I have another question'>
            <Link href='mailto:support@genap.ca'>Contact us</Link>
          </Question>

        </Modal.Content>
      </Modal>
    )
  }
}

export default pure(FAQ)
