import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { TranslateService } from '@ngx-translate/core'
import { Group } from '../../models/ipam-resource.model'
import { IpamResourceService } from '../../services/ipam-resource.service'
import { Subscription, forkJoin } from 'rxjs'
import { BaseComponent } from '../base/base.component'
import { CoreTableListComponent } from '../core-table-list/core-table-list.component'
import { getChunkArray } from '../../utils/getChunkArray'
import { generateNumberArray } from '../../utils/generateNumberArray'
import { NavigateAndSelectGroup } from '../../models/navigate-and-select-group.model'
import { CoreSelectComponent } from '../../components/core-select/core-select.component'

@Component({
  selector: 'navigate-and-select-group',
  templateUrl: './navigate-and-select-group.component.html'
})
export class NavigateAndSelectGroupComponent extends BaseComponent implements OnInit {

  @Input() data = <NavigateAndSelectGroup> {
    allGroups: [],
    leftTableData: [],
    rightTableData: [],
    current: null,
    group: null
  }
  @Output() dataChange = new EventEmitter<NavigateAndSelectGroup>()
  @Output() dataChangeStart = new EventEmitter<void>()
  @Input('display') display = 'full'
  @Input('lazyload') lazyload = false

  @ViewChild('leftTable', {static: true}) leftTable: CoreTableListComponent
  @ViewChild('searchByGroup', {static: true}) searchByGroup: CoreSelectComponent

  collapsed = false
  NO_PARENT_SELECTED = this.translate.instant('No Parent Selected')

  loadingLeftTable = false
  loadingRightTable = false
  loadingWell = false

  loadChildrenGroupsIntoLeftTableSub: Subscription
  loadChildrenGroupsIntoRightTableSub: Subscription
  backSub: Subscription
  subSelectGroup: Subscription
  subLoadSiblingGroups: Subscription

  PAGE_SIZE = 20
  leftTableAllData: Group[]
  leftTableIndex: number
  leftTableMaxIndex: number
  leftTableIndexLabels: number[]
  leftTablePageDisabled: boolean
  rightTableAllData: Group[]
  rightTableIndex: number
  rightTableMaxIndex: number
  rightTableIndexLabels: number[]
  rightTablePageDisabled: boolean

  highlightRowFunc(group: Group) {
    return group.selected
  }

  constructor(private toastr: ToastrService,
              private ipamResourceService: IpamResourceService,
              private translate: TranslateService) {
    super(translate)
  }

  ngOnInit() {
    if (!this.lazyload) {
      if (this.data.leftTableData.length === 0) {
        this.loadChildrenGroupsIntoLeftTable()
      }
    }
  }

  private loadSiblingGroupsIntoLeftTable(group: Group, callback?: Function) {
    this.loadingLeftTable = true
    this.subLoadSiblingGroups = this.ipamResourceService.getDirectParentGroup(group.id).subscribe(parent => {
      this.loadChildrenGroupsIntoLeftTable(parent, callback)
    }, (error) => {
      this.toastr.error(error.error)
      this.loadingLeftTable = false
    })
  }

  private loadChildrenGroupsIntoLeftTable(group?: Group, callback?: Function) {
    this.loadingLeftTable = true
    this.data.leftTableData = []
    this.data.current = group && group.id ? group : null
    const parentId = group && group.id ? group.id : 0
    if (group && group.id) {
      this.loadingWell = true
      this.ipamResourceService.getGroupProfile(parentId).subscribe((gr) => {
        this.loadingWell = false
        this.data.current.parents = gr.parents
      }, () => {
        this.loadingWell = false
      })
    }
    this.loadChildrenGroupsIntoLeftTableSub = this.ipamResourceService.getGroupChildren(parentId).subscribe((groups) => {
      if (groups.length > 0) {
        const arrayOfGroups = getChunkArray(groups, this.PAGE_SIZE)
        this.leftTablePageDisabled = false
        this.leftTableAllData = groups
        this.leftTableIndex = 0
        this.leftTableMaxIndex = arrayOfGroups.length - 1
        this.leftTableIndexLabels = generateNumberArray(1, arrayOfGroups.length)
        this.data.leftTableData = arrayOfGroups[this.leftTableIndex]
      } else {
        this.leftTablePageDisabled = true
        this.data.leftTableData = []
      }
      if (callback) {
        callback()
      }
      this.loadingLeftTable = false
    }, (error) => {
      this.toastr.error(error.error)
      this.loadingLeftTable = false
    })
  }

  private loadChildrenGroupsIntoRightTable(group: Group) {
    this.loadingRightTable = true
    const parentId = group ? group.id : 0
    return new Promise((resolve) => {
      this.data.rightTableData = []
      this.loadChildrenGroupsIntoRightTableSub = this.ipamResourceService.getGroupChildren(parentId).subscribe((groups) => {
        if (groups.length > 0) {
          this.data.allGroups = groups
          const arrayOfGroups = getChunkArray(groups, this.PAGE_SIZE)
          this.rightTablePageDisabled = false
          this.rightTableAllData = groups
          this.rightTableIndex = 0
          this.rightTableMaxIndex = arrayOfGroups.length - 1
          this.rightTableIndexLabels = generateNumberArray(1, arrayOfGroups.length)
          this.data.rightTableData = arrayOfGroups[this.rightTableIndex]
        } else {
          this.rightTablePageDisabled = true
          this.data.rightTableData = []
        }
        this.loadingRightTable = false
        resolve()
      }, () => {
        this.loadingRightTable = false
        resolve()
      })
    })
  }

