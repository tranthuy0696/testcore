import { Net, DhcpService, Address } from '../models/ipam-resource.model'

export interface NagivateAndSelectNetwork {
  leftTableData: Net[]
  rightTableData: any[]
  current: Net
  net: Net
  net1?: Net
  net2?: Net
  dhcpServices?: DhcpService[]
  loadingDhcpServices?: boolean
  searchedAddressString?: string
  address?: Address
}
