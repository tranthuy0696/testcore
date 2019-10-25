import { Component, ContentChildren, QueryList, AfterContentInit, EventEmitter, Output, Input } from '@angular/core'
import { CoreTabComponent } from '../core-tab/core-tab.component'

@Component({
  selector: 'core-tabs',
  templateUrl: './core-tabs.component.html'
})
export class CoreTabsComponent implements AfterContentInit {
  @ContentChildren(CoreTabComponent) tabs: QueryList<CoreTabComponent>
  @Output('selectionChange') selectionChange = new EventEmitter<CoreTabComponent>()
  @Input() clazz: string | string[]
  @Input('autoTagName') autoTag: string

  ngAfterContentInit() {
    const firstVisible = this.tabs.find((tab) => tab.show)
    if (firstVisible) {
      this.select(firstVisible)
    }
  }

  select(tab: CoreTabComponent) {
    if (tab) {
      this.tabs.toArray().forEach(item => item.active = false)
      tab.active = true
      this.selectionChange.emit(tab)
    }
  }
}
