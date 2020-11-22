import { TJsonaModel } from 'jsona/lib/JsonaTypes'

import { DeviceEntityTypes } from '~/models/devices-node/devices/types'
import { DevicePropertyEntityTypes } from '~/models/devices-node/device-properties/types'
import { ChannelEntityTypes } from '~/models/devices-node/channels/types'
import { ChannelPropertyEntityTypes } from '~/models/devices-node/channel-properties/types'
import { HardwareEntityTypes } from '~/models/devices-node/hardwares/types'
import { FirmwareEntityTypes } from '~/models/devices-node/firmwares/types'

export interface DeviceJsonModelInterface extends TJsonaModel {
  id: string
  type: DeviceEntityTypes
}

export interface DevicePropertyJsonModelInterface extends TJsonaModel {
  id: string
  type: DevicePropertyEntityTypes
}

export interface ChannelJsonModelInterface extends TJsonaModel {
  id: string
  type: ChannelEntityTypes
}

export interface ChannelPropertyJsonModelInterface extends TJsonaModel {
  id: string
  type: ChannelPropertyEntityTypes
}

export interface RelationInterface extends TJsonaModel {
  id: string
  type: DeviceEntityTypes | ChannelEntityTypes | DevicePropertyEntityTypes | ChannelPropertyEntityTypes | HardwareEntityTypes | FirmwareEntityTypes
}

export const ModuleOriginType = 'com.fastybird.devices-node'
