import { ChannelInterface } from '~/models/devices-module/channels/types'
import { HardwareInterface } from '~/models/devices-module/hardwares/types'

// ENTITY INTERFACE
// ================

export interface ValuesItemInterface {
  name: string
  value: any
}

export interface ChannelConfigurationInterface {
  id: string
  type: ChannelConfigurationEntityTypes

  configuration: string
  name: string | null
  comment: string | null
  default: any | null
  min: number | null
  max: number | null
  step: number | null
  values: Array<ValuesItemInterface>

  value: any

  relationshipNames: Array<string>

  channel: ChannelInterface | null
  channelBackward: ChannelInterface | null

  channelId: string

  isBoolean: boolean
  isNumber: boolean
  isSelect: boolean
  isText: boolean

  title: string
  description: string | null

  selectValues: Array<ValuesItemInterface>

  formattedValue: any

  hardware: HardwareInterface | null
}

// ENTITY TYPES
// ============

export enum ChannelConfigurationEntityTypes {
  BOOLEAN = 'devices-module/channel-configuration-boolean',
  NUMBER = 'devices-module/channel-configuration-number',
  SELECT = 'devices-module/channel-configuration-select',
  TEXT = 'devices-module/channel-configuration-text',
}
