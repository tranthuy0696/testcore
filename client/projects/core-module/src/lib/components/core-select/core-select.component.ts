import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, OnChanges, SimpleChanges } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  selector: 'core-select',
  templateUrl: './core-select.component.html',
  styleUrls: ['./core-select.component.css'],
  host: {
    '(document:click)': 'handleClick($event)'
  },
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CoreSelectComponent),
    multi: true
  }]
})
export class CoreSelectComponent implements ControlValueAccessor, OnChanges {

  @Input('items') items: any[] = []
  @Output('search') search = new EventEmitter<string>()
  @Output('valueChange') valueChange = new EventEmitter<string>()
  @Output('blur') blur = new EventEmitter<void>()
  @Output('selected') selected = new EventEmitter<any>()
  @Input('loading') loading = false
  @Input('textFields') textFields: string[]
  @Input('disabled') disabled = false
  @Input('allowCustom') allowCustom = true
  @Input('placeholder') placeholder = ''
  @Input('fixedDropdown') fixedDropdown = false
  @Input('autoTagName') autoTag: string

  private value: any
  text = ''
  showingList = false
  position = 'bottom'
  private timeout: any = null
  private timeoutMillis = 500
  cloneItems: any[] = []

  constructor(private elementRef: ElementRef) { }

  select(item: any) {
    this.showingList = false
    this.updateValue(item)
    this.selected.emit(item)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items && (changes.items.firstChange || JSON.stringify(changes.items.currentValue) !== JSON.stringify(changes.items.previousValue))) {
      this.cloneItems = [...this.items]
    }
  }

  input() {
    this.showList()
    this.updatePosition()
    this.findAndUpdateValue()
    this.fireSearch()
    this.shrinkSearch()
  }

  private findAndUpdateValue() {
    let found = this.items.find((item) => {
      if (this.textFields) {
        let value = this.toValue(item, this.textFields[0]) || item
        return value && value === this.text
      }
      return item && item === this.text
    })
    if (found) {
      this.updateValue(found)
    } else if (this.text !== '' && this.allowCustom) {
      if (this.textFields) {
        let obj = this.toItem(this.text, this.textFields[0])
        this.updateValue(obj)
      } else {
        this.updateValue(this.text)
      }
    } else {
      this.updateValue(undefined)
    }
  }

  private shrinkSearch() {
    if (this.text === '') {
      this.cloneItems = [...this.items]
    } else {
      this.cloneItems = this.items.filter((e) => this.display(e).toUpperCase().includes(this.text.toUpperCase()))
    }
  }

  private fireSearch() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(() => {
      this.search.next(this.text)
    }, this.timeoutMillis)
  }

  onFocus() {
    this.showList()
    this.updatePosition()
  }

  onBlur() {
    this.blur.emit(this.value)
    this.onTouched()

  }
  isSelected(item: any) {
    return item === this.value
  }

  private updateValue(item: any) {
    this.value = item
    this.valueChange.emit(this.value)
    this.updateText(this.value)
    this.onChange(this.value)
  }

  private updateText(value: any) {
    if (value) {
      if (this.textFields) {
        this.text = this.toValue(value, this.textFields[0]) || value
      } else {
        this.text = value
      }
    }
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

  display(item: any) {
    return this.textFields
      ? this.textFields.map((field) => this.toValue(item, field)).join(' - ')
      : item
  }

  onChange = (_: any) => { }
  onTouched = () => { }

  writeValue(value: any) {
    if (value) {
      this.value = value
      this.updateText(this.value)
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn
  }

  setDisabledState?(isDisabled: boolean) {
    this.disabled = isDisabled
  }

  private updatePosition() {
    const rect = this.elementRef.nativeElement.getBoundingClientRect()
    this.position = rect.top > 500 ? 'top' : 'bottom'
  }

  private showList() {
    this.showingList = true
  }

  private toValue(item: any, field: string) {
    return field
      .split('.')
      .reduce((a: any, v: any) => {
        if (a) {
          a = a[v] || 'N/A'
        }
        return a
      }, item)
  }

  private toItem(value: any, field: string) {
    return field
      .split('.')
      .reduce((a: any, v: any, index: number, array: Array<any>) => {
        if (index + 1 === array.length) {
          a[v] = value
        } else {
          a[v] = {}
        }
        return a
      }, {})
  }

}
