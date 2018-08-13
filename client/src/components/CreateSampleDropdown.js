import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import styled from 'styled-components'

import Button from './Button'
import Dropdown from './Dropdown'
import Gap from './Gap'
import Icon from './Icon'
import Input from './Input'
import Label from './Label'
import Spinner from './Spinner'


class CreateSampleDropdown extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      openItem: undefined,
      focusItem: undefined,
    }
  }

  toggle = () => {
    this.setState({ open: !this.state.open })
  }

  open = () => {
    this.setState({ open: true })
  }

  close = (ev) => {
    if (ev) {
      let node = ev.target
      do {
        if (node.className && node.className.includes('CreateSample__submenu'))
          return
      }
      while(node = node.parentNode)
    }

    this.setState({ open: false })
  }

  render() {
    const { isLoading, templates } = this.props
    const { open, openItem, focusItem } = this.state

    const newSampleButton =
      <Button info
        loading={templates.isLoading || isLoading}
        iconAfter={ templates.isLoading ? undefined : 'chevron-down' }
        onClick={this.toggle}
      >
        Create New Sample
      </Button>

    return (
      <Dropdown
        className='CreateSample'
        trigger={newSampleButton}
        open={this.state.open}
        onClose={this.close}
      >
        {
          templates.data.map((template, i) =>
            <Dropdown.SegmentedItem key={template.id}>
              <Dropdown.SegmentMain onClick={() => {
                this.props.createNewSample(template)
                this.close()
              }}>
                { template.name }
              </Dropdown.SegmentMain>

              <Dropdown.Segment
                center
                className='CreateSample__arrow'
                onMouseEnter={() => this.setState({ openItem: i })}
                onMouseLeave={() => this.setState({ openItem: undefined })}
              >
                <Icon name='chevron-right' />

                <Dropdown
                  compact
                  position='right'
                  className='CreateSample__submenu'
                  open={open && (openItem === i || focusItem === i)}
                  trigger={<span/>}
                  offset={{ left: 17, top: -1 }}
                >
                  <Dropdown.Content>
                    <Input
                      small
                      placeHolder='Enter names'
                      clearOnBlur
                      clearOnEnter
                      onEnter={names => {
                        this.props.createManySamples(names, template)
                        this.close()
                      }}
                      onFocus={() => this.setState({ focusItem: i })}
                      onBlur={() => this.setState({ focusItem: undefined })}
                    />
                  </Dropdown.Content>
                </Dropdown>

              </Dropdown.Segment>

            </Dropdown.SegmentedItem>
          )
        }
      </Dropdown>
    )
  }
}

export default pure(CreateSampleDropdown)
