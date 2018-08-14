/*
 * models.js
 */

import unindent from './utils/unindent'
import Status from './constants/status'

export const getNewTemplate = () => ({
  name: 'new-template',
  tags: [],
  steps: []
})

export const getNewTemplateStep = (alertDelay) => ({
  name: 'new-step',
  alertDelay: alertDelay,
  completionFn: null,
})

export const getNewSample = (template) => ({
  name: null,
  notes: '',
  tags: [template.name],
  steps: template.steps.map((step, i) => ({
    name: step.name,
    status: i !== 0 ? Status.NOT_DONE : Status.IN_PROGRESS,
    notes: '',
    started: i !== 0 ? null : new Date().toISOString(),
    alertDelay: step.alertDelay,
    completionFn: step.completionFn,
  }))
})

export const getNewCompletionFunction = () => ({
  name: 'new-function',
  code: unindent`
    /**
     * @param {Step} step
     * @param {Sample} sample
     * @param {User} user
     * @param {number} stepIndex
     */
    function canCompleteStep (step, sample, user, stepIndex) {
      // Any return value that is not strictly "true" will be considered as an error.

      if (step.files.length < 1)
        return \`Step \${step.name} requires at least 1 file attached to be closed. Currently has \${step.files.length}.\`

      if (user.email === 'john@example.com' || user.name === 'John John')
        return "John can't close this step."

      if (! /#\\d{6}/.test(sample.notes))
        return "Sample notes don't contain the sample ID. Please indicate it before completing this step."

      // If all is good
      return true
    }`,
})

export const testingSample = `/*
 * You can modify the data below to test the function above.
 * The function will be called with the following arguments:
 *
 *   canCompleteStep(sample.steps[stepIndex], sample, user, stepIndex)
 */

const user = {
  id: "811877316248971230109",
  token: "avosuieoifa0w8934-ioasdaflkseurliashdflasdfawieaweADAIRKpiOXA1A_TtFl1AkMoXAPcqus6_ia",
  name: "John John",
  email: "john@example.com"
}

const stepIndex = 1 // indexes start at 0, so this is the second step

const sample = {
   id: 2,
   name: "request",
   tags: [
      "request",
      "some",
      "tags"
   ],
   notes: "",
   created: "2017-12-06T17:37:04.748Z",
   modified: "2017-12-06T17:39:12.225Z",
   completed: null,
   steps: [
      {
         id: 3,
         name: "Write",
         status: "DONE",
         notes: "",
         started: null,
         alertDelay: "02:00:00",
         completionFn: null,
         isOverdue: null,
         overdueAt: null,
         files: [
            {
               id: 1,
               sampleId: 2,
               stepIndex: 0,
               mime: "image/png",
               name: "Screenshot from 2017-12-05 14-59-19.png"
            }
         ]
      },
      { // This is the step that we will be testing
         id: 4,
         name: "Review",
         status: "IN_PROGRESS",
         notes: "Some notes\\n",
         started: "2017-12-06T17:38:53.306Z",
         alertDelay: "14 days",
         completionFn: 1,
         isOverdue: false,
         overdueAt: "2017-12-20T17:38:53.306Z",
         files: [
            {
               id: 2,
               sampleId: 2,
               stepIndex: 1,
               mime: "application/javascript",
               name: "user-create.js"
            },
            {
               id: 3,
               sampleId: 2,
               stepIndex: 1,
               mime: "text/csv",
               name: "profyle.csv"
            }
         ]
      },
      {
         id: 5,
         name: "Send",
         status: "ON_HOLD",
         notes: "",
         started: null,
         alertDelay: "14 days",
         completionFn: 1,
         isOverdue: null,
         overdueAt: null,
         files: [

         ]
      },
      {
         id: 6,
         name: "Response",
         status: "NOT_DONE",
         notes: "",
         started: null,
         alertDelay: "14 days",
         completionFn: null,
         isOverdue: null,
         overdueAt: null,
         files: [

         ]
      }
   ],
   history: [
      {
         date: "2017-12-06T17:39:12.000Z",
         description: "changed status to ON_HOLD",
         stepIndex: 2,
         userID: "811877316248971230109"
      },
      {
         date: "2017-12-06T17:39:00.000Z",
         description: "updated sample",
         stepIndex: null,
         userID: "811877316248971230109"
      },
      {
         date: "2017-12-06T17:38:58.000Z",
         description: "updated sample",
         stepIndex: null,
         userID: "811877316248971230109"
      },
      {
         date: "2017-12-06T17:38:53.000Z",
         description: "updated sample",
         stepIndex: null,
         userID: "811877316248971230109"
      },
      {
         date: "2017-12-06T17:38:48.000Z",
         description: "updated sample",
         stepIndex: null,
         userID: "811877316248971230109"
      },
      {
         date: "2017-12-06T17:38:46.000Z",
         description: "updated sample",
         stepIndex: null,
         userID: "811877316248971230109"
      },
      {
         date: "2017-12-06T17:38:40.000Z",
         description: "added file profyle.csv to step 1",
         stepIndex: 1,
         userID: "811877316248971230109"
      },
      {
         date: "2017-12-06T17:38:35.000Z",
         description: "added file user-create.js to step 1",
         stepIndex: 1,
         userID: "811877316248971230109"
      },
      {
         date: "2017-12-06T17:38:15.000Z",
         description: "changed status to DONE",
         stepIndex: 0,
         userID: "811877316248971230109"
      },
      {
         date: "2017-12-06T17:38:13.000Z",
         description: "added file Screenshot from 2017-12-05 14-59-19.png to step 0",
         stepIndex: 0,
         userID: "811877316248971230109"
      },
      {
         date: "2017-12-06T17:37:04.000Z",
         description: "created sample",
         stepIndex: null,
         userID: "811877316248971230109"
      }
   ]
}

`

export const DECLARATIONS = `
  declare enum Status = {
    DONE =        'DONE',
    NOT_DONE =    'NOT_DONE',
    IN_PROGRESS = 'IN_PROGRESS',
    ERROR =       'ERROR',
    ON_HOLD =     'ON_HOLD',
  }
  //type Status = 'DONE' || 'NOT_DONE' || 'IN_PROGRESS' || 'ERROR' || 'ON_HOLD' ||

  declare class File {
    name: string
  }

  /**
   * Step information object
   */
  declare class Step {

    /**
     * Step name
     */
    name: string
    /**
     * Status - one of DONE, NOT_DONE, IN_PROGRESS, ERROR, or ON_HOLD
     */
    status: Status
    /**
     * Step notes
     */
    notes: string
    completionFn: number
    /**
     * Files attached to this step
     */
    files: Array<File>
  }

  /**
   * Sample information object
   */
  declare class Sample {

    id: integer
    /**
     * Sample name
     */
    name: string
    /**
     * Sample notes
     */
    notes: string
    /**
     * Sample steps.
     * Note that sample.steps[stepIndex] === step
     */
    steps: Array<Step>
  }

  /**
   * User information object
   */
  declare class User {

    /**
     * Google ID
     */
    id: string
    /**
     * Google OAuth token
     */
    token: string
    /**
     * User name
     */
    name: string
    /**
     * User email
     */
    email: string
  }

  declare function canCompleteStep(step: Step, sample: Sample, user: User, stepIndex: number): any;
`
