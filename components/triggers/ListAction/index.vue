<template>
  <div class="fb-triggers-list-action__container">
    <content-loading
      v-if="fetchingDevices || device === null"
      :height="28.5"
      class="fb-triggers-list-action__preloading"
    >
      <circle
        cx="15"
        cy="50%"
        r="9"
      />
      <rect
        x="30"
        y="5"
        rx="4"
        ry="4"
        width="100"
        height="8"
      />
      <rect
        x="30"
        y="15"
        rx="4"
        ry="4"
        width="50"
        height="6"
      />
      <rect
        x="340"
        y="9"
        rx="4"
        ry="4"
        width="50"
        height="10"
      />
    </content-loading>

    <list-item
      v-else
      :variant="windowSize === 'xs' ? 'list' : 'default'"
      class="fb-triggers-list-action__item"
      @click="() => {}"
    >
      <font-awesome-icon
        slot="icon"
        :icon="device.icon"
      />

      <template v-if="action.isDeviceProperty">
        <template slot="heading">
          {{ device.title }}
        </template>

        <template slot="sub-heading">
          {{ $t(`triggers.actions.${action.value}`, { property: property.title.toLowerCase() }) }}
        </template>
      </template>

      <template v-if="action.isChannelProperty">
        <template slot="heading">
          {{ device.title }}
        </template>

        <template slot="sub-heading">
          {{ channel.title }}:
          <span>
            {{ $t(`triggers.actions.${action.value}`, { property: property.title.toLowerCase() }) }}
          </span>
        </template>
      </template>

      <template slot="detail">
        <div class="fb-triggers-list-action__item-actions">
          <div class="fb-triggers-list-action__item-actions-state">
            <fb-ui-switch-element
              :status="form.model.enabled"
              variant="primary"
              @change="toggle"
            />
          </div>

          <div
            v-if="action.draft"
            class="fb-triggers-list-action__item-actions-buttons"
          >
            <fb-ui-button
              size="sm"
              variant="link"
              @click="remove"
            >
              {{ $t('application.buttons.remove.title') }}
            </fb-ui-button>
          </div>
        </div>
      </template>
    </list-item>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  reactive,
  onBeforeMount,
  SetupContext,
} from '@vue/composition-api'

import get from 'lodash/get'

import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import Action from '~/models/triggers-node/actions/Action'
import { ActionInterface } from '~/models/triggers-node/actions/types'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'
import Channel from '~/models/devices-node/channels/Channel'
import { ChannelInterface } from '~/models/devices-node/channels/types'
import DeviceProperty from '~/models/devices-node/device-properties/DeviceProperty'
import { DevicePropertyInterface } from '~/models/devices-node/device-properties/types'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'
import { ChannelPropertyInterface } from '~/models/devices-node/channel-properties/types'

interface TriggersDetailDefaultActionsContainerActionFormModelInterface {
  enabled: boolean
}

interface TriggersDetailDefaultActionsContainerActionFormInterface {
  model: TriggersDetailDefaultActionsContainerActionFormModelInterface
}

interface TriggersDetailDefaultActionsContainerActionPropsInterface {
  trigger: TriggerInterface,
  action: ActionInterface,
}

export default defineComponent({

  name: 'TriggersListAction',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

    action: {
      type: Object as PropType<ActionInterface>,
      required: true,
    },

  },

  setup(props: TriggersDetailDefaultActionsContainerActionPropsInterface, context: SetupContext) {
    const form = reactive<TriggersDetailDefaultActionsContainerActionFormInterface>({
      model: {
        enabled: props.action.enabled,
      },
    })

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    const device = computed<DeviceInterface | null>((): DeviceInterface | null => {
      return Device.query().where('identifier', props.action.device).first()
    })

    const channel = computed<ChannelInterface | null>((): ChannelInterface | null => {
      return props.action.isChannelProperty ? Channel.query().where('channel', props.action.channel).first() : null
    })

    let property = computed<DevicePropertyInterface | ChannelPropertyInterface | null>((): DevicePropertyInterface | ChannelPropertyInterface | null => {
      return null
    })

    if (props.action.isDeviceProperty) {
      property = computed<DevicePropertyInterface | null>((): DevicePropertyInterface | null => {
        return DeviceProperty
          .query()
          .where('property', props.action.property)
          .where('deviceId', device.value !== null ? device.value.id : null)
          .first()
      })
    } else if (props.action.isChannelProperty) {
      property = computed<ChannelPropertyInterface | null>((): ChannelPropertyInterface | null => {
        return ChannelProperty
          .query()
          .where('property', props.action.property)
          .where('channelId', channel.value !== null ? channel.value.id : null)
          .first()
      })
    }

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

    // Submit toggle state
    async function toggle(): Promise<void> {
      const errorMessage = context.root.$t('triggers.messages.actionNotUpdated', {
        trigger: props.trigger.name,
      }).toString()

      try {
        await Action.dispatch('edit', {
          action: props.action,
          data: {
            enabled: form.model.enabled,
          },
        })
      } catch (e) {
        if (get(e, 'exception', null) !== null) {
          context.root.handleException(e.exception, errorMessage)
        } else {
          context.root.$flashMessage(errorMessage, 'error')
        }
      }
    }

    async function remove(): Promise<void> {
      await Action.dispatch('remove', {
        action: props.action,
      })
    }

    return {
      form,
      device,
      channel,
      property,
      windowSize,
      fetchingDevices,
      toggle,
      remove,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
