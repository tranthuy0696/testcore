import { WizardData } from './ipam-resource-wizard.model'

export interface ModifyDhcpReservationData extends WizardData {
  modeSingleData: ModeSingleData,
  modeMultipleData: ModeMultipleData[]
}

export interface ModeSingleData {
  ipAddress?: string
  currentAddressName?: string
  currentMacAddress?: string
  newAddressName?: string
  newMacAddress?: string
}

export interface ModeMultipleData {
  selected?: boolean
  ipAddress: string
  macAddress: string
  replaceDhcp: string
  addressName: string
}
