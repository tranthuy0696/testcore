import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { TranslateService } from '@ngx-translate/core'
import { Net } from '../../models/ipam-resource.model'
import { NagivateAndSelectNetwork } from '../../models/navigate-and-select-network.model'
import { IpamResourceService } from '../../services/ipam-resource.service'
import { Subscription, forkJoin, of } from 'rxjs'
import { BaseComponent } from '../base/base.component'
import { CoreTableListComponent } from '../core-table-list/core-table-list.component'
import { mergeMap } from 'rxjs/operators'

@Component({
  selector: 'navigate-and-select-network',
  templateUrl: './navigate-and-select-network.component.html',
  host: {
    'auto-tag': 'navigate-and-select-network',
  }
})
export class NavigateAndSelectNetworkComponent extends BaseComponent implements OnInit {
  @Input() data = <NagivateAndSelectNetwork> {
    leftTableData: [],
    rightTableData: [],
    current: null,
    net: null
  }
  @Input() checkAccess = false
  @Output() dataChange = new EventEmitter<NagivateAndSelectNetwork>()
  @ViewChild('leftTable', {static: true}) leftTable: CoreTableListComponent
  collapsed = false

  private NO_PARENT_SELECTED = this.translate.instant('No Parent Selected')
  loadingLeftTable = false
  loadingRightTable = false
  loadingWell = false

  loadSiblingNetworksIntoLeftTableSub: Subscription
  loadChildrenNetworksIntoLeftTableSub: Subscription
  backSub: Subscription
  loadDirectParentNetworkSub: Subscription
  subSelectNetwork: Subscription

  constructor(private toastr: ToastrService,
              private ipamResourceService: IpamResourceService,
              private translate: TranslateService) {
    super(translate)
  }

  ngOnInit() {
    if (this.data.leftTableData.length === 0) {
      this.loadChildrenNetworksIntoLeftTable()
    }
  }

  private loadChildrenNetworksIntoLeftTable(network?: Net) {
    this.loadingLeftTable = true
    this.data.leftTableData = []
    this.data.current = network && network.id ? network : null
    if (network && network.id) {
      this.loadingWell = true
      this.ipamResourceService.getParentsAndGroupsForNetwork(network.id).subscribe(rs => {
        this.loadingWell = false
        this.data.current.parents = rs.parents
      }, () => {
        this.loadingWell = false
      })
    }
    this.loadChildrenNetworksIntoLeftTableSub = this.ipamResourceService.getChildSubnetsAndNetworks(network).subscribe((networks) => {
      for (let i = 0; i < networks.length; i++) {
        this.data.leftTableData.push(networks[i])
      }
      this.loadingLeftTable = false
    }, (error) => {
      this.toastr.error(error.error)
      this.loadingLeftTable = false
    })
  }

  private loadSiblingNetworksIntoLeftTable(network: Net, callback?: Function) {
    this.loadingLeftTable = true
    this.loadDirectParentNetworkSub = this.ipamResourceService.getDirectParentNetwork(network.id).pipe(mergeMap(parent => {
      return parent && parent.id
        ? this.ipamResourceService.getParentsAndGroupsForNetwork(parent.id).pipe(mergeMap(result => {
          parent.parents = result.parents
          return of(parent)
        }))
        : of(null)
    }))
    .subscribe(parent => {
      this.data.current = parent
      this.loadSiblingNetworksIntoLeftTableSub = this.ipamResourceService.getSiblingSubnetsAndNetworks(network.id).subscribe((networks) => {
        this.data.leftTableData = []
        for (let i = 0; i < networks.length; i++) {
          this.data.leftTableData.push(networks[i])
        }
        this.loadingLeftTable = false
        if (callback) {
          callback()
        }
      }, (error) => {
        this.toastr.error(error.error)
        this.loadingLeftTable = false
      })
    })
  }

  selectNetwork(network: Net) {
    this.unsubscribeAll()
    this.data.net = null
    this.data.rightTableData = []
    this.loadingWell = true
    this.loadingRightTable = true
    this.data.leftTableData.forEach(item => item.selected = (item.id === network.id && item.type === network.type) ? true : false)
    this.subSelectNetwork = forkJoin(
      this.ipamResourceService.getParentsAndGroupsForNetwork(network.id),
      this.ipamResourceService.hasWriteAccess(network.id),
      this.ipamResourceService.getChildSubnetsAndNetworks(network)
    ).subscribe((value) => {
      this.data.net = {
        id: network.id,
        CIDR: network.CIDR,
        name: network.name,
        group: value[0].group,
        parents: value[0].parents,
        accessible: value[1] === 'true'
      }
      for (let i = 0; i < value[2].length; i++) {
        this.data.rightTableData.push(value[2][i])
      }
      this.loadingWell = false
      this.loadingRightTable = false
      this.dataChange.emit(this.data)
    }, error => {
      this.loadingWell = false
      this.loadingRightTable = false
      this.toastr.error(error.error)
    })
  }

