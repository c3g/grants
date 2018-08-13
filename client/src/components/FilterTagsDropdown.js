import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import matchSorter from 'match-sorter'

import alphabeticalSort from '../utils/alphabetical-sort'
import Badge from './Badge'
import Button from './Button'
import Dropdown from './Dropdown'
import Gap from './Gap'
import Icon from './Icon'
import Input from './Input'
import Label from './Label'
import Spinner from './Spinner'
import Text from './Text'


class FilterTagsDropdown extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
    }
  }

  clearValue = () => {
    this.setState({ value: '' })
  }

  clearTags = () => {
    this.props.setFilteringTags([])
    this.clearValue()
  }

  render() {
    const { tags, selectedTags, } = this.props
    const { value } = this.state

    const visibleTags = matchSorter(tags, value)

    return (
      <Dropdown
        closeOnClick={false}
        label={selectedTags.join(', ') || <span>&nbsp;</span>}
        onOpen={this.clearValue}
      >
        <Dropdown.Content className='FilterTags__input'>
          <Input
            value={value}
            onChange={value => this.setState({ value })}
          />
        </Dropdown.Content>
        <Dropdown.Item
          onClick={this.clearTags}
          disabled={selectedTags.length === 0}
        >
          <Icon
            muted
            name='times-circle'
            marginRight={10}
          /> <Text bold>Clear selection</Text>
        </Dropdown.Item>
        {
          alphabeticalSort(visibleTags).map(tag =>
            <Dropdown.Item key={tag}
              onClick={() => selectedTags.includes(tag) ?
                this.props.deleteFilteringTag(tag) :
                this.props.addFilteringTag(tag)
              }
            >
              <Icon
                name={selectedTags.includes(tag) ? 'check-square' : 'square'}
                marginRight={10}
              /> <Badge info>{ tag }</Badge>
            </Dropdown.Item>
          )
        }
        {
          tags.length - visibleTags.length > 0 &&
            <Dropdown.Content>
              <Text muted>{ tags.length - visibleTags.length } tags filtered</Text>
            </Dropdown.Content>
        }
      </Dropdown>
    )
  }
}

export default pure(FilterTagsDropdown)
