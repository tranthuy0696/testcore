import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core'
import { DnsRecord, Zone } from '../../models/ipam-resource.model'
import { BaseComponent } from '../base/base.component'
import { TranslateService } from '@ngx-translate/core'
import { Subscription, of } from 'rxjs'
import { IpamResourceService } from '../../services/ipam-resource.service'
import { ToastrService } from 'ngx-toastr'
import { mergeMap } from 'rxjs/operators'
import { getChunkArray } from '../../utils/getChunkArray'

@Component({
  selector: 'navigate-and-select-zone-dns-record',
  templateUrl: './navigate-and-select-zone-dns-record.component.html'
})
export class NavigateAndSelectZoneDnsRecordComponent extends BaseComponent implements OnDestroy {
  @Input('selectable') selectable = true
  @Input('selectableTypes') selectableTypes: string[]
  @Output() selectionChange = new EventEmitter<DnsRecord>()

  TYPES = ['HOST', 'CNAME', 'PTR', 'MX', 'TXT', 'SRV', 'HINFO', 'NAPTR', 'Generic']
  ITEMS_PER_PAGE = 10

  zone: Zone
  records: DnsRecord[]
  filterByType: string
  filterByName: string
  page: number
  canNext: boolean
  loading: boolean
  subLoadRecords: Subscription
  shouldCache = true
  previousZoneId = -1

  constructor(translate: TranslateService,
              private ipamResourceService: IpamResourceService,
              private toastr: ToastrService) {
    super(translate)
    this.reset()
  }

  reset() {
    this.loading = false
    this.zone = null
    this.records = []
    this.filterByType = this.TYPES[0]
    this.page = 1
    this.canNext = false
    this.shouldCache = true
    this.destroy()
  }

  load(zone: Zone, byType?: string, byName?: string, selection?: DnsRecord) {
    this.loading = true
    this.zone = zone
    byType = byType || this.filterByType
    byName = byName || this.filterByName
    this.filterByType = byType === 'A' ? this.TYPES[0] : byType
    this.filterByName = byName
    if (this.filterByName) {
      this.shouldCache = true
      this.fetchNormal(this.zone.id, this.filterByType, this.filterByName, selection)
    } else {
      if (this.shouldCache) {
        this.fetchToCache(this.zone.id, this.filterByType, this.filterByName, selection)
      } else {
        this.fetchNormal(this.zone.id, this.filterByType, this.filterByName, selection)
      }
    }
  }

  fetchToCache(zoneId: number, byType?: string, byName?: string, selection?: DnsRecord) {
    this.destroy()
    this.subLoadRecords = this.ipamResourceService.getDnsRecordsOfZone(zoneId, byType, byName, 1, 1001)
      .pipe(mergeMap((records) => {
        if (records && records.length > 1000) {
          this.shouldCache = false
          return of([])
        } else {
          this.shouldCache = true
          return of(records)
        }
      }))
      .subscribe((records) => {
        if (records && records.length > 0) {
          this.previousZoneId = zoneId
          localStorage.setItem(String(zoneId), JSON.stringify(records))
          this.pagingDnsRecords(records, this.page, this.ITEMS_PER_PAGE)
          this.loading = false
        } else {
          this.fetchNormal(this.zone.id, this.filterByType, this.filterByName, selection)
        }
      })
  }

  fetchNormal(zoneId: number, byType?: string, byName?: string, selection?: DnsRecord) {
    this.destroy()
    this.subLoadRecords = this.ipamResourceService.getDnsRecordsOfZone(
      zoneId,
      byType,
      byName,
      this.page,
      this.ITEMS_PER_PAGE
    ).subscribe((records) => {
      this.records = records
      this.updateRecord(records)
      this.canNext = records.length >= this.ITEMS_PER_PAGE
      if (selection) {
        this.select(selection)
      }
      this.loading = false
    }, error => {
      this.loading = false
      this.toastr.error(error.error)
    })
  }

  destroy() {
    if (this.subLoadRecords) {
      this.subLoadRecords.unsubscribe()
    }
    if (localStorage.getItem(String(this.previousZoneId))) {
      localStorage.removeItem(String(this.previousZoneId))
    }
  }

  onChangeFilter() {
    if (this.zone) {
      this.page = 1
      this.load(this.zone, this.filterByType, this.filterByName)
    }
  }

  onChangePage(page: number) {
    this.page = page
    let localRecords = localStorage.getItem(String(this.zone.id))
    if (localRecords) {
      this.pagingDnsRecords(JSON.parse(localRecords), this.page, this.ITEMS_PER_PAGE)
    } else {
      this.load(this.zone, this.filterByType, this.filterByName)
    }
  }

  pagingDnsRecords(records: DnsRecord[], page: number, itemsPerPage: number) {
    let recordsPerPage = getChunkArray(records, itemsPerPage)[page - 1]
    this.canNext = recordsPerPage.length >= this.ITEMS_PER_PAGE
    this.records = recordsPerPage
    this.updateRecord(recordsPerPage)
  }

  select(record: DnsRecord) {
    this.records.forEach(item => item.selected = item.id === record.id
      && item.name === record.name && item.data === record.data)
    this.selectionChange.emit(record)
  }

  isSelectable(row: DnsRecord) {
    if (!this.selectable) {
      return false
    }
    if (!this.selectableTypes) {
      return true
    }
    return this.selectableTypes.find((type) => type === row.type) ? true : false
  }

  onCellClick(data: any) {
    if (this.selectable) {
      let record: DnsRecord = data.row
      if (!record.selected && this.isSelectable(record)) {
        this.select(record)
      }
    }
  }

  highlightRowFunc(item: any) {
    return item.selected
  }

  updateRecord(records: DnsRecord[]) {
    for (let i = 0; i < records.length; i++) {
      if (records[i].type !== 'HOST') {
        continue
      }
      this.records[i].temp = []
      for (let j = 0; j < records.length; j++) {
        if (i === j) {
          continue
        }
        if (records[i].id === records[j].id) {
          records[i].temp.push(records[j].data)
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.zone && this.zone.id) {
      if (localStorage.getItem(String(this.zone.id))) {
        localStorage.removeItem(String(this.zone.id))
      }
    }
  }
}
