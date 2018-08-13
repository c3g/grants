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


class FilterCategoriesDropdown extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
    }
  }

  clearValue = () => {
    this.setState({ value: '' })
  }

  clearCategories = () => {
    this.props.setFilteringCategories([])
    this.clearValue()
  }

  render() {
    const { tags, selectedCategories, } = this.props
    const { value } = this.state

    const visibleCategories = matchSorter(tags, value)

    return (
      <Dropdown
        closeOnClick={false}
        label={selectedCategories.join(', ') || <span>&nbsp;</span>}
        onOpen={this.clearValue}
      >
        <Dropdown.Content className='FilterCategories__input'>
          <Input
            value={value}
            onChange={value => this.setState({ value })}
          />
        </Dropdown.Content>
        <Dropdown.Item
          onClick={this.clearCategories}
          disabled={selectedCategories.length === 0}
        >
          <Icon
            muted
            name='times-circle'
            marginRight={10}
          /> <Text bold>Clear selection</Text>
        </Dropdown.Item>
        {
          alphabeticalSort(visibleCategories).map(tag =>
            <Dropdown.Item key={tag}
              onClick={() => selectedCategories.includes(tag) ?
                this.props.deleteFilteringTag(tag) :
                this.props.addFilteringTag(tag)
              }
            >
              <Icon
                name={selectedCategories.includes(tag) ? 'check-square' : 'square'}
                marginRight={10}
              /> <Badge info>{ tag }</Badge>
            </Dropdown.Item>
          )
        }
        {
          tags.length - visibleCategories.length > 0 &&
            <Dropdown.Content>
              <Text muted>{ tags.length - visibleCategories.length } tags filtered</Text>
            </Dropdown.Content>
        }
      </Dropdown>
    )
  }
}

export default pure(FilterCategoriesDropdown)
