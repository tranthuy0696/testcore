import { RequestDetail } from './request-detail.model'

export interface WizardGetUsageReportData {
  name: string
  detail: RequestDetail
  from: string
  to: string
  timeZone?: string
}
