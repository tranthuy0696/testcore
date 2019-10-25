import { WizardData } from './ipam-resource-wizard.model'

export interface AddZoneData extends WizardData {
  modeSingleData: Data,
  modeMultipleData: Data[]
}

export interface Data {
  selected?: boolean
  parentZone?: string
  name?: string
}
