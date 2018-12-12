import React from 'react'
import PropTypes from 'prop-types'
import cuid from 'cuid'

import { isOlderThan, MINUTES } from '../helpers/time'
import Icon from './Icon'
import Input from './Input'
import Button from './Button'

/*
 * Types:
 *   normal, info, success, warning, error
 *
 * Notification:
 *   { type: 'info', message: 'Hello' }
 *   { type: 'error', title: 'Oh no!', message: 'Hello' }
 */

const animationDelay = 500
const notificationDelay = 10 * 1000

class Notifications extends React.Component {
  static propTypes = {
    list: PropTypes.array.isRequired,
  }

  constructor() {
    super()

    this.infos = new WeakMap()

    this.state = { udpate: 0 }
  }

  update() {
    this.setState({ update: +new Date() })
  }

  get(notification) {
    if (!this.infos.has(notification)) {
      this.infos.set(notification, { closed: false, closing: false, creation: new Date(), id: cuid() })
      setTimeout(() => this.close(notification), notificationDelay)
    }
    return this.infos.get(notification)
  }

  close(notification) {
    const info = this.infos.get(notification)
    if (!info.closed && !info.closing) {
      info.closing = true
      this.infos.set(notification, info)
      this.update()
      setTimeout(() => {
        info.closed = true
        info.closing = false
        this.update()
      }, animationDelay)
    }
  }

  closeAll = () => {
    this.props.list.forEach(notification => this.close(notification))
  }

  render() {
    const { list } = this.props

    const shownItems = list
      .map(notification => {
        const info = this.get(notification)
        return { notification, info }
      })
      .filter(item => !item.info.closed)

    return (
      <div className='Notifications'>
        {
          shownItems.map((item, i) => {
            const className = 'Notification has-close '
              + (item.notification.type || '') + ' '
              + (item.info.closing ? 'remove ' : ' ')
              + (item.notification.details !== undefined ? 'has-details' : '') + ' '
              + (item.notification.stack !== undefined ? 'has-stack' : '') + ' '

            return (
              <div key={item.info.id} className={className}>
                <div className='before'>
                  {
                    item.notification.icon &&
                      <Icon name={item.notification.icon} />
                  }
                </div>
                <div className='content'>
                  <div className='message item'>
                  {
                    item.notification.message
                  }
                  </div>
                  <div className='details item'>
                  {
                    item.notification.details
                  }
                  </div>
                  <div className='stack-container item'>
                  {
                    item.notification.stack !== undefined &&
                    item.notification.stack.slice(1, 5).map(line =>
                      <div className='line'>{ line }</div>
                    )
                  }
                  {
                    item.notification.stack !== undefined &&
                    item.notification.stack.length > 5 &&
                      <div className='line'>...</div>
                  }
                  </div>
                </div>
                <button className='close' onClick={() => this.close(item.notification)}>
                  <Icon name='close' />
                </button>
                {
                  i === 0 && shownItems.length > 1 &&
                    <button className='close-all' onClick={this.closeAll}>
                      Close All
                    </button>
                }
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default Notifications
