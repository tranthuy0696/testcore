import { Component, Input, Output, OnChanges, SimpleChanges, OnInit, EventEmitter } from '@angular/core'
import { generateNumberArray } from '../../utils/generateNumberArray'

@Component({
  selector: 'core-select-spinner',
  templateUrl: './core-select-spinner.component.html',
  styleUrls: ['./core-select-spinner.component.css']
})
export class CoreSelectSpinnerComponent implements OnChanges, OnInit {
  @Input('min') min: number = null
  @Input('max') max: number = null
  @Input('disabled') disabled = false
  @Input() value: number = null
  @Input() labels: any = []
  @Input('BackButtonAutoTagName') BackButtonAutoTagName: string
  @Input('SelectBoxAutoTagName') SelectBoxAutoTagName: string
  @Input('NextButtonAutoTagName') NextButtonAutoTagName: string
  @Output() valueChange = new EventEmitter<number>()

  values = generateNumberArray(this.min, this.max)

  onValueChange(value: string): void {
    this.value = +value
    this.fireValueChange()
  }

  increaseValue() {
    if (this.value < this.max) {
      this.value++
      this.fireValueChange()
    }
  }

  decreaseValue() {
    if (this.value > this.min) {
      this.value--
      this.fireValueChange()
    }
  }

  private fireValueChange() {
    this.valueChange.emit(this.value)
  }

  ngOnInit() {
    if (!this.disabled) {
      if (this.min === null && !Number.isInteger(this.min)) {
        console.warn('[min] (integer) is required')
      }
      if (!this.max === null && !Number.isInteger(this.max)) {
        console.warn('[max] (integer) is required')
      }
      if (!this.value === null && !Number.isInteger(this.value)) {
        console.warn('[value] (integer) is required')
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.disabled) {
      if (this.min > this.max) {
        console.warn('[min=' + this.min + '] must be not greater than [max=' + this.max + ']')
        return
      }
      if (this.value < this.min) {
        console.warn('[value=' + this.value + '] must be greater than or equal to [min=' + this.min + ']')
        return
      }
      if (this.value > this.max) {
        console.warn('[value=' + this.value + '] must be less than or equal to [max=' + this.max + ']')
        return
      }
      if ((changes.min && changes.min.previousValue !== changes.min.currentValue)
      || (changes.max && changes.max.previousValue !== changes.max.currentValue)) {
        this.values = generateNumberArray(this.min, this.max)
      }
    }
  }
}
