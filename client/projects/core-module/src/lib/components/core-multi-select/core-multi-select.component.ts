import { Component, Input, ElementRef, forwardRef, Output, EventEmitter } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  selector: 'core-multi-select',
  templateUrl: './core-multi-select.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CoreMultiSelectComponent),
    multi: true
  }],
  host: {
    '(document:click)': 'handleClick($event)'
  }
})
export class CoreMultiSelectComponent implements ControlValueAccessor {
  @Input('items') items: any[] = []
  @Input('textField') textField: string
  @Input('placeholder') placeholder = ''
  @Input('highlight') highlight: string
  @Input('text') text: string
  @Output() removeItem = new EventEmitter()
  @Output() addItem = new EventEmitter()
  value: any[] = []

  showingList = false
  constructor(private elementRef: ElementRef) {
  }

  toggleList() {
    this.showingList = !this.showingList
  }

  remove(item: any) {
    let index = this.value.indexOf(item)
    this.value.splice(index, 1)
    this.removeItem.emit(item)
  }

  display(item: any) {
    if (this.textField) {
      return item[this.textField]
    }
    return item
  }

  isSelected(item: any) {
    if (this.textField) {
      return this.value.map(i => i[this.textField]).indexOf(item[this.textField]) > -1
    }
    return this.value && this.value.indexOf(item) > -1
  }

  check(item: any) {
    this.value = this.value || []
    const index = this.value.indexOf(item)
    if (index > -1) {
      this.value.splice(index, 1)
    } else {
      this.value.push(item)
    }
    this.addItem.emit(item)
  }

  isPlaceholderShown() {
    return this.value && this.value.length === 0
  }

  handleClick(event: Event) {
    let clickedComponent = event.target
    let inside = false
    do {
      if (clickedComponent === this.elementRef.nativeElement) {
        inside = true
      }
      clickedComponent = clickedComponent['parentNode']
    } while (clickedComponent) {
      if (!inside) {
        this.showingList = false
      }
    }
  }

  onChange = (_: any) => { }
  onTouched = () => { }

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
