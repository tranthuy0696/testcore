import { Injectable } from '@angular/core'
import { Validators, AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms'
import { Netmask, ip2long } from 'netmask'
import { Address } from '../models/ipam-resource.model'
import { IpamResourceService } from './ipam-resource.service'
import { Observable, of, forkJoin } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'
import { catchError, mergeMap, map } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { Organization } from '../models/organization.model'

@Injectable()
export class AppValidators {

  public static ipV4Pattern = '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)'
  public static macPattern = '^([0-9A-Fa-f]{2}[.:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$|^([0-9A-Fa-f]{4}[.]){2}([0-9A-Fa-f]{4})$|^([0-9A-Fa-f]{6}[.])([0-9A-Fa-f]{6})$'
  public static macPatternSpecial = '^(0{2}[.:-]){5}(0{2})$|^(0{12})$|^(0{4}[.]){2}(0{4})$|^(0{6}[.])(0{6})$'
  static ipV4 = Validators.pattern(AppValidators.ipV4Pattern)
  static integer = Validators.pattern('([1-9]\\d*|0)')
  static mac = Validators.pattern(AppValidators.macPattern)

  term: any

  private static ipToLong(ip: string) {
    const d = ip.split('.')
    return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3])
  }

  static cidr(control: AbstractControl) {
    let cidr = control.value
    const pattern = new RegExp('(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}'
      + '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-9]|[1-2][0-9]|3[0-2]))')
    if (!pattern.test(cidr)) {
      return {
        pattern: {
          valid: false,
          parsedDomain: cidr
        }
      }
    } else {
      try {
        const base = new Netmask(cidr).base
        const inputBase = cidr.split('/')[0]
        if (base.trim() !== inputBase.trim()) {
          return {
            pattern: {
              valid: false,
              parsedDomain: cidr
            }
          }
        }
      } catch (err) {
        return {
          pattern: {
            valid: false,
            parsedDomain: cidr
          }
        }
      }
    }
  }

  static isIp(ip: string): boolean {
    try {
      let test = new Netmask(ip)
      return test ? true : false
    } catch (error) {
      return false
    }
  }

  static isSearchStringFqdnValid(fqdn: string): boolean {
    const pattern = new RegExp('^[a-z0-9-\._]+$')
    return pattern.test(fqdn)
  }

  static isMacAddress(mac: string): boolean {
    const pattern = new RegExp(AppValidators.macPattern)
    return pattern.test(mac)
  }

  static multipleIps() : ValidatorFn {
    let validator : ValidatorFn = function (control: AbstractControl) {
      let ips = control.value
      if (!ips) {
        return null
      }
      let ipArray = ips.split(',')
      let pattern = new RegExp(`^${AppValidators.ipV4Pattern}$`)
      if (ipArray.filter((ip: string) => !ip || !pattern.test(ip) || !AppValidators.isIp(ip)).length > 0) {
        return {
          pattern: {
            valid: false,
            parsedDomain: ips
          }
        }
      }
      return null
    }
    return validator
  }

  static isValidMac() : ValidatorFn {
    let validator : ValidatorFn = function (control: AbstractControl) {
      let macAddress = control.value
      if (!macAddress) {
        return null
      }
      let pattern = new RegExp(AppValidators.macPatternSpecial)
      if (!new RegExp(AppValidators.macPattern).test(macAddress) || pattern.test(macAddress)) {
        return {
          pattern: {
            valid: false,
            parsedDomain: macAddress
          }
        }
      }
      return null
    }
    return validator
  }

  static minIp(minIp: string) {
    const self = this
    return function (control: AbstractControl) {
      let ip = control.value
      if (ip && minIp && self.ipToLong(minIp) > self.ipToLong(ip)) {
        return {
          minIp: {
            valid: false,
            parsedDomain: ip
          }
        }
      }
      return null
    }
  }

  static maxIp(maxIp: string) {
    const self = this
    return function (control: AbstractControl) {
      let ip = control.value
      if (ip && maxIp && self.ipToLong(maxIp) < self.ipToLong(ip)) {
        return {
          maxIp: {
            valid: false,
            parsedDomain: ip
          }
        }
      }
      return null
    }
  }

  static insideBlock(block: string) {
    const parentBlock = new Netmask(block)
    return (control: AbstractControl) => {
      try {
        let childBlock = new Netmask(control.value)
        const isValid = parentBlock.contains(childBlock)
        if (isValid) {
          return null
        } else {
          return {
            insideBlock: {
              valid: false,
              parsedDomain: childBlock
            }
          }
        }
      } catch (err) {
        return null
      }
    }
  }

  static conflictBlock(bs: string[]) {
    const blocks = bs.map((b) => new Netmask(b))
    return (control: AbstractControl) => {
      try {
        const block = new Netmask(control.value)
        let isValid = true
        for (let i = 0; i < blocks.length; i++) {
          if (blocks[i].contains(block) || block.contains(blocks[i])) {
            isValid = false
          }
        }
        if (isValid) {
          return null
        } else {
          return {
            conflictBlock: {
              valid: false,
              parsedDomain: block
            }
          }
        }
      } catch (err) {
        return null
      }
    }
  }
  static isValidSize(parentNetwork: string) : ValidatorFn {
    let validator : ValidatorFn = (control: AbstractControl) => {
      let childNetwork = control.value
      const parentSize = parentNetwork.split('/')[1]
      const isValid = childNetwork.split('/').length > 1 ? parentSize !== childNetwork.split('/')[1] : true
      if (isValid) {
        return null
      } else {
        return {
          validSize: {
            valid: false,
            parsedDomain: childNetwork
          }
        }
      }
    }
    return validator
  }
  static isEmpty(value: string) {
    return !value || value === ''
  }

  static isIpv4(value: string) {
    return new RegExp(`^${AppValidators.ipV4Pattern}$`).test(value)
  }

  static ip(netCidr?: string) : ValidatorFn {
    let validator : ValidatorFn = (control: AbstractControl) => {
      let checkRequired = Validators.required(control)
      if (checkRequired) {
        return checkRequired
      }
      let checkIp = AppValidators.ipV4(control)
      if (checkIp) {
        return checkIp
      }
      let checkNetOrBroadcast = AppValidators.netidOrBroadcast(netCidr)(control)
      if (checkNetOrBroadcast) {
        return checkNetOrBroadcast
      }
      if (netCidr) {
        let checkWinthinNet = AppValidators.notWithinNet(netCidr)(control)
        if (checkWinthinNet) {
          return checkWinthinNet
        }
      }
      return null
    }
    return validator
  }

  static notWithinNet(netCidr: string) : ValidatorFn {
    let validator : ValidatorFn = (control: AbstractControl) => {
      let ipCheck = Validators.required(control)
      if (ipCheck && ipCheck.required) {
        return null
      }
      ipCheck = AppValidators.ipV4(control)
      if (ipCheck && ipCheck.pattern) {
        return null
      }
      return new Netmask(netCidr).contains(control.value) ? null : { notWithinNet: true }
    }
    return validator
  }

  static isEndLessThanStart(start: string, end: string): boolean {
    try {
      if (this.isIpv4(end) && this.isIpv4(start)) {
        return ip2long(end) < ip2long(start)
      }
      return false
    } catch (e) {
      return false
    }
  }

  static isOverlap(start: string, end: string, addresses: Address[]): boolean {
    try {
      const endLong = ip2long(end)
      for (let startMask = new Netmask(start); startMask.netLong <= endLong; startMask = startMask.next()) {
        let found = addresses.find((e) => ip2long(e.ip) === startMask.netLong)
        if (found && found.state !== 'Available') {
          return true
        }
      }
      return false
    } catch (e) {
      return false
    }
  }

  static isValidGateway(b: string) : ValidatorFn {
    let validator : ValidatorFn = (control: FormControl) => {
      try {
        const block = new Netmask(b)
        const gateway = control.value.trim()
        const isValid = block.base !== gateway && block.broadcast !== gateway
        if (isValid) {
          return null
        } else {
          return {
            invalidGateway: {
              valid: false,
              parsedDomain: block
            }
          }
        }
      } catch (err) {
        return null
      }
    }
    return validator
  }

  static netidOrBroadcast(netCidr: string) : ValidatorFn{
    let validator : ValidatorFn = (control: AbstractControl) => {
      try {
        const block = new Netmask(netCidr)
        const ip = control.value.trim()
        if (block.base === ip) {
          return { netid: true }
        }
        if (block.broadcast === ip) {
          return { broadcast: true }
        }
        return null
      } catch (e) {
        return null
      }
    }
    return validator
  }

  static notBlank() : ValidatorFn {
    let validator : ValidatorFn = (control: AbstractControl): { [key: string]: any } => {
      let isWhitespace = (control.value || '').trim().length === 0
      let isValid = !isWhitespace
      return isValid ? null : { 'notBlank': 'value is only whitespace' }
    }
    return validator
  }

  constructor(private ipamResourceService: IpamResourceService,
    private translate: TranslateService,
    private http: HttpClient) {
    this.term = {
      GATEWAY: translate.instant('GATEWAY'),
      SUBNET: translate.instant('SUBNET'),
      DNS_ZONE: translate.instant('DNS_ZONE'),
      NETWORK: translate.instant('NETWORK'),
      DHCP_SCOPE: translate.instant('DHCP_SCOPE'),
      DHCP_RESERVATION: translate.instant('DHCP_RESERVATION'),
      IP_RESERVATION: translate.instant('IP_RESERVATION'),
      GROUP: translate.instant('GROUP')
    }
  }

  broadcastOrNetId(control: AbstractControl, overrideValue: any): Observable<ValidationErrors> {
    const address = overrideValue || control.value
    return this.ipamResourceService.getSubnetOfAddress(address).pipe(
      catchError(() => {
        return of(null)
      }),
      mergeMap(subnet => {
        if (subnet === null) {
          return of(null)
        }
        try {
          let block = new Netmask(subnet.CIDR)
          if (block.broadcast === address) {
            return of({ 'broadcastIpv4': true })
          } else if (block.base === address) {
            return of({ 'netid': true })
          } else {
            return of(null)
          }
        } catch (e) {
          return of(null)
        }
      })
    )
  }

  nonExistingAddress(control: AbstractControl): Observable<ValidationErrors> {
    return this.ipamResourceService.getAddressAnyByIp(control.value).pipe(
      catchError(() => of(null)),
      mergeMap(address => {
        if (address === null) {
          return of({ 'nonExistingAddress': true })
        } else if (address.state === 'DHCP') {
          return of({ 'isWithinDhcpScope': true})
        }
        return of(null)
      })
    )
  }

  existingAddress(control: AbstractControl, overrideValue: any): Observable<ValidationErrors> {
    const value = overrideValue || control.value
    return this.ipamResourceService.getAddressByIp(value).pipe(
      catchError(() => of(null)),
      mergeMap(address => {
        if (address !== null) {
          return of({ 'existingAddress': true })
        }
        return of(null)
      })
    )
  }

  notDhcpReserved(control: AbstractControl, overrideValue: any): Observable<ValidationErrors> {
    const value = overrideValue || control.value
    return this.ipamResourceService.getAddressByIp(value).pipe(
      catchError(() => of(null)),
      mergeMap(address => {
        return address && address.state === 'DHCP_RESERVED' ? of({ 'reservedDhcp': true }) : null
      })
    )
  }

  availableAddress(control: AbstractControl, overrideValue: any): Observable<ValidationErrors> {
    const value = overrideValue || control.value
    return this.ipamResourceService.getAddressByIp(value).pipe(
      catchError(() => of(null)),
      mergeMap(address => {
        if (address) {
          return this.ipamResourceService.getSubnetOfExistingAddress(address.id).pipe(mergeMap(subnet => {
            return forkJoin(
              this.ipamResourceService.hasWriteAccess(subnet.id),
              this.ipamResourceService.isActiveSubnet(subnet.id)
            ).pipe(map(result => {
              if (String(result[0]).toLowerCase() === 'false') {
                return { 'noWriteAccess': true }
              } else if (String(result[1]).toLowerCase() === 'false') {
                return { 'notActive': true }
              } else {
                return null
              }
            }))
          }))
        } else {
          return forkJoin(
            this.ipamResourceService.getAddressPermission(value).pipe(catchError(() => of(false))),
            this.ipamResourceService.getSubnetOfAddress(value).pipe(
              mergeMap(subnet => {
                return this.ipamResourceService.isActiveSubnet(subnet.id).pipe(catchError(() => of(false)))
              })
            )
          ).pipe(
            map(result => {
              if (String(result[0]).toLowerCase() === 'false') {
                return { 'noWriteAccess': true }
              } else if (String(result[1]).toLowerCase() === 'false') {
                return { 'notActive': true }
              } else {
                return null
              }
            }),
            catchError(() => {
              return of({ 'subnetNotExist': true })
            })
          )
        }
      })
    )
  }

  pointToInvalidData(control: AbstractControl, overrideValue: any): Observable<ValidationErrors> {
    const value = overrideValue || control.value
    return this.ipamResourceService.getAddressAnyByIp(value)
      .pipe(
        mergeMap(address => {
          if (address && address.invalid) {
            return of({ 'pointToInvalidData': true })
          } else {
            return of(null)
          }
        }),
        catchError(() => of(null))
      )
  }

  unsupportedRoundRobin(zoneName: string, hostname: string, type: string): ValidationErrors {
    return this.ipamResourceService.isRoundRobinDns(zoneName, hostname, type)
      .pipe(
        mergeMap((result) => {
          return result ? of({ 'unsupportedRoundRobin': true }) : of(null)
        }),
        catchError(() => of(null))
      )
  }

  unsupportedDnsRecordType(control: AbstractControl): ValidationErrors {
    let hasUnsupportedType = false
    for (let i = 0; i < control.value.length; i++) {
      let record = control.value[i]
      if (record.type !== 'A' && record.type !== 'PTR' && record.type !== 'CNAME' && record.type !== 'TXT') {
        hasUnsupportedType = true
        break
      }
    }
    return hasUnsupportedType ? { 'unsupportedDnsRecordType': true } : null
  }

  partOfDhcpScope(control: AbstractControl, overrideValue: any): Observable<ValidationErrors> {
    const value = overrideValue || control.value
    return this.ipamResourceService.isAddressPartOfDhcpScope(value).pipe(map(yes => {
      return yes ? { 'partOfDhcpScope': true } : null
    }))
  }

  hostname(control: AbstractControl): Observable<ValidationErrors> {
    let orgId = localStorage.getItem('user.org.id')
    return this.http.get<Organization>(`/api/v1/environments/${orgId}`).pipe(map(org => {
      const policy = org.customerPolicy
      if (!control.value) {
        return null
      }
      if (control.value.length < policy.hostNameValidation.minLength) {
        return { 'hostnameMinLength': policy.hostNameValidation.minLength }
      } else if (control.value.length > policy.hostNameValidation.maxLength) {
        return { 'hostnameMaxLength': policy.hostNameValidation.maxLength }
      }
      let additional = policy.hostNameValidation.allowUnderScore ? '_' : ''
      additional += policy.hostNameValidation.additionalCharSet.trim()
      let pattern = `^[0-9a-zA-Z${additional}-]+$`
      if (!control.value.match(pattern)) {
        return { 'hostnameInvalidCharacters': true }
      }
      return null
    }))
  }

  newGateway(control: AbstractControl): Observable<ValidationErrors> {
    return this.ipamResourceService.getAddressByIp(control.value).pipe(
      catchError(() => of(null)),
      mergeMap((address: Address) => {
        if (address !== null && address.state !== 'GATEWAY') {
          return of({ 'invalidNewGateway': true })
        }
        return of(null)
      })
    )
  }

  hasPermissionOnHost(control: AbstractControl): Observable<ValidationErrors> {
    return this.ipamResourceService.getHostRecordPermission(control.value).pipe(mergeMap((canAccess) => {
      return canAccess ? of(null) : of({ 'noWriteAccess': true })
    }),
      catchError(() => {
        return of({ 'noWriteAccess': true })
      })
    )
  }

  isActiveHostRecord(control: AbstractControl): Observable<ValidationErrors> {
    return this.ipamResourceService.getHostRecordActiveStatus(control.value).pipe(mergeMap((active) => {
      return active ? of(null) : of({ 'notActive': true })
    }),
      catchError(() => {
        return of({ 'notActive': true })
      })
    )
  }

  isMacEqual(mac1: String, mac2: String) {
    return mac1.toLowerCase().split(':').join('').split('-').join('') ===
      mac2.toLowerCase().split(':').join('').split('-').join('')
  }

  isValidMacAddressForAddDhcpReservation(subnetId: any, oldMacAddress: any) {
    return (control: AbstractControl) => {
      if (!subnetId) {
        return of(null)
      }
      const mac = control.value
      if (oldMacAddress && this.isMacEqual(oldMacAddress, mac)) {
        return of(null)
      }
      return this.ipamResourceService.getAddDhcpReservationValidation(mac, String(subnetId)).pipe(
        mergeMap((data) => {
          if (data.sameMacAddressInDhcp) {
            if (data.dhcpState === 'DHCP_RESERVED') {
              return of({ 'macReservedOnSubnet': true })
            }
            if (data.moreThanDefaultRecords) {
              return of({ 'macLinkedOtherRecords': true })
            }
            if (data.dhcpState === 'DHCP_ALLOCATED' &&
              !confirm(this.translate.instant(`MAC Address already exists in SUBNET within a dynamic DHCP_SCOPE.\n` +
                `Delete this object and replace with new DHCP_RESERVATION?`, this.term))) {
              return of({ 'macInLocalDhcpScope': true })
            }
          }
          return of(null)
        }),
        catchError(() => of(null))
      )
    }
  }

  isValidHostname(zone: any) {
    return (control: AbstractControl) => {
      if (!zone) {
        return of(null)
      }
      const hostname = control.value
      return this.ipamResourceService.getDnsRecordsByNameInZone(hostname, zone.id, 'HostRecord,AliasRecord')
        .pipe(
          mergeMap((data) => {
            return data && data.length > 0 ? of({ 'existingHostname': true }) : of(null)
          }),
          catchError(() => of(null))
        )
    }
  }
}
