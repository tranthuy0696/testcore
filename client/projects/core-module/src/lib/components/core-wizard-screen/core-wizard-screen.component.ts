import { Component, ContentChild, TemplateRef, Input, Output, EventEmitter, ChangeDetectorRef, AfterViewInit } from '@angular/core'

@Component({
  selector: 'core-wizard-screen',
  templateUrl: './core-wizard-screen.component.html'
})
export class CoreWizardScreenComponent implements AfterViewInit {

  @ContentChild('headerTemplate', {static: true}) headerTemplate: TemplateRef<any>
  @ContentChild('bodyTemplate', {static: true}) bodyTemplate: TemplateRef<any>
  @ContentChild('footerTemplate', {static: true}) footerTemplate: TemplateRef<any>
  @ContentChild('bodyAndFooterTemplate', {static: true}) bodyAndFooterTemplate: TemplateRef<any>

  @Input() name: string
  @Input() title: string

  @Output() cancel = new EventEmitter()
  @Output() next = new EventEmitter()
  @Output() previous = new EventEmitter()
  @Output() submit = new EventEmitter()

  @Input() canCancel = true
  @Input() canNext = true
  @Input() canPrevious = true
  @Input() canSubmit = true

  @Input() showCancel = true
  @Input() showNext = true
  @Input() showPrevious = true
  @Input() showSubmit = true

  @Input() validating = false

  visible = false

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.cd.detectChanges()
  }
}
