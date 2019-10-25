import { WizardData } from './ipam-resource-wizard.model'
import { NavigateDhcpOptionsAndScopes } from './navigate-dhcp-options-and-scopes.model'
import { Zone } from './ipam-resource.model'

export interface WizardAddDhcpReservationData extends WizardData {
  modeSingleData: WizardAddDhcpReservationModeSingleData,
  modeMultipleData: WizardAddDhcpReservationModeMultipleData[]
}

export interface WizardAddDhcpReservationModeSingleData {
  navigateDhcpOptionsAndScopes: NavigateDhcpOptionsAndScopes
  ipAddress: string
  ipAddressName: string
  hostName: string
  parentZone: Zone
  macAddress: string
  replaceDhcp: boolean
}

export interface WizardAddDhcpReservationModeMultipleData {
  selected?: boolean
  ipAddress: string
  ipAddressName: string
  hostName: string
  parentZone: string
  macAddress: string
  replaceDhcp: string
}
