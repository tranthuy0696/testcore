import { Component, Input, HostBinding } from '@angular/core'

const DISPLAY_BLOCK = 'block'
const DISPLAY_NONE = 'none'

@Component({
  selector: 'core-loader',
  templateUrl: './core-loader.component.html',
  styleUrls: ['./core-loader.component.css']
})
export class CoreLoaderComponent {

  @HostBinding('style.display')
  display = DISPLAY_BLOCK

  private timeout: any  = null

  @Input('show') set show(value: boolean) {
    this.updateDisplay(value)
  }

  @Input('delay') delay = 0

  private updateDisplay(value: boolean) {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    if (this.delay > 0) {
      this.timeout = setTimeout(() => {
        this.toggleDisplay(value)
      }, this.delay)
    } else {
      this.toggleDisplay(value)
    }
  }

  private toggleDisplay(value: boolean) {
    this.display = value ? DISPLAY_BLOCK : DISPLAY_NONE
  }
}
