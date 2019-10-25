import { Component, forwardRef } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  selector: 'core-collapse',
  templateUrl: './core-collapse.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CoreCollapseComponent),
    multi: true
  }]
})
export class CoreCollapseComponent implements ControlValueAccessor {
  value = false

  toggle() {
    this.value = !this.value
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
