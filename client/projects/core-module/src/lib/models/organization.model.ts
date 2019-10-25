export interface CustomerPolicy {
  itsmTool: string
  hostNameValidation: {
    allowUnderScore: boolean
    minLength: number
    maxLength: number
    additionalCharSet: string
  }
  showMACD?: boolean
}

export interface Organization {
  _id?: string
  name?: string
  enabled?: boolean,
  language?: string
  terminology?: TerminologyBasic
  template?: string
  serviceEmail?: string
  contact?: string,
  siteTitle?: string
  customerPolicy?: CustomerPolicy
  selected?: boolean
  allowApiAccess?: boolean
}

export interface TerminologyBasic {
  id?: string
  name?: string
}
