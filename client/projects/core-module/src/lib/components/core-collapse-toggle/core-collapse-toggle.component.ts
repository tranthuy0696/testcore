import { Component, forwardRef } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  selector: 'core-collapse-toggle',
  templateUrl: './core-collapse-toggle.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CoreCollapseToggleComponent),
    multi: true
  }]
})
export class CoreCollapseToggleComponent implements ControlValueAccessor {
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
