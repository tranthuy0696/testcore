import { RequestDetail } from './request-detail.model'

export interface WizardIssBuildWincorData {
  name: string
  detail: RequestDetail
  isUsedStoreNumber: boolean
  isValidSubnet: boolean
  checkingData: boolean
  storeNumber: string
  octet: number
}
