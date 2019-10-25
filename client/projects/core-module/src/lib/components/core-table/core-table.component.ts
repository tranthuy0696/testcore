import { Component, Input, Output, EventEmitter } from '@angular/core'
import { TableHeader, TableRow, TableRowSelection } from '../../models/table.model'

@Component({
  selector: 'core-table',
  templateUrl: './core-table.component.html',
  styleUrls: ['./core-table.component.css']
})
export class CoreTableComponent {

  sortReverses = {}

  isAllRowsChecked = false
  selectedSortIndex = 0
  selectedSortReverse = true

  @Input('caller') caller: object
  @Input('headers') headers: TableHeader = []
  @Input('rows') rows: TableRow[] = []
  @Input('hiddenColumns') hiddenColumns: Array<number>
  @Input('selectable') selectable = false
  @Input('columnRenderers') columnRenderers: any
  @Input('onCellClick') onCellClick: Function
  @Input('searching') searching = ''
  @Input('sortBy') set sortBy(value: number) {
    this.selectedSortIndex = value
  }

  @Input('rowSelection') rowSelection = <TableRowSelection> {}
  @Output('rowSelectionChange') rowSelectionChange = new EventEmitter<any>()

  @Input('style') style = ''
  @Input('selectionMode') selectionMode = 'multi'

  cellClick(selectedCellValues: Array<string>, selectedCellValue: string, selectedCellIndex: number): void {
    if (this.onCellClick && this.caller) {
      this.onCellClick.bind(this.caller)(selectedCellValues, selectedCellValue, selectedCellIndex)
    }
  }

  checkOrUnCheckAllRows(): void {
    if (this.isAllRowsChecked) {
      this.rows.forEach((_, index) => {
        this.rowSelection[index] = true
      })
    } else {
      this.rows.forEach((_, index) => {
        this.rowSelection[index] = false
      })
    }
    this.fireRowSelectionChange()
  }

  isCellHidden(cellIndex: number): boolean {
    if (this.hiddenColumns && this.hiddenColumns.indexOf(cellIndex) > -1) {
      return true
    }
    return false
  }

  getCssClass(cellValue: any, cellIndex: number, cellValues: any[]): string {
    if (this.columnRenderers && this.columnRenderers[cellIndex]) {
      if (typeof(this.columnRenderers[cellIndex]) === 'string') {
        return this.columnRenderers[cellIndex].toString()
      }
      if (typeof(this.columnRenderers[cellIndex]) === 'function' && this.caller) {
        return this.columnRenderers[cellIndex].bind(this.caller)(cellValue, cellIndex, cellValues)
      }
    }
    return ''
  }

  fireRowSelectionChange() {
    this.rowSelectionChange.emit(this.rowSelection)
  }

  sort(columnIndex: number) {
    this.clearRowSelection()
    let reversed = this.sortReverses[columnIndex] === undefined ? true : !this.sortReverses[columnIndex]
    this.sortReverses = {} // reset sort icons
    this.sortReverses[columnIndex] = reversed
    this.selectedSortIndex = columnIndex
    this.selectedSortReverse = this.sortReverses[columnIndex]
  }

  isRowSelected(rowIndex: number) {
    return this.rowSelection[rowIndex]
  }

  updateRowSelection(rowIndex: number) {
    if (this.selectionMode === 'single') {
      this.rowSelection = {}
    }
    this.rowSelection[rowIndex] = true
    this.rowSelectionChange.emit(this.rowSelection)
  }

  clearRowSelection() {
    this.rowSelection = {}
    this.fireRowSelectionChange()
  }
}
