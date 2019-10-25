import { Component, ContentChild, TemplateRef, Input } from '@angular/core'

@Component({
  selector: 'core-panel',
  templateUrl: './core-panel.component.html'
})
export class CorePanelComponent {
  @Input() legend: string
  @Input() canCollapse = true
  @ContentChild('bodyTemplate', {static: true}) bodyTemplate: TemplateRef<any>
  collapsed = false
}
