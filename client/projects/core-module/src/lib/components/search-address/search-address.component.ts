import { BaseComponent } from '../base/base.component'
import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core'
import { IpamResourceService } from '../../services/ipam-resource.service'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { DnsRecord, Address } from '../../models/ipam-resource.model'
import { CoreSelectComponent } from '../core-select/core-select.component'
import { AppValidators } from '../../services/app-validators.service'

@Component({
  selector: 'search-address',
  templateUrl: './search-address.component.html',
})

export class SearchAddress extends BaseComponent {
  SEARCH_BY_FQDN = 'searchByFqdn'
  SEARCH_BY_IP_ADDRESS = 'searchByIpAddress'
  @Input('searchBy') searchBy = this.SEARCH_BY_FQDN
  @ViewChild('selectIp', { static: true }) selectIp: CoreSelectComponent
  @ViewChild('selectFqdn', { static: true }) selectFqdn: CoreSelectComponent
  @Output() searchstart = new EventEmitter<any>()
  @Output() searchend = new EventEmitter<any>()

  searchedHostRecords: DnsRecord[] = []
  searchedHostRecord: DnsRecord = null
  matchingFQDN: DnsRecord = null
  searchedAddresses: Address[] = []
  searchedAddressEnd: Address = null
  searchedAddress: string
  searching: boolean
  subscription: Subscription
  subscriptionAddress: Subscription
  hasError: boolean
  errorMessage: string
  INVALID_SEARCH_STRING = 'Search string is invalid'

  constructor(
    private ipamResourceService: IpamResourceService,
    private translate: TranslateService) {
    super(translate)
  }
  valueChange() {
    this.hasError = false
    if (this.searchBy === this.SEARCH_BY_IP_ADDRESS) {
      this.searchedAddress = null
      this.searchedAddressEnd = null
    }
  }

  instantSearch(value: string) {
    this.searching = true
    this.hasError = false
    this.searchedAddress = ''
    if (!value) {
      this.searchedAddress = null
      this.searchedAddressEnd = null
      this.searchedAddresses = []
      this.searchedHostRecord = null
      this.searchedHostRecords = []
      this.hasError = false
      this.searching = false
      return
    }
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    if (this.searchBy === this.SEARCH_BY_IP_ADDRESS) {
      this.searchedAddressEnd = null
      if (AppValidators.isIp(value)) {
        this.subscription = this.ipamResourceService.getAddressAnyByIp(value)
          .subscribe((address) => {
            if (address && address.ip) {
              this.searchedAddress = address.ip
              this.searchedAddressEnd = address
            }
            if (!this.searchedAddressEnd) {
              this.errorMessage = this.translate.instant('IP address does not assigned', this.term)
              this.hasError = true
            } else if (this.searchedAddressEnd.state === 'DHCP') {
              this.errorMessage = this.translate.instant('IP address is within a DHCP_SCOPE', this.term)
              this.hasError = true
            } else if (this.searchedAddressEnd.state === 'GATEWAY') {
              this.errorMessage = this.translate.instant('IP address is a GATEWAY', this.term)
              this.hasError = true
            }
            this.searching = false
          }, () => {
            this.errorMessage = this.translate.instant('IP address does not assigned', this.term)
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
          this.searching = false
        }, () => {
          this.errorMessage = this.translate.instant('No matching FQDN found')
          this.hasError = true
          this.searching = false
        })
      } else {
        this.errorMessage = this.translate.instant(this.INVALID_SEARCH_STRING)
        this.hasError = true
        this.searching = false
      }
    }
  }

  search() {
    if (this.searchBy === this.SEARCH_BY_IP_ADDRESS) {
      let value = this.selectIp.text
      this.searchstart.emit()
      if (this.searchedAddress && this.searchedAddressEnd && this.searchedAddressEnd.id) {
        this.searchend.emit({
          searchedString: value,
          searchedResult: this.searchedAddressEnd,
          searchedBy: this.searchBy,
          searchedByResult: this.searchedAddress,
          hasError: this.hasError
        })
      } else {
        this.searchend.emit({
          searchedString: value,
          searchedResult: null,
          searchedBy: this.searchBy,
          searchedByResult: null,
          hasError: this.hasError
        })
      }
    } else if (this.searchBy === this.SEARCH_BY_FQDN) {
      this.searchedAddresses = []
      if (this.subscriptionAddress) {
        this.subscriptionAddress.unsubscribe()
      }
      let value = this.selectFqdn.text
      if (this.searchedHostRecord && this.searchedHostRecord.fqdn === value) {
        this.subscriptionAddress = this.ipamResourceService.getAddressesByHostRecord(this.searchedHostRecord.id)
          .subscribe((addresses) => {
            if (!addresses || !addresses[0]) {
              this.errorMessage = this.translate.instant('Found no address corresponding to the specified host record!')
              this.hasError = true
            } else {
              this.searchedAddresses = addresses
              this.searchstart.emit()
              this.searchend.emit({
                searchedString: value,
                searchedResult: this.searchedAddresses,
                searchedBy: this.searchBy,
                searchedByResult: this.searchedAddress,
                hasError: this.hasError
              })
            }
          }, () => {
            this.hasError = true
          })
      } else {
        this.searchend.emit({
          searchedString: value,
          searchedResult: null,
          searchedBy: this.searchBy,
          searchedByResult: null,
          hasError: this.hasError
        })
      }
    }
  }

  onSearchByChange() {
    this.hasError = false
    if (this.searchBy === this.SEARCH_BY_IP_ADDRESS) {
      this.selectIp.text = ''
      this.searchedAddress = null
      this.searchedAddressEnd = null
    }
    if (this.searchBy === this.SEARCH_BY_FQDN) {
      this.selectFqdn.text = ''
      this.searchedHostRecord = null
    }
  }

  onSelected() {
    this.hasError = false
  }

  goable() {
    return (this.searchBy === this.SEARCH_BY_FQDN && this.searchedHostRecord && this.searchedHostRecord.id)
      || (this.searchBy === this.SEARCH_BY_IP_ADDRESS && this.searchedAddressEnd && this.searchedAddressEnd.id && this.searchedAddressEnd.state !== 'DHCP')
  }

  onBlur() {
    if (!this.searchedHostRecord || !this.searchedHostRecord.id) {
      if (!this.matchingFQDN || !this.matchingFQDN.id) {
        this.errorMessage = this.translate.instant('No matching FQDN found')
      } else {
        this.errorMessage = this.translate.instant('FQDN does not exist')
      }
      this.hasError = true
    }
  }
}
