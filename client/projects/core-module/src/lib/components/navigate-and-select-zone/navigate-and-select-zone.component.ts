import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { TranslateService } from '@ngx-translate/core'
import { Zone } from '../../models/ipam-resource.model'
import { IpamResourceService } from '../../services/ipam-resource.service'
import { Subscription, forkJoin, of, Observable } from 'rxjs'
import { BaseComponent } from '../base/base.component'
import { NavigateAndSelectZone } from '../../models/navigate-and-select-zone.model'
import { CoreTableListComponent } from '../core-table-list/core-table-list.component'
import { getChunkArray } from '../../utils/getChunkArray'
import { generateNumberArray } from '../../utils/generateNumberArray'
import { mergeMap } from 'rxjs/operators'

@Component({
  selector: 'navigate-and-select-zone',
  templateUrl: './navigate-and-select-zone.component.html'
})
export class NavigateAndSelectZoneComponent extends BaseComponent implements OnInit {
  JUMP_TO_ZONE = 'Jump to zone'
  SEARCH_BY_FQDN = 'Search by FQDN'

  @Input() data = <NavigateAndSelectZone> {
    allZones: [],
    leftTableData: [],
    rightTableData: [],
    current: null,
    zone: null,
    records: []
  }
  @Output() dataChange = new EventEmitter<NavigateAndSelectZone>()
  @Output() dataChangeStart = new EventEmitter<void>()
  @Input('display') display = 'full'
  @Input('lazyload') lazyload = false

  @ViewChild('leftTable', {static: true}) leftTable: CoreTableListComponent

  collapsed = false
  NO_PARENT_SELECTED = this.translate.instant('No Parent Selected')

  loadingLeftTable = false
  loadingRightTable = false
  searchingZones = false
  loadingWell = false

  loadChildrenZonesIntoLeftTableSub: Subscription
  loadChildrenZonesIntoRightTableSub: Subscription
  backSub: Subscription
  subSelectZone: Subscription
  subLoadRecords: Subscription
  subSearchZonesByHint: Subscription
  subLoadSiblingZones: Subscription
  subGetZoneAndRecordsByFqdn: Subscription
  subGetParentsOfZone: Subscription

  PAGE_SIZE = 20
  leftTableAllData: Zone[]
  leftTableIndex: number
  leftTableMaxIndex: number
  leftTableIndexLabels: number[]
  leftTablePageDisabled: boolean
  rightTableAllData: Zone[]
  rightTableIndex: number
  rightTableMaxIndex: number
  rightTableIndexLabels: number[]
  rightTablePageDisabled: boolean

  highlightRowFunc(zone: Zone) {
    return zone.selected
  }

  constructor(private toastr: ToastrService,
              private ipamResourceService: IpamResourceService,
              private translate: TranslateService) {
    super(translate)
  }

  ngOnInit() {
    if (!this.lazyload) {
      if (this.data.leftTableData.length === 0) {
        this.loadChildrenZonesIntoLeftTable()
      }
    }
  }

  private loadSiblingNetworksIntoLeftTable(zone: Zone): Observable<void> {
    this.loadingLeftTable = true
    return this.ipamResourceService.getZoneSiblings(zone.id)
      .pipe(
        mergeMap(zones => {
          if (zones.length > 0) {
            this.leftTableAllData = zones.sort((first, second) => first.fqdn > second.fqdn ? 1 : -1)
            const arrayOfZones = getChunkArray(this.leftTableAllData, this.PAGE_SIZE)
            for (let i = 0, n = arrayOfZones.length; i < n; i++) {
              if (arrayOfZones[i].find(z => z.id === zone.id)) {
                this.leftTablePageDisabled = false
                this.leftTableIndex = i
                this.leftTableMaxIndex = arrayOfZones.length - 1
                this.leftTableIndexLabels = generateNumberArray(1, arrayOfZones.length)
                this.data.leftTableData = arrayOfZones[this.leftTableIndex]
                break
              }
            }
          } else {
            this.leftTablePageDisabled = true
            this.data.leftTableData = []
          }
          this.loadingLeftTable = false
          return of(null)
        })
      )
  }

