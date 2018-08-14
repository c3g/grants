import React from 'react'
import { findDOMNode } from 'react-dom'
import prop from 'prop-types'
import { Link } from 'react-router-dom'
import classname from 'classname'

import Icon from './Icon'
import Tooltip from './Tooltip'

/* {
   index: 0,
   items: [
     { type: 'item', icon: 'settings', title: 'Settings' },
     { type: 'item', icon: 'view_list' },
     { type: 'item', icon: 'edit' },
   ],
 } */

const Item = prop.shape({
  type: prop.oneOf(['item']),
  icon: prop.string,
  path: prop.string.isRequired,
  title: prop.string,
  showTitle: prop.bool,
})

class Navbar extends React.Component {
  static propTypes = {
    index: prop.number.isRequired,
    items: prop.arrayOf(Item).isRequired,
    direction: prop.oneOf(['vertical', 'horizontal']),
    visible: prop.bool.isRequired,
    children: prop.any,
  }

  static defaultProps = {
    direction: 'vertical',
    children: undefined,
  }

  elements = []

  state = {
    borderTop: undefined,
    borderLeft: undefined,
  }

  componentDidMount() {
    this.updateBorder()
  }

  componentWillReceiveProps() {
    this.elements = []
  }

  componentDidUpdate() {
    this.updateBorder()
  }

  updateBorder() {
    const isVertical = this.props.direction === 'vertical'
    const { index = 0 } = this.props

    if (isVertical) {
      const borderTop =
        this.elements.slice(0, index)
          .map(e => e.getBoundingClientRect().height)
          .reduce((acc, cur) => acc + cur, 0)

      if (borderTop !== this.state.borderTop)
        this.setState({ borderTop })
    } else {
      const borderLeft =
        this.elements.slice(0, index)
          .map(e => e.getBoundingClientRect().width)
          .reduce((acc, cur) => acc + cur, 0)

      if (borderLeft !== this.state.borderLeft)
        this.setState({ borderLeft })
    }
  }

  getBorderStyle() {
    const isVertical = this.props.direction === 'vertical'
    const hasElement = this.elements.length > this.props.index && this.props.index !== -1
    const rect = hasElement ?
      this.elements[this.props.index].getBoundingClientRect() :
      { width: 0, height: 0}

    return isVertical ? {
      top: this.state.borderTop,
      height: rect.height
    } : {
      left: this.state.borderLeft,
      width: rect.width
    }
  }

  render() {
    const {
      index,
      items,
      visible,
      direction,
      children,
    } = this.props

    const navClassName = classname('Navbar', {
      visible,
      [direction]: true,
      'vbox': direction === 'vertical',
      'hbox': direction === 'horizontal',
    })
    const navItemsClassName = classname('Navbar__items', {
      'vbox': direction === 'vertical',
      'hbox': direction === 'horizontal',
    })

    const childrenArray =
      React.Children.toArray(children)
        .map(c => React.cloneElement(c, { direction }))

    const title = childrenArray.find(c => c.type === Navbar.Title)
    const buttons = childrenArray.filter(c => c.type === Navbar.Button)

    return (
      <div className={navClassName}>
        { title }

        <div className={navItemsClassName}>
          {
            items.map((n, i) =>
              <Tooltip content={n.title} position='right' key={n.icon + n.title + n.path}>
                <Link key={i}
                  className={'Navbar__item ' + (i === index ? 'active' : '')}
                  to={n.path}
                  ref={e => {
                    if (e === null)
                      return
                    const node = findDOMNode(e)
                    if (!this.elements.includes(node))
                      this.elements.push(node)
                  }}
                >
                  { n.icon &&
                    <Icon large name={n.icon} className='Navbar__icon'/>
                  } { n.label &&
                    n.label
                  }
                </Link>
              </Tooltip>
            )
          }
          <div className='Navbar__border' style={this.getBorderStyle()} />
        </div>

        <div className='fill' />

        { buttons }

      </div>
    )
  }
}

Navbar.Button = function Button({ icon, title, direction, onClick, ...rest }) {
  const element = (
    <button className='Navbar__item' onClick={onClick} {...rest}>
      <Icon large name={icon} />
    </button>
  )

  if (!title)
    return element

  return (
    <Tooltip content={title} position={direction === 'vertical' ? 'right' : 'bottom'}>
      { element }
    </Tooltip>
  )
}

Navbar.Title = function Title({ children }) {
  return (
    <div className='Navbar__title title'>
      { children }
    </div>
  )
}

export default Navbar
