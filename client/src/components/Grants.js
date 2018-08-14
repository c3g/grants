import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import styled from 'styled-components'
import { withRouter } from 'react-router'

import Global from '../actions/global'
import UI from '../actions/ui'
import Grant from '../actions/grants'

import filterTags from '../utils/filter-tags'
import uniq from '../utils/uniq'
import { getNewGrant } from '../models'
import Checkbox from './Checkbox'
import Dropdown from './Dropdown'
import FilterCategoriesDropdown from './FilterCategoriesDropdown'
import Gap from './Gap'
import Label from './Label'
import Spinner from './Spinner'
import Title from './Title'


class Grants extends React.Component {

  createNewGrant = () => {
    this.props.create(getNewGrant())
  }

  render() {
    return (
      <div className='Grants vbox'>
        <div className='Grants__timeline'>
          timeline
        </div>
        <div className='Grants__content fill'>
          content
        </div>
      </div>
    )
  }
}

export default withRouter(pure(Grants))
