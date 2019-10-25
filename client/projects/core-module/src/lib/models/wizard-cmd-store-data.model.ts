import { RequestDetail } from './request-detail.model'
import { Store } from './ipam-resource.model'

export interface WizardCmdStoreData {
  name: string
  detail: RequestDetail
  originalStore: Store
  newStore: Store
  mode: string
  changes: String[]
}
