import { WizardData } from './ipam-resource-wizard.model'
import { NavigateDhcpOptionsAndScopes } from './navigate-dhcp-options-and-scopes.model'

export interface WizardExpandDhcpScopeData extends WizardData {
  navigateDhcpOptionsAndScopes: NavigateDhcpOptionsAndScopes
  newStartIp: string
  newEndIp: string
  newSize: number
  minIp: string
  maxIp: string
  sizes: number[]
}
