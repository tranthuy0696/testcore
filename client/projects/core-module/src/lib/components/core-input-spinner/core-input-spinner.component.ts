import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core'

@Component({
  selector: 'core-input-spinner',
  templateUrl: './core-input-spinner.component.html',
  styleUrls: ['./core-input-spinner.component.css']
})
export class CoreInputSpinnerComponent {
  @Input('disableNext') disableNext = false
  @Input('disablePrev') disablePrev = false
  @Input() value: number = null
  @Output() valueChange = new EventEmitter<number>()

  increaseValue() {
    this.value++

    this.fireValueChange()
  }

  decreaseValue() {
    this.value--
    this.fireValueChange()
  }

  private fireValueChange() {
    this.valueChange.emit(this.value)
  }
}
