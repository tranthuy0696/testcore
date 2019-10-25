import { BaseComponent } from '../base/base.component'
import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core'
import { IpamResourceService } from '../../services/ipam-resource.service'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { DnsRecord } from '../../models/ipam-resource.model'
import { CoreSelectComponent } from '../core-select/core-select.component'
import { AppValidators } from '../../services/app-validators.service'
@Component({
  selector: 'search-host-record',
  templateUrl: './search-host-record.component.html'
})

export class SearchHostRecord extends BaseComponent {
  @ViewChild('selectFqdn', { static: true }) selectFqdn: CoreSelectComponent
  @Output() searchend = new EventEmitter<any>()
  @Output() searchstart = new EventEmitter<any>()
  @Output() search = new EventEmitter<any>()
  @Output() blur = new EventEmitter<string>()
  @Input() valid: boolean
  @Input() invalid: boolean
  @Input() item: DnsRecord

  items: DnsRecord[] = []
  searching: boolean
  subscription: Subscription
  hasError: boolean
  errorMessage: string
  NOT_FOUND_HOSTNAME = 'Target hostname does not exist'

  constructor(
    private ipamResourceService: IpamResourceService,
    private translate: TranslateService) {
    super(translate)
  }

  instantSearch(value: string) {
    this.searching = true
    this.hasError = false
    this.searchstart.emit({
      searchedString: value,
      searchedResult: null,
      searchedBy: 'searchByFqdn',
      searchedByResult: null,
      hasError: this.hasError
    })
    if (!value) {
      this.searchend.emit({
        searchedString: value,
        searchedResult: null,
        searchedBy: 'searchByFqdn',
        searchedByResult: null,
        hasError: this.hasError
      })
      this.searching = false
    } else {
      if (AppValidators.isSearchStringFqdnValid(value)) {
        if (this.subscription) {
          this.subscription.unsubscribe()
        }
        this.subscription = this.ipamResourceService.searchHostRecordsByFqdn(value).subscribe((data) => {
          this.items = data
          this.item = this.items.find(record => record.fqdn === value)
          if (!this.item || !this.item.id) {
            this.hasError = true
            this.errorMessage = this.translate.instant(this.NOT_FOUND_HOSTNAME, this.term)
            this.searchend.emit({
              searchedString: value,
              searchedResult: null,
              searchedBy: 'searchByFqdn',
              searchedByResult: null,
              hasError: this.hasError
            })
          } else {
            this.searchend.emit({
              searchedString: value,
              searchedResult: this.item,
              searchedBy: 'searchByFqdn',
              searchedByResult: this.items,
              hasError: this.hasError
            })
          }
          this.searching = false
        }, () => {
          this.hasError = true
          this.errorMessage = this.translate.instant(this.NOT_FOUND_HOSTNAME, this.term)
          this.searchend.emit({
            searchedString: value,
            searchedResult: null,
            searchedBy: 'searchByFqdn',
            searchedByResult: null,
            hasError: this.hasError
          })
          this.searching = false
        })
      } else {
        this.hasError = true
        this.errorMessage = this.translate.instant('This field is invalid', this.term)
        this.searchend.emit({
          searchedString: value,
          searchedResult: null,
          searchedBy: 'searchByFqdn',
          searchedByResult: null,
          hasError: this.hasError
        })
        this.searching = false
      }
    }
  }

  onSelected() {
    let value = this.selectFqdn.text
    this.hasError = false
    this.searchend.emit({
      searchedString: value,
      searchedResult: this.item,
      searchedBy: 'searchByFqdn',
      searchedByResult: this.items,
      hasError: this.hasError
    })
  }

  onBlur() {
    this.blur.emit(this.selectFqdn.text)
    this.searchend.emit({
      searchedString: this.selectFqdn.text,
      searchedResult: this.item,
      searchedBy: 'searchByFqdn',
      searchedByResult: this.items,
      hasError: this.hasError
    })
  }
}
