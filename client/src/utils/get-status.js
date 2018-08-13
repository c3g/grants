/*
 * get-status.js
 */

import Status, { SampleStatus } from '../constants/status'

export default function getStatus(sample) {

  if (sample.completed)
    return SampleStatus.DONE

  if (sample.steps.length === 0) {
    console.error('Sample with no steps', sample)
    return SampleStatus.ERROR
  }

  if (sample.steps.some(step => step.isOverdue))
    return SampleStatus.OVERDUE

  let i = 0;

  for (; i < sample.steps.length; i++) {
    const status = sample.steps[i].status.nextValue || sample.steps[i].status
    if (status === Status.NOT_DONE)
      break
  }

  const lastStep   = sample.steps[i == 0 ? i : i - 1]
  const lastStatus = lastStep.status.nextValue || lastStep.status

  switch (lastStatus) {
    case Status.DONE:        return SampleStatus.DONE
    case Status.IN_PROGRESS: return SampleStatus.IN_PROGRESS
    case Status.ERROR:       return SampleStatus.ERROR
    case Status.ON_HOLD:     return SampleStatus.ON_HOLD
    /*
     * Should be reachable, but actually is for a short lapse of time
     * when updating multiple steps.
     */
    case Status.NOT_DONE:    return SampleStatus.IN_PROGRESS
    case Status.SKIP:        return SampleStatus.IN_PROGRESS
    default: throw new Error('unreachable')
  }
}