  private loadChildrenZonesIntoLeftTable(zone ?: Zone) {
    this.loadingLeftTable = true
    this.data.leftTableData = []
    this.data.current = zone && zone.id ? zone : null
    const parentId = zone && zone.id ? zone.id : 0
    forkJoin([
      this.ipamResourceService.getZoneChildren(parentId),
      this.ipamResourceService.getParentsOfZone(parentId)
    ])
      .subscribe(([zones, parents]) => {
        if (this.data.current) {
          this.data.current.parents = parents || []
        }
        if (zones.length > 0) {
          const arrayOfZones = getChunkArray(zones, this.PAGE_SIZE)
          this.leftTablePageDisabled = false
          this.leftTableAllData = zones
          this.leftTableIndex = 0
          this.leftTableMaxIndex = arrayOfZones.length - 1
          this.leftTableIndexLabels = generateNumberArray(1, arrayOfZones.length)
          this.data.leftTableData = arrayOfZones[this.leftTableIndex]
        } else {
          this.leftTablePageDisabled = true
          this.data.leftTableData = []
        }
        this.loadingLeftTable = false
      }, (error) => {
        this.toastr.error(error.error)
        this.loadingLeftTable = false
      })
  }

  private loadChildrenZonesIntoRightTable(zone: Zone) {
    this.loadingRightTable = true
    const parentId = zone ? zone.id : null
    return new Promise((resolve, reject) => {
      this.data.rightTableData = []
      this.loadChildrenZonesIntoRightTableSub = this.ipamResourceService.getZoneChildren(parentId).subscribe((zones) => {
        if (zones.length > 0) {
          this.data.allZones = zones
          const arrayOfZones = getChunkArray(zones, this.PAGE_SIZE)
          this.rightTablePageDisabled = false
          this.rightTableAllData = zones
          this.rightTableIndex = 0
          this.rightTableMaxIndex = arrayOfZones.length - 1
          this.rightTableIndexLabels = generateNumberArray(1, arrayOfZones.length)
          this.data.rightTableData = arrayOfZones[this.rightTableIndex]
        } else {
          this.rightTablePageDisabled = true
          this.data.rightTableData = []
        }
        this.loadingRightTable = false
        resolve()
      }, (error) => {
        this.toastr.error(error.error)
        this.loadingRightTable = false
        reject()
      })
    })
  }

  selectZone(zone: Zone) {
    this.dataChangeStart.emit()
    this.unsubscribeAll()
    this.data.zone = zone
    this.data.rightTableData = []
    this.loadingRightTable = false
    this.data.leftTableData.forEach(item => item.selected = item.id === zone.id)
    this.leftTableAllData.forEach(item => item.selected = item.id === zone.id)
    this.subSelectZone = forkJoin(
      this.ipamResourceService.getZoneProfile(zone.fqdn),
      this.loadChildrenZonesIntoRightTable(zone)
    ).subscribe((response) => {
      this.data.zone = response[0]
      this.dataChange.emit(this.data)
    })
  }

  goUp() {
    this.dataChangeStart.emit()
    this.reset()
    this.dataChange.emit(this.data)
    if (this.data.current) {
      this.loadingLeftTable = true
      this.backSub = this.ipamResourceService.getDirectParentZone(this.data.current.id).subscribe((parent) => {
        this.loadingLeftTable = false
        this.loadChildrenZonesIntoLeftTable(parent)
      })
    } else {
      this.loadChildrenZonesIntoLeftTable()
    }
  }

  openZone(zone ?: Zone, event ?: Event) {
    if (event) {
      event.stopPropagation()
    }
    this.dataChangeStart.emit()
    this.reset()
    this.loadChildrenZonesIntoLeftTable(zone)
  }

