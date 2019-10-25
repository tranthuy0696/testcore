import { WizardData } from './ipam-resource-wizard.model'
import { Group } from '../models/ipam-resource.model'

export interface WizardAddGroupData extends WizardData {
  data: Group
  subGroupName: string
  subAttributeName?: string
}
