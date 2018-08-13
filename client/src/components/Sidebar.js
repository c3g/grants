import React from 'react'
import { Link } from 'react-router-dom'
import classname from 'classname'

import Icon from './Icon'
import Tooltip from './Tooltip'

/*{
   index: 0,
   items: [
     { type: 'item', icon: 'settings', title: 'Settings' },
     { type: 'item', icon: 'view_list' },
     { type: 'item', icon: 'edit' },
   ],
 }*/

class Sidebar extends React.Component {
  render() {
    const {
      index,
      items,
      visible,
      children
    } = this.props

    return (
      <div className={ classname('Sidebar vbox', { visible }) }>
        {
          items.map((n, i) =>
            <Tooltip content={n.title} position='right'>
              <Link key={i} className={'Sidebar__item ' + (i === index ? 'active' : '')}
                to={n.path}
              >
                <Icon large name={n.icon} />
              </Link>
            </Tooltip>
          )
        }
        <div className='fill' />

        { children }

        <div className='Sidebar__border' style={{ top: index * 40 }} />
      </div>
    )
  }
}

Sidebar.Button = function({ icon, title, onClick, ...rest }) {
  const element = (
    <button className='Sidebar__item' onClick={onClick} {...rest}>
      <Icon large name={icon} />
    </button>
  )

  if (!title)
    return element

  return (
    <Tooltip content={title} position='right'>
      { element }
    </Tooltip>
  )
}

export default Sidebar
