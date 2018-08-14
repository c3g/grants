import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import styled from 'styled-components'
import { sortBy, prop } from 'ramda'

import uniq from '../utils/uniq'
import getEmails from '../utils/get-emails'
import Button from './Button'
import EditableLabel from './EditableLabel'
import EditableList from './EditableList'
import Label from './Label'
import Text from './Text'
import Title from './Title'


const Group = styled.div`
  margin-bottom: calc(6 * var(--padding));
`

class Settings extends React.Component {
  constructor(props) {
    super(props)

    this.state = Object.assign({
      whitelist: {},
    }, this.parseProps(props))
  }

  componentWillReceiveProps(props) {
    this.setState(this.parseProps(props))
  }

  parseProps(props) {
    const { data } = props

    const state = {}

    Object.keys(data).forEach(key => {
      const value = data[key]

      if (!value.isLoading) {
        state[key] = value
      } else {
        state[key] = { isLoading: true, data: this.state[key] ? this.state[key].data : value.data }
      }
    })

    return state
  }

  onListAdd = (which, value) => {
    const { onChange, onError } = this.props
    const list = this.state[which]

    const emails = uniq(getEmails(value))
    if (emails.length > 0)
      onChange(which, uniq(list.data.concat(emails)))
    else
      onError(`Couldn't find any email in the input value.`)
  }

  onListDelete = (which, value) => {
    const { onChange } = this.props
    const list = this.state[which]

    onChange(which, list.data.filter(v => v !== value))
  }

  onDeleteUser = (id) => {
    this.props.deleteUser(id)
  }

  onUpdateUserName = (id, name) => {
    const user = { ...this.props.users.find(u => u.id === id), name }
    this.props.updateUser(id, user)
  }

  onUpdateUserEmail = (id, email) => {
    const user = { ...this.props.users.find(u => u.id === id), email }
    this.props.updateUser(id, user)
  }

  render() {
    const {
      users,
    } = this.props

    const {
      whitelist
    } = this.state

    return (
      <section className='Settings vbox'>

        <div className='Settings__content hbox'>
          <div className='Settings__left fill'>
            <Group>
              <Title>Whitelist</Title>
              <Text block muted>
                Emails in this list are allowed to log-in/sign-up to this application.
              </Text>
              <EditableList
                help='Multiple emails allowed. Press <Enter> to submit.'
                placeHolder='Add email…'
                loading={whitelist.isLoading}
                values={whitelist.data || []}
                onAdd={value => this.onListAdd('whitelist', value)}
                onDelete={value => this.onListDelete('whitelist', value)}
              />
            </Group>
          </div>

          <div className='Settings__right fill'>

            <Title>Users</Title>
            <Text block muted>
              This is the list of users with an account. <br/>
            </Text>

            <table className='table UsersTable'>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {
                  sortBy(prop('id'), users).map(user =>
                    <tr>
                      <td>
                        {
                          user.googleID === null ?
                            <Label>{user.name}</Label>
                            :
                            <EditableLabel
                              value={user.name}
                              onEnter={name => this.onUpdateUserName(user.id, name)}
                            />
                        }
                      </td>
                      <td>
                        {
                          user.googleID === null ?
                            <Label>{user.email}</Label>
                            :
                            <EditableLabel
                              value={user.email}
                              onEnter={email => this.onUpdateUserEmail(user.id, email)}
                            />
                        }
                    </td>
                      <td className='button-column'>
                        {
                          user.googleID !== null &&
                            <Button
                              flat
                              square
                              small
                              icon='close'
                              onClick={() => this.onDeleteUser(user.id)}
                            />
                        }
                      </td>
                    </tr>
                  )
                }
                {
                  users.length === 0 &&
                    <tr className='empty'>
                      <td colSpan='3'>
                        No users yet
                      </td>
                    </tr>
                }
              </tbody>
            </table>

          </div>
        </div>

      </section>
    )
  }
}

Settings.propTypes = {
  data: PropTypes.object.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  deleteUser: PropTypes.func.isRequired,
  updateUser: PropTypes.func.isRequired,
}

export default pure(Settings)