  selectGroup(group: Group) {
    this.dataChangeStart.emit()
    this.unsubscribeAll()
    this.data.group = group
    this.data.rightTableData = []
    this.loadingRightTable = false
    this.loadingWell = true

    let index = this.leftTableAllData.findIndex((g) => g.id === group.id)
    let leftTableIndex = parseInt(`${index / this.PAGE_SIZE}`, 10)
    const arrayOfGroups = getChunkArray(this.leftTableAllData, this.PAGE_SIZE)
    this.data.leftTableData = arrayOfGroups[leftTableIndex]

    this.data.leftTableData.forEach(item => item.selected = item.id === group.id)
    this.leftTableIndex = leftTableIndex
    this.subSelectGroup = forkJoin(
      this.ipamResourceService.getGroupProfile(group.id),
      this.loadChildrenGroupsIntoRightTable(group)
    ).subscribe((response) => {
      this.data.group = response[0]
      this.data.group.parents.push(group)
      this.loadingWell = false
      this.dataChange.emit(this.data)
    }, () => {
      this.loadingWell = false
      this.loadingRightTable = false
    })
  }

  goUp() {
    this.dataChangeStart.emit()
    this.reset()
    this.dataChange.emit(this.data)
    if (this.data.current) {
      this.loadingLeftTable = true
      this.backSub = this.ipamResourceService.getDirectParentGroup(this.data.current.id).subscribe((parent) => {
        this.loadingLeftTable = false
        this.loadChildrenGroupsIntoLeftTable(parent)
      })
    } else {
      this.loadChildrenGroupsIntoLeftTable()
    }
  }

  openGroup(group?: Group, event?: Event) {
    if (event) {
      event.stopPropagation()
    }
    this.dataChangeStart.emit()
    this.reset()
    this.loadChildrenGroupsIntoLeftTable(group)
  }

  onLeftTableCellClick(data: any) {
      let group: Group = data.row
      if (!group.selected) {
        this.selectGroup(group)
      }
  }

  onRightTableCellClick(data: any) {
    const group: Group = data.row
      this.dataChangeStart.emit()
      this.unsubscribeAll()
      this.data.group = null
      this.data.rightTableData = []
      this.loadingRightTable = true
      this.loadingLeftTable = true
      this.data.allGroups = []
      this.data.leftTableData = []
      this.loadSiblingGroupsIntoLeftTable(group, () => {
        this.data.leftTableData.forEach(item => item.selected = item.id === group.id)
        this.leftTable.scrollToFirstSelectedRow()
        this.selectGroup(group)
      })
  }

  reset() {
    this.unsubscribeAll()
    this.data.leftTableData = []
    this.data.rightTableData = []
    this.data.group = null
    this.data.allGroups = null
    this.loadingRightTable = false
    this.loadingLeftTable = false
  }

  unsubscribeAll() {
    if (this.backSub) {
      this.backSub.unsubscribe()
    }
    if (this.loadChildrenGroupsIntoRightTableSub) {
      this.loadChildrenGroupsIntoRightTableSub.unsubscribe()
    }
    if (this.loadChildrenGroupsIntoLeftTableSub) {
      this.loadChildrenGroupsIntoLeftTableSub.unsubscribe()
    }
    if (this.subSelectGroup) {
      this.subSelectGroup.unsubscribe()
    }
    if (this.subLoadSiblingGroups) {
      this.subLoadSiblingGroups.unsubscribe()
    }
  }

  onSearchStart() {
    this.loadingLeftTable = true
  }

  onSearchEnd(e) {
    if (e && e.searchedResult && e.searchedResult.id) {
      this.dataChangeStart.emit()
      this.data.group = null
      this.data.rightTableData = []
      this.loadingRightTable = true
      this.data.allGroups = []
      this.data.current = null
      this.loadSiblingGroupsIntoLeftTable(e.searchedResult, () => {
        this.data.leftTableData.forEach(item => item.selected = item.id === e.searchedResult.id)
        this.leftTable.scrollToFirstSelectedRow()
        this.selectGroup(e.searchedResult)
      })
    } else {
      this.loadingLeftTable = false
      this.loadingRightTable = false
      this.loadingWell = false
    }
  }

  onLeftTablePageChange() {
    const arrayOfGroups = getChunkArray(this.leftTableAllData, this.PAGE_SIZE)
    this.data.leftTableData = arrayOfGroups[this.leftTableIndex]
  }

  onRightTablePageChange() {
    const arrayOfGroups = getChunkArray(this.rightTableAllData, this.PAGE_SIZE)
    this.data.rightTableData = arrayOfGroups[this.rightTableIndex]
  }
}
