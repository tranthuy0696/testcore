import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], value: string): any[] {
    if (!items) {
      return []
    }
    if (!value) {
      return items
    }
    return items.filter(item => {
      if (item) {
        if (item instanceof Array) {
          for (let i = 0; i < item.length; i++) {
            if (item[i]) {
              if (item[i].toString().toLowerCase().indexOf(value.toLowerCase()) > -1) {
                return true
              }
            }
          }
        } else {
          let fields = Object.keys(item)
          for (let i = 0; i < fields.length; i++) {
            let field = fields[i]
            if (item[field].toString().toLowerCase().indexOf(value.toLowerCase()) > -1) {
              return true
            }
          }
        }
      }
      return false
    })
  }
}
