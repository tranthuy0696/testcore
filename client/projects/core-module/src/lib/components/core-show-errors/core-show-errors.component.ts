import { Component, Input } from '@angular/core'
import { AbstractControlDirective, AbstractControl } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { BaseComponent } from '../base/base.component'

@Component({
 selector: 'core-show-errors',
 templateUrl: './core-show-errors.component.html'
})
export class CoreShowErrorsComponent extends BaseComponent {

  @Input() control: AbstractControlDirective | AbstractControl
  @Input() alwaysShowErrors: boolean
  @Input('autoTagName') autoTag: string

  private readonly messages = {
    'required': () => this.translate.instant('This field is required'),
    'empty': () => this.translate.instant('This field is required'),
    'invalidIpv4': () => this.translate.instant('Invalid IP address'),
    'existingAddress': () => this.translate.instant('Address already exists'),
    'nonExistingAddress': () => this.translate.instant('Address does not exist'),
    'reservedDhcp': () => this.translate.instant('Address is a reserved DHCP'),
    'broadcastIpv4': () => this.translate.instant('Must not be a broadcast'),
    'netid': () => this.translate.instant('Must not be a netid'),
    'pattern': () => this.translate.instant('This field is invalid'),
    'noWriteAccess': () => this.translate.instant('No write access to target subnet'),
    'notActive': () => this.translate.instant('This is not active'),
    'unsupportedDnsRecordType': () => this.translate.instant('Has unsupported DNS record type'),
    'partOfDhcpScope': () => this.translate.instant('Address is part of a DHCP_SCOPE', this.term),
    'existingDnsRecordFqdn': () => this.translate.instant('Existing DNS record with the same FQDN'),
    'hostnameMinLength': (min: number) => this.translate.instant(`Host name must be at least ${min} characters`),
    'hostnameMaxLength': (max: number) => this.translate.instant(`Host name must be not over ${max} characters`),
    'hostnameInvalidCharacters': () => this.translate.instant('Host name contains invalid characters'),
    'dotsNotAllowed': () => this.translate.instant('Dots are not allowed'),
    'insideBlock': () => this.translate.instant('GATEWAY is outside current address space', this.term),
    'invalidGateway': () => this.translate.instant('Invalid GATEWAY', this.term),
    'invalidNewGateway': () => this.translate.instant('This address cannot be used for new GATEWAY', this.term),
    'macLinkedOtherRecords': () => this.translate.instant(`MAC linked to other DNS Records`, this.term),
    'macInLocalDhcpScope': () => this.translate.instant(`MAC in local DHCP_SCOPE`, this.term),
    'macReservedOnSubnet': () => this.translate.instant(`MAC already reserved on SUBNET`, this.term),
    'existingHostname': () => this.translate.instant('Hostname has been used'),
    'existingZone': () => this.translate.instant(`DNS_ZONE already exists`, this.term),
    'unsupportedRoundRobin': () => this.translate.instant(`Round robin DNS is not supported`, this.term),
    'isWithinDhcpScope': () => this.translate.instant(`IP is within a DHCP_SCOPE`, this.term),
    'subnetNotExist': () => this.translate.instant(`SUBNET does not exist`, this.term),
    'invalidRecord': () => this.translate.instant(`Modifying invalid record is not allowed`, this.term),
    'pointToInvalidData': () => this.translate.instant(`Pointing to invalid data`, this.term)
  }

  constructor(private translate: TranslateService) {
    super(translate)
  }

  private getMessage(type: string, params: any) {
    const log = this.messages[type]
    return log ? log(params) : this.translate.instant('This field does not pass validation')
  }

  shouldShowErrors(): boolean {
    return this.control && this.control.errors && (this.alwaysShowErrors || this.control.dirty || this.control.touched)
  }

  listOfErrors(): string[] {
    return Object.keys(this.control.errors).map(key => this.getMessage(key, this.control.errors[key]))
  }
}
