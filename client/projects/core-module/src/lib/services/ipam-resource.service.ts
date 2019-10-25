import { Observable } from 'rxjs'
import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import {
  Address,
  Zone,
  DnsRecord,
  Net,
  DhcpScope,
  DhcpService,
  DhcpLease,
  Group
} from '../models/ipam-resource.model'
import {
  WizardAddIpv4AddressData,
  WizardDeleteIpv4AddressData,
  WizardAddNetworkData,
  WizardAddSubnetData,
  WizardAddDnsRecordData,
  WizardGetSubnetListData,
  WizardGetStoreListData
} from '../models/ipam-resource-wizard.model'

import { WizardModifyDnsRecordData } from '../models/wizard-modify-dns-record-data.model'
import { WizardMoveDnsRecordData } from '../models/wizard-move-dns-record-data.model'
import { DhcpOption } from '../models/dhcp-option.model'
import { WizardExpandDhcpScopeData } from '../models/wizard-expand-dhcp-scope-data.model'
import { WizardAddDhcpScopeData } from '../models/wizard-add-dhcp-scope-data.model'
import { WizardAddDhcpReservationData } from '../models/wizard-add-dhcp-reservation-data.model'
import { WizardModifySubnetData } from '../models/wizard-modify-subnet-data.model'
import { Netmask, ip2long } from 'netmask'
import { WizardIssBuildWincorData } from '../models/wizard-iss-build-wincor-data'
import { WizardCmdStoreData } from '../models/wizard-cmd-store-data.model'
import { ipSort } from '../utils/ipSort'
import { WizardGetUsageReportData } from '../models/wizard-get-usage-report-data'
import { of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { ModifyDhcpReservationData } from '../models/modify-dhcp-reservation-data.model'
import { AddZoneData } from '../models/add-zone-data.model'
import { WizardAddGroupData } from '../models/wizard-add-group-data.model'

const SINGLE = 'single'

@Injectable()
export class IpamResourceService {

  static sortAddresses(unsortedAddresses: Array<Address>) {
    unsortedAddresses.sort((a: Address, b: Address) => ipSort(a.ip || a.CIDR, b.ip || b.CIDR))
  }

  static sortDhcpScopes(scopes: Array<DhcpScope>) {
    scopes.sort((a: DhcpScope, b: DhcpScope) => ipSort(a.start, b.start))
  }

  static displayDnsRecord(record: DnsRecord) {
    let owner = ''
    if (record.fqdn) {
      owner = record.fqdn
    } else if (record.name) {
      owner = record.zone ? `${record.name}.${record.zone}` : `${record.name}`
    }
    let data = record.type === 'TXT' ? `"${record.data}"` : record.data
    return `${owner} ${record.ttl} ${record.type} ${data}`
  }

  constructor(private http: HttpClient) {
  }

  getChildSubnetsAndNetworks(parent: Net): Observable<Net[]> {
    let params = new HttpParams()
    if (parent && parent.id && parent.CIDR) {
      params = params.append('parentId', parent.id.toString())
      params = params.append('parentCidr', parent.CIDR.toString())
    }
    return this.http.get<Net[]>('/api/v1/ipam-resources/networks', {
      params
    })
  }

  getParentsOfZone(id: number): Observable<Zone[]> {
    if (!id || id === 0) {
      return of([])
    }
    return this.http.get<Zone[]>(`/api/v1/ipam-resources/parents-of-zone/${encodeURIComponent(id.toString())}`)
  }

  getParentsAndGroupsForNetwork(id: number, type?: string): Observable<Net> {
    return this.http.get<Net>(`/api/v1/ipam-resources/networks/${encodeURIComponent(id.toString())}${type ? `?type=${type}` : ''}`)
  }

  getParentsAndGroupsForSubnet(id: number): Observable<Net> {
    return this.http.get<Net>(`/api/v1/ipam-resources/subnets/${encodeURIComponent(id.toString())}`)
  }

  getDirectParentNetwork(netId: number, type?: string): Observable<Net> {
    return this.http.get<Net>(`/api/v1/ipam-resources/direct-parent-network/${encodeURIComponent(netId.toString())}${type ? `?type=${type}` : ''}`)
  }

  getSiblingSubnetsAndNetworks(id: number, type?: string) {
    return this.http.get<any>(`/api/v1/ipam-resources/${encodeURIComponent(id.toString())}/sibling${type ? `?type=${type}` : ''}`)
  }

  searchSubnetsByHint(hint: string) {
    let params = new HttpParams()
    params = params.append('hint', hint)
    return this.http.get<any[]>('/api/v1/ipam-resources/subnets', {
      params
    })
  }

  searchNetworksByHint(hint: string) {
    let params = new HttpParams()
    params = params.append('hint', hint)
    return this.http.get<any[]>('/api/v1/ipam-resources/networks', {
      params
    })
  }

  searchHostRecordsByFqdn(hint: string) {
    let params = new HttpParams()
    params = params.append('hint', hint)
    return this.http.get<DnsRecord[]>('/api/v1/ipam-resources/fqdn', {
      params
    })
  }

  getSubnetsByHostRecord(hostRecordId: number) {
    return this.http.get<any[]>(`/api/v1/ipam-resources/host-records/${encodeURIComponent(hostRecordId.toString())}/subnets`)
  }

  getAddresses(subnetId: number, subnetCidr: string): Observable<Address[]> {
    return this.http.get<Address[]>(`/api/v1/ipam-resources/subnets/${encodeURIComponent(subnetId.toString())}/addresses?ip=${subnetCidr}`)
  }

  getAddressesByStartEnd(subnetId: number, subnetCidr: string, startIp: string, endIp: string): Observable<Address[]> {
    return this.http.get<Address[]>(`/api/v1/ipam-resources/subnets/${encodeURIComponent(subnetId.toString())}/addresses/${startIp}/${endIp}?ip=${subnetCidr}`)
  }

  getAddressesByHostRecord(hostRecordId: number) {
    return this.http.get<Address[]>(`/api/v1/ipam-resources/host-records/${encodeURIComponent(hostRecordId.toString())}/addresses`)
  }

  getDnsRecordsByAddress(addressIp: string) {
    let params = new HttpParams()
    params = params.append('ip', addressIp)
    return this.http.get<DnsRecord[]>('/api/v1/ipam-resources/dns-records', {
      params
    }).pipe(catchError(() => {
      return of(<DnsRecord[]>[])
    }))
  }

  getAddressByIp(ip: string) {
    let params = new HttpParams()
    params = params.append('address', ip)
    return this.http.get<Address>('/api/v1/ipam-resources/addresses', {
      params
    })
  }

  getAddressAnyByIp(ip: string) {
    let params = new HttpParams()
    params = params.append('address', ip)
    return this.http.get<Address>('/api/v1/ipam-resources/any-address', {
      params
    })
  }

  uploadCsv(formData: FormData): Observable<any> {
    return this.http.post<any>('/api/v1/upload', formData)
  }

  uploadText(formData: FormData): Observable<any> {
    return this.http.post<any>('/api/v1/upload?type=text', formData)
  }

  exportCsv(array: any[], filename?: string) {
    if (array && array.length > 0) {
      let meta = 'data:text/csv;charset=utf-8,'
      let body = array[0].join(',') + '\n'
      for (let i = 1, n = array.length; i < n; i++) {
        body += array[i].map((item: any) => '"' + item + '"').join(',') + '\n'
      }
      let uri = encodeURI(meta + body)
      if (filename) {
        let link = document.createElement('a')
        if (typeof link.download === 'string') {
          link.href = uri
          link.download = filename
          document.body.appendChild(link) // for FF to work
          link.click()
          document.body.removeChild(link) // for FF to work
        } else {
          window.open(uri)
        }
      } else {
        window.open(uri)
      }
    }
  }

  getZonesByHint(hint: string): Observable<Zone[]> {
    return this.http.get<Zone[]>('/api/v1/ipam-resources/zones/' + hint)
  }

  addIpv4Address(data: WizardAddIpv4AddressData): Observable<any> {
    let addresses: any = []
    if (data.mode === 'single') {
      addresses.push({
        ip4Address: data.modeSingleData.ip4Address,
        hostname: data.modeSingleData.hostname,
        zone: data.modeSingleData.zone.fqdn,
        addressName: data.modeSingleData.addressName
      })
    } else if (data.mode === 'multiple') {
      addresses = addresses.concat(data.modeMultipleData)
    } else {
      throw 'Submission mode ' + data.mode + ' is not supported'
    }
    const params = {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      addresses: addresses
    }
    return this.http.post<any>('/api/v1/add-ip-and-dns-record', params)
  }

  deleteIpv4Address(data: WizardDeleteIpv4AddressData): Observable<any> {
    let addresses: any = []
    if (data.mode === 'single') {
      addresses.push({
        ip: data.modeSingleData.address.CIDR
      })
    } else if (data.mode === 'multiple') {
      data.modeMultipleData.forEach((item) => {
        addresses.push({
          ip: item.address
        })
      })
    } else {
      throw 'Submission mode ' + data.mode + ' is not supported'
    }
    const params = {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      addresses: addresses
    }
    return this.http.post<any>('/api/v1/delete-ip-and-dns-record', params)
  }

  addSubnet(data: WizardAddSubnetData) {
    let subnets: {
      cidr: string
      name: string
      subGroup: string
      gateway: string
      reserved: boolean
      parentCidr?: string
    } [] = []
    if (data.mode === SINGLE) {
      subnets.push({
        cidr: data.modeSingleData.CIDR,
        name: data.modeSingleData.name,
        gateway: data.modeSingleData.gateway,
        subGroup: data.modeSingleData.subGroup ? data.modeSingleData.subGroup.name : null,
        reserved: data.modeSingleData.reserved,
        parentCidr: data.modeSingleData.parent.net.CIDR
      })
    } else {
      data.modeMultipleData.tableData.forEach((item) => {
        subnets.push({
          cidr: item.CIDR,
          gateway: item.gateway,
          name: item.name,
          reserved: item.reserved === 'Yes' ? true : false,
          subGroup: item.subGroup
        })
      })
    }
    let params = {
      changeid: data.detail.changeid,
      subnets: subnets
    }
    return this.http.post<any>('/api/v1/add-subnets', params)
  }

  addNetwork(data: WizardAddNetworkData) {
    let networks: {
      cidr: string
      name: string
      subGroup: string
      parentCidr?: string
    } [] = []
    if (data.mode === 'single') {
      networks.push({
        cidr: data.modeSingleData.CIDR,
        name: data.modeSingleData.name,
        subGroup: data.modeSingleData.subGroup ? data.modeSingleData.subGroup.name : null,
        parentCidr: data.modeSingleData.parent.net.CIDR
      })
    } else if (data.mode === 'multiple') {
      data.modeMultipleData.tableData.forEach((item) => {
        networks.push({
          cidr: item.CIDR,
          name: item.name,
          subGroup: item.subGroup
        })
      })
    } else {
      throw 'Submission mode ' + data.mode + ' is not supported'
    }
    const params = {
      changeid: data.detail.changeid,
      networks: networks
    }
    return this.http.post<any>('/api/v1/add-networks', params)
  }

  addDnsRecord(data: WizardAddDnsRecordData) {
    let records: DnsRecord[] = []
    if (data.mode === SINGLE) {
      records.push({
        type: data.modeSingleData.type,
        name: data.modeSingleData.name,
        zone: data.modeSingleData.zone,
        ttl: data.modeSingleData.ttl,
        data: data.modeSingleData.data
      })
    } else {
      data.modeMultipleData.forEach((item) => {
        records.push({
          type: item.type,
          name: item.name,
          zone: item.zone,
          ttl: item.ttl,
          data: item.data
        })
      })
    }
    let params = {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      records: records
    }
    return this.http.post<any>('/api/v1/add-dns-record', params)
  }

  modifyDnsRecord(data: WizardModifyDnsRecordData) {
    let records: DnsRecord[] = []
    if (data.mode === SINGLE) {
      if (data.modeSingleData.dnsRecord.type === 'HOST' && data.modeSingleData.dnsRecord.temp &&
        data.modeSingleData.dnsRecord.temp.length > 0) {
        data.modeSingleData.dnsRecord.data += `,${data.modeSingleData.dnsRecord.temp.join(',')}`
      }
      records.push({
        type: data.modeSingleData.dnsRecord.type === 'HOST' ? 'A' : data.modeSingleData.dnsRecord.type,
        name: data.modeSingleData.dnsRecord.name,
        zone: data.modeSingleData.dnsRecord.zone,
        ttl: data.modeSingleData.dnsRecord.ttl,
        data: data.modeSingleData.dnsRecord.data
      })
    } else {
      data.modeMultipleData.forEach((item) => {
        records.push({
          type: item.type,
          name: item.name,
          zone: item.zone,
          ttl: item.ttl,
          data: item.data
        })
      })
    }
    let params = {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      records: records
    }
    return this.http.post<any>('/api/v1/modify-dns-record', params)
  }

  getDnsRecordsByNameInZone(name: string, zoneId: number, type = '') {
    return this.http.get<any>(`api/v1/ipam-resources/zones/` +
      `${encodeURIComponent(zoneId.toString())}/dns-records/${name}?type=${type}`)
  }

  moveDnsRecords(data: WizardMoveDnsRecordData) {
    let addresses: {
      sourceIp: string
      targetIp: string
    } [] = []
    if (data.mode === SINGLE) {
      addresses.push({
        sourceIp: data.modeSingleData.currentAddress.CIDR,
        targetIp: data.modeSingleData.targetAddress.ip
      })
    } else {
      data.modeMultipleData.forEach((item) => {
        addresses.push({
          sourceIp: item.currentAddress,
          targetIp: item.targetAddress
        })
      })
    }
    let params = {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      addresses: addresses
    }
    return this.http.post<any>('/api/v1/move-dns-record-to-new-ip', params)
  }

  getSubnetList(data: WizardGetSubnetListData) {
    let params = {
      changeid: data.detail.changeid
    }
    return this.http.post<any>('/api/v1/get-subnet-list', params)
  }

  getStoreList(data: WizardGetStoreListData) {
    let params = {
      changeid: data.detail.changeid
    }
    return this.http.post<any>('/api/v1/get-store-list', params)
  }

  getDhcpOptions({subnetId, addressIp}: any) {
    let params = new HttpParams()
    if (subnetId) {
      params = params.append('subnetId', subnetId)
    }
    if (addressIp) {
      params = params.append('addressIp', addressIp)
    }
    return this.http.get<DhcpOption[]>(`/api/v1/ipam-resources/dhcpoptions`, { params })
  }

  getDhcpScopes({subnetId, addressIp}: any): Observable<DhcpScope[]> {
    let params = new HttpParams()
    if (subnetId) {
      params = params.append('subnetId', subnetId)
    }
    if (addressIp) {
      params = params.append('addressIp', addressIp)
    }
    return this.http.get<DhcpScope[]>(`/api/v1/ipam-resources/dhcpscopes`, { params })
  }

  getDhcpLeases({addressIp}: any): Observable<DhcpLease[]> {
    let params = new HttpParams()
    if (addressIp) {
      params = params.append('addressIp', addressIp)
    }
    return this.http.get<DhcpLease[]>(`/api/v1/ipam-resources/dhcpleases`, { params })
  }

  expandDhcpScope(data: WizardExpandDhcpScopeData) {
    let params = {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      originalStart: data.navigateDhcpOptionsAndScopes.selectedDhcpScope.start,
      originalEnd: data.navigateDhcpOptionsAndScopes.selectedDhcpScope.end,
      start: data.newStartIp,
      end: data.newEndIp
    }
    return this.http.post<any>('/api/v1/modify-dhcp-scope', params)
  }

  addDhcpScope(data: WizardAddDhcpScopeData) {
    let items: Array<any> = []
    if (data.mode === SINGLE) {
      items.push({
        subnet: data.modeSingleData.navigateDhcpOptionsAndScopes.navigateSubnet.net.CIDR,
        start: data.modeSingleData.startIpAddress,
        size: Math.max(0, ip2long(data.modeSingleData.endIpAddress) - ip2long(data.modeSingleData.startIpAddress) + 1)
      })
    } else {
      data.modeMultipleData.forEach((item) => {
        items.push({
          start: item.start,
          size: item.size
        })
      })
    }
    let params = {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      data: items
    }
    return this.http.post<any>('/api/v1/add-dhcp-scopes', params)
  }

  getDhcpRoleOnSubnet(subnetId: number): Observable<any[]> {
    let params = new HttpParams()
    params = params.append('type', 'dhcp')
    return this.http.get<any[]>('/api/v1/ipam-resources/deployment-roles/' + subnetId, {
      params: params
    })
  }

  hasWriteAccess(entityId: number) {
    return this.http.get(`/api/v1/ipam-resources/has-write-access/${encodeURIComponent(entityId.toString())}`, {
      responseType: 'text'
    })
  }

  isValidDhcpScope(scopeId?: number, startIp?: string, endIp?: string, isNew = false): Observable<boolean> {
    let params = new HttpParams()
    if (scopeId) {
      params = params.append('scopeId', scopeId.toString())
    }
    if (startIp) {
      params = params.append('startIp', startIp)
    }
    if (endIp) {
      params = params.append('endIp', endIp)
    }
    params = params.append('isNew', String(isNew))
    return this.http.get<boolean>(`/api/v1/ipam-resources/dhcpscopes/isValid`, {
      params: params
    })
  }

  addDhcpReservation(data: WizardAddDhcpReservationData) {
    let items: {
      ip4Address: string
      hostname: string
      zone: string
      addressName: string
      macAddress: string
      replaceDhcp: boolean
    } [] = []
    if (data.mode === SINGLE) {
      items.push({
        ip4Address: data.modeSingleData.ipAddress,
        hostname: data.modeSingleData.hostName,
        zone: data.modeSingleData.parentZone.fqdn,
        addressName: data.modeSingleData.ipAddressName,
        macAddress: data.modeSingleData.macAddress,
        replaceDhcp: data.modeSingleData.replaceDhcp
      })
    } else {
      data.modeMultipleData.forEach((item) => {
        items.push({
          ip4Address: item.ipAddress,
          hostname: item.hostName,
          zone: item.parentZone,
          addressName: item.ipAddressName,
          macAddress: item.macAddress,
          replaceDhcp: item.replaceDhcp === 'Yes' ? true : false,
        })
      })
    }
    let params = {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      data: items
    }
    return this.http.post<any>('/api/v1/add-dhcp-reservation', params)
  }

  getAddDhcpReservationValidation(macAddress: string, subnetId: string) {
    let params = new HttpParams()
    params = params.append('macAddress', macAddress)
    params = params.append('subnetId', subnetId)
    return this.http.get<any>('/api/v1/ipam-resources/validate-mac-address', {
      params: params
    })
  }

  isActiveSubnet(subnetId: number) {
    return this.http.get(`/api/v1/ipam-resources/is-active-subnet/${encodeURIComponent(subnetId.toString())}`, {
      responseType: 'text'
    })
  }

  isRoundRobinDns(zoneName: string, hostName: string, type: string) {
    let params = new HttpParams()
    params = params.append('hostName', hostName)
    return this.http.get(`/api/v1/ipam-resources/is-round-robin-dns/${encodeURIComponent(hostName.toString())}?type=${type}&zoneName=${zoneName}`, {
      params: params
    })
  }

  modifySubnet(data: WizardModifySubnetData) {
    let action
    let params
    if (data.mode === 'split') {
      action = data.mode
      params = {
        changeid: data.detail.changeid,
        data: [{
          cidr: data.modeSplitSubnetData.navigateSubnet.net.CIDR,
          firstName: data.modeSplitSubnetData.firstSubnet.name,
          firstGateway: data.modeSplitSubnetData.firstSubnet.gateway,
          firstReserved: data.modeSplitSubnetData.firstSubnet.reserved,
          secondName: data.modeSplitSubnetData.secondSubnet.name,
          secondGateway: data.modeSplitSubnetData.secondSubnet.gateway,
          secondReserved: data.modeSplitSubnetData.secondSubnet.reserved
        }]
      }
    } else if (data.mode === 'join') {
      action = data.mode
      params = {
        changeid: data.detail.changeid,
        data: [{
          firstCidr: data.modeJoinSubnetData.navigateSubnet.net1.CIDR,
          secondCidr: data.modeJoinSubnetData.navigateSubnet.net2.CIDR,
          newGateway: data.modeJoinSubnetData.joinedSubnet.gateway,
          newName: data.modeJoinSubnetData.joinedSubnet.name,
          newReserved: data.modeJoinSubnetData.joinedSubnet.reserved
        }]
      }
    } else if (data.mode === 'activate') {
      action = data.mode
      params = {
        changeid: data.detail.changeid,
        data: [{
          cidr: data.modeActivateSubnetData.navigateSubnet.net.CIDR,
          newGateway: data.modeActivateSubnetData.subnetGateway,
          newName: data.modeActivateSubnetData.subnetName
        }]
      }
    } else if (data.mode === 'modify-dhcp-service') {
      action = data.mode
      params = {
        changeid: data.detail.changeid,
        deployNow: data.detail.deployNow,
        data: [{
          cidr: data.modeModifyDhcpData.navigateSubnet.net.CIDR,
          dhcpService: data.modeModifyDhcpData.newDhcpService.name
        }]
      }
    }
    return this.http.post<any>('/api/v1/modify-subnet/' + action, params)
  }

  getSplitSubnetInfo(originalSubnetCidr: string): Observable<any> {
    let params = new HttpParams()
    params = params.append('subnet', originalSubnetCidr)
    return this.http.get<any>('/api/v1/ipam-resources/split-subnet-info', {
      params
    })
  }

  getJoinedSubnet(subnet1: Net, subnet2: Net): Net {
    return {
      CIDR: this.tryJoin(subnet1.CIDR, subnet2.CIDR),
      name: subnet1.name,
      gateway: subnet1.gateway,
      reserved: true
    }
  }

  getJoinableSubnets(firtSubnetCidr: string): Observable<Net[]> {
    let params = new HttpParams()
    params = params.append('subnet', firtSubnetCidr)
    return this.http.get<Net[]>('/api/v1/ipam-resources/joinable-subnets', {
      params
    })
  }

  private tryJoin(net1Cidr: string, net2Cidr: string) {
    const mask1 = new Netmask(net1Cidr)
    const mask2 = new Netmask(net2Cidr)
    const mask = mask1.netLong < mask2.netLong ? mask1 : mask2
    return `${mask.base}/${mask.bitmask - 1}`
  }

  getWincorSubnets(): Observable<number[]> {
    return this.http.get<any>('/api/v1/ipam-resources/build-wincor/third-octets')
  }

  isUsedStoreNumber(storeNumber: string): Observable<boolean> {
    return this.http.get<boolean>('/api/v1/ipam-resources/is-used-store-number/' + storeNumber)
  }

  isStoreZoneExist(storeNumber: string): Observable<boolean> {
    return this.http.get<boolean>('/api/v1/ipam-resources/is-store-zone-exist/' + storeNumber)
  }

  isValidSubnet(subnet: number): Observable<boolean> {
    return this.http.get<boolean>('/api/v1/ipam-resources/build-wincor/is-valid-third-octet/' + subnet)
  }

  issBuildWincor(data: WizardIssBuildWincorData): Observable<any> {
    let params = {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      storeNumber: data.storeNumber,
      octet: data.octet
    }
    return this.http.post<any>('/api/v1/iss-build-wincor', params)
  }

  getDhcpServices(forSubnetId: number): Observable<DhcpService[]> {
    return this.http.get<DhcpService[]>(`/api/v1/ipam-resources/dhcp-services?` +
      `forSubnet=${encodeURIComponent(forSubnetId.toString())}`).pipe(catchError(() => {
      return of([])
    }))
  }

  getSubnetDhcpService(subnetId: number, cidr: string): Observable<DhcpService> {
    return this.http.get<DhcpService>(`/api/v1/ipam-resources/subnets/${encodeURIComponent(subnetId.toString())}/dhcp-service?cidr=${cidr}`)
  }

  createStore(data: WizardCmdStoreData) {
    let params = data.newStore
    params['changeid'] = data.detail.changeid
    params['deployNow'] = data.detail.deployNow
    return this.http.post<any>('/api/v1/add-modify-or-delete-store/create', params)
  }

  deleteStore(data: WizardCmdStoreData) {
    return this.http.post<any>('/api/v1/add-modify-or-delete-store/delete', {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      data: [{
        storeNumber: data.newStore.storeNumber
      }]
    })
  }

  modifyStore(data: WizardCmdStoreData) {
    let params = data.newStore
    params['changeid'] = data.detail.changeid
    params['deployNow'] = data.detail.deployNow
    return this.http.post<any>('/api/v1/add-modify-or-delete-store/modify', params)
  }

  getStore(storeNumber: number): Observable<any> {
    return this.http.get<any>(`/api/v1/ipam-resources/get-store/${storeNumber}`)
  }

  isValidStoreSubnet(nodeSite: number, channelNumber: number): Observable<boolean> {
    return this.http.get<boolean>(`api/v1/ipam-resources/is-valid-store-subnet?node=${nodeSite}&channel=${channelNumber}`)
  }

  getCmdStoreChanges(data: WizardCmdStoreData): Observable<any[]> {
    if (data.mode === 'create') {
      return this.http.post<any[]>('/api/v1/add-modify-or-delete-store/create/review', data.newStore)
    } else if (data.mode === 'delete') {
      return this.http.get<any[]>(`/api/v1/add-modify-or-delete-store/delete/${data.newStore.storeNumber}/review`)
    } else if (data.mode === 'modify') {
      return this.http.post<any[]>(`/api/v1/add-modify-or-delete-store/modify/review`, data.newStore)
    }
  }

  getSubnetOfAddress(ip: string): Observable<Net> {
    return this.http.get<Net>(`/api/v1/ipam-resources/subnets?childAddress=${ip}`)
  }

  isAddressPartOfDhcpScope(ip: string): Observable<boolean> {
    return this.http.get<boolean>(`/api/v1/ipam-resources/is-part-dhcp-scope?address=${ip}`)
  }

  getSubnetOfExistingAddress(entityId: number): Observable<any> {
    return this.http.get<any>(`/api/v1/ipam-resources/direct-parent-subnet?id=${entityId}`)
  }

  getAddressPermission(addr: string): Observable<boolean> {
    return this.http.get<boolean>(`/api/v1/ipam-resources/addresses/permission?address=${addr}`)
  }

  getHostRecordPermission(hostRecord: string): Observable<boolean> {
    return this.http.get<boolean>(`/api/v1/ipam-resources/host-records/permission?host=${hostRecord}`)
  }

  getHostRecordActiveStatus(hostRecord: string): Observable<boolean> {
    return this.http.get<boolean>(`/api/v1/ipam-resources/host-records/status?host=${hostRecord}`)
  }

  getZoneChildren(id: number): Observable<Zone[]> {
    return this.http.get<Zone[]>(`/api/v1/ipam-resources/zones/${encodeURIComponent(id.toString())}/children/`)
  }

  getZoneSiblings(id: number): Observable<Zone[]> {
    return this.http.get<Zone[]>(`/api/v1/ipam-resources/zones/${encodeURIComponent(id.toString())}/siblings/`)
  }

  getDirectParentZone(id: number): Observable<Zone> {
    return this.http.get<Zone>(`/api/v1/ipam-resources/direct-parent-zone/${encodeURIComponent(id.toString())}`)
  }

  getDnsRecordsOfZone(zoneId: number, type: string, name: string, page: number, limit: number): Observable<any> {
    let params = new HttpParams()
    if (name) {
      params = params.append('name', name)
    }
    return this.http.get<any>(`/api/v1/ipam-resources/zones/${encodeURIComponent(zoneId.toString())}/` +
      `dns-records?type=${type}&page=${page}&limit=${limit}`, {params})
  }

  getZoneAndRecordsByFqdn(fqdn: string): Observable<{ zone: Zone, record: DnsRecord }> {
    return this.http.get<any>(`/api/v1/ipam-resources/fqdn/${fqdn}/zone`)
  }

  downloadSample(name: string) {
    window.open(`/api/v1/samples/${name}`, '_blank')
  }

  getUsageReport(data: WizardGetUsageReportData) {
    return this.http.post<any>('/api/v1/get-usage-report', {
      'changeid': data.detail.changeid,
      'from': data.from,
      'to': data.to,
      'timeZone': data.timeZone
    })
  }

  getSubnetsByCIDR(CIDR: string) {
    return this.http.get<any>(`/api/v1/ipam-resources/subnet/${encodeURIComponent(CIDR.toString())}`)
  }

  modifyDhcpReservation(data: ModifyDhcpReservationData) {
    let items: {
      ipAddress: string
      macAddress: string
      addressName: string
      replaceDhcp?: boolean
    } [] = []
    if (data.mode === SINGLE) {
      items.push({
        ipAddress: data.modeSingleData.ipAddress,
        macAddress: data.modeSingleData.newMacAddress,
        addressName: data.modeSingleData.newAddressName
      })
    } else {
      data.modeMultipleData.forEach((item) => {
        items.push({
          ipAddress: item.ipAddress,
          macAddress: item.macAddress,
          addressName: item.addressName,
          replaceDhcp: item.replaceDhcp === 'Yes' ? true : false
        })
      })
    }
    let params = {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      data: items
    }
    return this.http.post<any>('/api/v1/modify-dhcp-reservation', params)
  }

  searchAddressesByMac(mac: string): Observable<Address[]> {
    let params = new HttpParams()
    params = params.append('macAddress', mac)
    return this.http.get<Address[]>(`/api/v1/ipam-resources/addresses`, {
      params
    })
  }

  addZone(data: AddZoneData) {
    let items: {
      parentZone: string
      name: string
    } [] = []
    if (data.mode === SINGLE) {
      items.push({
        parentZone: data.modeSingleData.parentZone,
        name: data.modeSingleData.name
      })
    } else {
      data.modeMultipleData.forEach((item) => {
        items.push({
          parentZone: item.parentZone,
          name: item.name
        })
      })
    }
    let params = {
      changeid: data.detail.changeid,
      deployNow: data.detail.deployNow,
      data: items
    }
    return this.http.post<any>('/api/v1/add-child-zone', params)
  }

  getZoneProfile(name: string) {
    return this.http.get<Zone>(`/api/v1/ipam-resources/zones/profile?name=${encodeURIComponent(name)}`)
  }

  getGroupChildren(id: number): Observable<Group[]> {
    return this.http.get<Group[]>(`/api/v1/ipam-resources/groups?parent-id=${encodeURIComponent(id.toString())}`)
  }

  getGroupProfile(id: number) {
    return this.http.get<Group>(`/api/v1/ipam-resources/groups/${encodeURIComponent(id.toString())}`)
  }

  getDirectParentGroup(id: number): Observable<Group> {
    return this.http.get<Group>(`/api/v1/ipam-resources/groups?child-id=${encodeURIComponent(id.toString())}`)
  }

  getGroupsByHint(hint: string): Observable<Group[]> {
    return this.http.get<Group[]>(`/api/v1/ipam-resources/groups?name=${hint}`)
  }

  addGroup(dt: WizardAddGroupData): any {
    let items = {
      parent_id: dt.data.id,
      name: dt.subGroupName,
      attributeName: dt.subAttributeName
    }
    let params = {
      changeid: dt.detail.changeid,
      data: [items]
    }
    return this.http.post<any>('/api/v1/add-sub-group', params)
  }

  getZoneList(data: WizardGetStoreListData) {
    let params = {
      changeid: data.detail.changeid
    }
    return this.http.post<any>('/api/v1/get-zone-list', params)
  }
}
