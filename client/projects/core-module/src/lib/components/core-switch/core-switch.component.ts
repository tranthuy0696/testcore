import { Component, forwardRef, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  selector: 'core-switch',
  templateUrl: './core-switch.component.html',
  styleUrls: ['./core-switch.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CoreSwitchComponent),
    multi: true
  }]
})
export class CoreSwitchComponent implements ControlValueAccessor {
  @ViewChild('switch', {static: true}) switch: ElementRef
  @Input() label: string
  @Input('autoTagName') autoTag: string
  @Output() valueChange = new EventEmitter<boolean>()
  value = false
  @Input() cssClass: string
  toggle() {
    this.value = !this.value
    this.valueChange.emit(this.value)
    this.onChange(this.value)
  }

  onChange = (_: any) => {}
  onTouched = () => {}

  writeValue(value: any) {
    this.value = value
    this.onChange(this.value)
  }

  registerOnChange(fn: any) {
    this.onChange = fn
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn
  }
}
