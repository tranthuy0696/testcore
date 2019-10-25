import { Pipe, PipeTransform } from '@angular/core'
import { naturalSort } from '../utils/naturalSort'

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {
  transform(items: any[], sortable: boolean, index: number, reverse?: boolean) {
    return sortable ? naturalSort(items, index, reverse) : items
  }
}
