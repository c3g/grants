import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import styled from 'styled-components'
import { withRouter } from 'react-router'
import {CanvasSpace, Pt, Group, Curve} from 'pts'
import {
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  addDays,
  addYears,
  addMonths,
  format,
  differenceInCalendarDays
} from 'date-fns'
import Color from 'color'
import { decay, pointer, value } from 'popmotion'
import { clamp, groupBy, prop, path } from 'ramda'

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


const formatISO = date => format(date, 'YYYY-MM-DD')
const formatAmount = n => `$ ${Number(n).toLocaleString()}`

const MAX_SCROLL_VELOCITY = 900
const clampScrollVelocity = clamp(-MAX_SCROLL_VELOCITY, MAX_SCROLL_VELOCITY)

const BACKGROUND_COLOR = '#f7f7f7'
const TEXT_COLOR = '#333'
const TEXT_COLOR_DARK = TEXT_COLOR
const TEXT_COLOR_LIGHT = '#ddd'
const LINE_COLOR  = '#999'
const YEAR_LINE_COLOR  = LINE_COLOR
const MONTH_LINE_COLOR = '#ddd'
const CURSOR_LINE_COLOR = '#ffa0a0'

const TIMELINE_HEIGHT = 30
const GRANT_HEIGHT = 100
const GRANT_MARGIN = 15
const GRANT_PADDING = 10
const TITLE_SIZE = 16
const TEXT_SIZE = 14
const TITLE_HEIGHT = TITLE_SIZE * 1.2
const TEXT_HEIGHT  = TEXT_SIZE * 1.5

const INITIAL_DATE = startOfYear(new Date())


class Grants extends React.Component {

  /**
   * @type HTMLCanvasElement
   */
  canvas = undefined

  /**
   * @type HTMLElement
   */
  element = undefined

  state = {
    width: window.innerWidth || 500,
    height: 200,
    scrollTop: 0,
    startDate: INITIAL_DATE,
    endDate: endOfYear(addYears(INITIAL_DATE, 2)),
  }

  space = {}

  componentDidMount() {
    this.updateDimensions()

    window.addEventListener('resize', this.onWindowResize)

    document.addEventListener('mouseup', this.onDocumentMouseUp)
    document.addEventListener('touchend', this.onDocumentTouchEnd)

    this.canvas.addEventListener('mousewheel', this.onMouseWheel)

    this.space = new CanvasSpace(this.canvas)
    this.space.setup({ bgcolor: BACKGROUND_COLOR })
    this.form = this.space.getForm()

    this.space.add(this.onUpdateSpace)
    this.space.play().bindMouse().bindTouch()

    this.setupDragging()
    this.setupScrolling()
  }

