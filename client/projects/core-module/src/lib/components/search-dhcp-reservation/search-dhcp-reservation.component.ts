import { BaseComponent } from '../base/base.component'
import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core'
import { IpamResourceService } from '../../services/ipam-resource.service'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { DnsRecord, Address } from '../../models/ipam-resource.model'
import { CoreSelectComponent } from '../core-select/core-select.component'
import { AppValidators } from '../../services/app-validators.service'
@Component({
  selector: 'search-dhcp-reservation',
  templateUrl: './search-dhcp-reservation.component.html'
})

export class SearchDhcpReservation extends BaseComponent {
  SEARCH_BY_FQDN = 'SEARCH_BY_FQDN'
  SEARCH_BY_IP = 'SEARCH_BY_IP'
  SEARCH_BY_MAC = 'SEARCH_BY_MAC'
  @Input('searchBy') searchBy = this.SEARCH_BY_MAC
  @ViewChild('selectIp', { static: true }) selectIp: CoreSelectComponent
  @ViewChild('selectFqdn', { static: true }) selectFqdn: CoreSelectComponent
  @ViewChild('selectMac', { static: true }) selectMac: CoreSelectComponent
  @Output() searchstart = new EventEmitter<any>()
  @Output() searchend = new EventEmitter<any>()

  searchedHostRecords: DnsRecord[] = []
  searchedHostRecord: DnsRecord = null
  matchingFQDN: DnsRecord = null
  searchedAddresses: Address[] = []
  searchedAddressEnd: Address = null
  searchedAddress: string
  searchedMac: string
  searching: boolean
  subscription: Subscription
  subscriptionAddress: Subscription
  hasError: boolean
  errorMessage: string
  isAllowGoFqdn = false
  INVALID_SEARCH_STRING = 'Search string is invalid'

  constructor(
    private ipamResourceService: IpamResourceService,
    private translate: TranslateService) {
    super(translate)
  }

  valueChange() {
    this.hasError = false
    if (this.searchBy === this.SEARCH_BY_IP) {
      this.searchedAddress = null
      this.searchedAddressEnd = null
    }
    if (this.searchBy === this.SEARCH_BY_MAC) {
      this.searchedAddresses = []
    }
  }

  instantSearch(value: string) {
    this.searching = true
    this.hasError = false
    this.searchedAddressEnd = null
    this.searchedAddress = ''
    if (!value) {
      this.searchedAddress = null
      this.searchedAddressEnd = null
      this.searchedHostRecord = null
      this.searchedHostRecords = []
      this.searchedMac = null
      this.searchedAddresses = []
      this.hasError = false
      this.searching = false
      return
    }
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    if (this.searchBy === this.SEARCH_BY_IP) {
      this.errorMessage = ''
      if (AppValidators.isIp(value)) {
        this.subscription = this.ipamResourceService.getAddressAnyByIp(value)
          .subscribe((address) => {
            if (address) {
              if (address.state === 'DHCP_RESERVED') {
                this.searchedAddress = address.ip
                this.searchedAddressEnd = address
              } else {
                this.errorMessage = this.translate.instant('IP is not a DHCP_RESERVATION', this.term)
                this.hasError = true
              }
            } else {
              this.errorMessage = this.translate.instant('IP does not exist', this.term)
              this.hasError = true
            }
            this.searching = false
          }, () => {
            this.errorMessage = this.translate.instant('IP does not exist', this.term)
            this.hasError = true
            this.searching = false
          })
      } else {
        this.errorMessage = this.translate.instant(this.INVALID_SEARCH_STRING, this.term)
        this.hasError = true
        this.searching = false
      }
    } else if (this.searchBy === this.SEARCH_BY_FQDN) {
      this.errorMessage = ''
      this.searchedHostRecords = []
      if (AppValidators.isSearchStringFqdnValid(value)) {
        this.searching = true
        this.subscription = this.ipamResourceService.searchHostRecordsByFqdn(value).subscribe((data) => {
          this.searchedHostRecords = data
          this.matchingFQDN = this.searchedHostRecords.find(record => record.fqdn.includes(value))
          this.searchedHostRecord = this.searchedHostRecords.find(record => record.fqdn === value)
          if (!this.matchingFQDN || !this.matchingFQDN.id) {
            this.errorMessage = this.translate.instant('No matching FQDN found')
            this.hasError = true
          }
          if (this.searchedHostRecord && this.searchedHostRecord.id) {
            this.validateHostRecord(this.searchedHostRecord)
          }
          this.searching = false
        }, () => {
          this.errorMessage = this.translate.instant('No matching FQDN found', this.term)
          this.hasError = true
          this.searching = false
        })
      } else {
        this.errorMessage = this.translate.instant(this.INVALID_SEARCH_STRING, this.term)
        this.hasError = true
        this.searching = false
      }
    } else if (this.searchBy === this.SEARCH_BY_MAC) {
      this.errorMessage = ''
      this.searchedAddresses = []
      if (AppValidators.isMacAddress(value)) {
        this.searching = true
        this.ipamResourceService.searchAddressesByMac(value).subscribe((addresses) => {
          if (addresses && addresses.length > 0) {
            addresses = addresses.filter((i) => i.state === 'DHCP_RESERVED')
            if (addresses && addresses.length > 0) {
              this.searchedAddresses = addresses
              this.searchedMac = value
            } else {
              this.errorMessage = this.translate.instant('IP Address of the MAC is not a DHCP_RESERVATION', this.term)
              this.hasError = true
            }
          } else {
            this.errorMessage = this.translate.instant('MAC Address does not exist', this.term)
            this.hasError = true
          }
          this.searching = false
        }, () => {
          this.errorMessage = this.translate.instant('MAC Address does not exist', this.term)
          this.hasError = true
          this.searching = false
        })
      } else {
        this.errorMessage = this.translate.instant(this.INVALID_SEARCH_STRING, this.term)
        this.hasError = true
        this.searching = false
      }
    }
  }

