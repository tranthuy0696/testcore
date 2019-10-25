import { Component, Input, ViewChild, ElementRef } from '@angular/core'

@Component({
  selector: 'core-tab',
  templateUrl: './core-tab.component.html'
})
export class CoreTabComponent {
  @ViewChild('tab', {static: true}) tab: ElementRef
  @Input() label: string
  @Input() icon: string | string[]
  @Input() active = false
  @Input() value: string
  @Input('padding')
  @Input() autoTagName: string
  set padding(value: string) {
    this.tab.nativeElement.style.padding = value
  }
  @Input() show = true
  @Input() loading = false
  @Input() description: string
}
