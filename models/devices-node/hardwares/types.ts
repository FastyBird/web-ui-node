import { DeviceInterface } from '~/models/devices-node/devices/types'

// ENTITY INTERFACE
// ================

export interface HardwareInterface {
  id: string
  type: HardwareEntityTypes

  model: HardwareModelTypes
  manufacturer: HardwareManufacturerTypes
  version: string | null
  macAddress: string | null

  relationshipNames: Array<string>

  device: DeviceInterface | null

  deviceId: string

  isCustom: boolean
  isManufacturerGeneric: boolean
  isManufacturerItead: boolean
  isManufacturerFastyBird: boolean
}

// ENTITY TYPES
// ============

export enum HardwareEntityTypes {
  HARDWARE = 'devices-node/hardware',
}

export enum HardwareManufacturerTypes {
  GENERIC = 'generic',
  FASTYBIRD = 'fastybird',
  ITEAD = 'itead',
  AI_THINKER = 'ai_thinker',
}

export enum HardwareModelTypes {
  CUSTOM = 'custom',

  SONOFF_BASIC = 'sonoff_basic',
  SONOFF_RF = 'sonoff_rf',
  SONOFF_TH = 'sonoff_th',
  SONOFF_SV = 'sonoff_sv',
  SONOFF_SLAMPHER = 'sonoff_slampher',
  SONOFF_S20 = 'sonoff_s20',
  SONOFF_TOUCH = 'sonoff_touch',
  SONOFF_POW = 'sonoff_pow',
  SONOFF_POW_R2 = 'sonoff_pow_r2',
  SONOFF_DUAL = 'sonoff_dual',
  SONOFF_DUAL_R2 = 'sonoff_dual_r2',
  SONOFF_4CH = 'sonoff_4ch',
  SONOFF_4CH_PRO = 'sonoff_4ch_pro',
  SONOFF_RF_BRIDGE = 'sonoff_rf_bridge',
  SONOFF_B1 = 'sonoff_b1',
  SONOFF_LED = 'sonoff_led',
  SONOFF_T1_1CH = 'sonoff_t1_1ch',
  SONOFF_T1_2CH = 'sonoff_t1_2ch',
  SONOFF_T1_3CH = 'sonoff_t1_3ch',
  SONOFF_S31 = 'sonoff_s31',
  SONOFF_SC = 'sonoff_sc',
  SONOFF_SC_PRO = 'sonoff_sc_pro',
  SONOFF_PS_15 = 'sonoff_ps_15',

  AI_THINKER_AI_LIGHT = 'ai_thinker_ai_light',

  FASTYBIRD_WIFI_GW = 'fastybird_wifi_gw',
  FASTYBIRD_3CH_POWER_STRIP_R1 = 'fastybird_3ch_power_strip_r1',
  FASTYBIRD_8CH_BUTTONS = '8ch_buttons',
  FASTYBIRD_16CH_BUTTONS = '16ch_buttons',
}
