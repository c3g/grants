import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import {
  startOfYear,
  endOfYear,
  addYears,
} from 'date-fns'


import HistoryActions from '../actions/history'
import { formatISO } from '../utils/time'

import Button from './Button'
import Input from './Input'
import Label from './Label'
import Title from './Title'
import Text from './Text'


const isISODate = date => /^\d{4}-\d{2}-\d{2}$/.test(date)

const initialRange = {
  start: formatISO(startOfYear(new Date())),
  end:   formatISO(endOfYear(new Date())),
}

class History extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      start: props.range.start,
      end: props.range.end,
    }
  }

  componentWillReceiveProps(props) {
    if (props.range !== this.props.range)
      this.setState({
        start: props.range.start,
        end: props.range.end,
      })
  }

  onSearch = () => {
    if (isISODate(this.state.start) && isISODate(this.state.end))
      HistoryActions.findByRange(this.state.start, this.state.end)
  }

  onChangeStart = start => {
    this.setState({ start })
  }

  onChangeEnd = end => {
    this.setState({ end })
  }

  render() {
    const {
      isLoading,
      range,
      data,
      users,
    } = this.props
    const { start, end } = this.state

    if (!isLoading && range.start === undefined)
      HistoryActions.findByRange(initialRange.start, initialRange.end)

    return (
      <section className='History'>
        <Title>History</Title>
        <Text medium block muted>
          History of changes in the database.
        </Text>

        <div className='row'>
          <Label htmlFor='start'>
            From
          </Label>
          <Input
            id='start'
            value={start}
            status={!isISODate(start) ? 'error' : undefined}
            disabled={isLoading}
            onEnter={this.onSearch}
            onChange={this.onChangeStart}
          />
          <Label htmlFor='end'>
            To
          </Label>
          <Input
            id='end'
            value={end}
            status={!isISODate(end) ? 'error' : undefined}
            disabled={isLoading}
            onEnter={this.onSearch}
            onChange={this.onChangeEnd}
          />
          <Button info icon='search' loading={isLoading} onClick={this.onSearch}>
            Search
          </Button>
        </div>

        <table className='History__table'>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {
              data.map(entry =>
                <tr key={entry.id}>
                  <td className='text-muted'>{ formatISO(entry.date) }</td>
                  <td>
                    { getUserName(users, entry.userID) }{' '}
                    { entry.description }{' '}
                    { getItemKind(entry) }{' '}
                    { entry.targetID }
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>

      </section>
    )
  }
}

function getUserName(users, id) {
  if (users.isLoading)
    return <span className='bold text-muted'>[{ id }]</span>

  const user = users.data[id]

  if (!user)
    return <span className='bold text-muted'>[DELETED USER]</span>

  if (user.isLoading)
    return <span className='bold text-muted'>[{ id }]</span>

  return <span className='bold'>{ user.data.name }</span>
}

function getItemKind(entry) {
  switch (entry.table) {
    case 'applicants': return 'applicant'
    case 'categories': return 'category'
    case 'fundings': return 'funding'
    case 'grants': return 'grant'
    case 'settings': return 'setting'
    case 'users': return 'user'
    default:
      return <span className='text-muted'>[UNKNOWN TABLE]</span>
  }
}

History.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  range: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  users: PropTypes.object.isRequired,
}

export default pure(History)
