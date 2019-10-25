import { Component, ViewChild, Output, EventEmitter } from '@angular/core'
import { CoreSelectComponent } from '../core-select/core-select.component'
import { Group } from '../../models/ipam-resource.model'
import { Subscription } from 'rxjs'
import { IpamResourceService } from '../../services/ipam-resource.service'
import { BaseComponent } from '../base/base.component'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'search-group',
  templateUrl: './search-group.component.html',
})

export class SearchGroup extends BaseComponent {
  @ViewChild('select', {static: true}) select: CoreSelectComponent
  @Output() searchstart = new EventEmitter<any>()
  @Output() searchend = new EventEmitter<any>()

  items: Group[] = []
  item: Group = null
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
      this.hasError = false
      this.item = null
      this.items = []
      this.searching = false
    } else {
      if (this.subscription) {
        this.subscription.unsubscribe()
      }
      this.subscription = this.ipamResourceService.getGroupsByHint(value)
        .subscribe((data) => {
          data.forEach((e) => {
              e.fullName = e.parents && e.parents.length > 0 ?
                `${e.parents.map((p) => p.name).reverse().join(' > ')} > ${e.name}` :
                e.name
            })
          this.items = data
          this.item = this.items.find(item => String(item.name).toLowerCase() === String(value).toLowerCase())
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

  onSelected() {
    this.hasError = false
  }

  search() {
    let value = this.select.text.split(' > ').reverse()[0]
    this.searchstart.emit()
    this.searching = true
    if (this.item && this.item.name === value) {
      this.searchend.emit({
        searchedString: value,
        searchedResult: this.item,
        searchedBy: 'searchByGroupName',
        searchedByResult: this.items,
        hasError: this.hasError
      })
      this.searching = false
    } else {
      this.searchend.emit({
        searchedString: value,
        searchedResult: null,
        searchedBy: 'searchByGroupName',
        searchedByResult: null,
        hasError: this.hasError
      })
      this.searching = false
    }
  }

  goable() {
    return this.item && this.item.id
  }
}
