import { Component, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core'

@Component({
  selector: 'core-file-input',
  templateUrl: './core-file-input.component.html'
})
export class CoreFileInputComponent {
  @ViewChild('input', {static: true}) input: ElementRef
  @Input() classes: string | string[]
  @Output() change = new EventEmitter<any>()
  @Input() internalId: string
  @Input('autoTagName') autoTag: string

  fireChange(event: any) {
    this.change.emit(event)
  }

  onClick() {
    this.input.nativeElement.click()
  }
}
