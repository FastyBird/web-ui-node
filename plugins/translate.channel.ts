import { Plugin } from '@nuxt/types'
import get from 'lodash/get'
import capitalize from 'lodash/capitalize'

import ThingInterface from '~/models/Thing'
import Hardware from '~/models/devices-node/Hardware'

declare module 'vue/types/vue' {
  interface Vue {
    $tThingChannel(thing: ThingInterface, original: boolean): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $tThingChannel(thing: ThingInterface, original: boolean): string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $tThingChannel(thing: ThingInterface, original: boolean): string
  }
}

const tThingChannelPlugin: Plugin = ({ app }, inject): void => {
  inject('tThingChannel', (thing: ThingInterface, original: boolean = false): string => {
    if (get(thing, 'channel.title', null) !== null && !original) {
      return get(thing, 'channel.title', null)
    }

    const hardware = Hardware
      .query()
      .where('device_id', thing.device_id)
      .first()

    const channel = get(thing, 'channel.name', null)

    if (!hardware || hardware.isCustom) {
      return capitalize(channel)
    }

    if (channel.includes('_')) {
      const channelPart = channel.substring(0, (channel.indexOf('_')))
      const channelNum = parseInt(channel.substring(channel.indexOf('_') + 1), 10)

      if (!`${app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channelPart}`)}`.includes('things.vendors.')) {
        return `${app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channelPart}`, { number: (channelNum + 1) })}`
      }
    }

    if (!`${app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`)}`.includes('things.vendors.')) {
      return `${app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`)}`
    }

    return capitalize(channel)
  })
}

export default tThingChannelPlugin
