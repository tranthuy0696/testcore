import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { TranslateService } from '@ngx-translate/core'

import { Net, Address } from '../../models/ipam-resource.model'
import { NagivateAndSelectNetwork } from '../../models/navigate-and-select-network.model'
import { IpamResourceService } from '../../services/ipam-resource.service'
import { Subscription, forkJoin, of } from 'rxjs'
import { BaseComponent } from '../base/base.component'
import { Netmask } from 'netmask'
import { CoreTableListComponent } from '../core-table-list/core-table-list.component'
import { catchError, mergeMap } from 'rxjs/operators'
import { SearchSubnet } from '../search-subnet/search-subnet.component'

@Component({
  selector: 'navigate-and-select-subnet',
  templateUrl: './navigate-and-select-subnet.component.html'
})
export class NavigateAndSelectSubnetComponent extends BaseComponent implements OnInit {
  MODE_SELECT_SUBNET = 'SelectSubnet'
  MODE_SELECT_SUBNET_TO_SPLIT = 'SelectSubnetToSplit'
  MODE_SELECT_SUBNETS_TO_JOIN = 'SelectSubnetsToJoin'
  MODE_SELECT_SUBNET_TO_ACTIVATE = 'SelectSubnetToActivate'
  MODE_SELECT_SUBNET_TO_MODIFY_DHCP_SERVICE = 'SelectSubnetToModifyDhcpService'
  MODE_SELECT_SUBNET_TO_SELECT_ADDRESS = 'SelectSubnetToSelectAddress'
  MODE_SELECT_SUBNET_SELECTABLE_ADDRESS = 'SelectSubnetSelectableAddress'
  AVAILABLE = 'Available'

  @Input() data = <NagivateAndSelectNetwork> {
    leftTableData: [],
    rightTableData: [],
    current: null,
    net: null
  }
  @Output() dataChange = new EventEmitter<NagivateAndSelectNetwork>()
  @Output() dataChangeStart = new EventEmitter<any>()
  @Output() subnetNotFound = new EventEmitter<any>()
  @Output() pageChange = new EventEmitter<any>()
  @Input() classes: string[]
  @Input() mode = this.MODE_SELECT_SUBNET
  @Input() showDhcpService = false
  @ViewChild('leftTable', {static: true}) leftTable: CoreTableListComponent
  @Input('lazyload') lazyload = false
  @Output() rightPaneDataClick = new EventEmitter<any>()
  @ViewChild('searchSubnet', {static: true}) searchSubnet: SearchSubnet

  collapsed = false

  NOT_SELECTED = this.translate.instant('Not Selected')
  NETWORK = 'Network'
  SUBNET = 'Subnet'
  SEARCH_BY_SUBNET = 'searchBySubnet'
  SEARCH_BY_FQDN = 'searchByFqdn'
  SEARCH_BY_IP = 'searchByIp'

  searchedResult: Net = null
  loadingLeftTable = false
  loadingRightTable = false
  loadingNet = false
  loadingNet1 = false
  loadingNet2 = false
  pageList = new Array()
  selectedPage = 0
  isPageDisabled = true
  labels = new Array()

  loadSiblingNetworksIntoLeftTableSub: Subscription
  loadChildNetsIntoLeftTableSub: Subscription
  loadNetSub: Subscription
  backSub: Subscription
  getSubnetsByHostRecordSub: Subscription
  loadDirectParentNetworkSub: Subscription
  loadNet1Sub: Subscription
  loadNet2Sub: Subscription
  getJoinableSubnets: Subscription
  getDhcpScopesSub: Subscription
  subSearchByIp: Subscription

  constructor(private toastr: ToastrService,
              private translate: TranslateService,
              private ipamResourceService: IpamResourceService) {
    super(translate)
  }

  ngOnInit() {
    if (!this.lazyload) {
      if (this.data.leftTableData.length === 0) {
        this.openNetwork()
      } else {
        if (this.data.net && this.data.rightTableData.length > 0 && (this.mode === this.MODE_SELECT_SUBNET
          || this.mode === this.MODE_SELECT_SUBNET_TO_SELECT_ADDRESS)) {
          this.setPaginateChildSubnets(this.data.net)
        }
      }
    }
  }


  onSearchStart() {
    this.loadingLeftTable = true
  }