  back() {
    this.reset()
    if (this.data.current) {
      this.loadingLeftTable = true
      this.backSub = this.ipamResourceService.getDirectParentNetwork(this.data.current.id).subscribe((parent) => {
        this.loadingLeftTable = false
        this.loadChildrenNetworksIntoLeftTable(parent)
      })
    } else {
      this.loadChildrenNetworksIntoLeftTable()
    }
  }

  openNetwork(network?: Net, event?: Event) {
    if (event) {
      event.stopPropagation()
    }
    this.reset()
    this.loadChildrenNetworksIntoLeftTable(network)
  }

  reset() {
    this.unsubscribeAll()
    this.data.leftTableData = []
    this.data.rightTableData = []
    this.data.net = null
    this.loadingRightTable = false
    this.loadingLeftTable = false
    this.loadingWell = false
  }

  displayParentGroups() {
    let network = this.data.net
    if (!network) {
      return this.NO_PARENT_SELECTED
    }
    if (!network.group || !network.group.parentGroup) {
      return ''
    } else {
      return network.group.parentGroup.map((item) => item.name).join(', ')
    }
  }

  onLeftTableCellClick(data: any) {
    if (data.row.type === 'Network') {
      let network: Net = data.row
      if (!network.selected) {
        this.selectNetwork(network)
      }
    }
  }

  highlightRowFunc(network: Net) {
    return network.selected
  }

  unsubscribeAll() {
    if (this.backSub) {
      this.backSub.unsubscribe()
    }
    if (this.loadSiblingNetworksIntoLeftTableSub) {
      this.loadSiblingNetworksIntoLeftTableSub.unsubscribe()
    }
    if (this.loadChildrenNetworksIntoLeftTableSub) {
      this.loadChildrenNetworksIntoLeftTableSub.unsubscribe()
    }
    if (this.loadDirectParentNetworkSub) {
      this.loadDirectParentNetworkSub.unsubscribe()
    }
    if (this.subSelectNetwork) {
      this.subSelectNetwork.unsubscribe()
    }
  }

  onRightTableCellClick(data: any) {
    if (data.row.type === 'Network') {
      let network: Net = data.row
      if (!network.selected) {
        this.unsubscribeAll()
        this.data.leftTableData = []
        this.data.rightTableData = []
        this.data.net = null
        this.data.current = null
        this.loadingLeftTable = true
        this.loadingRightTable = true
        this.loadingWell = true
        this.subSelectNetwork = forkJoin(
          this.ipamResourceService.getSiblingSubnetsAndNetworks(network.id),
          this.ipamResourceService.getChildSubnetsAndNetworks(network),
          this.ipamResourceService.getParentsAndGroupsForNetwork(network.id),
          this.ipamResourceService.hasWriteAccess(network.id)
        ).subscribe((results) => {
          this.data.leftTableData = results[0]
          this.data.rightTableData = results[1]
          this.data.net = {
            id: network.id,
            CIDR: network.CIDR,
            name: network.name,
            group: results[2].group,
            parents: results[2].parents,
            accessible: results[3] === 'true'
          }
          this.data.current = results[2].parents.length > 0 ? results[2].parents[results[2].parents.length - 1] : null
          this.data.leftTableData.forEach(item => item.selected = (item.id === network.id && item.type === network.type) ? true : false)
          this.leftTable.scrollToFirstSelectedRow()
          this.loadingLeftTable = false
          this.loadingRightTable = false
          this.loadingWell = false
          this.dataChange.emit(this.data)
        }, error => {
          this.loadingLeftTable = false
          this.loadingRightTable = false
          this.loadingWell = false
          this.toastr.error(error.error)
        })
      }
    }
  }

  onSearchStart() {
    this.loadingLeftTable = true
  }

  onSearchEnd(e) {
    if (e && e.searchedResult && e.searchedResult.id) {
      this.data.net = null
      this.data.leftTableData = []
      this.data.rightTableData = []
      this.loadSiblingNetworksIntoLeftTable(e.searchedResult, () => {
        this.data.leftTableData.forEach(item => item.selected = item.id === e.searchedResult.id && item.type === e.searchedResult.type)
        this.leftTable.scrollToFirstSelectedRow()
        this.selectNetwork(e.searchedResult)
      })
    } else {
      this.loadingLeftTable = false
      this.loadingRightTable = false
      this.loadingWell = false
    }
  }
}
