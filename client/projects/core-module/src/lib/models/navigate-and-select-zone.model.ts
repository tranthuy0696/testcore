import { DnsRecord, Zone } from '../models/ipam-resource.model'

export interface NavigateAndSelectZone {
  allZones?: Zone[],
  leftTableData: Zone[]
  rightTableData: any[]
  current: Zone
  zone: Zone
  records: DnsRecord[]
  selectedDnsRecord?: DnsRecord
}
