export interface Tag {
  id: number
  name: string
}

export interface Address {
  selected?: boolean
  id?: number
  name?: string
  CIDR?: string
  state?: string
  ip?: string
  icon?: string
  macAddress?: string
  invalid?: boolean
}

export interface Zone {
  id?: number
  name?: string
  parents?: Zone[]
  fqdn?: string
  selected?: boolean
  refresh?: number
  retry?: number
  expire?: number
  defaultTtl?: number
  negativeCachingTtl?: number
  rname?: string
  deployable?: boolean
}

// Network model is used for both Network and Subnet.
// Will not declare Subnet model
// because it will cause type mismatch when requesting
// a list of networks and subnets from server.
// Moreover: Subnet = Sub-Network which is actually a Network
export interface Net {
  selected?: boolean
  id?: number
  CIDR?: string
  type?: string
  name?: string
  gateway?: string
  reserved?: boolean
  children?: Net[]
  parents?: Net[]
  group?: {
    parentGroup: Tag[]
    subGroup: Tag[]
  },
  isActive?: boolean
  accessible?: boolean
  dhcpService?: DhcpService
}

export interface DnsRecord {
  selected?: boolean
  id?: number
  name?: string
  fqdn?: string
  type?: string
  zone?: string
  ttl?: number
  data?: string
  owner?: string
  temp?: string[]
}

export interface DhcpScope {
  selected?: boolean
  id?: number,
  name?: string
  start?: string
  end?: string
  min?: string
  max?: string
  size?: number
  maxSize?: number
}

export interface DhcpLease {
  selected?: boolean
  id?: any,
  ip?: string
  start?: number
  end?: number
  mac?: string
}

export interface DhcpService {
  id: number
  name: string
  type: string
}

export interface Store {
  storeNumber?: string
  name?: string
  nodeSite?: number
  channelNumber?: number
  rfAccessPoint?: number
  rfpdcuDevices?: number
  scanGuide?: number
  selfScan?: number
  selfScan2?: number
  shopFloor?: number
  standardLaneTills?: number
  tescoDirect?: number
  backOffice?: number
  coPc?: number
  dotComStore?: number
  eKiosk?: number
  mobileTills?: number
  pfsTills?: number
  PCs: object
  otherTills: object
  printers: object
  wirelessLanController: string
  accessPoints: string[]
  storeCpeR1: boolean
  storeCpeR2: boolean
  primaryBroadband: boolean
  backupBroadband: boolean
  cradlePointCpe: boolean
  says: boolean
  paypoint: boolean
}

export interface Group {
  id?: number
  name?: string
  selected?: boolean
  parents?: Group[]
  groupbys?: string
  shouldGroupBy?: string
  fullName?: string
}
