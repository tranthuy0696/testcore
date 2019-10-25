import { Component, Input } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { BaseComponent } from '../base/base.component'
import { DhcpOption } from '../../models/dhcp-option.model'

@Component({
  selector: 'navigate-dhcp-option',
  templateUrl: './navigate-dhcp-option.component.html'
})
export class NavigateDhcpOptionComponent extends BaseComponent {
  @Input() data: DhcpOption[]
  @Input() loading: boolean

  constructor(translate: TranslateService) {
    super(translate)
  }
}

