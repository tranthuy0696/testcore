import { WizardData } from './ipam-resource-wizard.model'
import { NavigateDhcpOptionsAndScopes } from './navigate-dhcp-options-and-scopes.model'

export interface WizardAddDhcpScopeData extends WizardData {
  modeSingleData: WizardAddDhcpScopeModeSingleData,
  modeMultipleData: WizardAddDhcpScopeModeMultipleData[]
}

export interface WizardAddDhcpScopeModeSingleData {
  navigateDhcpOptionsAndScopes: NavigateDhcpOptionsAndScopes
  startIpAddress: string
  endIpAddress: string
}

export interface WizardAddDhcpScopeModeMultipleData {
  selected?: boolean
  start: string
  size: string
}
