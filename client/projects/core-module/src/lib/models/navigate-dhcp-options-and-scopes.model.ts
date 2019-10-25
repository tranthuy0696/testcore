import { NagivateAndSelectNetwork } from './navigate-and-select-network.model'
import { DhcpScope } from './ipam-resource.model'
import { DhcpOption } from './dhcp-option.model'

export interface NavigateDhcpOptionsAndScopes {
  navigateSubnet: NagivateAndSelectNetwork
  dhcpScopes: DhcpScope[]
  dhcpOptions: DhcpOption[]
  selectedDhcpScope: DhcpScope
}
