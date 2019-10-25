// Librarys
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { HttpClientModule } from '@angular/common/http'

// Components Core Module
import { CoreBlockerComponent } from './components/core-blocker/core-blocker.component'
import { CoreCollapseComponent } from './components/core-collapse/core-collapse.component'
import { CoreCollapseToggleComponent } from './components/core-collapse-toggle/core-collapse-toggle.component'
import { CoreFileInputComponent } from './components/core-file-input/core-file-input.component'
import { CoreLoaderComponent } from './components/core-loader/core-loader.component'
import { CoreMarkdownComponent } from './components/core-markdown/core-markdown.component'
import { CoreMarkdownEditorComponent } from './components/core-markdown-editor/core-markdown-editor.component'
import { CoreModalComponent } from './components/core-modal/core-modal.component'
import { CoreMultiEditComponent } from './components/core-multi-edit/core-multi-edit.component'
import { CoreMultiSelectComponent } from './components/core-multi-select/core-multi-select.component'
import { CorePanelComponent } from './components/core-panel/core-panel.component'
import { CoreSelectComponent } from './components/core-select/core-select.component'
import { CoreSelectSpinnerComponent } from './components/core-select-spinner/core-select-spinner.component'
import { CoreShowErrorsComponent } from './components/core-show-errors/core-show-errors.component'
import { CoreSwitchComponent } from './components/core-switch/core-switch.component'
import { CoreTabComponent } from './components/core-tab/core-tab.component'
import { CoreTabSelectComponent } from './components/core-tab-select/core-tab-select.component'
import { CoreTableComponent } from './components/core-table/core-table.component'
import { CoreTableListComponent } from './components/core-table-list/core-table-list.component'
import { CoreTableListColumnComponent } from './components/core-table-list-column/core-table-list-column.component'
import { CoreTabsComponent } from './components/core-tabs/core-tabs.component'
import { CoreWizardComponent } from './components/core-wizard/core-wizard.component'
import { CoreWizardScreenComponent } from './components/core-wizard-screen/core-wizard-screen.component'
import { CoreInputSpinnerComponent } from './components/core-input-spinner/core-input-spinner.component'

// Components DDI Module
import { NavigateAndSelectNetworkComponent } from './components/navigate-and-select-network/navigate-and-select-network.component'
import { NavigateAndSelectSubnetComponent } from './components/navigate-and-select-subnet/navigate-and-select-subnet.component'
import { NavigateAndSelectZoneComponent } from './components/navigate-and-select-zone/navigate-and-select-zone.component'
import { NavigateAndSelectDnsRecordComponent }
  from './components/navigate-and-select-dns-record/navigate-and-select-dns-record.component'
import { NavigateAndSelectZoneDnsRecordComponent }
  from './components/navigate-and-select-zone-dns-record/navigate-and-select-zone-dns-record.component'
import { NavigateDhcpOptionComponent } from './components/navigate-dhcp-option/navigate-dhcp-option.component'
import { NavigateDhcpScopeComponent } from './components/navigate-dhcp-scope/navigate-dhcp-scope.component'
import { NavigateAndSelectGroupComponent } from './components/navigate-and-select-group/navigate-and-select-group.component'
import { SearchNetwork } from './components/search-network/search-network.component'
import { SearchSubnet } from './components/search-subnet/search-subnet.component'
import { SearchZone } from './components/search-zone/search-zone.component'
import { SearchGroup } from './components/search-group/search-group.component'
import { SearchAddress } from './components/search-address/search-address.component'
import { SearchHostRecord } from './components/search-host-record/search-host-record.component'
import { SearchDhcpReservation } from './components/search-dhcp-reservation/search-dhcp-reservation.component'

// Pipes
import { SortPipe } from './pipes/sort.pipe'
import { FilterPipe } from './pipes/filter.pipe'
import { SafeHtmlPipe } from './pipes/safeHtml.pipe'

// Services
import { IpamResourceService } from './services/ipam-resource.service'
import { AppValidators } from './services/app-validators.service'

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule
  ],
  declarations: [
    CoreBlockerComponent,
    CoreCollapseComponent,
    CoreCollapseToggleComponent,
    CoreFileInputComponent,
    CoreLoaderComponent,
    CoreMarkdownComponent,
    CoreMarkdownEditorComponent,
    CoreModalComponent,
    CoreMultiEditComponent,
    CoreMultiSelectComponent,
    CorePanelComponent,
    CoreSelectComponent,
    CoreSelectSpinnerComponent,
    CoreShowErrorsComponent,
    CoreSwitchComponent,
    CoreTabComponent,
    CoreTabSelectComponent,
    CoreTableComponent,
    CoreTableListComponent,
    CoreTableListColumnComponent,
    CoreTabsComponent,
    CoreWizardComponent,
    CoreWizardScreenComponent,
    CoreInputSpinnerComponent,
    SortPipe,
    FilterPipe,
    SafeHtmlPipe,
    NavigateAndSelectNetworkComponent,
    NavigateAndSelectSubnetComponent,
    NavigateAndSelectZoneComponent,
    NavigateAndSelectDnsRecordComponent,
    NavigateAndSelectZoneDnsRecordComponent,
    NavigateDhcpOptionComponent,
    NavigateDhcpScopeComponent,
    NavigateAndSelectGroupComponent,
    SearchNetwork,
    SearchSubnet,
    SearchZone,
    SearchGroup,
    SearchAddress,
    SearchHostRecord,
    SearchDhcpReservation
  ],
  providers: [
    IpamResourceService,
    AppValidators
  ],
  exports: [
    CoreBlockerComponent,
    CoreCollapseComponent,
    CoreCollapseToggleComponent,
    CoreLoaderComponent,
    CoreFileInputComponent,
    CoreMarkdownEditorComponent,
    CoreModalComponent,
    CoreMultiEditComponent,
    CoreMultiSelectComponent,
    CorePanelComponent,
    CoreSelectComponent,
    CoreSelectSpinnerComponent,
    CoreShowErrorsComponent,
    CoreSwitchComponent,
    CoreTabComponent,
    CoreTabSelectComponent,
    CoreTableComponent,
    CoreTableListComponent,
    CoreTableListColumnComponent,
    CoreTabsComponent,
    CoreWizardComponent,
    CoreWizardScreenComponent,
    CoreInputSpinnerComponent,
    NavigateAndSelectNetworkComponent,
    NavigateAndSelectSubnetComponent,
    NavigateAndSelectZoneComponent,
    NavigateAndSelectDnsRecordComponent,
    NavigateAndSelectZoneDnsRecordComponent,
    NavigateDhcpOptionComponent,
    NavigateDhcpScopeComponent,
    NavigateAndSelectGroupComponent,
    SearchNetwork,
    SearchSubnet,
    SearchZone,
    SearchGroup,
    SearchAddress,
    SearchHostRecord,
    SearchDhcpReservation
  ]
})
export class CoreModule {}