  onLeftTableCellClick(data: any) {
    if (data.row.deployable) {
      let zone: Zone = data.row
      if (!zone.selected) {
        this.data.selectedDnsRecord = null
        this.selectZone(zone)
      }
    }
  }

  onRightTableCellClick(data: any) {
    const zone: Zone = data.row
    if (zone.deployable) {
      this.dataChangeStart.emit()
      this.unsubscribeAll()
      this.data.leftTableData = []
      this.data.rightTableData = []
      this.data.selectedDnsRecord = null
      this.loadingLeftTable = true
      this.loadingRightTable = true
      this.subSelectZone = forkJoin(
        this.ipamResourceService.getZoneSiblings(zone.id),
        this.ipamResourceService.getZoneChildren(zone.id),
        this.ipamResourceService.getZoneProfile(zone.fqdn),
        this.ipamResourceService.getDirectParentZone(zone.id)
          .pipe(mergeMap(parent => {
            let result: Zone = parent
            return this.ipamResourceService.getParentsOfZone(parent ? parent.id : 0)
              .pipe(mergeMap(parents => {
                result.parents = parents
                return of (result)
              }))
          }))
      ).subscribe((searchedResults) => {
        this.populateLeftList(searchedResults[0])
        this.populateRightList(searchedResults[1])
        this.highlightSelection(searchedResults[2])
        this.markCurrentView(searchedResults[3])
        this.dataChange.emit(this.data)
        this.loadingLeftTable = false
        this.loadingRightTable = false
      })
    } else {
      this.toastr.warning(`${zone.fqdn} is not a deployable DNS_ZONE`)
    }
  }

  private populateLeftList(zones: Zone[]) {
    if (zones.length > 0) {
      const arrayOfZones = getChunkArray(zones, this.PAGE_SIZE)
      this.leftTablePageDisabled = false
      this.leftTableAllData = zones
      this.leftTableIndex = 0
      this.leftTableMaxIndex = arrayOfZones.length - 1
      this.leftTableIndexLabels = generateNumberArray(1, arrayOfZones.length)
      this.data.leftTableData = arrayOfZones[this.leftTableIndex]
    } else {
      this.leftTablePageDisabled = true
      this.data.leftTableData = []
    }
  }

  private populateRightList(zones: Zone[]) {
    if (zones.length > 0) {
      const arrayOfZones = getChunkArray(zones, this.PAGE_SIZE)
      this.rightTablePageDisabled = false
      this.rightTableAllData = zones
      this.rightTableIndex = 0
      this.rightTableMaxIndex = arrayOfZones.length - 1
      this.rightTableIndexLabels = generateNumberArray(1, arrayOfZones.length)
      this.data.rightTableData = arrayOfZones[this.rightTableIndex]
    } else {
      this.rightTablePageDisabled = true
      this.data.rightTableData = []
    }
  }

  private highlightSelection(zone: Zone) {
    this.data.zone = zone
    this.data.leftTableData.forEach(item => item.selected = item.id === zone.id)
    this.leftTable.scrollToFirstSelectedRow()
  }

  private markCurrentView(zone: Zone) {
    this.data.current = zone
  }

  reset() {
    this.unsubscribeAll()
    this.data.leftTableData = []
    this.data.rightTableData = []
    this.data.selectedDnsRecord = null
    this.data.records = []
    this.data.zone = null
    this.loadingRightTable = false
    this.loadingLeftTable = false
  }

  unsubscribeAll() {
    if (this.backSub) {
      this.backSub.unsubscribe()
    }
    if (this.loadChildrenZonesIntoRightTableSub) {
      this.loadChildrenZonesIntoRightTableSub.unsubscribe()
    }
    if (this.loadChildrenZonesIntoLeftTableSub) {
      this.loadChildrenZonesIntoLeftTableSub.unsubscribe()
    }
    if (this.subSelectZone) {
      this.subSelectZone.unsubscribe()
    }
    if (this.subSearchZonesByHint) {
      this.subSearchZonesByHint.unsubscribe()
    }
    if (this.subLoadSiblingZones) {
      this.subLoadSiblingZones.unsubscribe()
    }
    if (this.subGetZoneAndRecordsByFqdn) {
      this.subGetZoneAndRecordsByFqdn.unsubscribe()
    }
    if (this.subGetParentsOfZone) {
      this.subGetParentsOfZone.unsubscribe()
    }
  }

