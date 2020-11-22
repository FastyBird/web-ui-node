<template>
  <div class="fb-triggers-list-action__container">
    <list-item
      v-if="fetchingDevices || device === null"
      :variant="$windowSize.isExtraSmall() ? listSizeTypes.LIST : listSizeTypes.DEFAULT"
      class="fb-triggers-list-action__preloading"
    >
      <fb-ui-spinner
        slot="icon"
        :variant="spinnerVariantTypes.DEFAULT"
      />

      <font-awesome-icon
        slot="detail"
        icon="ellipsis-h"
      />
    </list-item>

    <list-item
      v-else
      :variant="$windowSize.isExtraSmall() ? listSizeTypes.LIST : listSizeTypes.DEFAULT"
      class="fb-triggers-list-action__item"
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

      <template :slot="action.draft ? 'detail-large' : 'detail'">
        <div class="fb-triggers-list-action__item-actions">
          <div class="fb-triggers-list-action__item-actions-state">
            <fb-ui-switch-element
              :status="form.model.enabled"
              :variant="switchVariantTypes.PRIMARY"
              @change="handleToggle"
            />
          </div>

          <div
            v-if="action.draft"
            class="fb-triggers-list-action__item-actions-buttons"
          >
            <fb-ui-button
              :size="sizeTypes.SMALL"
              :variant="buttonVariantTypes.LINK"
              @click="handleRemove"
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

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
  FbUiSwitchElementVariantTypes,
  FbUiSpinnerVariantTypes,
} from '@fastybird/web-ui-theme'

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

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

interface TriggersListActionFormInterface {
  model: {
    enabled: boolean
  }
}

interface TriggersListActionPropsInterface {
  trigger: TriggerInterface
  action: ActionInterface
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

  setup(props: TriggersListActionPropsInterface, context: SetupContext) {
    const form = reactive<TriggersListActionFormInterface>({
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

    async function handleToggle(): Promise<void> {
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

    async function handleRemove(): Promise<void> {
      const errorMessage = context.root.$t('triggers.messages.actionNotRemoved', {
        trigger: props.trigger.name,
      }).toString()

      try {
        await Action.dispatch('remove', {
          action: props.action,
        })
      } catch (e) {
        if (get(e, 'exception', null) !== null) {
          context.root.handleException(e.exception, errorMessage)
        } else {
          context.root.$flashMessage(errorMessage, 'error')
        }
      }
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
      form,
      device,
      channel,
      property,
      windowSize,
      fetchingDevices,
      handleToggle,
      handleRemove,
      listSizeTypes: ListItemSizeTypes,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
      switchVariantTypes: FbUiSwitchElementVariantTypes,
      spinnerVariantTypes: FbUiSpinnerVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
