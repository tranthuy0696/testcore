import { RequestDetail } from './request-detail.model'
import { NagivateAndSelectNetwork } from './navigate-and-select-network.model'
import { Net, DhcpService } from './ipam-resource.model'

export interface WizardModifySubnetData {
  name: string
  detail: RequestDetail
  mode: string
  modeSplitSubnetData: SplitSubnetData
  modeJoinSubnetData: JoinSubnetData
  modeActivateSubnetData: ActivateSubnetData
  modeModifyDhcpData: ModifyDhcpData
}

export interface SplitSubnetData {
  navigateSubnet: NagivateAndSelectNetwork
  firstSubnet: Net
  secondSubnet: Net
}

export interface JoinSubnetData {
  navigateSubnet: NagivateAndSelectNetwork
  joinedSubnet: Net
}

export interface ActivateSubnetData {
  navigateSubnet: NagivateAndSelectNetwork
  subnetName: string
  subnetGateway: string
}

export interface ModifyDhcpData {
  navigateSubnet: NagivateAndSelectNetwork
  newDhcpService: DhcpService
}
