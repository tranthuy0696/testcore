import { Component, Input } from '@angular/core'
import { DnsRecord } from '../../models/ipam-resource.model'
import { BaseComponent } from '../base/base.component'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'navigate-and-select-dns-record',
  templateUrl: './navigate-and-select-dns-record.component.html'
})
export class NavigateAndSelectDnsRecordComponent extends BaseComponent {
  @Input() data: DnsRecord[] = []
  @Input() classes: string[] = []
  @Input() loading = false
  @Input() placeholder = ''
  @Input() showPlaceholder = false
  @Input('autoTagName') autoTag: string

  constructor(translate: TranslateService) {
    super(translate)
  }
}
