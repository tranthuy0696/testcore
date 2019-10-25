import { Component, Input, Output, EventEmitter } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { BaseComponent } from '../base/base.component'
import { DhcpScope } from '../../models/ipam-resource.model'

@Component({
  selector: 'navigate-dhcp-scope',
  templateUrl: './navigate-dhcp-scope.component.html'
})
export class NavigateDhcpScopeComponent extends BaseComponent {
  @Input() data: DhcpScope[]
  @Input() loading: boolean
  @Input() placeholder = ''
  @Input() showPlaceholder = false
  @Input() selectable = true
  @Input('autoTagName') autoTag: string
  @Output() selectionChange = new EventEmitter<DhcpScope>()

  constructor(translate: TranslateService) {
    super(translate)
  }

  onScopeClick(data: any) {
    this.data.forEach(item => item.selected = false)
    data.row.selected = true
    this.selectionChange.emit(data.row)
  }

  highlightRowFunc(scope: DhcpScope) {
    return scope.selected
  }
}

