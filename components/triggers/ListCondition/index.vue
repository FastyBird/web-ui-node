<template>
  <div class="fb-triggers-list-condition__container">
    <template v-if="condition.isDeviceProperty || condition.isChannelProperty">
      <list-item
        v-if="fetchingDevices || device === null"
        :variant="$windowSize.isExtraSmall() ? listSizeTypes.LIST : listSizeTypes.DEFAULT"
        class="fb-triggers-list-condition__preloading"
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
        class="fb-triggers-list-condition__item"
      >
        <font-awesome-icon
          slot="icon"
          :icon="device.icon"
        />

        <template v-if="condition.isDeviceProperty">
          <template slot="heading">
            {{ device.title }}
          </template>

          <template slot="sub-heading">
            {{
              $t(`triggers.conditions.${condition.operator}`, {
                property: property.title.toLowerCase(),
                value: condition.operand,
              })
            }}
          </template>
        </template>

        <template v-if="condition.isChannelProperty">
          <template slot="heading">
            {{ device.title }}
          </template>

          <template slot="sub-heading">
            {{ channel.title }}:
            <span>
              {{
                $t(`triggers.conditions.${condition.operator}`, {
                  property: property.title.toLowerCase(),
                  value: condition.operand,
                })
              }}
            </span>
          </template>
        </template>

        <template :slot="condition.draft ? 'detail-large' : 'detail'">
          <div class="fb-triggers-list-condition__item-conditions">
            <div class="fb-triggers-list-condition__item-conditions-state">
              <fb-ui-switch-element
                :status="form.model.enabled"
                :variant="switchVariantTypes.PRIMARY"
                @change="toggle"
              />
            </div>

            <div
              v-if="condition.draft"
              class="fb-triggers-list-condition__item-conditions-buttons"
            >
              <fb-ui-button
                :size="sizeTypes.SMALL"
                :variant="buttonVariantTypes.LINK"
                @click="remove"
              >
                {{ $t('application.buttons.remove.title') }}
              </fb-ui-button>
            </div>
          </div>
        </template>
      </list-item>
    </template>

    <template v-else>
      <list-item
        :variant="$windowSize.isExtraSmall() ? listSizeTypes.LIST : listSizeTypes.DEFAULT"
        class="fb-triggers-list-condition__item"
      >
        <font-awesome-icon
          slot="icon"
          v-if="condition.isDate"
          icon="calendar"
        />

        <font-awesome-icon
          slot="icon"
          v-if="condition.isTime"
          icon="clock"
        />

        <template v-if="condition.isDate">
          <template slot="heading">
            {{
              $t('triggers.texts.scheduledDate', {
                date: $dateFns.format(new Date(condition.date), _.get(account, 'dateFormat', 'dd.MM.yyyy')),
                time: $dateFns.format(new Date(condition.date), _.get(account, 'timeFormat', 'HH:mm')),
              })
            }}
          </template>
        </template>

        <template v-if="condition.isTime">
          <template slot="heading">
            {{
              $t('triggers.texts.scheduledTime', { time: $dateFns.format(new Date(condition.time), _.get(account, 'timeFormat', 'HH:mm')) })
            }}
          </template>

          <template slot="sub-heading">
            <template v-if="condition.days.length !== 7">
              <span
                v-for="(row, index) in condition.days"
                :key="index"
              >
                {{ translateDay(row) }}<template v-if="index < (condition.days.length - 1)">, </template>
              </span>
            </template>
            <span v-else>all week</span>
          </template>
        </template>

        <template :slot="condition.draft ? 'detail-large' : 'detail'">
          <div class="fb-triggers-list-condition__item-conditions">
            <div class="fb-triggers-list-condition__item-conditions-state">
              <fb-ui-switch-element
                :status="form.model.enabled"
                :variant="switchVariantTypes.PRIMARY"
                @change="toggle"
              />
            </div>

            <div
              v-if="condition.draft"
              class="fb-triggers-list-condition__item-conditions-buttons"
            >
              <fb-ui-button
                :size="sizeTypes.SMALL"
                :variant="buttonVariantTypes.LINK"
                @click="remove"
              >
                {{ $t('application.buttons.remove.title') }}
              </fb-ui-button>
            </div>
          </div>
        </template>
      </list-item>
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  reactive,
  onBeforeMount,
  ref,
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
import Condition from '~/models/triggers-node/conditions/Condition'
import { ConditionInterface } from '~/models/triggers-node/conditions/types'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'
import Channel from '~/models/devices-node/channels/Channel'
import { ChannelInterface } from '~/models/devices-node/channels/types'
import DeviceProperty from '~/models/devices-node/device-properties/DeviceProperty'
import { DevicePropertyInterface } from '~/models/devices-node/device-properties/types'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'
import { ChannelPropertyInterface } from '~/models/devices-node/channel-properties/types'

