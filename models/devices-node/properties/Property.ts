import {
  Model,
  Fields,
} from '@vuex-orm/core'

import {
  PropertyCommandResult,
  PropertyCommandState,
  PropertyDatatypeType,
  PropertyInterface,
} from '~/models/devices-node/properties/types'
import { HardwareInterface } from '~/models/devices-node/hardwares/types'

// ENTITY MODEL
// ============
export default class Property extends Model implements PropertyInterface {
  static fields(): Fields {
    return {
      id: this.string(''),

      // Common property
      property: this.string(''),
      name: this.string(null).nullable(),
      settable: this.boolean(false),
      queryable: this.boolean(false),
      datatype: this.string(''),
      unit: this.string(null).nullable(),
      format: this.string(null).nullable(),

      value: this.attr(null).nullable(),
      expected: this.attr(null).nullable(),
      pending: this.boolean(false),

      // Relations
      relationshipNames: this.attr([]),
    }
  }

  id!: string

  property!: string
  name!: string | null
  settable!: boolean
  queryable!: boolean
  datatype!: PropertyDatatypeType
  unit!: string | null
  format!: string | null

  value!: any
  expected!: any
  pending!: boolean

  command!: PropertyCommandState | null
  lastResult!: PropertyCommandResult | null
  backup!: string | null

  relationshipNames!: Array<string>

  hardware!: HardwareInterface | null

  get isInteger(): boolean {
    return this.datatype === PropertyDatatypeType.INTEGER
  }

  get isFloat(): boolean {
    return this.datatype === PropertyDatatypeType.FLOAT
  }

  get isNumber(): boolean {
    return this.datatype === PropertyDatatypeType.INTEGER || this.datatype === PropertyDatatypeType.FLOAT
  }

  get isBoolean(): boolean {
    return this.datatype === PropertyDatatypeType.BOOLEAN
  }

  get isString(): boolean {
    return this.datatype === PropertyDatatypeType.STRING
  }

  get isEnum(): boolean {
    return this.datatype === PropertyDatatypeType.ENUM
  }

  get isColor(): boolean {
    return this.datatype === PropertyDatatypeType.COLOR
  }

  get isSettable(): boolean {
    return this.settable
  }

  get isQueryable(): boolean {
    return this.queryable
  }

  get binaryValue(): boolean {
    if (this.isBoolean) {
      return !!this.value
    } else if (this.isEnum) {
      return this.value === 'on'
    }

    return false
  }

  get analogValue(): string {
    if (this.hardware !== null && this.hardware.isManufacturerItead) {
      switch (this.property) {
        case 'air_quality':
          if (this.value > 7) {
            return Property.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.values.unhealthy`).toString()
          } else if (this.value > 4) {
            return Property.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.values.moderate`).toString()
          }

          return Property.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.values.good`).toString()

        case 'light_level':
          if (this.value > 8) {
            return Property.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.values.dusky`).toString()
          } else if (this.value > 4) {
            return Property.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.values.normal`).toString()
          }

          return Property.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.values.bright`).toString()

        case 'noise_level':
          if (this.value > 6) {
            return Property.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.values.noisy`).toString()
          } else if (this.value > 3) {
            return Property.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.values.normal`).toString()
          }

          return Property.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.values.quiet`).toString()
      }
    }

    return this.formattedValue
  }

  get formattedValue(): string {
    const number = parseFloat(this.value)
    const decimals = 2
    const decPoint = ','
    const thousandsSeparator = ' '

    const cleanedNumber = (`${number}`).replace(/[^0-9+\-Ee.]/g, '')

    const n = !isFinite(+cleanedNumber) ? 0 : +cleanedNumber
    const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)

    const sep = typeof thousandsSeparator === 'undefined' ? ',' : thousandsSeparator
    const dec = typeof decPoint === 'undefined' ? '.' : decPoint

    let s = []

    const toFixedFix = (fN: number, fPrec: number): string => {
      const k = 10 ** fPrec

      return `${Math.round(fN * k) / k}`
    }

    // Fix for IE parseFloat(0.55).toFixed(0) = 0
    s = (prec ? toFixedFix(n, prec) : `${Math.round(n)}`).split('.')

    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }

    if ((s[1] || '').length < prec) {
      s[1] = s[1] || ''
      s[1] += new Array(prec - s[1].length + 1).join('0')
    }

    return s.join(dec)
  }

  get icon(): string {
    switch (this.property) {
      case 'temperature':
        return 'thermometer-half'

      case 'humidity':
        return 'tint'

      case 'air_quality':
        return 'fan'

      case 'light_level':
        return 'sun'

      case 'noise_level':
        return 'microphone-alt'

      case 'power':
        return 'plug'

      case 'current':
      case 'voltage':
        return 'bolt'

      case 'energy':
        return 'calculator'
    }

    return 'chart-bar'
  }
}
