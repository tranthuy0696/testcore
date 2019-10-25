import { Component, ViewChild, Output, EventEmitter } from '@angular/core'
import { CoreSelectComponent } from '../core-select/core-select.component'
import { Net } from '../../models/ipam-resource.model'
import { Subscription } from 'rxjs'
import { IpamResourceService } from '../../services/ipam-resource.service'
import { BaseComponent } from '../base/base.component'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'search-network',
  templateUrl: './search-network.component.html',
})

export class SearchNetwork extends BaseComponent {
  @ViewChild('select', {static: true}) select: CoreSelectComponent
  @Output() searchstart = new EventEmitter<any>()
  @Output() searchend = new EventEmitter<any>()

  items: Net[] = []
  item: Net
  searching: boolean
  subscription: Subscription
  hasError: boolean

  constructor(
    private ipamResourceService: IpamResourceService,
    translate: TranslateService) {
      super(translate)
  }

  instantSearch(value: string) {
    this.searching = true
    this.hasError = false
    this.items = []
    if (!value) {
      this.item = null
      this.items = []
      this.hasError = false
      this.searching = false
    } else {
      if (this.subscription) {
        this.subscription.unsubscribe()
      }
      this.subscription = this.ipamResourceService.searchNetworksByHint(value)
        .subscribe((data) => {
          this.items = data
          this.item = this.items.find(item => item.CIDR === value)
          if (!this.item || !this.item.id) {
            this.hasError = true
          }
          this.searching = false
        }, () => {
          this.hasError = true
          this.searching = false
        })
    }
  }

  search() {
    let value = this.select.text
    this.searchstart.emit()
    this.searching = true
    if (this.item && this.item.CIDR === value) {
      this.searchend.emit({
        searchedString: value,
        searchedResult: this.item,
        searchedBy: 'searchByCidr',
        searchedByResult: this.items,
        hasError: this.hasError
      })
      this.searching = false
    } else {
      this.searchend.emit({
        searchedString: value,
        searchedResult: null,
        searchedBy: 'searchByCidr',
        searchedByResult: null,
        hasError: this.hasError
      })
      this.searching = false
    }
  }

  onSelected() {
    this.hasError = false
  }

  goable() {
    return this.item && this.item.id
  }
}
