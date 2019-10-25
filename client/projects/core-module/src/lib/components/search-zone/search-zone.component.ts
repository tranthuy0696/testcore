import { Component, Output, EventEmitter, ViewChild, Input } from '@angular/core'
import { Zone } from '../../models/ipam-resource.model'
import { Subscription } from 'rxjs'
import { IpamResourceService } from '../../services/ipam-resource.service'
import { BaseComponent } from '../base/base.component'
import { TranslateService } from '@ngx-translate/core'
import { CoreSelectComponent } from '../core-select/core-select.component'
import { AppValidators } from '../../services/app-validators.service'

@Component({
  selector: 'search-zone',
  templateUrl: './search-zone.component.html'
})

export class SearchZone extends BaseComponent {
  JUMP_TO_ZONE = 'Jump to zone'
  SEARCH_BY_FQDN = 'Search by FQDN'

  @Input('searchBy') searchBy = this.JUMP_TO_ZONE
  @ViewChild('selectZone', { static: true }) selectZone: CoreSelectComponent
  @ViewChild('selectFqdn', { static: true }) selectFqdn: CoreSelectComponent
  @Output() searchstart = new EventEmitter<any>()
  @Output() searchend = new EventEmitter<any>()

  searchedFqdn: {}
  searchedFqdnEnd: {}
  searchedZones: Zone[] = []
  searchedZone: Zone = null
  searching: boolean
  subscription: Subscription
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
    if (this.searchBy === this.SEARCH_BY_FQDN) {
      this.searchedFqdn = null
      this.searchedFqdnEnd = null
    }
  }

  instantSearch(value: string) {
    this.searching = true
    this.hasError = false
    if (!value) {
      this.hasError = false
      this.searchedZone = null
      this.searchedZones = []
      this.searchedFqdn = null
      this.searchedFqdnEnd = null
      this.searching = false
      return
    } else {
      if (this.subscription) {
        this.subscription.unsubscribe()
      }
      if (this.searchBy === this.JUMP_TO_ZONE) {
        this.searchedZones = []
        if (AppValidators.isSearchStringFqdnValid(value)) {
          this.subscription = this.ipamResourceService.getZonesByHint(value)
            .subscribe((data) => {
              this.searchedZones = data
              this.searchedZone = this.searchedZones.find(item => item.fqdn === value)
              if (!this.searchedZone || !this.searchedZone.id) {
                this.hasError = true
                this.errorMessage = this.translate.instant('DNS_ZONE does not exist', this.term)
              }
              this.searching = false
            }, () => {
              this.errorMessage = this.translate.instant('DNS_ZONE does not exist', this.term)
              this.hasError = true
              this.searching = false
            })
        } else {
          this.errorMessage = this.translate.instant(this.INVALID_SEARCH_STRING, this.term)
          this.hasError = true
          this.searching = false
        }
      } else if (this.searchBy === this.SEARCH_BY_FQDN) {
        this.searchedFqdn = null
        this.searchedFqdnEnd = null
        if (AppValidators.isSearchStringFqdnValid(value)) {
          this.subscription = this.ipamResourceService.getZoneAndRecordsByFqdn(value)
            .subscribe((data) => {
              this.searchedFqdn = data.record.fqdn
              this.searchedFqdnEnd = data
              if (!data.zone || !data.zone.id) {
                this.hasError = true
                this.errorMessage = this.translate.instant('FQDN does not exist', this.term)
              }
              this.searching = false
            }, () => {
              this.errorMessage = this.translate.instant('FQDN does not exist', this.term)
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
  }

  search() {
    if (this.searchBy === this.JUMP_TO_ZONE) {
      let value = this.selectZone.text
      this.searchstart.emit()
      if (this.searchedZone && this.searchedZone.fqdn === value) {
        this.searchend.emit({
          searchedString: value,
          searchedResult: this.searchedZone,
          searchedBy: this.searchBy,
          searchedByResult: this.searchedZones,
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
      let value = this.selectFqdn.text
      this.searchstart.emit()
      if (this.searchedFqdnEnd) {
        this.searchend.emit({
          searchedString: value,
          searchedResult: this.searchedFqdnEnd,
          searchedBy: this.searchBy,
          searchedByResult: this.searchedFqdn,
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
    if (this.searchBy === this.JUMP_TO_ZONE) {
      this.selectZone.text = ''
      this.searchedZone = null
    }
    if (this.searchBy === this.SEARCH_BY_FQDN) {
      this.selectFqdn.text = ''
      this.searchedFqdn = null
      this.searchedFqdnEnd = null
    }
  }

  onSelected() {
    this.hasError = false
  }

  goable() {
    return (this.searchBy === this.JUMP_TO_ZONE && this.searchedZone && this.searchedZone.id) ||
      (this.searchBy === this.SEARCH_BY_FQDN && this.searchedFqdn)
  }
}
