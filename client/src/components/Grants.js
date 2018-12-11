import React from 'react'
import Prop from 'prop-types'
import pure from 'recompose/pure'
import {CanvasSpace, Pt, Group, Curve, Rectangle} from 'pts/dist/es5.js'
import {
  startOfYear,
  endOfYear,
  startOfMonth,
  startOfDay,
  addDays,
  addYears,
  addMonths,
  format,
  differenceInCalendarDays
} from 'date-fns'
import Color from 'color'
import { decay, pointer, value } from 'popmotion'
import { clamp, groupBy, path, lensPath, set } from 'ramda'

import Grant from '../actions/grants'
import Funding from '../actions/fundings'

import {formatISO} from '../utils/time'
import Status from '../constants/status'
import { getNewGrant, getNewFunding } from '../models'
import Button from './Button'
import FilteringDropdown from './FilteringDropdown'
import GrantEditor from './GrantEditor'
import Icon from './Icon'
import Input from './Input'
import Label from './Label'
import Modal from './Modal'
import Text from './Text'


const formatAmount = n => `$ ${Number(n).toLocaleString()}`
const parseAmount = s => parseInt(s.replace(/,/g, ''), 10)

const today = () => new Date()

const STORAGE_KEY = 'GRANTS_TIMELINE_VIEW'

const I = () => {}

const MAX_SCROLL_VELOCITY = 1200
const clampScrollVelocity = clamp(-MAX_SCROLL_VELOCITY, MAX_SCROLL_VELOCITY)

const BLACK = '#000'
const WHITE = '#fff'
const BACKGROUND_COLOR = '#f7f7f7'
const SELECTION_COLOR = 'rgba(166, 203, 255, 0.4)'
const TEXT_COLOR       = '#333'
const TEXT_COLOR_DARK  = TEXT_COLOR
const TEXT_COLOR_LIGHT = '#eee'
const LINE_COLOR        = '#999'
const YEAR_LINE_COLOR   = LINE_COLOR
const MONTH_LINE_COLOR  = '#ddd'
const CURSOR_LINE_COLOR = '#ffa0a0'
const TIMELINE_BACKGROUND = BACKGROUND_COLOR
const TOOLTIP_BACKGROUND = 'rgba(0, 0, 0, 0.6)'

const TIMELINE_HEIGHT = 30
const GRANT_HEIGHT = 100
const GRANT_MARGIN = 15
const GRANT_PADDING = 10
const TITLE_SIZE = 16
const TEXT_SIZE = 14
const TEXT_SIZE_SMALL = 12
const TITLE_HEIGHT = TITLE_SIZE * 1.2
const TEXT_HEIGHT  = TEXT_SIZE * 1.5

const FONT_FAMILY = 'Ubuntu'

const INITIAL_DATE = startOfYear(today())

const DEFAULT_FILTERS = {
  categories: [],
  applicants: [],
  status: ['SUBMITTED', 'ACCEPTED', 'FINISHED'], // 'NOT_ACCEPTED'
  grants: [],
}


class Grants extends React.Component {
  static propTypes = {
    grants: Prop.arrayOf(Prop.object).isRequired,
    applicants: Prop.object.isRequired,
    fundings: Prop.arrayOf(Prop.object).isRequired,
    categories: Prop.object.isRequired,
  }

  /**
   * @type HTMLCanvasElement
   */
  canvas = undefined

  /**
   * @type HTMLElement
   */
  element = undefined

  space = {}

  constructor(props) {
    super(props)

    sortByStartDate(props.grants)

    const filters = DEFAULT_FILTERS

    const savedView = window.localStorage[STORAGE_KEY] ? JSON.parse(window.localStorage[STORAGE_KEY]) : {}

    this.state = {
      width: window.innerWidth || 500,
      height: 200,
      scrollTop: 0,
      startDate: savedView.startDate ? new Date(savedView.startDate) : INITIAL_DATE,
      endDate:   savedView.endDate   ? new Date(savedView.endDate)   : endOfYear(addYears(INITIAL_DATE, 2)),

      mouseHover: false,

      grantMode: false,
      grant: null,
      fundingMode: false,
      funding: null,

      filters: filters,

      inputValue: '',

      deleteGrantID: undefined,

      // derived
      grants: filterGrants(filters, props.grants, props.fundings),
      grantsHover: props.grants.reduce((acc, grant) => {
        acc[grant.data.id] = false
        return acc
      }, {}),
    }
  }