  componentDidUpdate() {
    this.updateDimensions()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize)
    document.removeEventListener('mouseup', this.onDocumentMouseUp)
    document.removeEventListener('touchend', this.onDocumentTouchEnd)
    this.canvas.removeEventListener('mousewheel', this.onMouseWheel)
  }

  updateDimensions() {
    const { width, height } = this.element.getBoundingClientRect()
    if (width !== this.state.width || height !== this.state.height) {
      this.setState({ width, height })
      return true
    }
    return false
  }

  getVisibleYears() {
    const years = []
    let current = startOfYear(this.state.startDate)
    while (current < this.state.endDate) {
      if (current >= this.state.startDate)
        years.push(current)
      current = addYears(current, 1)
    }
    return years
  }

  getVisibleMonths() {
    const months = []
    let current = startOfMonth(this.state.startDate)
    while (current < this.state.endDate) {
      if (current >= this.state.startDate)
        months.push(current)
      current = addMonths(current, 1)
    }
    return months
  }

  getVisibleDays() {
    return Math.abs(differenceInCalendarDays(this.state.startDate, this.state.endDate))
  }

  getMouseDate() {
    const { startDate, width } = this.state
    const {x} = this.space.pointer

    const visibleDays = this.getVisibleDays()
    const pixelsPerDay = width / visibleDays

    const days = Math.abs(x / pixelsPerDay)

    return addDays(startDate, days)
  }

  getMaxScrollHeight() {
    const grantsHeight = this.props.grants.length * (GRANT_HEIGHT + GRANT_MARGIN) + 3 * GRANT_MARGIN
    return Math.abs(this.state.height - grantsHeight)
  }

  getGrantHeight(i) {
    return (
      2 * GRANT_PADDING
      + TITLE_HEIGHT
      + 3 * TEXT_HEIGHT
      + this.props.grants[i].data.fields.length * TEXT_HEIGHT
    )
  }

  getGrantColor(grant) {
    if (this.props.categories.isLoading)
      return '#bbb'
    return this.props.categories.data[grant.data.categoryID].data.color
  }

  setCursor(type) {
    this.canvas.style.cursor = type
  }

  dateToX(date) {
    const visibleDays = this.getVisibleDays()
    const pixelsPerDay = this.state.width / visibleDays
    const days = differenceInCalendarDays(date, this.state.startDate)
    const x = days * pixelsPerDay
    return x
  }

  xToDate(x) {
    const visibleDays = this.getVisibleDays()
    const pixelsPerDay = this.state.width / visibleDays
    const days = Math.abs(x / pixelsPerDay)
    const date = addDays(this.state.startDate, days)
    return date
  }

  isMouseInRect(rect) {
    const {x, y} = this.space.pointer
    return x >= rect[0][0] && x <= rect[1][0] && y >= rect[0][1] && y <= rect[1][1]
  }

  isEventInRect(event, rect) {
    const x = event.clientX
    const y = event.clientY
    return x >= rect[0][0] && x <= rect[1][0] && y >= rect[0][1] && y <= rect[1][1]
  }

  drawText(position, text) {
    this.form.fill(TEXT_COLOR).font(14, 'bold')
      .text(position, text)
  }

  drawLine(position, color = LINE_COLOR, width = 1) {
    this.form.stroke(color, width).line(position)
  }

  drawBackground(years, months) {
    const { height } = this.state

    years.forEach(year => {
      const x = this.dateToX(year)
      this.drawLine([[x, 0], [x, height]], YEAR_LINE_COLOR)
    })

    months.forEach(month => {
      if (month.getTime() === startOfYear(month).getTime())
        return
      const x = this.dateToX(month)
      this.drawLine([[x, 0], [x, height]], MONTH_LINE_COLOR)
    })
  }

  drawTimeline(years, months) {
    const { width } = this.state

    this.form.fillOnly('#fff').rect([[0, 0], [width, TIMELINE_HEIGHT]])
    this.drawLine([[0, TIMELINE_HEIGHT], [width, TIMELINE_HEIGHT]])

    this.form.font(14, 'bold')

    const visibleDays = this.getVisibleDays()
    const pixelsPerDay = this.state.width / visibleDays

    const yearTextWidth = this.form.getTextWidth('0000')
    const minMonthWidth = 28 * pixelsPerDay

    let monthsAfterYear = 0
    while (yearTextWidth + 10 > minMonthWidth * monthsAfterYear) {
      monthsAfterYear++
    }

    const monthsByYear = groupBy(d => d.getFullYear(), months)

    years.forEach(year => {
      const x = this.dateToX(year)
      const text = format(year, 'YYYY')

      this.form.fill(TEXT_COLOR).text([x + 5, 5], text)
      this.drawLine([[x, 0], [x, TIMELINE_HEIGHT]], YEAR_LINE_COLOR)
    })

    Object.values(monthsByYear).forEach(months => {
      const offset = months[0].getMonth() === 0 ? 0 : 12 - months.length
      months.forEach((month, i) => {
        if (month.getTime() === startOfYear(month).getTime())
          return

        if ((i + offset) % monthsAfterYear !== 0)
          return

        const x = this.dateToX(month)
        const text = format(month, 'MMM')
        this.form.fill(MONTH_LINE_COLOR).text([x + 5, 5], text)
        this.drawLine([[x, 0], [x, TIMELINE_HEIGHT]], MONTH_LINE_COLOR)
      })
    })
  }

  drawGrants() {
    const {scrollTop} = this.state

    let currentY = 0 + TIMELINE_HEIGHT + GRANT_MARGIN
    this.grantsDimensions = []

    this.props.grants.forEach((grant, i) => {
      const startX = this.dateToX(grant.data.start)
      const endX   = this.dateToX(grant.data.end)
      const height = this.getGrantHeight(i)

      const startY = currentY + scrollTop
      const endY   = startY + height

      currentY += height + GRANT_MARGIN

      const rect = Group.fromArray([[startX, startY], [endX, endY]])
      const innerRect = Group.fromArray(addPadding([[startX, startY], [endX, endY]], GRANT_PADDING))
      this.grantsDimensions.push(rect)

      const isHover = this.isMouseInRect(rect)

      const color = isHover ? Color(this.getGrantColor(grant)).lighten(0.2) : Color(this.getGrantColor(grant))
      const borderColor = Color(this.getGrantColor(grant)).darken(0.5).toString()
      const textColor = color.isDark() ? TEXT_COLOR_LIGHT : TEXT_COLOR_DARK


      this.form.stroke(borderColor, 2).fill(color.toString()).rect(rect)

      // Text

      this.form.fill(textColor).font(TITLE_SIZE, 'bold').alignText('left')
        .textBox(innerRect, grant.data.name, "top", '…')
      innerRect[0].y += TITLE_HEIGHT

      this.form.fill(textColor).font(TEXT_SIZE, 'normal').alignText('left')
        .textBox(innerRect, `${formatISO(grant.data.start)} - ${formatISO(grant.data.end)}`, "top", '…')
      innerRect[0].y += TEXT_HEIGHT


      const drawLabel = (label, value) => {
        const valueWidth = this.form.getTextWidth(value)

        this.form.alignText('right').textBox(innerRect, value, 'top', '…')
        const originalRight = innerRect[1].x
        innerRect[1].x -= valueWidth + 5
        this.form.alignText('left').textBox(innerRect, label, 'top', '…')
        innerRect[1].x = originalRight
        innerRect[0].y += TEXT_HEIGHT
      }

      this.form.fill(textColor).font(TEXT_SIZE, 'normal')
      drawLabel('Project total:', formatAmount(grant.data.total))

      grant.data.fields.forEach(field => {
        drawLabel(`${field.name}:`, formatAmount(field.amount))
      })

      this.form.fill(textColor).font(TEXT_SIZE, 'bold')
      drawLabel(`Available co-funding:`, formatAmount(grant.data.cofunding))

      if (isHover)
        this.setCursor('pointer')
    })
  }

  drawFundings() {
    const fromGrant = groupBy(path(['data', 'fromGrantID']), Object.values(this.props.fundings.data))
    const toGrant   = groupBy(path(['data', 'toGrantID']),   Object.values(this.props.fundings.data))

    const detailsByGrant = {}
    this.props.grants.forEach((grant, i) => {
      const dimension = this.grantsDimensions[i]
      const height = dimension[1].y - dimension[0].y
      const availableHeight = height - 2 * GRANT_PADDING
      const links =
        (fromGrant[grant.data.id] ? fromGrant[grant.data.id].length : 0)
        + (toGrant[grant.data.id] ? toGrant[grant.data.id].length : 0)
      const sectionHeight = availableHeight / (links + 1)

      detailsByGrant[grant.data.id] = {
        grant: grant,
        dimension: dimension,
        y: dimension[0].y,
        paddingY: dimension[0].y + GRANT_PADDING,
        height: height,
        sectionHeight: sectionHeight,
        links: links,
        from: fromGrant[grant.data.id] || [],
        to:   toGrant[grant.data.id] || [],
        fromCount: 0,
        toCount: 0,
      }
    })

    const links = []
    Object.values(detailsByGrant).forEach(detail => {

      detail.from.forEach(funding => {
        const start = {
          x: this.dateToX(detail.grant.data.start),
          y: detail.paddingY
            + (detail.to.length * detail.sectionHeight)
            + ((1 + detail.fromCount++) * detail.sectionHeight)
        }
        const otherDetail = detailsByGrant[funding.data.toGrantID]
        const end = {
          x: this.dateToX(otherDetail.grant.data.start),
          y: otherDetail.paddingY
            + ((1 + otherDetail.toCount++) * otherDetail.sectionHeight)
        }

        links.push({ funding, start, end, detail })
      })
    })

    links.forEach(link => {

      const start = new Pt(link.start)
      const end   = new Pt(link.end)

      const smallerX = Math.min(start.x, end.x)
      const dx = Math.abs(link.end.x - link.start.x)
      const dy = Math.abs(link.end.y - link.start.y)
      const anchorX = smallerX - 30 - (dx / 10)

      const heightOffset = ((link.detail.height - (start.y - link.detail.y)) / 2)

      const startAnchor = new Pt({ x: anchorX, y: start.y + heightOffset + (dy / 10) })
      const endAnchor   = new Pt({ x: anchorX, y: end.y })

      const points = [
        start,
        startAnchor,
        endAnchor,
        end,
      ]
      // points.forEach(p => this.form.fillOnly('#000').point(p, 3, 'circle'))

      const color = Color(this.getGrantColor(link.detail.grant)).darken(0.1).toString()

      this.form.strokeOnly(color, 2).line(Curve.bezier(points, 50))
      this.form.strokeOnly(color, 2, undefined, 'round').line([end, end.$subtract(10, 8)])
      this.form.strokeOnly(color, 2, undefined, 'round').line([end, end.$subtract(10, -8)])

      const middlePoint = new Pt(calculateBezierPoint(0.6, points))

      const text = formatAmount(link.funding.data.amount)
      const rect = [middlePoint, middlePoint.$add(this.form.getTextWidth(text) - 2, TEXT_HEIGHT- 2)]

      // this.form.stroke(TEXT_COLOR, 1).fill('#fff').rect(rect)
      this.form.fill(TEXT_COLOR, 1).font(TEXT_SIZE, 'bold')
        .text(middlePoint.$add(10, (2 - TEXT_HEIGHT / 2)), text)
      this.form.fillOnly('#000').point(middlePoint, 2, 'circle')
    })
  }

  onUpdateSpace = (time, ftime) => {
    const {startDate, endDate, width, height, scrollTop} = this.state

    const visibleDays = this.getVisibleDays()
    const pixelsPerDay = width / visibleDays

    const years = this.getVisibleYears()
    const months = this.getVisibleMonths()

    const context = this.canvas.getContext('2d')

    /*
     * Drawing
     */

    this.setCursor('default')


    this.drawBackground(years, months)

    const pointerX = this.space.pointer.x
    this.drawLine([[pointerX, TIMELINE_HEIGHT], [pointerX, height]], CURSOR_LINE_COLOR, 2)

    this.drawGrants()

    this.drawFundings()

    this.drawTimeline(years, months)
  }

  onWindowResize = () => {
    this.updateDimensions()
  }

  onMouseWheel = (event) => {
    event.preventDefault()

    if (event.ctrlKey) {
      /*
       * Zoom
       */
      const zoomIn = event.deltaY > 0
      const visibleDays = this.getVisibleDays()

      // We zoom by -+10%, so we add -+5% on each boundary
      const deltaDays = Math.round(visibleDays * 0.05)

      const startDate = addDays(this.state.startDate, deltaDays * (zoomIn ? -1 : 1))
      const endDate   = addDays(this.state.endDate,   deltaDays * (zoomIn ? 1 : -1))

      this.xSlider.stop()
      this.scrollSlider.stop()
      this.setState({ startDate, endDate })
      this.setupDragging()
    }
    else if (event.deltaX === 0 && event.deltaY !== 0) {
      /*
       * Vertical scroll
       */

      const direction = -event.deltaY / Math.abs(event.deltaY)
      const delta = direction * 50
      const scrollTop = this.scrollSlider.get()
      const velocity =  this.scrollSlider.getVelocity()
      const isOpposed = (delta < 0 && velocity > 0) || (delta > 0 && velocity < 0)
      let newVelocity =
        clampScrollVelocity(isOpposed ?
          delta :
          delta + this.scrollSlider.getVelocity())

      /* if ((scrollTop <= 0 && newVelocity < 0)
          || (scrollTop >= this.getMaxScrollHeight() && newVelocity > 0))
        newVelocity = 0 */

      // console.log(delta, velocity, isOpposed)

      console.assert(this.state.scrollTop === scrollTop, 'Invalid scrollTop')

      this.scrollSlider.stop()
      this.xSlider.stop()

      decay({
        from: this.scrollSlider.get(),
        velocity: newVelocity,
        power: 0.3,
        timeConstant: 200,
        // restDelta: 0.9,
        // modifyTarget: v => Math.round(v / 10) * 10
      })
        .pipe(scrollTop => {
          if (this.state.height < this.getMaxScrollHeight()) {
            return clamp(0, this.getMaxScrollHeight(), scrollTop)
          }
          //const diffHeight = this.state.heigth - this.getMaxScrollHeight()
          return scrollTop // clamp(-diffHeight, diffHeight, scrollTop)
        })
        .start(this.scrollSlider)
    }
  }

  onMouseMove = (event) => {
    if (this.isDragging)
      this.didDrag = true
    this.forceUpdate()
  }

  onMouseDown = (event) => {
    if (!event.shiftKey) {
      this.isDragging = true
      this.didDrag = false
      this.onStartDrag()
      return
    }
  }

  onDocumentMouseUp = (event) => {
    if (!event.shiftKey) {
      this.onStopDrag()
      return
    }

  }

  onTouchStart = this.onStartDrag

  onDocumentTouchEnd = this.onStopDrag

  onStartDrag = () => {
    this.scrollSlider.stop()

    pointer({ x: this.xSlider.get() })
      .pipe(({ x }) => x)
      .start(this.xSlider);
  }

  onStopDrag = () => {
    decay({
      from: this.xSlider.get(),
      velocity: this.xSlider.getVelocity(),
      power: 0.7,
      // timeConstant: 350,
      // restDelta: 0.5,
      // modifyTarget: v => v
    })
      .start(this.xSlider);
  }

  onClick = (event) => {
    if (this.didDrag)
      return
    const index = this.grantsDimensions.findIndex(d => this.isEventInRect(event, d))
    const grant = index !== -1 ? this.props.grants[index] : undefined
    console.log(grant)
  }

  setupScrolling() {
    this.scrollSlider = value(this.state.scrollTop, (scrollTop) => {
      if (scrollTop !== this.state.scrollTop)
        this.setState({ scrollTop })

      return scrollTop
    })
  }

  setupDragging() {
    this.initialDate = this.state.startDate

    this.xSlider = value(0, (x) => {
      const visibleDays = this.getVisibleDays()
      const pixelsPerDay = this.state.width / visibleDays

      const days = -x / pixelsPerDay

      const startDate = addDays(this.initialDate, days)
      const endDate   = addDays(startDate, visibleDays)

      this.setState({ startDate, endDate })

      return x
    })
  }

  onRef = (ref) => {
    if (ref)
      this.element = ref
  }

  onRefCanvas = (ref) => {
    if (ref)
      this.canvas = ref
  }

  render() {
    const {width, height} = this.state

    const hasPointer = this.space.pointer
    const {pointer = {x: -100, y: -100}} = this.space

    return (
      <div className='Grants' ref={this.onRef}>

        <canvas
          className='Grants__canvas'
          width={width}
          height={height}
          ref={this.onRefCanvas}
          onClick={this.onClick}
          onMouseMove={this.onMouseMove}
          onMouseDown={this.onMouseDown}
          onTouchStart={this.onTouchStart}
        />

        <div className='Grants__mouseDate'
          style={{
            display: hasPointer ? 'block' : 'none',
            top:  pointer.y,
            left: pointer.x + 20,
          }}
        >
          { hasPointer ? format(this.getMouseDate(), 'MMM D, YYYY') : null }
        </div>
      </div>
    )
  }
}

function addPadding(r, top, right = top, bottom = top, left = right) {
  return [
    [r[0][0] + left, r[0][1] + top],
    [r[1][0] - right, r[1][1] - bottom],
  ]
}

function calculateBezierPoint(t, p) {
  const order = p.length - 1
  const mt = 1 - t

  const mt2 = mt * mt
  const t2 = t * t
  let a
  let b
  let c
  let d = 0

  if (order === 2) {
    p = [p[0], p[1], p[2], [0, 0]];
    a = mt2;
    b = mt * t * 2;
    c = t2;
  } else if (order === 3) {
    a = mt2 * mt;
    b = mt2 * t * 3;
    c = mt * t2 * 3;
    d = t * t2;
  }

  return {
    x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
    y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
  }
}

export default withRouter(pure(Grants))
