import React from 'react'
import Prop from 'prop-types'
import pure from 'recompose/pure'
import matchSorter from 'match-sorter'

import alphabeticalSort from '../helpers/alphabetical-sort'
import Dropdown from './Dropdown'
import Icon from './Icon'
import Input from './Input'
import Text from './Text'


class FilteringDropdown extends React.Component {
  static propTypes = {
    items: Prop.arrayOf(Prop.object).isRequired,
    selectedItems: Prop.arrayOf(Prop.any).isRequired,
    setItems: Prop.func.isRequired,
    selectItem: Prop.func.isRequired,
    deselectItem: Prop.func.isRequired,
    className: Prop.string,
    label: Prop.string,
    renderItem: Prop.func,
    getItemText: Prop.func,
    onCreate: Prop.func,
    clearInputOnSelect: Prop.boolean,
  }

  static defaultProps = {
    getItemText: x => x,
    clearInputOnSelect: false,
  }

  constructor(props) {
    super(props)
    this.state = {
      value: '',
    }
  }

  clearValue = () => {
    this.setState({ value: '' })
  }

  clearItems = () => {
    this.props.setItems([])
    this.clearValue()
  }

  onCreate = () => {
    this.props.onCreate(this.state.value)
    this.clearValue()
  }

  onClickItem = (item) => {
    if (!this.props.selectedItems.includes(item))
      this.props.setItems(this.props.selectedItems.concat(item))
    else
      this.props.setItems(this.props.selectedItems.filter(i => i !== item))

    if (this.props.clearInputOnSelect)
      this.clearValue()
  }

  render() {
    const { items, selectedItems, renderItem, getItemText, label, className, ...rest } = this.props
    const { value } = this.state

    const visibleItems = matchSorter(
      items.map(item => ({ item, text: getItemText(item) })),
      value,
      { keys: ['text'] }
    ).map(result => result.item)

    return (
      <Dropdown
        className={className}
        closeOnClick={false}
        label={label === undefined ?
          (selectedItems.join(', ') || <span>&nbsp;</span>) :
          (label || <span>&nbsp;</span>)}
        onOpen={this.clearValue}
        {...rest}
      >
        <Dropdown.Content className='FilteringDropdown__input'>
          <Input
            showClearButton
            className='fill-width'
            value={value}
            onChange={value => this.setState({ value })}
            onEnter={this.onEnter}
          />
        </Dropdown.Content>
        <Dropdown.Item
          onClick={this.clearItems}
          disabled={selectedItems.length === 0}
        >
          <Icon
            muted
            name='times-circle'
            marginRight={10}
          /> <Text bold>Clear all</Text>
        </Dropdown.Item>
        {
          visibleItems.length === 0 &&
            <Dropdown.Content>
              <Text muted>No items</Text>
            </Dropdown.Content>
        }

        <div className='FilteringDropdown__items'>
        {
          alphabeticalSort(visibleItems, getItemText).map(item =>
            <Dropdown.Item key={item}
              onClick={() => this.onClickItem(item)}
            >
              <Icon
                name={selectedItems.includes(item) ? 'check-square-o' : 'square-o'}
                marginRight={10}
              /> {
                renderItem ?
                  renderItem(item, value) :
                getItemText ?
                  highlightValue(getItemText(item), value) :
                  item
              }
            </Dropdown.Item>
          )
        }
        </div>

        {

          (this.props.onCreate && value && !items.some(i => getItemText(i) === value)) &&
            <Dropdown.Item
              onClick={this.onCreate}
            >
              <Icon
                muted
                name='plus-circle'
                marginRight={10}
              /> Create&nbsp;<Text bold>{ value }</Text>
            </Dropdown.Item>
        }
        {
          items.length - visibleItems.length > 0 &&
            <Dropdown.Content>
              <Text muted>{ items.length - visibleItems.length } items filtered</Text>
            </Dropdown.Content>
        }
      </Dropdown>
    )
  }
}

function highlightValue(text, value) {
  if (!value)
    return text
  const parts = text.replace(new RegExp(value, 'g'), '####').split('####')
  const result = []
  parts.forEach((p, i) => {
    if (/^ /.test(p))
      result.push(<Text>&nbsp;</Text>)
    result.push(p)
    if (/ $/.test(p))
      result.push(<Text>&nbsp;</Text>)
    if (i !== parts.length - 1)
      result.push(<span style={{ fontWeight: 'bold' }}>{value}</span>)
      if (/ $/.test(value))
        result.push(<Text>&nbsp;</Text>)
  })
  return result
}

export default pure(FilteringDropdown)
