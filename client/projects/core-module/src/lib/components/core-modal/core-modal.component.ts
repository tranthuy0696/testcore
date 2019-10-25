import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core'
import { fade } from '../../animations/fade.animation'

@Component({
  selector: 'core-modal',
  templateUrl: './core-modal.component.html',
  animations: [
    fade('animation')
  ]
})
export class CoreModalComponent implements OnInit, OnDestroy {
  @ViewChild('modal', {static: true}) modal: ElementRef

  @Input() set height(value: number) {
    this.modal.nativeElement.style.height = value
  }

  @Input() set width(value: number) {
    this.modal.nativeElement.style.width = value
  }

  @Input() set maxWidth(value: number) {
    this.modal.nativeElement.style.maxWidth = value
  }

  @Input('opaque') opaque = false

  ngOnInit() {
    if (!document.body.classList.contains('modal-open')) {
      document.body.classList.add('modal-open')
    }
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open')
  }
}
