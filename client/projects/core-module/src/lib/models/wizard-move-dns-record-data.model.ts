import { RequestDetail } from './request-detail.model'
import { DnsRecord, Address, Net } from './ipam-resource.model'
import { NagivateAndSelectNetwork } from './navigate-and-select-network.model'

export interface WizardMoveDnsRecordData {
  name: string
  detail: RequestDetail
  mode: string
  modeSingleData: MoveDnsRecordModeSingleData
  modeMultipleData: MoveDnsRecordModeMultipleData[]
}

export interface MoveDnsRecordModeMultipleData {
  selected?: boolean
  currentAddress: string
  targetAddress: string
}

export interface MoveDnsRecordModeSingleData {
  currentSubnet: Net
  currentAddresses: Address[]
  currentDnsRecords: DnsRecord[]
  currentAddress: Address

  targetSubnetNavigation: NagivateAndSelectNetwork
  targetAddresses: Address[]
  targetAddress: Address
}