import { AccountInterface } from '~/models/auth-node/accounts/types'

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

interface TriggersDetailDefaultConditionsContainerConditionFormModelInterface {
  enabled: boolean
}

interface TriggersDetailDefaultConditionsContainerConditionFormInterface {
  model: TriggersDetailDefaultConditionsContainerConditionFormModelInterface
}

interface TriggersDetailDefaultConditionsContainerConditionPropsInterface {
  trigger: TriggerInterface,
  condition: ConditionInterface,
}

export default defineComponent({

  name: 'TriggersListCondition',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

    condition: {
      type: Object as PropType<ConditionInterface>,
      required: true,
    },

  },

  setup(props: TriggersDetailDefaultConditionsContainerConditionPropsInterface, context: SetupContext) {
    const form = reactive<TriggersDetailDefaultConditionsContainerConditionFormInterface>({
      model: {
        enabled: props.condition.enabled,
      },
    })

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    let device = computed<DeviceInterface | null>((): DeviceInterface | null => {
      return null
    })
    let channel = computed<ChannelInterface | null>((): ChannelInterface | null => {
      return null
    })
    let property = computed<DevicePropertyInterface | ChannelPropertyInterface | null>((): DevicePropertyInterface | ChannelPropertyInterface | null => {
      return null
    })
    let fetchingDevices = computed<boolean>((): boolean => false)

    if (props.condition.isDeviceProperty || props.condition.isChannelProperty) {
      device = computed<DeviceInterface | null>((): DeviceInterface | null => {
        return Device.query().where('identifier', props.condition.device).first()
      })

      if (props.condition.isDeviceProperty) {
        property = computed<DevicePropertyInterface | null>((): DevicePropertyInterface | null => {
          return DeviceProperty
            .query()
            .where('property', props.condition.property)
            .where('deviceId', device.value !== null ? device.value.id : null)
            .first()
        })

        channel = ref<ChannelInterface | null>(null)
      } else if (props.condition.isChannelProperty) {
        channel = computed<ChannelInterface | null>((): ChannelInterface | null => {
          return props.condition.isChannelProperty ? Channel.query().where('channel', props.condition.channel).first() : null
        })

        property = computed<ChannelPropertyInterface | null>((): ChannelPropertyInterface | null => {
          return ChannelProperty
            .query()
            .where('property', props.condition.property)
            .where('channelId', channel.value !== null ? channel.value.id : null)
            .first()
        })
      }

      fetchingDevices = computed<boolean>((): boolean => Device.getters('fetching')())

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
    }

    const account = computed<AccountInterface | null>((): AccountInterface | null => {
      return context.root.$store.getters['session/getAccount']()
    })

    // Submit toggle state
    async function toggle(): Promise<void> {
      const errorMessage = context.root.$t('triggers.messages.conditionNotUpdated', {
        trigger: props.trigger.name,
      }).toString()

      try {
        await Condition.dispatch('edit', {
          condition: props.condition,
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
      const errorMessage = context.root.$t('triggers.messages.conditionNotRemoved', {
        trigger: props.trigger.name,
      }).toString()

      try {
        await Condition.dispatch('remove', {
          condition: props.condition,
        })
      } catch (e) {
        if (get(e, 'exception', null) !== null) {
          context.root.handleException(e.exception, errorMessage)
        } else {
          context.root.$flashMessage(errorMessage, 'error')
        }
      }
    }

    function translateDay(day: number): string {
      switch (day) {
        case 1:
          return context.root.$t('application.days.mon.short').toString()
        case 2:
          return context.root.$t('application.days.tue.short').toString()
        case 3:
          return context.root.$t('application.days.wed.short').toString()
        case 4:
          return context.root.$t('application.days.thu.short').toString()
        case 5:
          return context.root.$t('application.days.fri.short').toString()
        case 6:
          return context.root.$t('application.days.sat.short').toString()
        case 7:
          return context.root.$t('application.days.sun.short').toString()
        default:
          return ''
      }
    }

    return {
      form,
      device,
      channel,
      property,
      windowSize,
      fetchingDevices,
      account,
      toggle,
      remove,
      translateDay,
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
