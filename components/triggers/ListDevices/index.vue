<template>
  <fb-ui-loading-box
    v-if="fetchingDevices && devices.length === 0"
    :text="$t('triggers.texts.loadingDevices')"
  />

  <fb-ui-no-results v-else-if="!fetchingDevices && devices.length === 0">
    <font-awesome-icon
      slot="icon"
      icon="plug"
    />

    <font-awesome-icon
      slot="second-icon"
      icon="exclamation-triangle"
    />

    {{ $t('triggers.texts.noDevices') }}
  </fb-ui-no-results>

  <div
    v-else
    class="fb-triggers-list-devices__container"
  >
    <list-item
      v-for="device in devices"
      :key="device.id"
      :data-state="isSelected(device) ? 'on' : 'off'"
      @click="$emit('select', device)"
    >
      <template slot="icon">
        <font-awesome-icon :icon="device.icon" />
      </template>

      <template slot="heading">
        {{ device.title }}
      </template>

      <template
        v-if="device.hasDescription"
        slot="sub-heading"
      >
        {{ device.comment }}
      </template>

      <template slot="detail">
        <div class="fb-triggers-list-devices__buttons">
          <div class="fb-triggers-list-devices__buttons-item">
            <font-awesome-icon
              v-if="isSelected(device)"
              icon="check-circle"
            />
          </div>

          <div class="fb-triggers-list-devices__buttons-item">
            <font-awesome-icon
              icon="chevron-right"
              role="button"
            />
          </div>
        </div>
      </template>
    </list-item>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted,
  PropType,
  SetupContext,
} from '@vue/composition-api'

import { ActionInterface } from '~/models/triggers-node/actions/types'
import { ConditionInterface } from '~/models/triggers-node/conditions/types'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'

export enum ViewType {
  SENSORS = 'sensors',
  ACTORS = 'actors',
  DEVICES = 'devices',
}

interface TriggersSelectDevicePropsInterface {
  type: ViewType
  items: Array<ActionInterface | ConditionInterface>
}

export default defineComponent({

  name: 'TriggersListDevices',

  props: {

    type: {
      type: String as PropType<ViewType>,
      required: true,
    },

    items: {
      type: Array as PropType<Array<ActionInterface | ConditionInterface>>,
      default: () => {
        return []
      },
    },

  },

  setup(props: TriggersSelectDevicePropsInterface, context: SetupContext) {
    const devices = computed<Array<DeviceInterface>>((): Array<DeviceInterface> => {
      if (props.type === ViewType.ACTORS) {
        return Device
          .query()
          .with('properties', (query): void => {
            query.where('isSettable', true)
          })
          .with('channels', (query): void => {
            query.with('properties', (subQuery): void => {
              subQuery.where('isSettable', true)
            })
          })
          .all()
      } else if (props.type === ViewType.SENSORS) {
        return Device
          .query()
          .with('channels', (query): void => {
            query.with('properties', (subQuery): void => {
              subQuery.where('isSettable', [false, true])
            })
          })
          .all()
      } else {
        return Device
          .query()
          .with('channels', (query): void => {
            query.with('properties', (subQuery): void => {
              subQuery.where('isSettable', [false, true])
            })
          })
          .all()
      }
    })

    const fetchingDevices = computed<boolean>((): boolean => Device.getters('fetching')())

    onBeforeMount(async(): Promise<void> => {
      if (!Device.getters('firstLoadFinished')()) {
        try {
          await Device.dispatch('fetch', {
            includeChannels: true,
          })
        } catch {
          context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
        }
      }
    })

    onMounted((): void => {
      context.emit('loaded')
    })

    function isSelected(device: DeviceInterface): boolean {
      return typeof props.items.find((item: ActionInterface | ConditionInterface): boolean => item.device === device.identifier) !== 'undefined'
    }

    return {
      devices,
      fetchingDevices,
      isSelected,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
