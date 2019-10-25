import { Address, DnsRecord, Net, Tag, Zone } from '../models/ipam-resource.model'
import { NagivateAndSelectNetwork } from './navigate-and-select-network.model'
import { RequestDetail } from './request-detail.model'

export interface WizardData {
  name: string
  detail: RequestDetail
  mode?: string
  modeSingleData?: any
  modeMultipleData?: any
}

export interface WizardAddIpv4AddressData extends WizardData {
  modeSingleData: {
    hostname: string
    ip4Address: string
    zone: Zone
    addressName: string
    parent?: NagivateAndSelectNetwork
  }
  modeMultipleData: {
    selected?: boolean
    hostname: string
    ip4Address: string
    zone: string
    addressName: string
  } []
}

export interface WizardDeleteIpv4AddressData extends WizardData {
  modeSingleData: {
    address: Address
    subnet?: Net
    dnsRecords?: DnsRecord[]
  }
  modeMultipleData: {
    selected?: boolean
    address: string
  } []
}

export interface WizardAddNetworkData extends WizardData {
  modeSingleData: {
    parent: NagivateAndSelectNetwork
    CIDR: string
    name: string
    subGroup: Tag
  }
  modeMultipleData: {
    tableData: any[]
  }
}

export interface WizardAddSubnetData extends WizardData {
  modeSingleData: {
    parent: NagivateAndSelectNetwork
    CIDR: string
    name: string
    subGroup: Tag
    gateway: string
    reserved: boolean
  }
  modeMultipleData: {
    tableData: {
      selected: boolean
      CIDR: string
      name: string
      subGroup: string
      gateway: string
      reserved: string
    } []
  }
}

export interface WizardGetSubnetListData extends WizardData {}
export interface WizardGetStoreListData extends WizardData {}

export interface WizardAddDnsRecordData extends WizardData {
  modeSingleData: DnsRecord
  modeMultipleData: DnsRecord[]
}
export interface WizardGetZoneListData extends WizardData {}