  componentDidMount() {
    this.updateDimensions()

    window.addEventListener('resize', this.onWindowResize)
    window.addEventListener('blur',   this.onWindowBlur)
    window.addEventListener('unload', this.onWindowUnload)

    document.addEventListener('mouseup', this.onDocumentMouseUp)
    document.addEventListener('touchend', this.onDocumentTouchEnd)
    document.addEventListener('keydown', this.onDocumentKeyDown)
    document.addEventListener('keyup', this.onDocumentKeyUp)

    this.canvas.addEventListener('wheel', this.onMouseWheel)

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
    this.scrollSlider.stop()
    this.xSlider.stop()

    window.removeEventListener('resize', this.onWindowResize)
    window.removeEventListener('blur',   this.onWindowBlur)
    window.removeEventListener('unload', this.onWindowUnload)

    document.removeEventListener('mouseup', this.onDocumentMouseUp)
    document.removeEventListener('touchend', this.onDocumentTouchEnd)
    document.removeEventListener('keydown', this.onDocumentKeyDown)
    document.removeEventListener('keyup', this.onDocumentKeyUp)

    this.canvas.removeEventListener('wheel', this.onMouseWheel)

    window.localStorage[STORAGE_KEY] = JSON.stringify({
      startDate: this.state.startDate,
      endDate: this.state.endDate,
    })

    this.space.stop()
  }

  componentWillReceiveProps(props, state) {
    if (props.grants !== this.state.grants) {
      sortByStartDate(props.grants)

      this.setState({
        grants: filterGrants(this.state.filters, props.grants, props.fundings),
        grantsHover: props.grants.reduce((acc, grant) => {
          acc[grant.data.id] = false
          return acc
        }, {}),
      })
    }
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
    if (!this.grantsDimensions)
      return this.state.height

    const height = this.grantsDimensions.reduce((acc, cur) => acc + (cur[1][1] - cur[0][1]) + GRANT_MARGIN, 0)
    const lastGrant = this.grantsDimensions[this.grantsDimensions.length - 1]
    const lastHeight = this.grantsDimensions.length === 0 ? 0 : lastGrant[1][1] - lastGrant[0][1]

    // Will scroll until all of last grant is visible
    return height - lastHeight - GRANT_MARGIN
  }

  getGrantByID(id) {
    return this.state.grants.find(g => g.data.id === id)
  }

  getGrantHeight(i) {
    return (
      2 * GRANT_PADDING
      + TITLE_HEIGHT
      + 3 * TEXT_HEIGHT
      + this.state.grants[i].data.fields.length * TEXT_HEIGHT
    )
  }

  getGrantColor(grant) {
    const category = this.props.categories.data[grant.data.categoryID]
    if (!category)
      return '#bbb'
    return category.data.color
  }

  getAvailableCofunding(grant) {
    return (
      grant.data.cofunding
      - this.props.fundings.reduce((total, f) =>
          total + (f.data.fromGrantID === grant.data.id ? f.data.amount : 0), 0)
    )
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
    return Rectangle.withinBound(rect, this.space.pointer)
  }

  isMouseInCircle(center, radius) {
    const {x, y} = this.space.pointer
    const dx = center[0] - x
    const dy = center[1] - y
    return Math.sqrt(dx*dx + dy*dy) < radius
  }

  getClickedGrant(event) {
    // We use this.space.pointer.x/y rather than event.clientX/clientY
    const index = this.grantsDimensions.findIndex(d => this.isMouseInRect(d))
    const grant = index !== -1 ? this.state.grants[index] : undefined
    return grant
  }

  getClickedFundingID() {
    if (!this.state.fundingMode)
      return undefined
    const entry = Object.entries(this.fundingsPositions).find(([id, { hover }]) => hover)
    return entry ? entry[0] : undefined
  }

  drawText(position, text) {
    this.form.fill(TEXT_COLOR).font(14, 'bold')
      .text(position, text)
  }

  drawLine(position, color = LINE_COLOR, width = 1) {
    this.form.stroke(color, width).line(position)
  }

  drawCircle(position, color, radius = 5, otherRadius = radius) {
    this.form.stroke(BLACK, 1).fill(color).circle([position, [radius, otherRadius]])
  }