  onSearchStart() {
    this.loadingLeftTable = true
  }

  onSearchEnd(e) {
    if (e && e.id) {
      e.searchedResult = e
      e.searchedBy = this.JUMP_TO_ZONE
    }
    if (e && e.searchedResult && e.searchedResult.id && e.searchedBy === this.JUMP_TO_ZONE) {
      this.dataChangeStart.emit()
      this.data.selectedDnsRecord = {}
      this.data.leftTableData = []
      this.data.rightTableData = []
      this.subGetZoneAndRecordsByFqdn = this.ipamResourceService.getDirectParentZone(e.searchedResult.id)
        .pipe(
          mergeMap(parent => {
            this.data.current = parent && parent.id ? parent : null
            return this.ipamResourceService.getParentsOfZone(parent ? parent.id : 0)
          })
        )
        .pipe(
          mergeMap(parents => {
            if (this.data.current) {
              this.data.current.parents = parents
            }
            return this.loadSiblingNetworksIntoLeftTable(e.searchedResult)
          })
        )
        .subscribe(() => {
          this.data.leftTableData.forEach(item => item.selected = item.id === e.searchedResult.id)
          this.leftTable.scrollToFirstSelectedRow()
          this.selectZone(e.searchedResult)
        }, () => {
          this.loadingLeftTable = false
          this.loadingRightTable = false
          this.loadingWell = false
        })
    } else if (e && e.searchedResult && e.searchedResult.zone && e.searchedResult.zone.id && e.searchedBy === this.SEARCH_BY_FQDN) {
      this.dataChangeStart.emit()
      this.loadingLeftTable = true
      this.data.selectedDnsRecord = {}
      this.data.leftTableData = []
      this.data.rightTableData = []
      if (e.searchedResult.zone && e.searchedResult.zone.id) {
        this.ipamResourceService.getDirectParentZone(e.searchedResult.zone.id)
          .pipe(
            mergeMap(searchedResult => {
              this.data.current = searchedResult && searchedResult.id ? searchedResult : null
              return this.ipamResourceService.getParentsOfZone(searchedResult ? searchedResult.id : 0)
            })
          )
          .subscribe((parents) => {
            if (this.data.current) {
              this.data.current.parents = parents
            }
          })
      }
      this.data.selectedDnsRecord = e.searchedResult.record
      this.loadSiblingNetworksIntoLeftTable(e.searchedResult.zone)
        .subscribe(() => {
          this.data.leftTableData.forEach(item => item.selected = item.id === e.searchedResult.zone.id)
          this.leftTable.scrollToFirstSelectedRow()
          this.selectZone(e.searchedResult.zone)
          this.loadingWell = false
        })
    }
  }

  onLeftTablePageChange() {
    const arrayOfZones = getChunkArray(this.leftTableAllData, this.PAGE_SIZE)
    this.data.leftTableData = arrayOfZones[this.leftTableIndex]
  }

  onRightTablePageChange() {
    const arrayOfZones = getChunkArray(this.rightTableAllData, this.PAGE_SIZE)
    this.data.rightTableData = arrayOfZones[this.rightTableIndex]
  }

  load(zone ?: Zone) {
    this.unsubscribeAll()
    this.data.leftTableData = []
    this.data.rightTableData = []
    this.data.selectedDnsRecord = null
    this.data.records = []
    this.data.zone = null
    this.loadingRightTable = false
    this.loadingLeftTable = false
    if (zone && zone.id) {
      this.onSearchEnd(zone)
    } else {
      this.loadChildrenZonesIntoLeftTable()
    }
  }
}