  onSearchEnd(data, callback?: Function) {
    this.dataChangeStart.emit()
    if (data.searchedBy === this.SEARCH_BY_SUBNET) {
      if (data.searchedResult && data.searchedResult.id) {
        this.reset()
        this.loadingLeftTable = true
        this.loadSiblingNetworksIntoLeftTable(data.searchedResult, () => {
          this.loadingLeftTable = false
          this.data.leftTableData.forEach(item => item.selected = item.id === data.searchedResult.id)
          const net = this.data.leftTableData.find(item => item.id === data.searchedResult.id && item.type === data.searchedResult.type)
          this.leftTable.scrollToFirstSelectedRow()
          this.selectSubnet(net, callback)
        })
      } else {
        this.reset()
      }
    } else if (data.searchedBy === this.SEARCH_BY_FQDN) {
      if (data.searchedResult && data.searchedResult.id) {
        this.reset()
        this.loadingLeftTable = true
        this.getSubnetsByHostRecordSub = this.ipamResourceService.getSubnetsByHostRecord(
          data.searchedResult.id).subscribe((subnets) => {
          this.loadingLeftTable = false
          this.loadSiblingNetworksIntoLeftTable(subnets[0], () => {
            this.data.leftTableData.forEach(item => item.selected = item.id === subnets[0].id && item.type === subnets[0].type)
            this.leftTable.scrollToFirstSelectedRow()
            this.selectSubnet(subnets[0])
          })
        }, (error) => {
          if (error.status === 404) {
            this.loadingLeftTable = false
          }
        })
      } else {
        this.reset()
      }
    } else if (data.searchedBy === this.SEARCH_BY_IP) {
      this.reset()
      this.loadingLeftTable = true
      this.loadingLeftTable = false
      this.loadSiblingNetworksIntoLeftTable(data.searchedResult, () => {
        this.data.leftTableData.forEach(item => item.selected = item.id === data.searchedResult.id && item.type === data.searchedResult.type)
        this.leftTable.scrollToFirstSelectedRow()
        this.selectSubnet(data.searchedResult)
      })
    }
  }

  private loadChildNetsIntoLeftTable(parentNet?: Net, callback?: Function) {
    this.loadingLeftTable = true
    this.data.current = parentNet && parentNet.id ? parentNet : null
    if (parentNet && parentNet.id) {
      this.loadingNet = true
      this.loadingNet1 = true
      this.ipamResourceService.getParentsAndGroupsForSubnet(parentNet.id).subscribe(rs => {
        this.loadingNet = false
        this.loadingNet1 = false
        this.data.current.parents = rs.parents
      }, () => {
        this.loadingNet = false
        this.loadingNet1 = false
      })
    }
    this.data.leftTableData = []
    this.loadChildNetsIntoLeftTableSub = this.ipamResourceService.getChildSubnetsAndNetworks(parentNet).subscribe((nets) => {
      for (let i = 0; i < nets.length; i++) {
        this.data.leftTableData.push(nets[i])
      }
      this.loadingLeftTable = false
      if (callback) {
        callback()
      }
    }, (error) => {
      this.toastr.error(error.error)
      this.loadingLeftTable = false
      if (callback) {
        callback(error)
      }
    })
  }

