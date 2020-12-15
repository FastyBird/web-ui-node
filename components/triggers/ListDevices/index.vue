<template>
  <div class="fb-triggers-list-devices__container">
    <template v-if="fetchingDevices && devices.length === 0">
      <fb-ui-loading-box :text="$t('triggers.texts.loadingDevices')" />
    </template>

    <no-results
      v-else-if="!fetchingDevices && devices.length === 0"
      icon="plug"
    >
      {{ $t('triggers.texts.noDevices') }}
    </no-results>

    <scroll-shadow v-else>
      <div class="fb-triggers-list-devices__items">
        <list-item
          v-for="device in devices"
          :key="device.id"
          :data-state="isSelected(device) ? 'on' : 'off'"
          @click="handleSelect(device)"
        >
          <template slot="icon">
            <font-awesome-icon :icon="device.icon" />
          </template>

          <template slot="heading">
            {{ device.title }}
          </template>

          <template
            slot="sub-heading"
            v-if="device.hasDescription"
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
    </scroll-shadow>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  PropType,
  SetupContext,
} from '@vue/composition-api'

import { ActionInterface } from '~/models/triggers-module/actions/types'
import { ConditionInterface } from '~/models/triggers-module/conditions/types'

import Device from '~/models/devices-module/devices/Device'
import { DeviceInterface } from '~/models/devices-module/devices/types'

export enum ViewType {
  SENSORS = 'sensors',
  ACTORS = 'actors',
  DEVICES = 'devices',
}

interface TriggersListDevicesPropsInterface {
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

  setup(props: TriggersListDevicesPropsInterface, context: SetupContext) {
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

    function isSelected(device: DeviceInterface): boolean {
      return typeof props.items.find((item: ActionInterface | ConditionInterface): boolean => item.device === device.identifier) !== 'undefined'
    }

    function handleSelect(device: DeviceInterface): void {
      context.emit('select', device)
    }

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

    return {
      devices,
      fetchingDevices,
      isSelected,
      handleSelect,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