  search() {
    if (this.searchBy === this.SEARCH_BY_IP) {
      let value = this.selectIp.text
      this.searchstart.emit()
      if (this.searchedAddress && this.searchedAddressEnd && this.searchedAddressEnd.id) {
        this.searchend.emit({
          searchedString: value,
          searchedResult: this.searchedAddressEnd,
          searchedBy: this.SEARCH_BY_IP,
          searchedByResult: this.searchedAddress
        })
      } else {
        this.searchend.emit({
          searchedString: value,
          searchedResult: null,
          searchedBy: this.SEARCH_BY_IP,
          searchedByResult: null,
          hasError: this.hasError
        })
      }
    } else if (this.searchBy === this.SEARCH_BY_FQDN) {
      let value = this.selectFqdn.text
      this.searchstart.emit()
      if (this.searchedAddresses && this.searchedAddresses.length > 0) {
        this.searchend.emit({
          searchedString: value,
          searchedResult: this.searchedAddresses,
          searchedBy: this.SEARCH_BY_FQDN,
          searchedByResult: this.searchedAddress,
          hasError: this.hasError
        })
      } else {
        this.searchend.emit({
          searchedString: value,
          searchedResult: null,
          searchedBy: this.SEARCH_BY_FQDN,
          searchedByResult: null,
          hasError: this.hasError
        })
      }
    } else if (this.searchBy === this.SEARCH_BY_MAC) {
      let value = this.selectMac.text
      this.searchstart.emit()
      if (this.searchedAddresses && this.searchedAddresses.length > 0) {
        this.searchend.emit({
          searchedString: value,
          searchedResult: this.searchedAddresses,
          searchedBy: this.SEARCH_BY_MAC,
          searchedByResult: this.searchedMac,
          hasError: this.hasError
        })
      } else {
        this.searchend.emit({
          searchedString: value,
          searchedResult: null,
          searchedBy: this.SEARCH_BY_MAC,
          searchedByResult: null,
          hasError: this.hasError
        })
      }
    }
  }

  onSearchByChange() {
    this.hasError = false
    if (this.searchBy === this.SEARCH_BY_IP) {
      this.selectIp.text = ''
      this.searchedAddress = null
      this.searchedAddressEnd = null
    }
    if (this.searchBy === this.SEARCH_BY_FQDN) {
      this.selectFqdn.text = ''
      this.searchedHostRecord = null
    }
    if (this.searchBy === this.SEARCH_BY_MAC) {
      this.selectMac.text = ''
      this.searchedMac = null
    }
  }

  onSelected(e) {
    this.validateHostRecord(e)
  }

  goable() {
    return (this.searchBy === this.SEARCH_BY_FQDN && this.searchedHostRecord && this.searchedHostRecord.id && this.isAllowGoFqdn)
      || (this.searchBy === this.SEARCH_BY_IP && this.searchedAddressEnd && this.searchedAddressEnd.id && this.searchedAddressEnd.state === 'DHCP_RESERVED')
      || (this.searchBy === this.SEARCH_BY_MAC && this.searchedAddresses && this.searchedAddresses.length > 0)
  }

  onBlur(e) {
    if (e && (!this.searchedHostRecord || !this.searchedHostRecord.id)) {
      if (!this.matchingFQDN || !this.matchingFQDN.id) {
        this.errorMessage = this.translate.instant('No matching FQDN found')
      } else {
        this.errorMessage = this.translate.instant('FQDN does not exist')
      }
      this.hasError = true
    }
  }

  validateHostRecord (item: any) {
    this.searchedAddresses = []
    if (this.subscriptionAddress) {
      this.subscriptionAddress.unsubscribe()
    }
    this.isAllowGoFqdn = false
    this.hasError = false
    this.searching = true
    this.subscriptionAddress = this.ipamResourceService.getAddressesByHostRecord(item.id)
      .subscribe((addresses) => {
        addresses = addresses.filter((i) => i.state === 'DHCP_RESERVED')
        if (addresses && addresses.length > 0) {
          this.searchedAddresses = addresses
          this.isAllowGoFqdn = true
        } else {
          this.errorMessage = this.translate.instant('IP Address of the FQDN is not a DHCP_RESERVATION', this.term)
          this.hasError = true
        }
        this.searching = false
      }, () => {
        this.errorMessage = this.translate.instant('FQDN does not exist', this.term)
        this.hasError = true
        this.searching = false
      })
  }
}
