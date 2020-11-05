import { TJsonaModel } from 'jsona/lib/JsonaTypes'

import { DeviceEntityTypeType } from '~/models/devices-node/devices/types'
import { DevicePropertyEntityTypeType } from '~/models/devices-node/device-properties/types'
import { ChannelEntityTypeType } from '~/models/devices-node/channels/types'
import { ChannelPropertyEntityTypeType } from '~/models/devices-node/channel-properties/types'
import { HardwareEntityTypeType } from '~/models/devices-node/hardwares/types'
import { FirmwareEntityTypeType } from '~/models/devices-node/firmwares/types'

export interface DeviceJsonModelInterface extends TJsonaModel {
  id: string
  type: DeviceEntityTypeType
}

export interface DevicePropertyJsonModelInterface extends TJsonaModel {
  id: string
  type: DevicePropertyEntityTypeType
}

export interface ChannelJsonModelInterface extends TJsonaModel {
  id: string
  type: ChannelEntityTypeType
}

export interface ChannelPropertyJsonModelInterface extends TJsonaModel {
  id: string
  type: ChannelPropertyEntityTypeType
}

export interface RelationInterface extends TJsonaModel {
  id: string
  type: DeviceEntityTypeType | ChannelEntityTypeType | DevicePropertyEntityTypeType | ChannelPropertyEntityTypeType | HardwareEntityTypeType | FirmwareEntityTypeType
}

export const ModuleOriginType = 'com.fastybird.devices-node'