  drawCross(position, color, width = 2, length = 5) {
    this.form.stroke(color, width, undefined, 'round')
      .line([[position.x - length, position.y - length], [position.x + length, position.y + length]])
    this.form.stroke(color, width, undefined, 'round')
      .line([[position.x + length, position.y - length], [position.x - length, position.y + length]])
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

  drawCursorLine() {
    const {height} = this.space
    const {grantMode, grant, mouseHover} = this.state
    const pointerX = this.space.pointer.x

    if (!mouseHover)
      return

    const isCreatingGrant = grantMode && grant && grant.data.end === null

    if (isCreatingGrant) {
      const startX = this.dateToX(grant.data.start)

      this.form.fillOnly(SELECTION_COLOR).rect([
        [Math.min(pointerX, startX), TIMELINE_HEIGHT],
        [Math.max(pointerX, startX), height],
      ])

      this.drawLine(
        [[startX, TIMELINE_HEIGHT], [startX, this.state.height]],
        'rgba(0, 0, 0, 0.3)',
        1
      )
    }

    this.drawLine(
      [[pointerX, TIMELINE_HEIGHT], [pointerX, this.state.height]],
      CURSOR_LINE_COLOR,
      1
    )
  }

  drawTooltip() {
    const {mouseHover} = this.state
    const hasPointer = this.space.pointer
    const showTooltip = hasPointer && mouseHover

    if (!showTooltip)
      return

    const {pointer = {x: -100, y: -100}} = this.space
    const text = format(this.getMouseDate(), 'MMM D, YYYY')

    this.form.font(TEXT_SIZE, 'normal')

    const x = pointer.x + 20
    const y = pointer.y
    const textWidth = this.form.getTextWidth(text)
    const paddingH = 5
    const paddingV = 2
    const width = textWidth + 2 * paddingH
    const height = 30

    const box = [
      new Pt([x, y]),
      new Pt([x + width, y + height])
    ]
    const innerBox = [
      new Pt([x + paddingH, y]),
      new Pt([x + width - paddingH, y + height])
    ]

    this.form.fillOnly(TOOLTIP_BACKGROUND).rect(box)
    this.form.fill(WHITE).textBox(innerBox, text)
  }

  drawTimeline(years, months) {
    const { width, height } = this.space

    // Background & border
    this.form.fillOnly(TIMELINE_BACKGROUND).rect([[0, -1], [width, TIMELINE_HEIGHT]])
    this.drawLine([[0, TIMELINE_HEIGHT], [width, TIMELINE_HEIGHT]])

    // Months & Years
    this.form.font(14, 'bold')

    const visibleDays = this.getVisibleDays()
    const pixelsPerDay = this.state.width / visibleDays

    const yearTextWidth = this.form.getTextWidth('0000')
    const minMonthWidth = 28 * pixelsPerDay

    let monthsAfterYear = 0
    while (yearTextWidth + 10 > minMonthWidth * monthsAfterYear) {
      monthsAfterYear += 1
    }

    this.form.alignText('left', 'top')

    if (monthsAfterYear <= 6) {
      const monthsByYear = groupBy(d => d.getFullYear(), months)

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

    years.forEach(year => {
      const x = this.dateToX(year)
      const text = format(year, 'YYYY')

      this.form.fill(TEXT_COLOR).text([x + 5, 5], text)
      this.drawLine([[x, 0], [x, TIMELINE_HEIGHT]], YEAR_LINE_COLOR)
    })


    // Today's cross
    const todayX = this.dateToX(today())
    this.drawLine([[todayX, TIMELINE_HEIGHT - 2], [todayX, TIMELINE_HEIGHT + 2]], BLACK, 2)
    this.drawLine([[todayX - 2, TIMELINE_HEIGHT], [todayX + 2, TIMELINE_HEIGHT]], BLACK, 2)
  }

  drawGrants() {
    const {width, height, scrollTop, mouseHover} = this.state

    const visibleRect = addPadding([[0, 0], [width, height]], 10)
    let currentY = 0 + TIMELINE_HEIGHT + GRANT_MARGIN

    this.grantsDimensions = []

    this.state.grants.forEach((grant, i) => {
      const availableCofunding = this.getAvailableCofunding(grant)

      const startX = this.dateToX(grant.data.start)
      const endX   = this.dateToX(grant.data.end)
      const grantHeight = this.getGrantHeight(i)

      const startY = currentY + scrollTop
      const endY   = startY + grantHeight

      currentY += grantHeight + GRANT_MARGIN

      const rect = Group.fromArray([[startX, startY], [endX, endY]])
      const innerRect = Group.fromArray(
        clipHorizontalRect(
          addPadding([[startX, startY], [endX, endY]], GRANT_PADDING),
          visibleRect
        )
      )
      // const innerWidth = getRectangleWidth(innerRect)

      this.grantsDimensions.push(rect)

      const isHover = mouseHover && this.isMouseInRect(rect)
      const {hover} = this.state.grantsHover[grant.data.id]

      if (isHover && !hover)
        this.onMouseEnterGrant(grant)
      else if (!isHover && hover)
        this.onMouseLeaveGrant(grant)

      this.state.grantsHover[grant.data.id] = isHover

      const isPickingFrom = this.state.fundingMode && !this.state.funding
      const isActive = !this.state.fundingMode ? isHover : (availableCofunding > 0 || !isPickingFrom) ? isHover : false
      const isDisabled = this.state.fundingMode && isPickingFrom && availableCofunding <= 0

      const color =
        isDisabled ?
          Color(this.getGrantColor(grant)).fade(0.7) :
        isActive ?
          Color(this.getGrantColor(grant)).lighten(0.2) :
          Color(this.getGrantColor(grant))
      const borderColor =
        Color(this.getGrantColor(grant)).darken(0.5).fade(isDisabled ? 0.7 : 0).toString()
      const matchingTextColor =
        color.isDark() ?
          TEXT_COLOR_LIGHT :
          TEXT_COLOR_DARK
      const textColor =
        this.state.fundingMode && isPickingFrom && availableCofunding <= 0 ?
          'rgba(0, 0, 0, 0.3)' :
          matchingTextColor

      // Box

      this.form
        .stroke(borderColor, 2)
        .fill(color.toString())
        .rect(rect)

      // Text

      const drawLabel = ({
          label,
          labelStyle = I,
          value,
          valueStyle = I,
          height = TEXT_HEIGHT,
          preferValue = true,
        }) => {
        if (preferValue) {
          const originalRight = innerRect[1].x
          const valueWidth = this.form.getTextWidth(value)
          if (valueStyle)
            valueStyle()
          this.form.alignText('right').textBox(innerRect, value, 'top', '...')
          innerRect[1].x -= valueWidth + 5

          if (labelStyle)
            labelStyle()
          this.form.alignText('left').textBox(innerRect, label, 'top', '...')
          innerRect[1].x = originalRight
          innerRect[0].y += height
        }
        else {
          const originalLeft = innerRect[0].x
          const labelWidth = this.form.getTextWidth(label)
          if (labelStyle)
            labelStyle()
          this.form.alignText('left').textBox(innerRect, label, 'top', '...')
          innerRect[0].x += labelWidth + 5

          if (valueStyle)
            valueStyle()
          this.form.alignText('right').textBox(innerRect, value, 'top', '...')
          innerRect[0].x = originalLeft
          innerRect[0].y += height
        }
      }

      drawLabel({
        label: grant.data.name,
        labelStyle: () => this.form.fill(textColor).font(TITLE_SIZE, 'bold'),
        value: `[${grant.data.status}]`,
        valueStyle: () => this.form.fill(textColor).font(TEXT_SIZE_SMALL, 'normal'),
        preferValue: false,
        height: TITLE_HEIGHT,
      })

      this.form.fill(textColor).font(TEXT_SIZE, 'normal').alignText('left')
        .textBox(innerRect, `${formatISO(grant.data.start)} - ${formatISO(grant.data.end)}`, "top", '...')
      innerRect[0].y += TEXT_HEIGHT

      this.form.fill(textColor).font(TEXT_SIZE, 'normal')
      drawLabel({ label: 'Project total:', value: formatAmount(grant.data.total) })

      grant.data.fields.forEach(field => {
        drawLabel({ label: `${field.name}:`, value: formatAmount(field.amount) })
      })

      this.form.fill(textColor).font(TEXT_SIZE, 'bold')
      drawLabel({
        label: `Co-funding (available/original):`,
        value: `${formatAmount(availableCofunding)} / ${formatAmount(grant.data.cofunding)}`
      })

      if (isHover) {
        if (isActive)
          this.setCursor('pointer')
        else
          this.setCursor('not-allowed')
      }
    })
  }

  drawFundings() {
    const fundings = this.state.funding ? this.props.fundings.concat(this.state.funding) : this.props.fundings

    const fromGrant = groupBy(path(['data', 'fromGrantID']), fundings)
    const toGrant   = groupBy(path(['data', 'toGrantID']),   fundings)

    const detailsByGrant = {}
    this.state.grants.forEach((grant, i) => {
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

        if (funding.data.toGrantID === null) {
          links.push({ funding, start, end: null, detail })
          return
        }

        if (!(funding.data.toGrantID in detailsByGrant)) {
          // Grant might not be visible
          return
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

    this.fundingsPositions = {}

    links.forEach(link => {

      const {isPartial} = link.funding

      const start = new Pt(link.start)
      const end   = !link.end ? new Pt(this.space.pointer) : new Pt(link.end)

      const isReversed = end.x < start.x
      const smallerX = Math.min(start.x, end.x)
      const dx = Math.abs(end.x - start.x)
      const dy = Math.abs(end.y - start.y)
      const fx = 1 - Math.sqrt(dx/100)
      const anchorX = smallerX - 30 - (dx / 10) - (100 * (fx < 0 ? 0 : fx)) - (isReversed ? 100 : 0)

      const heightOffset = ((link.detail.height - (start.y - link.detail.y)) / 2)

      const startAnchor = new Pt({ x: anchorX, y: start.y + heightOffset + (dy / 10) })
      const endAnchor   = new Pt({ x: anchorX, y: end.y })

      const points = [
        start,
        startAnchor,
        endAnchor,
        end,
      ]

      const color =
        Color(this.getGrantColor(link.detail.grant))
          .darken(0.1)
          .fade(isPartial ? 0.5 : 0)

      this.form.strokeOnly(color.toString(), 2).line(Curve.bezier(points, 50))
      this.form.strokeOnly(color.toString(), 2, undefined, 'round').line([end, end.$subtract(10, 8)])
      this.form.strokeOnly(color.toString(), 2, undefined, 'round').line([end, end.$subtract(10, -8)])

      const middlePoint = new Pt(calculateBezierPoint(0.6, points))

      this.fundingsPositions[link.funding.data.id] = { position: middlePoint }

      if (!isPartial) {
        const text = formatAmount(link.funding.data.amount)
        this.form.fill(TEXT_COLOR, 1).font(TEXT_SIZE, 'bold')
          .text(middlePoint.$add(10, (2 - TEXT_HEIGHT / 2)), text)
        if (!this.state.fundingMode) {
          this.form.fillOnly(BLACK).point(middlePoint, 2, 'circle')
        }
        else {
          const isHover = this.isMouseInCircle(middlePoint, 10)
          if (!isHover) {
            this.drawCross(middlePoint, BLACK)
          } else {
            this.setCursor('pointer')
            this.drawCross(middlePoint, BLACK, 3)
            this.fundingsPositions[link.funding.data.id].hover = true
          }
        }
      }

      if (isPartial && link.end && !this.state.funding.position) {
        this.setState({
          funding: {
            ...this.state.funding,
            position: middlePoint,
          }
        })
      }
    })
  }

  onUpdateSpace = (time, ftime) => {
    const years = this.getVisibleYears()
    const months = this.getVisibleMonths()

    /*
     * Drawing
     */

    this.form.font(TEXT_SIZE, undefined, undefined, undefined, FONT_FAMILY)

    this.setCursor('default')

    this.drawBackground(years, months)

    this.drawCursorLine()

    this.drawGrants()

    this.drawFundings()

    this.drawTimeline(years, months)

    this.drawTooltip()
  }

  onMouseEnterGrant = (grant) => {

  }

  onMouseLeaveGrant = (grant) => {

  }

  onWindowResize = () => {
    this.updateDimensions()
  }

  onWindowBlur = () => {
    this.exitGrantMode()
    this.exitFundingMode()
  }

  onWindowUnload = () => {
    window.localStorage[STORAGE_KEY] = JSON.stringify({
      startDate: this.state.startDate,
      endDate: this.state.endDate,
    })
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
    else if (event.deltaX === 0 && event.deltaY !== 0 && !event.shiftKey) {
      /*
       * Vertical scroll
       */

      const direction = -event.deltaY / Math.abs(event.deltaY)
      const delta = direction * 150
      // const scrollTop = this.scrollSlider.get()
      const velocity =  this.scrollSlider.getVelocity()
      const isOpposed = (delta < 0 && velocity > 0) || (delta > 0 && velocity < 0)
      const newVelocity =
        clampScrollVelocity(isOpposed ?
          delta :
          delta + this.scrollSlider.getVelocity())

      this.scrollSlider.stop()
      this.xSlider.stop()

      decay({
        from: this.scrollSlider.get(),
        velocity: newVelocity,
        power: 0.3,
        timeConstant: 200,
      })
        .pipe(scrollTop => {
          const maxScrollHeight = this.getMaxScrollHeight()
          return clamp(-maxScrollHeight, 0, scrollTop)
        })
        .start(this.scrollSlider)
    }
    else if (event.deltaX === 0 && event.deltaY !== 0 && event.shiftKey) {
      /*
       * Horizontal scroll
       */

      const direction = -event.deltaY / Math.abs(event.deltaY)
      const delta = direction * 600
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
        from: this.xSlider.get(),
        velocity: newVelocity,
        power: 0.3,
        timeConstant: 200,
        // restDelta: 0.9,
        // modifyTarget: v => Math.round(v / 10) * 10
      })
        .start(this.xSlider)
    }
  }

  onMouseMove = (event) => {
    if (this.isDragging)
      this.didDrag = true
    if (!this.state.mouseHover)
      this.setState({ mouseHover: true })
  }

  onMouseDown = (event) => {
    if (!event.shiftKey) {
      this.isDragging = true
      this.didDrag = false
      this.onStartDrag()
      return
    }

    const start = startOfDay(this.xToDate(this.space.pointer.x))

    this.setState({
      grantMode: 'new',
      grant: {
        isPartial: true,
        isLoading: false,
        data: getNewGrant(start, null),
      },
    })
  }

  onMouseEnter = (event) => {
    this.setState({ mouseHover: true })
  }

  onMouseLeave = (event) => {
    this.setState({ mouseHover: false })
  }

  onDocumentMouseUp = (event) => {
    if (!event.shiftKey) {
      this.onStopDrag()
      return
    }

    const {grantMode, grant} = this.state
    const isCreatingGrant = grantMode && grant && grant.data.end === null

    if (isCreatingGrant) {
      const end = this.xToDate(this.space.pointer.x)
      this.setState({
        grant: set(lensPath(['data', 'end']), end, this.state.grant)
      })
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
    if (this.didDrag) {
      return
    }

    const grant = this.getClickedGrant(event)
    const fundingID = this.getClickedFundingID()

    if (fundingID) {
      this.onClickFunding(event, fundingID)
      return
    }

    if (grant) {
      this.onClickGrant(event, grant)
      return
    }

    if (this.state.funding) {
      this.setState({ funding: null })
    }
  }

  onClickFunding = (event, id) => {
    Funding.delete(id)
  }

  onClickGrant = (event, grant) => {
    if (this.state.fundingMode) {
      if (this.state.funding) {
        if (grant.data.id === this.state.funding.data.fromGrantID) {
          this.setState({ funding: null })
          return
        }

        this.setState({
          funding: {
            isPartial: true,
            isLoading: false,
            data: { ...this.state.funding.data, toGrantID: grant.data.id },
          }
        })
      }
      // Create new funding
      else if (grant && this.getAvailableCofunding(grant) > 0) {
        this.setState({
          funding: {
            isPartial: true,
            isLoading: false,
            data: getNewFunding(grant.data.id),
          }
        })
      }
    }
    else {
      this.setState({
        grantMode: 'edit',
        grant: grant,
      })
    }
  }

  onDocumentKeyDown = (event) => {
    const {fundingMode, grantMode} = this.state

    if (isEscapeKey(event)) {
      this.onEscape()
    }

    if (fundingMode || grantMode)
      return

    if (isAltKey(event)) {
      this.enterFundingMode()
    }
    if (isShiftKey(event)) {
      this.setState({ grantMode: true })
    }
  }

  onDocumentKeyUp = (event) => {
    if (isAltKey(event) && !this.state.funding) {
      this.setState({ fundingMode: false })
    }
    if (isShiftKey(event) && !this.state.grant) {
      this.exitGrantMode()
    }
  }

  onEscape = () => {
    if (this.state.fundingMode) {
      this.setState({ fundingMode: false, funding: null })
    }
    if (this.state.grantMode) {
      this.setState({ grantMode: false, grant: null })
    }
  }

  onChangeInput = (inputValue) => {
    this.setState({ inputValue })
  }

  onBlurInput = () => {
    // if (this.state.funding)
      // this.setState({ funding: null })
  }

  onEnterInput = (value) => {
    if (this.state.funding) {
      const amount = parseAmount(value)

      if (!Number.isInteger(amount)) {
        this.setState({ funding: null })
        return
      }

      const funding = {
        ...this.state.funding,
        isLoading: true,
        data: {
          ...this.state.funding.data,
          amount: amount,
        }
      }

      this.setState({ funding })

      Funding.create(funding.data)
        .then(() => {
          this.setState({ fundingMode: false, funding: null })
        })
    }
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

  validateFunding = (amount) => {
    const {funding} = this.state

    const grant = this.getGrantByID(funding.data.fromGrantID)
    const maximum = this.getAvailableCofunding(grant)

    if (amount > maximum) {
      return false
    }

    return true
  }

  onRef = (ref) => {
    if (ref)
      this.element = ref
  }

  onRefCanvas = (ref) => {
    if (ref)
      this.canvas = ref
  }

  onCreateGrant = (grant) => {
    Grant.create(grant.data)
    .then(() => {
      this.exitGrantMode()
    })
    .catch(() => { /* FIXME(assert we're showing the message) */})
  }

  onUpdateGrant = (grant) => {
    Grant.update(grant.data.id, grant.data)
    .then(() => {
      this.exitGrantMode()
    })
    .catch(() => { /* FIXME(assert we're showing the message) */})
  }

  onDeleteGrant = (grant) => {
    this.setState({ deleteGrantID: grant.data.id })
  }

  unsetGrantDeleteID = () => {
    this.setState({ deleteGrantID: undefined })
  }

  deleteGrant = () => {
    const {deleteGrantID} = this.state

    if (deleteGrantID === undefined)
      return

    Grant.delete(deleteGrantID)
    .then(this.unsetGrantDeleteID)
    .catch(() => { /* FIXME(assert we're showing the message) */})
  }

  enterFundingMode = () => {
    this.setState({ fundingMode: true })
  }

  exitFundingMode = () => {
    this.setState({ fundingMode: false })
  }

  toggleFundingMode = () => {
    if (!this.state.fundingMode)
      this.enterFundingMode()
    else
      this.exitFundingMode()
  }

  exitGrantMode = () => {
    this.setState({ grantMode: false, grant: null })
  }

  setFilters(patch) {
    const filters = patch === DEFAULT_FILTERS ? DEFAULT_FILTERS : { ...this.state.filters, ...patch }
    const grants = filterGrants(filters, this.props.grants, this.props.fundings)
    this.setState({ filters, grants })
  }

  resetFilters = () => {
    this.setFilters(DEFAULT_FILTERS)
  }

  renderInput() {
    const {funding, inputValue} = this.state

    if (!funding || !funding.position)
      return null

    const {position} = funding
    const grant = this.getGrantByID(funding.data.fromGrantID)
    const maximum = this.getAvailableCofunding(grant)

    const amount = parseAmount(inputValue)

    const isEmpty = inputValue === ''
    const isValidAmount = !isEmpty && !Number.isNaN(amount)
    const hasEnoughFunds = isValidAmount && this.validateFunding(amount)
    const status = hasEnoughFunds ? 'success' : 'error'

    const message =
      isEmpty ? undefined :
      !isValidAmount ? 'Input is not a valid number' :
      !hasEnoughFunds ? `Not enough funds to create this co-funding (maximum: ${formatAmount(maximum)})` :
                        undefined

    return [
      <div className='Grants__shadow' onClick={this.onEscape} />,
      <div className='Grants__input vbox'
        style={{
          top:  position.y,
          left: position.x + 20,
        }}
      >
        <Input
          className='fill-width'
          placeholder={ `Enter amount (maximum: ${formatAmount(maximum)})` }
          value={inputValue}
          status={status}
          onChange={this.onChangeInput}
          onBlur={this.onBlurInput}
          onEnter={this.onEnterInput}
          ref={e => e && e.focus()}
        />
        {
          message &&
            <Label error className='no-wrap font-weight-bold'>
              {message}
            </Label>
        }
      </div>
    ]
  }

  renderGrantEditor() {
    const {grantMode, grant} = this.state

    let open = true

    if  (grantMode === false)
      open = false

    if  (grantMode === true)
      open = false

    if (grantMode === 'new' && grant.data.end === null)
      open = false

    return (
      <GrantEditor
        open={open}
        grant={grant}
        categories={this.props.categories}
        applicants={this.props.applicants}
        availableCofunding={open ? this.getAvailableCofunding(grant) : 0}
        onDone={grantMode === 'new' ? this.onCreateGrant : this.onUpdateGrant}
        onCancel={this.exitGrantMode}
      />
    )
  }

  renderGrantButtons() {
    const {grantMode} = this.state

    if (grantMode !== true)
      return null

    return this.grantsDimensions.map((dimension, i) =>
      <div
        className='row'
        style={{
          position: 'absolute',
          transform: `translate(${dimension[1].x - 85}px, ${dimension[0].y + 0}px)`,
        }}
      >
        <Button
          default
          square
          icon='eye'
          onClick={() => this.setFilters({ grants: this.state.filters.grants.concat(this.state.grants[i].data.id) }) }
        />
        <Button
          default
          square
          icon='close'
          onClick={() => this.onDeleteGrant(this.state.grants[i]) }
        />
      </div>
    )
  }

  renderDeleteModal() {
    const {deleteGrantID, grants} = this.state
    const grant = grants.find(g => g.data.id === deleteGrantID)
    const isOpen = deleteGrantID !== undefined

    return (
      <Modal minimal open={isOpen} onClose={this.unsetGrantDeleteID} showClose={false}>
        <Modal.Title>
          <Icon name='trash' size='lg' /> &nbsp;&nbsp;Confirm Grant Deletion
        </Modal.Title>
        <Modal.Content>
          Are you sure you want to delete grant “{grant ? grant.data.name : ''}”?
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.unsetGrantDeleteID} muted>
            No, cancel
          </Button>
          <Button onClick={this.deleteGrant} error>
            Yes, delete
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  renderControls() {
    const {filters: {categories, applicants, status, grants}, fundingMode} = this.state

    const getCategoryText = id => this.props.categories.data[id].data.name
    const getApplicantText = id => this.props.applicants.data[id].data.name
    const getGrantText = id => this.props.grants.find(g => g.data.id === id).data.name 

    return (
      <div className='Grants__controls'>
        <div className='hbox'>
          <div className='fill' />
          <Button
            default
            className='font-weight-normal'
            disabled={this.state.filters === DEFAULT_FILTERS}
            onClick={this.resetFilters}
          >
            <Icon name='close' /> Reset Filters
          </Button>
        </div>
        <FilteringDropdown
          className='full-width'
          position='bottom left'
          clearInputOnSelect
          label={
            categories.length > 0 ?
              categories.map(getCategoryText).join(', ') :
              <Text muted>Filter by source</Text>
          }
          items={Object.values(this.props.categories.data).map(a => a.data.id)}
          selectedItems={categories}
          getItemText={getCategoryText}
          setItems={categories => this.setFilters({ categories })}
        />
        <FilteringDropdown
          className='full-width'
          position='bottom left'
          clearInputOnSelect
          label={
            applicants.length > 0 ?
              applicants.map(getApplicantText).join(', ') :
              <Text muted>Filter by applicant</Text>
          }
          items={Object.values(this.props.applicants.data).map(a => a.data.id)}
          selectedItems={applicants}
          getItemText={getApplicantText}
          setItems={applicants => this.setFilters({ applicants })}
        />
        <FilteringDropdown
          className='full-width'
          position='bottom left'
          clearInputOnSelect
          label={
            grants.length > 0 ?
              grants.map(getGrantText).join(', ') :
              <Text muted>Filter by grant</Text>
          }
          items={this.props.grants.map(g => g.data.id)}
          selectedItems={grants}
          getItemText={getGrantText}
          setItems={grants => this.setFilters({ grants })}
        />
        <FilteringDropdown
          className='full-width'
          position='bottom left'
          clearInputOnSelect
          label={
            status.length > 0 ?
              status.join(', ') :
              <Text muted>Filter by status</Text>
          }
          items={Object.values(Status)}
          selectedItems={status}
          setItems={status => this.setFilters({ status })}
        />
        <div className='hbox'>
          <div className='fill' />
          <Button default className='font-weight-normal' active={fundingMode} onClick={this.toggleFundingMode}>
            Edit Fundings
          </Button>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className='Grants' ref={this.onRef}>

        <canvas
          className='Grants__canvas'
          ref={this.onRefCanvas}
          onClick={this.onClick}
          onMouseMove={this.onMouseMove}
          onMouseDown={this.onMouseDown}
          onTouchStart={this.onTouchStart}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        />

        { this.renderControls() }
        { this.renderInput() }
        { this.renderGrantEditor() }
        { this.renderGrantButtons() }
        { this.renderDeleteModal() }

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

function clipHorizontalRect(inner, outer) {
  return [
    [
      Math.min(Math.max(inner[0][0], outer[0][0]), inner[1][0]),
      inner[0][1]
    ],
    [
      Math.max(Math.min(inner[1][0], outer[1][0]), inner[0][0]),
      inner[1][1]
    ],
  ]
}

function getRectangleWidth(rect) {
  return rect[1].x - rect[0].x
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

function isControlKey(event) {
  return (
    event.code.startsWith('Control')
    || event.key === 'Control'
    || event.which === 17 /* Control */
    || event.which === 20 /* CapsLock */
  )
}

function isAltKey(event) {
  return (
    event.code.startsWith('Alt')
    || event.key === 'Alt'
    || event.which === 18 /* Alt */
  )
}

function isShiftKey(event) {
  return (
       event.code.startsWith('Shift')
    || event.key === 'Shift'
    || event.which === 16 /* Shift */
  )
}

function isEscapeKey(event) {
  return (
       event.code === 'Escape'
    || event.key === 'Escape'
    || event.which === 27 /* Escape */
  )
}

function sortByStartDate(/* mutable */ grants) {
  grants.sort((a, b) => new Date(a.data.start) - new Date(b.data.start))
}

function filterGrants(filters, grants, fundings) {
  return grants.filter(grant => {

    if (filters.categories.length > 0
        && !filters.categories.some(id => id === grant.data.categoryID)) {
      return false
    }

    if (filters.applicants.length > 0
        && !filters.applicants.some(id => grant.data.applicants.some(applicantID => applicantID === id))) {
      return false
    }

    if (filters.grants.length > 0
        && !filters.grants.some(id =>
                 grant.data.id === id
              || fundings.some(f =>
                     isFundingRelated(f, id)
                  && isFundingRelated(f, grant.data.id)))) {
      return false
    }

    if (filters.status.length > 0
        && !filters.status.some(status => grant.data.status === status)) {
      return false
    }

    return true
  })
}

function isFundingRelated(funding, id) {
  return funding.data.fromGrantID === id || funding.data.toGrantID === id
}

export default pure(Grants)
