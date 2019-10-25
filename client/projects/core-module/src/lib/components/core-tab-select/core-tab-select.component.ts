import { Component, ContentChildren, QueryList, AfterContentInit, Input, forwardRef } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { CoreTabComponent } from '../core-tab/core-tab.component'

@Component({
  selector: 'core-tab-select',
  templateUrl: './core-tab-select.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CoreTabSelectComponent),
    multi: true
  }]
})
export class CoreTabSelectComponent implements AfterContentInit, ControlValueAccessor {
  @ContentChildren(CoreTabComponent) tabs: QueryList<CoreTabComponent>
  @Input() clazz: string | string[]

  private value: string

  ngAfterContentInit() {
    let activeTabs = this.tabs.filter((tab) => tab.active)
    if (activeTabs.length === 0) {
      this.select(this.tabs.first)
    }
  }

  select(tab: CoreTabComponent) {
    if (tab) {
      this.tabs.toArray().forEach(item => item.active = false)
      tab.active = true
      this.value = tab.value
      this.onChange(this.value)
    }
  }

  selectTabByValue(value: string) {
    if (this.tabs) {
      let tab = this.tabs.toArray().find(item => item.value === value)
      this.select(tab)
    }
  }

  onChange = (_: any) => {}
  onTouched = () => {}

  writeValue(value: any) {
    this.value = value
    this.selectTabByValue(value)
  }

  registerOnChange(fn: any) {
    this.onChange = fn
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn
  }
}
