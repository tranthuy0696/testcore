import { Component, forwardRef } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  selector: 'core-multi-edit',
  templateUrl: 'core-multi-edit.component.html',
  styleUrls: ['core-multi-edit.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CoreMultiEditComponent),
    multi: true
  }]
})

export class CoreMultiEditComponent implements ControlValueAccessor  {
  innerValue: string

  set value(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value
      this.onChange(value)
    }
  }

  get value() {
    return this.innerValue
  }

  getItems() {
    return this.innerValue.split(',')
  }

  updateValue(index: number, event: any) {
    let updatedItems = this.innerValue.split(',')
    updatedItems[index] = event.target.value
    this.value = updatedItems.join(',')
  }

  onChange = (_: any) => {}
  onTouched = () => {}

  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn
  }
}
