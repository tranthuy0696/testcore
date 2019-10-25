import { DnsRecord, Zone } from '../models/ipam-resource.model'
import { WizardData } from './ipam-resource-wizard.model'

export interface WizardModifyDnsRecordData extends WizardData {
  modeSingleData: WizardModifyDnsRecordSingleData
  modeMultipleData: DnsRecord[]
}

export interface WizardModifyDnsRecordSingleData {
  search: string
  searchedDnsRecords: DnsRecord[]
  dnsRecord: DnsRecord
  originDnsRecord: DnsRecord
  zone?: Zone
}