  private loadSiblingNetworksIntoLeftTable(network: Net, callback?: Function) {
    this.loadingLeftTable = true
    this.data.leftTableData = []
    this.loadDirectParentNetworkSub = this.ipamResourceService.getDirectParentNetwork(network.id, network.type).pipe(mergeMap(parent => {
      return parent
        ? this.ipamResourceService.getParentsAndGroupsForSubnet(parent.id).pipe(mergeMap(result => {
          parent.parents = result.parents
          return of(parent)
        }))
        : of(null)
    })).subscribe(parent => {
      this.data.current = parent
      this.loadSiblingNetworksIntoLeftTableSub = this.ipamResourceService.getSiblingSubnetsAndNetworks(network.id, network.type).subscribe((networks) => {
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
    }, () => {
      this.searchSubnet.resetSearchText()
      this.subnetNotFound.emit()
    })
  }

  onPageChange(_: any): void {
    this.loadingRightTable = true
    this.ipamResourceService.getAddressesByStartEnd(this.data.net.id, this.data.net.CIDR, this.pageList[this.selectedPage].start, this.pageList[this.selectedPage].end)
    .subscribe((addresses) => {
      this.data.rightTableData = addresses
      this.pageChange.emit(addresses)
      this.loadingRightTable = false
    })
  }

  private paginateLabels(subnet: Net): any {
    let all = new Array()
    new Netmask(subnet.CIDR).forEach((ip) => {
      all.push(ip)
    })
    let pageList = new Array()
    let pageSize = 255
    while (all.length > 0) {
      let array = all.splice(0, pageSize)
      pageList.push({
        start: array[0],
        end: array[array.length - 1],
        label: `${array[0]} - ${array[array.length - 1]}`
      })
      pageSize = 256
    }
    this.pageList = pageList
    this.labels = this.pageList.map(({ label }) => label)
    this.isPageDisabled = false
  }

  changeSubnet(net: Net) {
    this.dataChangeStart.emit()
    this.selectSubnet(net)
  }

  setPaginateChildSubnets(net: Net) {
    this.paginateLabels(net)
    let index = this.pageList.findIndex(({ start, end }) => start === this.data.rightTableData[0].ip && end === this.data.rightTableData[this.data.rightTableData.length - 1].ip)
    this.selectedPage = index > -1 ? index : 0
    this.isPageDisabled = false
  }

  private selectSubnet(net: Net, callback?: Function) {
    this.unsubscribeAll()
    this.resetPaging()
    this.data.leftTableData.forEach(item => item.selected = (item.id === net.id && item.type === net.type) ? true : false)
    switch (this.mode) {
      case this.MODE_SELECT_SUBNET:
      case this.MODE_SELECT_SUBNET_TO_SPLIT:
      case this.MODE_SELECT_SUBNET_TO_ACTIVATE:
      case this.MODE_SELECT_SUBNET_TO_SELECT_ADDRESS:
      case this.MODE_SELECT_SUBNET_SELECTABLE_ADDRESS:
        this.loadSubnet(net, callback)
        break
      case this.MODE_SELECT_SUBNETS_TO_JOIN:
        this.data.net1 = null
        this.data.net2 = null
        this.data.rightTableData = []
        this.loadingRightTable = true
        this.getJoinableSubnets = this.ipamResourceService.getJoinableSubnets(net.CIDR).subscribe(data => {
          this.data.rightTableData = data
          if (this.data.rightTableData.length > 0) {
            this.selectSecondSubnet(this.data.rightTableData[0])
          }
          this.loadingRightTable = false
        }, error => {
          if (error.status === 404) {
            this.toastr.info(this.translate.instant('Found no possible join!'))
          } else {
            this.toastr.error(error.error)
          }
          this.loadingRightTable = false
        })
        this.loadingNet1 = true

        this.loadNet1Sub = forkJoin(
          this.ipamResourceService.getParentsAndGroupsForSubnet(net.id),
          this.ipamResourceService.hasWriteAccess(net.id),
          this.ipamResourceService.isActiveSubnet(net.id)
        ).subscribe(value => {
          this.data.net1 = net
          this.data.net1.group = value[0].group
          this.data.net1.parents = value[0].parents
          this.data.net1.accessible = value[1] === 'true'
          this.data.net1.isActive = value[2] === 'true'
          this.dataChange.emit(this.data)
          this.loadingNet1 = false
        }, error => {
          this.toastr.error(error.error)
        })
        break
      case this.MODE_SELECT_SUBNET_TO_MODIFY_DHCP_SERVICE:
        this.loadingNet = true
        this.loadingRightTable = true
        this.data.loadingDhcpServices = true
        this.data.net = null
        this.data.rightTableData = []
        this.data.dhcpServices = []
        this.loadNetSub = forkJoin(
          this.ipamResourceService.getParentsAndGroupsForSubnet(net.id),
          this.ipamResourceService.hasWriteAccess(net.id),
          this.ipamResourceService.isActiveSubnet(net.id),
          this.ipamResourceService.getSubnetDhcpService(net.id, net.CIDR)
            .pipe(
              catchError((res) => {
                if (res.status === 500) {
                  this.toastr.error(res.error)
                }
                return of(null)
              })
            ),
          this.ipamResourceService.getDhcpServices(net.id)
        ).subscribe(data => {
          this.data.net = net
          this.data.net.group = data[0].group
          this.data.net.parents = data[0].parents
          this.data.net.accessible = data[1] === 'true'
          this.data.net.isActive = data[2] === 'true'
          this.data.net.dhcpService = data[3]
          this.data.dhcpServices = data[4]
          if (this.data.net.dhcpService && !this.data.dhcpServices.find((e) => e.id === this.data.net.dhcpService.id)) {
            this.data.dhcpServices.push(this.data.net.dhcpService)
          }
          this.data.loadingDhcpServices = false
          this.loadingNet = false
          this.dataChange.emit(this.data)
        }, error => {
          this.loadingRightTable = false
          this.data.loadingDhcpServices = false
          this.loadingNet = false
          this.toastr.error(error.error)
        })
        this.getDhcpScopesSub = this.ipamResourceService.getDhcpScopes({subnetId: net.id}).subscribe((data) => {
          this.data.rightTableData = data
          this.loadingRightTable = false
        })
        break
      default:
        console.log(`Mode=${this.mode} is not supported!`)
        break
    }
  }

  openNetwork(network?: Net) {
    this.reset()
    this.dataChangeStart.emit()
    this.loadChildNetsIntoLeftTable(network)
  }

  back() {
    this.reset()
    this.dataChangeStart.emit()
    if (this.data.current) {
      this.loadingLeftTable = true
      this.backSub = this.ipamResourceService.getDirectParentNetwork(this.data.current.id).subscribe(parent => {
        this.loadingLeftTable = false
        this.loadChildNetsIntoLeftTable(parent, () => {
          this.dataChange.emit(this.data)
        })
      })
    } else {
      this.loadChildNetsIntoLeftTable(null, () => {
        this.dataChange.emit(this.data)
      })
    }
  }

  private resetPaging() {
    this.pageList = []
    this.selectedPage = 0
    this.labels = [' ']
    this.isPageDisabled = true
  }

  reset() {
    this.unsubscribeAll()
    this.data.leftTableData = []
    this.data.rightTableData = []
    this.data.net = null
    this.data.address = null
    this.loadingRightTable = false
    this.loadingLeftTable = false
    this.loadingNet = false
    this.resetPaging()
  }

  displayGroups(net: Net) {
    if (!net) {
      return this.NOT_SELECTED
    }
    if (!net.group || !net.group.parentGroup) {
      return ''
    } else {
      return net.group.parentGroup.map(item => item.name).join(', ')
    }
  }

  displayGateway(net: Net) {
    if (!net) {
      return this.NOT_SELECTED
    }
    return net.gateway
  }

  displayCidr(net: Net) {
    if (!net) {
      return this.NOT_SELECTED
    }
    return net.CIDR
  }

  displayName(net: Net) {
    if (!net) {
      return this.NOT_SELECTED
    }
    return net.name
  }

  displayDhcpService(net: Net) {
    if (!net) {
      return this.NOT_SELECTED
    }
    return net.dhcpService ? net.dhcpService.name : this.translate.instant('None')
  }

  onLeftTableCellClick(data: any) {
    if (data.row.type === this.SUBNET) {
      this.changeSubnet(data.row)
    }
  }

  onRightTableClick(data: any) {
    if (this.mode === this.MODE_SELECT_SUBNETS_TO_JOIN) {
      this.selectSecondSubnet(data.row)
    } else if (this.mode === this.MODE_SELECT_SUBNET_SELECTABLE_ADDRESS) {
      this.selectAddress(data.row)
    }
  }

  selectAddress(address: Address) {
    if (address.state !== 'Available') {
      this.data.rightTableData.forEach(item => item.selected = item.ip === address.ip)
      this.data.address = address
      this.dataChange.emit(this.data)
    }
  }

  selectSecondSubnet(subnet: Net) {
    this.data.rightTableData.forEach(item => item.selected = false)
    subnet.selected = true
    this.loadingNet2 = true
    this.loadNet2Sub = forkJoin(
      this.ipamResourceService.hasWriteAccess(subnet.id),
      this.ipamResourceService.isActiveSubnet(subnet.id)
    ).subscribe((results) => {
      this.data.net2 = subnet
      this.data.net2.accessible = results[0] === 'true'
      this.data.net2.isActive = results[1] === 'true'
      this.data.net2.reserved = true // always - per agreement with server side
      this.dataChange.emit(this.data)
      this.loadingNet2 = false
    }, res => {
      this.toastr.error(res.error)
    })
  }

  highlightRowFunc(net: Net) {
    return net.selected
  }

  unsubscribeAll() {
    if (this.backSub) {
      this.backSub.unsubscribe()
    }
    if (this.loadSiblingNetworksIntoLeftTableSub) {
      this.loadSiblingNetworksIntoLeftTableSub.unsubscribe()
    }
    if (this.loadNetSub) {
      this.loadNetSub.unsubscribe()
    }
    if (this.loadChildNetsIntoLeftTableSub) {
      this.loadChildNetsIntoLeftTableSub.unsubscribe()
    }
    if (this.getSubnetsByHostRecordSub) {
      this.getSubnetsByHostRecordSub.unsubscribe()
    }
    if (this.loadDirectParentNetworkSub) {
      this.loadDirectParentNetworkSub.unsubscribe()
    }
    if (this.loadNet1Sub) {
      this.loadNet1Sub.unsubscribe()
    }
    if (this.loadNet2Sub) {
      this.loadNet2Sub.unsubscribe()
    }
    if (this.getJoinableSubnets) {
      this.getJoinableSubnets.unsubscribe()
    }
    if (this.getDhcpScopesSub) {
      this.getDhcpScopesSub.unsubscribe()
    }
    if (this.subSearchByIp) {
      this.subSearchByIp.unsubscribe()
    }
  }

  loadSubnet(net: Net, callback?: Function) {
    this.loadingNet = true
    this.loadingRightTable = true
    this.data.net = null
    this.data.rightTableData = []
    this.data.address = null
    this.paginateLabels(net)
    this.loadNetSub = forkJoin(
      this.ipamResourceService.getParentsAndGroupsForSubnet(net.id),
      this.ipamResourceService.hasWriteAccess(net.id),
      this.ipamResourceService.isActiveSubnet(net.id),
      this.ipamResourceService.getSubnetDhcpService(net.id, net.CIDR)
        .pipe(
          catchError((res) => {
            if (res.status === 500 && this.mode !== this.MODE_SELECT_SUBNET_SELECTABLE_ADDRESS ) {
              this.toastr.error(res.error)
            }
            return of(null)
          })
        ),
      this.ipamResourceService.getAddressesByStartEnd(net.id, net.CIDR, this.pageList[this.selectedPage].start, this.pageList[this.selectedPage].end)
    ).subscribe((value) => {
      this.data.net = net
      this.data.net.group = value[0].group
      this.data.net.parents = value[0].parents
      this.data.net.accessible = value[1] === 'true'
      this.data.net.isActive = value[2] === 'true'
      this.data.net.dhcpService = value[3]
      this.data.rightTableData = value[4]
      this.isPageDisabled = false
      this.loadingNet = false
      this.loadingRightTable = false
      this.dataChange.emit(this.data)
      if (callback) {
        callback()
      }
    }, error => {
      this.loadingNet = false
      this.loadingRightTable = false
      this.toastr.error(error.error)
    })
  }

  displayState(address: Address) {
    switch (address.state) {
      case 'STATIC':
      case 'GATEWAY':
        return this.translate.instant('Static')
      case 'DHCP':
      case 'DHCP_ALLOCATED':
        return this.translate.instant('DHCP')
      case 'DHCP_RESERVED':
        return this.translate.instant('DHCP_RESERVATION')
      default:
        return address.state
    }
  }

  load(net?: Net, address?: Address) {
    this.unsubscribeAll()
    this.data.leftTableData = []
    this.data.rightTableData = []
    this.data.net = null
    this.data.address = null
    this.loadingRightTable = false
    this.loadingLeftTable = false
    this.loadingNet = false
    this.resetPaging()
    if (net && net.id) {
      this.searchedResult = net
      let data = {
        searchedResult: net,
        searchedBy: this.SEARCH_BY_SUBNET,
        searchedByResult: null

      }
      this.onSearchEnd(data, () => {
        if (address && address.id) {
          this.selectAddress(address)
        }
      })
    } else {
      this.loadChildNetsIntoLeftTable()
    }
  }

  onRightTableCellClick(data: any) {
    this.rightPaneDataClick.emit(data)
  }
}
