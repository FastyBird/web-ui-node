import { ChannelInterface } from '~/models/devices-node/channels/types'
import { HardwareInterface } from '~/models/devices-node/hardwares/types'

// ENTITY INTERFACE
// ================

export interface ValuesItemInterface {
  name: string
  value: any
}

export interface ChannelConfigurationInterface {
  id: string
  type: ChannelConfigurationEntityTypeType

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

export enum ChannelConfigurationEntityTypeType {
  BOOLEAN = 'devices-node/channel-configuration-boolean',
  NUMBER = 'devices-node/channel-configuration-number',
  SELECT = 'devices-node/channel-configuration-select',
  TEXT = 'devices-node/channel-configuration-text',
}
