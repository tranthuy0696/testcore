import { TranslateService } from '@ngx-translate/core'

export class BaseComponent {

  term: any
  loading: boolean

  constructor(translate: TranslateService) {
    this.term = {
      GATEWAY: translate.instant('GATEWAY'),
      SUBNET: translate.instant('SUBNET'),
      DNS_ZONE: translate.instant('DNS_ZONE'),
      NETWORK: translate.instant('NETWORK'),
      DHCP_SCOPE: translate.instant('DHCP_SCOPE'),
      DHCP_RESERVATION: translate.instant('DHCP_RESERVATION'),
      IP_RESERVATION: translate.instant('IP_RESERVATION'),
      GROUP: translate.instant('GROUP')
    }
  }

  openModal(callback?: Function, context?: any) {
    if (!document.body.classList.contains('modal-open')) {
      document.body.classList.add('modal-open')
    }
    if (callback) {
      callback(context)
    }
  }

  closeModal(callback?: Function, context?: any) {
    document.body.classList.remove('modal-open')
    if (callback) {
      callback(context)
    }
  }

  privateIdCompareFunc(value1: any, value2: any) {
    return value1 && value2 && value1._id === value2._id
  }
}
