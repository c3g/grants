import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import styled from 'styled-components'

import { getNewTemplate } from '../models'
import Button from './Button'
import Input from './Input'
import Label from './Label'
import Template from './Template'
import Title from './Title'


function Templates({
  isLoading,
  isCreating,
  data,
  settings,
  completionFunctions,
  onChange,
  onDelete,
  onCreate,
  onError
}) {

  const templates = Object.values(data)

  const onClickCreate = () =>
    onCreate(getNewTemplate())

  return (
    <section className='Templates'>

      <div className='HeaderBar row'>
        <Title large keepCase muted>
          GenAP FOLLOW
        </Title>

        <Title large keepCase>
          Templates
        </Title>
      </div>

      {
        templates.map(template =>
          <Template
            key={template.id}
            settings={settings}
            onChange={onChange}
            onDelete={onDelete}
            template={template}
            completionFunctions={completionFunctions}
          />
        )
      }
      {
        templates.length === 0 &&
          <div className='Template empty'>
            <div className='Steps' style={{ paddingLeft: 'calc(2 * var(--padding))'}}>
              <Label large muted>
                No templates yet
              </Label>
            </div>
          </div>
      }

      <div className='row hcenter'>
        <Button info onClick={onClickCreate} loading={isCreating}>
          Create
        </Button>

        <div className='fill' />

        <Label>
          <span className='text-info'>*</span> Has a completion function
        </Label>
      </div>

    </section>
  )
}

Templates.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  onCreate: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default pure(Templates)
