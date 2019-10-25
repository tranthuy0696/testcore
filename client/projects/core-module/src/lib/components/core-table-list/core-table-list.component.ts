import { Component, Input, Output, EventEmitter, IterableDiffers,
  ViewChild, ElementRef, QueryList, ContentChildren, ChangeDetectorRef, AfterContentInit } from '@angular/core'
import { CoreTableListColumnComponent } from '../core-table-list-column/core-table-list-column.component'

@Component({
  selector: 'core-table-list',
  templateUrl: './core-table-list.component.html'
})
export class CoreTableListComponent implements AfterContentInit {

  @Input('data')
  set data(rows: any[]) {
    this.rows = rows
    this.updateSelectingAll()
  }

  @Input('searching') searching = ''
  @Input('style') style = ''
  @Output('cellClick') cellClick = new EventEmitter<any>()
  @Output('sort') onSort = new EventEmitter<any>()
  @Input('highlightRowFunc') highlightRowFunc: Function
  @Input('loading') loading = false
  @Input('loadingDelay') loadingDelay = 0
  @Input('sortable') sortable = false
  @Input('placeholder') placeholder = ''
  @Input('showPlaceholder') showPlaceholder = false
  @Input('editable') editable = false
  @Input('selectable') selectable = false
  @Input('autoTagName') autoTag: string
  @Output('editingStart') editingStart = new EventEmitter<void>()
  @Output('editingEnd') editingEnd = new EventEmitter<void>()
  @Input('allowSelectAll') allowSelectAll = false
  @Output('changeSelected') changeSelected = new EventEmitter<any>()
  @ViewChild('scroll', {static: true})
  private scroll: ElementRef

  @ViewChild('table', {static: true}) table: ElementRef
  @Input() set minWidth(value: number) {
    this.table.nativeElement.style.minWidth = value
  }

  rows: any[]
  columns: CoreTableListColumnComponent[] = []
  sortedColumn: CoreTableListColumnComponent = null

  private editingValue = false
  get editing() {
    return this.editingValue
  }
  @Input('editing')
  set editing(value: boolean) {
    this.editingValue = value
    this.editingChange.emit(this.editingValue)
  }
  @Output() editingChange = new EventEmitter<boolean>()
  @ContentChildren(CoreTableListColumnComponent) children: QueryList<CoreTableListColumnComponent>

  selectingAll = false
  private iterableDiffer: any

  constructor(
    private iterableDiffers: IterableDiffers,
    private cdRef: ChangeDetectorRef
  ) {
    this.iterableDiffer = this.iterableDiffers.find([]).create(null)
  }

  ngDoCheck() {
    // check if more rows have been added or removed
    let changes = this.iterableDiffer.diff(this.rows)
    if (changes) {
      this.updateSelectingAll()
    }
  }

  ngAfterContentInit() {
    this.columns = []
    this.children.forEach((child) => {
      this.columns.push(child)
      this.cdRef.detectChanges()
    })
  }

  onCellClick(event: Event, value: any, row: any, rowIndex: number, columnIndex: number, column: CoreTableListColumnComponent) {
    event.stopPropagation() // stop sending the event to onTableClick()
    if (this.editable && column.editable) {
      this.startEditing()
    }
    this.cellClick.next({
      value: value,
      row: row,
      index: {
        row: rowIndex,
        column: columnIndex
      }
    })
  }

  isHighlighted(row: any) {
    return this.highlightRowFunc ? this.highlightRowFunc(row) : false
  }

  sort(column: CoreTableListColumnComponent) {
    if (this.sortable && column.sortable) {
      column.reverse = !column.reverse
      this.sortedColumn = column
      this.onSort.emit({ sort: column.value, order: column.reverse ? 'desc' : 'asc' })
    }
  }

  isBeingSorted(column: CoreTableListColumnComponent, reverse: boolean) {
    return this.sortable && this.sortedColumn === column && this.sortedColumn.reverse === reverse
  }

  startEditing() {
    this.editing = true
    this.editingStart.emit()
  }

  commitEditing() {
    this.editing = false
    this.editingEnd.emit()
  }

  selectAll() {
    if (this.rows) {
      this.rows.forEach(item => item.selected = this.selectingAll)
    }
  }

  updateSelectingAll(row?: any) {
    if (!this.rows || this.rows.length === 0) {
      this.selectingAll = false
    } else {
      let found = this.rows.find(item => item.selected === false)
      this.selectingAll = found ? false : true
    }
    if (row) {
      this.changeSelected.emit(row)
    }

  }

  onTableClick() {
    if (this.editable && this.editing) {
      this.commitEditing()
    }
  }

  scrollToFirstSelectedRow() {
    setTimeout(() => {
      const firstSelectedRow = this.scroll.nativeElement.querySelector('tr[data-selected=true]')
      if (firstSelectedRow) {
        this.scroll.nativeElement.scrollTop = firstSelectedRow.offsetTop
      } else {
        console.log('scrollToFirstSelectedRow - found no row selected')
      }
    }, 0)
  }
}
