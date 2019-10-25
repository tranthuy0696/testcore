import { Component, Output, EventEmitter, ViewChild, Input } from '@angular/core'
import { Net, DnsRecord } from '../../models/ipam-resource.model'
import { Subscription } from 'rxjs'
import { BaseComponent } from '../base/base.component'
import { TranslateService } from '@ngx-translate/core'
import { CoreSelectComponent } from '../core-select/core-select.component'
import { IpamResourceService } from '../../services/ipam-resource.service'

@Component({
  selector: 'search-subnet',
  templateUrl: './search-subnet.component.html'
})

export class SearchSubnet extends BaseComponent {
  SEARCH_BY_SUBNET = 'searchBySubnet'
  SEARCH_BY_FQDN = 'searchByFqdn'
  SEARCH_BY_IP = 'searchByIp'
  MODE_SELECT_SUBNET = 'SelectSubnet'
  MODE_SELECT_SUBNET_TO_SPLIT = 'SelectSubnetToSplit'
  MODE_SELECT_SUBNETS_TO_JOIN = 'SelectSubnetsToJoin'
  MODE_SELECT_SUBNET_TO_ACTIVATE = 'SelectSubnetToActivate'
  MODE_SELECT_SUBNET_TO_MODIFY_DHCP_SERVICE = 'SelectSubnetToModifyDhcpService'
  MODE_SELECT_SUBNET_TO_SELECT_ADDRESS = 'SelectSubnetToSelectAddress'
  MODE_SELECT_SUBNET_SELECTABLE_ADDRESS = 'SelectSubnetSelectableAddress'

  @Input('searchBy') searchBy = this.SEARCH_BY_SUBNET
  @ViewChild('searchBySubnet', {static: true}) searchBySubnet: CoreSelectComponent
  @ViewChild('searchByFQDN', {static: true}) searchByFQDN: CoreSelectComponent
  @ViewChild('searchByIp', {static: true}) searchByIp: CoreSelectComponent
  @Output() searchstart = new EventEmitter<any>()
  @Output() searchend = new EventEmitter<any>()
  @Input() mode: string

  searchedSubnets: Net[] = []
  @Input('searchedResult') searchedSubnet: Net = null
  searchedHostRecords: DnsRecord[] = []
  searchedHostRecord: DnsRecord = null
  searching: boolean
  subscription: Subscription
  hasError: boolean

  constructor(
    private ipamResourceService: IpamResourceService,
    translate: TranslateService) {
      super(translate)
  }

  valueChange() {
    this.hasError = false
    if (this.searchBy === this.SEARCH_BY_IP) {
      this.searchedSubnet = null
    }
  }

  instantSearch(value: string) {
    this.searching = true
    this.hasError = false
    this.searchedSubnets = []
    this.searchedSubnet = null
    if (!value) {
      this.hasError = false
      this.searchedSubnet = null
      this.searchedSubnets = []
      this.searchedHostRecord = null
      this.searchedHostRecords = []
      this.searching = false
    } else {
      if (this.subscription) {
        this.subscription.unsubscribe()
      }
      if (this.searchBy === this.SEARCH_BY_SUBNET) {
        this.subscription = this.ipamResourceService.searchSubnetsByHint(value).subscribe((data) => {
          this.searchedSubnets = data
          this.searchedSubnet = this.searchedSubnets.find(network => network.CIDR === value)
          if (!this.searchedSubnet || !this.searchedSubnet.id) {
            this.hasError = true
          }
          this.searching = false
        }, () => {
          this.hasError = true
          this.searching = false
        })
      } else if (this.searchBy === this.SEARCH_BY_FQDN) {
        this.searching = true
        this.searchedHostRecords = []
        this.subscription = this.ipamResourceService.searchHostRecordsByFqdn(value).subscribe((data) => {
          this.searchedHostRecords = data
          this.searchedHostRecord = this.searchedHostRecords.find(record => record.fqdn === value)
          if (!this.searchedHostRecord || !this.searchedHostRecord.id) {
            this.hasError = true
          }
          this.searching = false
        }, () => {
          this.hasError = true
          this.searching = false
        })
      } else if (this.searchBy === this.SEARCH_BY_IP) {
        this.searching = true
        this.searchedSubnet = null
        this.subscription = this.ipamResourceService.getSubnetOfAddress(value).subscribe(subnet => {
          this.searchedSubnet = subnet
          this.searching = false
        }, () => {
          this.hasError = true
          this.searching = false
        })
      }
    }
  }

  search() {
    if (this.searchBy === this.SEARCH_BY_SUBNET) {
      let value = this.searchBySubnet.text
      this.searchstart.emit()
      if (this.searchedSubnet && this.searchedSubnet.CIDR === value) {
        this.searchend.emit({
          searchedString: value,
          searchedResult: this.searchedSubnet,
          searchedBy: this.searchBy,
          searchedByResult: this.searchedSubnets,
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
      let value = this.searchByFQDN.text
      this.searchstart.emit()
      if (this.searchedHostRecord && this.searchedHostRecord.fqdn === value) {
        this.searchend.emit({
          searchedString: value,
          searchedResult: this.searchedHostRecord,
          searchedBy: this.searchBy,
          searchedByResult: this.searchedHostRecords,
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
    } else if (this.searchBy === this.SEARCH_BY_IP) {
      let value = this.searchByIp.text
      if (this.searchedSubnet && this.searchedSubnet.id) {
        this.searchend.emit({
          searchedString: value,
          searchedResult: this.searchedSubnet,
          searchedBy: this.searchBy,
          searchedByResult: this.searchedSubnets,
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
    }
  }

  onSearchByChange() {
    this.hasError = false
    if (this.searchBy === this.SEARCH_BY_IP) {
      this.searchByIp.text = ''
    }
    if (this.searchBy === this.SEARCH_BY_FQDN) {
      this.searchByFQDN.text = ''
      this.searchedHostRecord = null
    }
    if (this.searchBy === this.SEARCH_BY_SUBNET) {
      this.searchBySubnet.text = ''
      this.searchedSubnet = null
    }
  }

  onSelected() {
    this.hasError = false
  }

  goable() {
    return (this.searchBy === this.SEARCH_BY_SUBNET && this.searchedSubnet && this.searchedSubnet.id) ||
      (this.searchBy === this.SEARCH_BY_FQDN && this.searchedHostRecord && this.searchedHostRecord.id) ||
      (this.searchBy === this.SEARCH_BY_IP && this.searchedSubnet && this.searchedSubnet.id)
  }

  resetSearchText() {
    this.searchBySubnet.text = ''
    this.searchByFQDN.text = ''
    this.searchByIp.text = ''
  }
}
