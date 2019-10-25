import { Component, Input, ViewChild, ElementRef } from '@angular/core'

@Component({
  selector: 'core-blocker',
  templateUrl: './core-blocker.component.html'
})
export class CoreBlockerComponent {

  @ViewChild('blocker', {static: true}) blocker: ElementRef

  @Input('show')
  set show(value: boolean) {
    let display = value ? 'block' : 'none'
    this.blocker.nativeElement.style.display = display
  }

  @Input('opacity')
  set opacity(value: number) {
    this.blocker.nativeElement.style.opacity = value
  }

  @Input('backgroundColor')
  set backgroundColor(value: string) {
    this.blocker.nativeElement.style.backgroundColor = value
  }

  @Input('color')
  set color(value: string) {
    this.blocker.nativeElement.style.color = value
  }

  @Input('message') message: string
}
