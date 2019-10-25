import { Component, Input, TemplateRef, ContentChild } from '@angular/core'

@Component({
  selector: 'core-table-list-column',
  template: ''
})
export class CoreTableListColumnComponent {
  @Input() value: string
  @Input() header: string
  @Input() width: string
  @Input() editable = true
  @Input() sortable = true
  @Input() headerClazz: string | string[]
  @Input() editorType: string
  @Input() editorOptions: string[]
  @Input() color: string

  reverse = true

  @ContentChild('headerTemplate', {static: true}) headerTemplate: TemplateRef<any>
  @ContentChild('bodyTemplate', {static: true}) bodyTemplate: TemplateRef<any>
}
