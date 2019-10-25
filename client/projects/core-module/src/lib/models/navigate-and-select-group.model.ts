import { Group } from '../models/ipam-resource.model'

export interface NavigateAndSelectGroup {
  allGroups?: Group[],
  leftTableData: Group[]
  rightTableData: any[]
  current: Group
  group: Group
}
