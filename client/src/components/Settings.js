import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import styled from 'styled-components'
import { sortBy, prop } from 'ramda'

import Global from '../actions/global'
import Setting from '../actions/settings'
import User from '../actions/users'
import Applicant from '../actions/applicants'
import Category from '../actions/categories'

import isColor from '../utils/is-color'
import uniq from '../utils/uniq'
import getEmails from '../utils/get-emails'
import Button from './Button'
import ColorPicker from './ColorPicker'
import EditableLabel from './EditableLabel'
import EditableList from './EditableList'
import Gap from './Gap'
import Input from './Input'
import Label from './Label'
import Text from './Text'
import Title from './Title'


const Group = styled.div`
  margin-bottom: 30px;
`

class Settings extends React.Component {

  static propTypes = {
    users: PropTypes.arrayOf(PropTypes.object).isRequired,
    applicants: PropTypes.object.isRequired,
    categories: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      whitelist: {},
      newApplicant: '',
      newCategory: { name: '', color: '#' },
      ...this.parseProps(props)
    }
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
    const list = this.state[which]

    const emails = uniq(getEmails(value))
    if (emails.length > 0)
      Setting.update(which, uniq(list.data.concat(emails)))
    else
      Global.showError(`Couldn't find any email in the input value.`)
  }

  onListDelete = (which, value) => {
    const list = this.state[which]

    Setting.update(which, list.data.filter(v => v !== value))
  }

  onDeleteUser = (id) => {
    User.delete(id)
  }

  onUpdateUserName = (id, name) => {
    const user = { ...this.props.users.find(u => u.id === id), name }
    User.update(id, user)
  }

  onUpdateUserEmail = (id, email) => {
    const user = { ...this.props.users.find(u => u.id === id), email }
    User.update(id, user)
  }

  onChangeNewApplicant = newApplicant => {
    this.setState({ newApplicant })
  }

  onCreateNewApplicant = () => {
    const {newApplicant} = this.state
    if (!newApplicant)
      return
    Applicant.create({ name: newApplicant })
    .then(() => this.setState({ newApplicant: '' }))
  }

  onChangeNewCategoryName = name => {
    this.setState({ newCategory: { ...this.state.newCategory, name } })
  }

  onChangeNewCategoryColor = color => {
    this.setState({ newCategory: { ...this.state.newCategory, color } })
  }

  onCreateNewCategory = () => {
    const {newCategory} = this.state
    if (!newCategory.name || !isColor(newCategory.color))
      return
    Category.create(newCategory)
    .then(() => this.setState({ newCategory: { name: '', color: '#' } }))
  }

  render() {
    const {
      users,
      applicants,
      categories,
    } = this.props

    const {
      whitelist,
      newApplicant,
      newCategory,
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

            <Group>
              <Title>Users</Title>
              <Text block muted>
                This is the list of users with an account. <br/>
              </Text>

              <table className='table Settings__table'>
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
                              <Label style={{ padding: '0 5px' }}>{user.name}</Label>
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
            </Group>
          </div>

          <Gap fill='40px' />

          <div className='Settings__right fill'>

            <Group>
              <Title>Applicants</Title>
              <Text block muted>
                This is the list of grant applicants. <br/>
              </Text>

              <table className='table Settings__table Settings__table__first'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    sortBy(prop('id'), applicants).map(applicant =>
                      <tr>
                        <td>
                          <EditableLabel
                            value={applicant.data.name}
                            onEnter={name => Applicant.update(applicant.data.id, { name })}
                          />
                        </td>
                        <td className='button-column'>
                          <Button
                            flat
                            square
                            small
                            icon='close'
                            disabled={applicant.isLoading}
                            onClick={() => Applicant.delete(applicant.data.id)}
                          />
                        </td>
                      </tr>
                    )
                  }
                  {
                    applicants.length === 0 &&
                      <tr className='empty'>
                        <td colSpan='2'>
                          No applicants yet
                        </td>
                      </tr>
                  }
                  <tr>
                    <td className='Settings__table__inputCell'>
                      <Input
                        placeholder='Create new applicant'
                        className='fill-width'
                        disabled={applicants.isCreating}
                        value={newApplicant}
                        onChange={this.onChangeNewApplicant}
                        onEnter={this.onCreateNewApplicant}
                      />
                    </td>
                    <td className='button-column'>
                      <Button
                        flat
                        square
                        small
                        icon='plus'
                        disabled={applicants.isCreating || applicants.isLoading}
                        onClick={this.onCreateNewApplicant}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Group>

            <Group>
              <Title>Categories</Title>
              <Text block muted>
                This is the list of grant categories. <br/>
              </Text>

              <table className='table Settings__table Settings__table__first'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Color</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {
                    sortBy(prop('id'), categories).map(category =>
                      <tr>
                        <td>
                          <EditableLabel
                            value={category.data.name}
                            onEnter={name => Category.update(category.data.id, { ...category.data, name })}
                          />
                        </td>
                        <td>
                          <ColorPicker
                            value={category.data.color}
                            onChange={color => Category.update(category.data.id, { ...category.data, color })}
                          />
                        </td>
                        <td className='button-column'>
                          <Button
                            flat
                            square
                            small
                            icon='close'
                            disabled={category.isLoading}
                            onClick={() => Category.delete(category.data.id)}
                          />
                        </td>
                      </tr>
                    )
                  }
                  {
                    categories.length === 0 &&
                      <tr className='empty'>
                        <td colSpan='3'>
                          No categories yet
                        </td>
                      </tr>
                  }
                  <tr>
                    <td className='Settings__table__inputCell'>
                      <Input
                        placeholder='Create new category'
                        className='fill-width'
                        disabled={categories.isCreating || categories.isLoading}
                        value={newCategory.name}
                        onChange={this.onChangeNewCategoryName}
                        onEnter={this.onCreateNewCategory}
                      />
                    </td>
                    <td>
                      <ColorPicker
                        value={newCategory.color}
                        onChange={this.onChangeNewCategoryColor}
                      />
                    </td>
                    <td className='button-column'>
                      <Button
                        flat
                        square
                        small
                        icon='plus'
                        disabled={categories.isCreating || categories.isLoading}
                        onClick={this.onCreateNewCategory}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Group>
          </div>
        </div>

      </section>
    )
  }
}

export default pure(Settings)
