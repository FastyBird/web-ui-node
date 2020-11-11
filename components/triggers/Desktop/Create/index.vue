<template>
  <fb-ui-modal-form
    :lock-submit-button="remoteFormResult !== formResultTypes.NONE"
    :state="remoteFormResult"
    :submit-btn-text="$t('application.buttons.done.title')"
    :submit-btn-show="submitBtnShow"
    :cancel-btn-text="cancelBtnText"
    :data-type="openedType()"
    @submit="submitBtnCallback"
    @cancel="cancelBtnCallback"
    @close="closeView"
    class="fb-triggers-desktop-create__container"
  >
    <fb-ui-modal-header
      slot="modal-header"
      v-if="view.triggerType.show"
      @close="closeView"
    >
      <font-awesome-icon
        slot="icon"
        icon="project-diagram"
        class="fb-triggers-desktop-create__icon"
      />

      <template slot="heading">
        {{ $t('triggers.headings.triggerType') }}
      </template>

      <template slot="description">
        Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
        consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
      </template>
    </fb-ui-modal-header>

    <fb-ui-modal-header
      slot="modal-header"
      v-if="view.generalInfo.show"
      @close="closeView"
    >
      <font-awesome-icon
        slot="icon"
        v-if="view.generalInfo.type === triggerTypes.TIME_SCHEDULED"
        icon="clock"
        class="fb-triggers-desktop-create__icon"
      />

      <font-awesome-icon
        slot="icon"
        v-if="view.generalInfo.type === triggerTypes.DATE_SCHEDULED"
        icon="calendar"
        class="fb-triggers-desktop-create__icon"
      />

      <font-awesome-icon
        slot="icon"
        v-if="view.generalInfo.type === triggerTypes.DEVICE"
        icon="plug"
        class="fb-triggers-desktop-create__icon"
      />

      <font-awesome-icon
        slot="icon"
        v-if="view.generalInfo.type === triggerTypes.SENSOR"
        icon="thermometer-half"
        class="fb-triggers-desktop-create__icon"
      />

      <font-awesome-icon
        slot="icon"
        v-if="view.generalInfo.type === triggerTypes.MANUAL"
        icon="gamepad"
        class="fb-triggers-desktop-create__icon"
      />

      <template
        slot="heading"
        v-if="view.generalInfo.type === triggerTypes.TIME_SCHEDULED"
      >
        {{ $t('triggers.headings.createTimeScheduledTrigger') }}
      </template>

      <template
        slot="heading"
        v-if="view.generalInfo.type === triggerTypes.DATE_SCHEDULED"
      >
        {{ $t('triggers.headings.createDateScheduledTrigger') }}
      </template>

      <template
        slot="heading"
        v-if="view.generalInfo.type === triggerTypes.DEVICE"
      >
        {{ $t('triggers.headings.createDeviceTrigger') }}
      </template>

      <template
        slot="heading"
        v-if="view.generalInfo.type === triggerTypes.SENSOR"
      >
        {{ $t('triggers.headings.createSensorTrigger') }}
      </template>

      <template
        slot="heading"
        v-if="view.generalInfo.type === triggerTypes.MANUAL"
      >
        {{ $t('triggers.headings.createManualTrigger') }}
      </template>

      <template slot="description">
        Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
        consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
      </template>
    </fb-ui-modal-header>

    <fb-ui-modal-header
      slot="modal-header"
      v-if="view.listConditionDevices.show || view.listActionDevices.show"
      @close="closeView"
    >
      <font-awesome-icon
        slot="icon"
        icon="plug"
        class="fb-triggers-desktop-create__icon"
      />

      <template slot="heading">
        {{ $t('triggers.headings.selectDevice') }}
      </template>

      <template slot="description">
        Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
        consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
      </template>
    </fb-ui-modal-header>

    <fb-ui-modal-header
      slot="modal-header"
      v-if="view.selectConditionDevice.show && view.selectConditionDevice.device !== null"
      @close="closeView"
    >
      <font-awesome-icon
        slot="icon"
        :icon="view.selectConditionDevice.device.icon"
        class="fb-triggers-desktop-create__icon"
      />

      <template slot="heading">
        {{ view.selectConditionDevice.device.title }}
      </template>

      <template slot="description">
        Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
        consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
      </template>
    </fb-ui-modal-header>

    <fb-ui-modal-header
      slot="modal-header"
      v-if="view.selectActionDevice.show && view.selectActionDevice.device !== null"
      @close="closeView"
    >
      <font-awesome-icon
        slot="icon"
        :icon="view.selectActionDevice.device.icon"
        class="fb-triggers-desktop-create__icon"
      />

      <template slot="heading">
        {{ view.selectActionDevice.device.title }}
      </template>

      <template slot="description">
        Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
        consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
      </template>
    </fb-ui-modal-header>

    <fb-ui-modal-header
      slot="modal-header"
      v-if="view.configureTime.show"
      @close="closeView"
    >
      <font-awesome-icon
        slot="icon"
        icon="clock"
        class="fb-triggers-desktop-create__icon"
      />

      <template slot="heading">
        {{ $t('triggers.headings.typeTime') }}
      </template>

      <template slot="description">
        Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
        consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
      </template>
    </fb-ui-modal-header>

    <div slot="form">
      <div
        v-if="view.triggerType.show"
        class="fb-triggers-desktop-create__select-type"
      >
        <div class="fb-triggers-desktop-create__select-type-item">
          <fb-ui-button
            :variant="buttonVariantTypes.OUTLINE_PRIMARY"
            :size="sizeTypes.LARGE"
            @click.prevent="triggerType(triggerTypes.TIME_SCHEDULED)"
            block
            name="scheduled"
          >
            <font-awesome-icon icon="clock" />
            {{ $t('triggers.buttons.addTypeTimeOfDay.title') }}
          </fb-ui-button>
        </div>
        <div class="fb-triggers-desktop-create__select-type-item">
          <fb-ui-button
            :variant="buttonVariantTypes.OUTLINE_PRIMARY"
            :size="sizeTypes.LARGE"
            @click.prevent="triggerType(triggerTypes.DEVICE)"
            block
            name="device"
          >
            <font-awesome-icon icon="plug" />
            {{ $t('triggers.buttons.addTypeDeviceControlled.title') }}
          </fb-ui-button>
        </div>
        <div class="fb-triggers-desktop-create__select-type-item">
          <fb-ui-button
            :variant="buttonVariantTypes.OUTLINE_PRIMARY"
            :size="sizeTypes.LARGE"
            @click.prevent="triggerType(triggerTypes.SENSOR)"
            block
            name="sensor"
          >
            <font-awesome-icon icon="thermometer-half" />
            {{ $t('triggers.buttons.addTypeSensorDetect.title') }}
          </fb-ui-button>
        </div>
        <div class="fb-triggers-desktop-create__select-type-item">
          <fb-ui-button
            :variant="buttonVariantTypes.OUTLINE_PRIMARY"
            :size="sizeTypes.LARGE"
            @click.prevent="triggerType(triggerTypes.MANUAL)"
            block
            name="scene"
          >
            <font-awesome-icon icon="gamepad" />
            {{ $t('triggers.buttons.addTypeManual.title') }}
          </fb-ui-button>
        </div>
      </div>

      <trigger-create
        v-if="view.generalInfo.show"
        :trigger="trigger"
        :type="view.generalInfo.type"
        :remote-submit.sync="remoteSubmit"
        :remote-form-result.sync="remoteFormResult"
        @addCondition="openView(viewTypes.LIST_CONDITION_DEVICES)"
        @addAction="openView(viewTypes.LIST_ACTION_DEVICES)"
        @addTimeSchedule="openView(viewTypes.CONFIGURE_TIME)"
        @addDateSchedule="openView(viewTypes.CONFIGURE_DATE)"
        @close="closeCreateTrigger"
      />

      <triggers-list-devices
        v-if="view.listConditionDevices.show"
        :type="selectDeviceViewTypes.SENSORS"
        :items="conditions"
        @select="listConditionDevices"
      />

      <triggers-list-devices
        v-if="view.listActionDevices.show"
        :type="selectDeviceViewTypes.ACTORS"
        :items="actions"
        @select="listActionDevices"
      />

      <triggers-select-condition-device
        v-if="view.selectConditionDevice.show && Object.keys(form.model.conditions).length > 0"
        v-model="form.model.conditions"
        :device="view.selectConditionDevice.device"
      />

      <triggers-select-action-device
        v-if="view.selectActionDevice.show && Object.keys(form.model.actions).length > 0"
        v-model="form.model.actions"
        :device="view.selectActionDevice.device"
      />

      <triggers-select-time
        v-if="view.configureTime.show && Object.keys(form.model.time).length > 0"
        v-model="form.model.time"
      />
    </div>
  </fb-ui-modal-form>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onUnmounted,
  reactive,
  ref,
  SetupContext,
} from '@vue/composition-api'

import uuid from 'uuid'

import {
  FbSizeTypes,
  FbFormResultType,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import {
  TriggerEntityTypeType,
  TriggerInterface,
} from '~/models/triggers-node/triggers/types'
import Condition from '~/models/triggers-node/conditions/Condition'
import {
  ConditionEntityTypeType,
  ConditionInterface,
} from '~/models/triggers-node/conditions/types'
import Action from '~/models/triggers-node/actions/Action'
import {
  ActionEntityTypeType,
  ActionInterface,
} from '~/models/triggers-node/actions/types'
import { ConditionOperatorType } from '~/models/triggers-node/types'
import Notification from '~/models/triggers-node/notifications/Notification'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import DeviceProperty from '~/models/devices-node/device-properties/DeviceProperty'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'

import TriggerCreate, { TriggerType } from '~/components/triggers/Create/index.vue'
import TriggersListDevices, { ViewType as SelectViewType } from '~/components/triggers/ListDevices/index.vue'
import TriggersSelectConditionDevice from '~/components/triggers/SelectConditionDevice/index.vue'
import TriggersSelectTime from '~/components/triggers/SelectTime/index.vue'
import TriggersSelectActionDevice from '~/components/triggers/SelectActionDevice/index.vue'
import { TRIGGERS_HASH_DETAIL } from '~/configuration/routes'

enum ViewTypes {
  TRIGGER_TYPE = 'triggerType',
  GENERAL_INFO = 'generalInfo',
  LIST_CONDITION_DEVICES = 'listConditionDevices',
  LIST_ACTION_DEVICES = 'listActionDevices',
  SELECT_CONDITION_DEVICE = 'selectConditionDevice',
  SELECT_ACTION_DEVICE = 'selectActionDevice',
  CONFIGURE_TIME = 'configureTime',
  CONFIGURE_DATE = 'configureDate',
}

enum ConditionItemType {
  DEVICE_CONDITION = 'deviceCondition',
  CHANNEL_CONDITION = 'channelCondition',
}

enum ActionItemType {
  DEVICE_ACTION = 'deviceAction',
  CHANNEL_ACTION = 'channelAction',
}

interface TriggersDesktopCreateFormModelConditionDeviceInterface {
  selected: boolean
  operator: ConditionOperatorType
  operand: string | boolean | null
  type: ConditionItemType
  condition: string | null
}

interface TriggersDesktopCreateFormModelActionDeviceInterface {
  selected: boolean
  operation: string | boolean | null
  type: ActionItemType
  action: string | null
}

interface TriggersDesktopCreateFormModelTimeInterface {
  selected: boolean
  time: string
  days: Array<number>
  condition: string | null
}

interface TriggersDesktopCreateFormModelDateInterface {
  selected: boolean
  date: string
  condition: string | null
}

interface TriggersDesktopCreateFormModelInterface {
  conditions?: { [key: string]: TriggersDesktopCreateFormModelConditionDeviceInterface }
  actions?: { [key: string]: TriggersDesktopCreateFormModelActionDeviceInterface }
  time?: TriggersDesktopCreateFormModelTimeInterface
  date?: TriggersDesktopCreateFormModelDateInterface
}

interface TriggersDesktopCreateFormInterface {
  model: TriggersDesktopCreateFormModelInterface
}

interface TriggersDesktopCreateViewTriggerTypeInterface {
  show: boolean
}

interface TriggersDesktopCreateViewGeneralInfoInterface {
  show: boolean
  type?: TriggerType
}

interface TriggersDesktopCreateViewListConditionDevicesInterface {
  show: boolean
}

interface TriggersDesktopCreateViewListActionDevicesInterface {
  show: boolean
}

interface TriggersDesktopCreateViewSelectConditionDeviceInterface {
  show: boolean
  device: DeviceInterface | null
}

interface TriggersDesktopCreateViewSelectActionDeviceInterface {
  show: boolean
  device: DeviceInterface | null
}

interface TriggersDesktopCreateViewConfigureTimeInterface {
  show: boolean
}

interface TriggersDesktopCreateViewConfigureDateInterface {
  show: boolean
}

interface TriggersDesktopCreateViewInterface {
  triggerType: TriggersDesktopCreateViewTriggerTypeInterface
  generalInfo: TriggersDesktopCreateViewGeneralInfoInterface
  listConditionDevices: TriggersDesktopCreateViewListConditionDevicesInterface
  listActionDevices: TriggersDesktopCreateViewListActionDevicesInterface
  selectConditionDevice: TriggersDesktopCreateViewSelectConditionDeviceInterface
  selectActionDevice: TriggersDesktopCreateViewSelectActionDeviceInterface
  configureTime: TriggersDesktopCreateViewConfigureTimeInterface
  configureDate: TriggersDesktopCreateViewConfigureDateInterface
}

interface TriggersDesktopCreatePropsInterface {
  type: string
}

export default defineComponent({

  name: 'TriggersDesktopCreate',

  components: {
    TriggerCreate,
    TriggersListDevices,
    TriggersSelectConditionDevice,
    TriggersSelectTime,
    TriggersSelectActionDevice,
  },

  setup(props: TriggersDesktopCreatePropsInterface, context: SetupContext) {
    const triggerId = uuid.v4().toString()

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    const conditions = computed<Array<ConditionInterface>>((): Array<ConditionInterface> => {
      return Condition
        .query()
        .where('triggerId', triggerId)
        .all()
    })

    const actions = computed<Array<ActionInterface>>((): Array<ActionInterface> => {
      return Action
        .query()
        .where('triggerId', triggerId)
        .all()
    })

    const remoteSubmit = ref<boolean>(false)
    const remoteFormResult = ref<FbFormResultType>(FbFormResultType.NONE)

    const hasConditionDate = ref<boolean>(false)
    const hasConditionTime = ref<boolean>(false)
    const hasConditionDevice = ref<boolean>(false)
    const hasActionDevice = ref<boolean>(false)

    const view = reactive<TriggersDesktopCreateViewInterface>({
      triggerType: {
        show: true,
      },
      generalInfo: {
        show: false,
        type: TriggerType.DEVICE,
      },
      listConditionDevices: {
        show: false,
      },
      listActionDevices: {
        show: false,
      },
      selectConditionDevice: {
        show: false,
        device: null,
      },
      selectActionDevice: {
        show: false,
        device: null,
      },
      configureTime: {
        show: false,
      },
      configureDate: {
        show: false,
      },
    })

    const trigger = computed<TriggerInterface | null>((): TriggerInterface | null => {
      return Trigger
        .query()
        .with('conditions')
        .with('actions')
        .with('notifications')
        .where('id', triggerId)
        .first()
    })

    const form = reactive<TriggersDesktopCreateFormInterface>({
      model: {},
    })

    onUnmounted((): void => {
      if (trigger.value !== null) {
        trigger.value.conditions.forEach((condition): void => {
          if (condition.draft) {
            Condition.delete(condition.id)
          }
        })

        trigger.value.actions.forEach((action): void => {
          if (action.draft) {
            Action.delete(action.id)
          }
        })

        trigger.value.notifications.forEach((notification): void => {
          if (notification.draft) {
            Notification.delete(notification.id)
          }
        })
      }

      if (trigger.value !== null && trigger.value.draft) {
        Trigger.dispatch('remove', {
          trigger: trigger.value,
        })
          .catch(() => {
            context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          })
      }
    })

    // Open info window
    function openView(type: ViewTypes): void {
      if (type === ViewTypes.CONFIGURE_TIME) {
        form.model.conditions = {}
        form.model.actions = {}

        const condition = Condition
          .query()
          .where('triggerId', triggerId)
          .where('type', ConditionEntityTypeType.TIME)
          .first()

        if (condition !== null) {
          Object.assign(form.model, {
            time: {
              selected: true,
              time: (new Date(condition.time)).toISOString(),
              days: condition.days,
              condition: condition.id,
            },
          })

          hasConditionTime.value = true
        } else {
          const today = new Date()

          Object.assign(form.model, {
            time: {
              selected: false,
              time: today.toISOString(),
              days: [1, 2, 3, 4, 5, 6, 7],
              condition: null,
            },
          })
        }
      } else if (type === ViewTypes.CONFIGURE_DATE) {
        form.model.conditions = {}
        form.model.actions = {}

        const condition = Condition
          .query()
          .where('triggerId', triggerId)
          .where('type', ConditionEntityTypeType.DATE)
          .first()

        if (condition !== null) {
          Object.assign(form.model, {
            date: {
              selected: true,
              date: (new Date(condition.date)).toISOString(),
              condition: condition.id,
            },
          })

          hasConditionDate.value = true
        } else {
          const today = new Date()

          Object.assign(form.model, {
            date: {
              selected: false,
              date: today.toISOString(),
              condition: null,
            },
          })
        }
      }

      view[type].show = true

      Object.keys(view)
        .forEach((key: string): void => {
          if (
            (
              key === ViewTypes.TRIGGER_TYPE ||
              key === ViewTypes.GENERAL_INFO ||
              key === ViewTypes.LIST_CONDITION_DEVICES ||
              key === ViewTypes.LIST_ACTION_DEVICES ||
              key === ViewTypes.SELECT_CONDITION_DEVICE ||
              key === ViewTypes.SELECT_ACTION_DEVICE ||
              key === ViewTypes.CONFIGURE_TIME ||
              key === ViewTypes.CONFIGURE_DATE
            ) &&
            type !== key
          ) {
            view[key].show = false
          }
        })
    }

    // Close opened window
    function closeView(): void {
      Object.keys(view)
        .forEach((key: string): void => {
          if (
            key === ViewTypes.TRIGGER_TYPE ||
            key === ViewTypes.GENERAL_INFO ||
            key === ViewTypes.LIST_CONDITION_DEVICES ||
            key === ViewTypes.LIST_ACTION_DEVICES ||
            key === ViewTypes.SELECT_CONDITION_DEVICE ||
            key === ViewTypes.SELECT_ACTION_DEVICE ||
            key === ViewTypes.CONFIGURE_TIME ||
            key === ViewTypes.CONFIGURE_DATE
          ) {
            view[key].show = false
          }
        })

      context.emit('close')
    }

    function triggerType(type: TriggerType): void {
      if (type === TriggerType.MANUAL) {
        Trigger.dispatch('add', {
          id: triggerId,
          draft: true,
          data: {
            type: TriggerEntityTypeType.MANUAL,
            actions: [],
            notifications: [],
          },
        })
          .catch(() => {
            context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          })
      } else {
        Trigger.dispatch('add', {
          id: triggerId,
          draft: true,
          data: {
            type: TriggerEntityTypeType.AUTOMATIC,
            actions: [],
            conditions: [],
            notifications: [],
          },
        })
          .catch(() => {
            context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          })
      }

      view[ViewTypes.GENERAL_INFO].type = type

      openView(ViewTypes.GENERAL_INFO)
    }

    function listConditionDevices(device: DeviceInterface): void {
      form.model.conditions = {}

      device.channels
        .forEach((channel): void => {
          channel.properties
            .forEach((property): void => {
              if (typeof form.model.conditions !== 'undefined') {
                form.model.conditions[property.id] = {
                  selected: false,
                  type: ConditionItemType.CHANNEL_CONDITION,
                  operator: ConditionOperatorType.STATE_VALUE_EQUAL,
                  operand: null,
                  condition: null,
                }
              }
            })
        })

      device.properties
        .forEach((property): void => {
          if (typeof form.model.conditions !== 'undefined') {
            form.model.conditions[property.id] = {
              selected: false,
              type: ConditionItemType.DEVICE_CONDITION,
              operator: ConditionOperatorType.STATE_VALUE_EQUAL,
              operand: null,
              condition: null,
            }
          }
        })

      Condition
        .query()
        .where('triggerId', triggerId)
        .all()
        .forEach((condition): void => {
          let property = null

          if (condition.isDeviceProperty && condition.device === device.identifier) {
            property = DeviceProperty
              .query()
              .where('property', condition.property)
              .whereHas('deviceBackward', (query): void => {
                query.where('identifier', condition.device)
              })
              .first()
          } else if (condition.isChannelProperty && condition.device === device.identifier) {
            property = ChannelProperty
              .query()
              .where('property', condition.property)
              .whereHas('channelBackward', (query): void => {
                query
                  .where('channel', condition.channel)
                  .with('deviceBackward', (subQuery): void => {
                    subQuery.where('identifier', condition.device)
                  })
              })
              .first()
          }

          if (
            property !== null &&
            Object.prototype.hasOwnProperty.call(form.model.conditions, property.id) &&
            typeof form.model.conditions !== 'undefined'
          ) {
            Object.assign(form.model.conditions[property.id], {
              selected: true,
              operator: condition.operator,
              operand: condition.operand,
              condition: condition.id,
            })
          }
        })

      Object.keys(form.model.conditions)
        .forEach((key): void => {
          if (
            typeof form.model.conditions !== 'undefined' &&
            form.model.conditions[key].condition !== null
          ) {
            hasConditionDevice.value = true
          }
        })

      view[ViewTypes.SELECT_CONDITION_DEVICE].device = device

      openView(ViewTypes.SELECT_CONDITION_DEVICE)
    }

    function listActionDevices(device: DeviceInterface): void {
      form.model.actions = {}

      device.channels
        .forEach((channel): void => {
          channel.properties
            .forEach((property): void => {
              if (typeof form.model.actions !== 'undefined') {
                form.model.actions[property.id] = {
                  selected: false,
                  operation: null,
                  type: ActionItemType.CHANNEL_ACTION,
                  action: null,
                }
              }
            })
        })

      device.properties
        .forEach((property): void => {
          if (typeof form.model.actions !== 'undefined') {
            form.model.actions[property.id] = {
              selected: false,
              operation: null,
              type: ActionItemType.DEVICE_ACTION,
              action: null,
            }
          }
        })

      Action
        .query()
        .where('triggerId', triggerId)
        .all()
        .forEach((action): void => {
          let property = null

          if (action.isDeviceProperty && action.device === device.identifier) {
            property = DeviceProperty
              .query()
              .where('property', action.property)
              .whereHas('deviceBackward', (query): void => {
                query.where('identifier', action.device)
              })
              .first()
          } else if (action.isChannelProperty && action.device === device.identifier) {
            property = ChannelProperty
              .query()
              .where('property', action.property)
              .whereHas('channelBackward', (query): void => {
                query
                  .where('channel', action.channel)
                  .with('deviceBackward', (subQuery): void => {
                    subQuery.where('identifier', action.device)
                  })
              })
              .first()
          }

          if (
            property !== null &&
            Object.prototype.hasOwnProperty.call(form.model.actions, property.id) &&
            typeof form.model.actions !== 'undefined'
          ) {
            Object.assign(form.model.actions[property.id], {
              selected: true,
              operation: action.value,
              action: action.id,
            })
          }
        })

      Object.keys(form.model.actions)
        .forEach((key): void => {
          if (
            typeof form.model.actions !== 'undefined' &&
            form.model.actions[key].action !== null
          ) {
            hasActionDevice.value = true
          }
        })

      view[ViewTypes.SELECT_ACTION_DEVICE].device = device

      openView(ViewTypes.SELECT_ACTION_DEVICE)
    }

    function submitConditionDevice(): void {
      let result = true

      if (typeof form.model.conditions !== 'undefined') {
        let isValid = false

        Object.keys(form.model.conditions)
          .forEach((key): void => {
            if (
              typeof form.model.conditions !== 'undefined' &&
              form.model.conditions[key].selected &&
              form.model.conditions[key].operand !== null
            ) {
              isValid = true
            }
          })

        if (!isValid) {
          context.root.$flashMessage(context.root.$t('triggers.messages.atLeastOneConditionProperty').toString(), 'error')

          return
        }

        Object.keys(form.model.conditions)
          .forEach(async(key): Promise<void> => {
            if (typeof form.model.conditions !== 'undefined') {
              const conditionId = form.model.conditions[key].condition

              let condition = null

              if (conditionId !== null) {
                condition = Condition.find(conditionId)

                if (condition === null) {
                  result = false

                  return
                }
              }

              if (form.model.conditions[key].type === ConditionItemType.DEVICE_CONDITION) {
                if (form.model.conditions[key].selected) {
                  if (condition !== null) {
                    await Condition.update({
                      where: condition.id,
                      data: {
                        operator: form.model.conditions[key].operator,
                        operand: form.model.conditions[key].operand,
                      },
                    })
                  } else {
                    const property = DeviceProperty
                      .query()
                      .with('deviceBackward')
                      .where('id', key)
                      .has('deviceBackward')
                      .first()

                    if (property !== null) {
                      await Condition.insert({
                        data: {
                          id: uuid.v4().toString(),
                          trigger: trigger.value,
                          triggerId,
                          draft: true,
                          type: ConditionEntityTypeType.DEVICE_PROPERTY,
                          enabled: true,
                          operator: form.model.conditions[key].operator,
                          operand: form.model.conditions[key].operand,
                          device: property.deviceBackward?.identifier,
                          property: property.property,
                        },
                      })
                    } else {
                      result = false
                    }
                  }
                } else if (condition !== null) {
                  await Condition.delete(condition.id)
                }
              } else if (form.model.conditions[key].type === ConditionItemType.CHANNEL_CONDITION) {
                if (form.model.conditions[key].selected) {
                  if (condition !== null) {
                    await Condition.update({
                      where: condition.id,
                      data: {
                        operator: form.model.conditions[key].operator,
                        operand: form.model.conditions[key].operand,
                      },
                    })
                  } else {
                    const property = ChannelProperty
                      .query()
                      .with('channelBackward')
                      .with('channelBackward.deviceBackward')
                      .has('channelBackward')
                      .where('id', key)
                      .first()

                    if (property !== null) {
                      await Condition.insert({
                        data: {
                          id: uuid.v4().toString(),
                          trigger: trigger.value,
                          triggerId,
                          draft: true,
                          type: ConditionEntityTypeType.CHANNEL_PROPERTY,
                          enabled: true,
                          operator: form.model.conditions[key].operator,
                          operand: form.model.conditions[key].operand,
                          device: property.channelBackward?.deviceBackward?.identifier,
                          channel: property.channelBackward?.channel,
                          property: property.property,
                        },
                      })
                    } else {
                      result = false
                    }
                  }
                } else if (condition !== null) {
                  await Condition.delete(condition.id)
                }
              }
            }
          })
      }

      if (result) {
        openView(ViewTypes.GENERAL_INFO)
      } else {
        context.root.$flashMessage(context.root.$t('application.messages.unknownError').toString(), 'error')
      }
    }

    function submitActionDevice(): void {
      let result = true

      if (typeof form.model.actions !== 'undefined') {
        let isValid = false

        Object.keys(form.model.actions)
          .forEach((key): void => {
            if (
              typeof form.model.actions !== 'undefined' &&
              form.model.actions[key].selected &&
              form.model.actions[key].operation !== null
            ) {
              isValid = true
            }
          })

        if (!isValid) {
          context.root.$flashMessage(context.root.$t('triggers.messages.atLeastOneActionProperty').toString(), 'error')

          return
        }

        Object.keys(form.model.actions)
          .forEach(async(key): Promise<void> => {
            if (typeof form.model.actions !== 'undefined') {
              const actionId = form.model.actions[key].action

              let action = null

              if (actionId !== null) {
                action = Action.find(actionId)

                if (action === null) {
                  result = false

                  return
                }
              }

              if (form.model.actions[key].type === ActionItemType.DEVICE_ACTION) {
                if (form.model.actions[key].selected) {
                  if (action !== null) {
                    await Action.update({
                      where: action.id,
                      data: {
                        value: form.model.actions[key].operation,
                      },
                    })
                  } else {
                    const property = DeviceProperty
                      .query()
                      .with('deviceBackward')
                      .where('id', key)
                      .has('deviceBackward')
                      .first()

                    if (property !== null) {
                      await Action.insert({
                        data: {
                          id: uuid.v4().toString(),
                          trigger: trigger.value,
                          triggerId,
                          draft: true,
                          type: ActionEntityTypeType.DEVICE_PROPERTY,
                          enabled: true,
                          value: form.model.actions[key].operation,
                          device: property.deviceBackward?.identifier,
                          property: property.property,
                        },
                      })
                    } else {
                      result = false
                    }
                  }
                } else {
                  Action.dispatch('remove', {
                    action,
                  })
                    .catch(() => {
                      context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
                    })
                }
              } else if (form.model.actions[key].type === ActionItemType.CHANNEL_ACTION) {
                if (form.model.actions[key].selected) {
                  if (action !== null) {
                    await Action.update({
                      where: action.id,
                      data: {
                        value: form.model.actions[key].operation,
                      },
                    })
                  } else {
                    const property = ChannelProperty
                      .query()
                      .with('channelBackward')
                      .with('channelBackward.deviceBackward')
                      .has('channelBackward')
                      .where('id', key)
                      .first()

                    if (property !== null) {
                      await Action.insert({
                        data: {
                          id: uuid.v4().toString(),
                          trigger: trigger.value,
                          triggerId,
                          draft: true,
                          type: ActionEntityTypeType.CHANNEL_PROPERTY,
                          enabled: true,
                          value: form.model.actions[key].operation,
                          device: property.channelBackward?.deviceBackward?.identifier,
                          channel: property.channelBackward?.channel,
                          property: property.property,
                        },
                      })
                    } else {
                      result = false
                    }
                  }
                } else {
                  Action.dispatch('remove', {
                    action,
                  })
                    .catch(() => {
                      context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
                    })
                }
              }
            }
          })
      }

      if (result) {
        openView(ViewTypes.GENERAL_INFO)
      } else {
        context.root.$flashMessage(context.root.$t('application.messages.unknownError').toString(), 'error')
      }
    }

    async function submitDate(): Promise<void> {
      let result = true

      if (typeof form.model.date !== 'undefined') {
        if (form.model.date.condition !== null) {
          const condition = Condition.find(form.model.date.condition)

          if (condition !== null) {
            await Condition.update({
              where: condition.id,
              data: {
                date: form.model.date.date,
              },
            })
          } else {
            result = false
          }
        } else {
          await Condition.insert({
            data: {
              id: uuid.v4().toString(),
              trigger: trigger.value,
              triggerId,
              draft: true,
              type: ConditionEntityTypeType.DATE,
              enabled: true,
              date: form.model.date.date,
            },
          })
        }
      }

      if (result) {
        openView(ViewTypes.GENERAL_INFO)
      } else {
        context.root.$flashMessage(context.root.$t('application.messages.unknownError').toString(), 'error')
      }
    }

    async function submitTime(): Promise<void> {
      let result = true

      if (typeof form.model.time !== 'undefined') {
        if (form.model.time.condition !== null) {
          const condition = Condition.find(form.model.time.condition)

          if (condition !== null) {
            await Condition.update({
              where: condition.id,
              data: {
                time: form.model.time.time,
                days: form.model.time.days,
              },
            })
          } else {
            result = false
          }
        } else {
          await Condition.insert({
            data: {
              id: uuid.v4().toString(),
              trigger: trigger.value,
              triggerId,
              draft: true,
              type: ConditionEntityTypeType.TIME,
              enabled: true,
              time: form.model.time.time,
              days: form.model.time.days,
            },
          })
        }
      }

      if (result) {
        openView(ViewTypes.GENERAL_INFO)
      } else {
        context.root.$flashMessage(context.root.$t('application.messages.unknownError').toString(), 'error')
      }
    }

    function submitTrigger(): void {
      remoteSubmit.value = true
    }

    function closeCreateTrigger(): void {
      closeView()

      if (windowSize.value === 'xs') {
        context.root.$router.push(context.root.localePath({
          name: context.root.$routes.triggers.detail,
          params: {
            id: triggerId,
          },
        }))
      } else {
        context.root.$router.push(context.root.localePath({
          name: context.root.$routes.triggers.list,
          hash: `${TRIGGERS_HASH_DETAIL}-${triggerId}`,
        }))
      }
    }

    const submitBtnShow = computed<boolean>((): boolean => {
      return !(view.triggerType.show || view.listConditionDevices.show || view.listActionDevices.show)
    })

    const cancelBtnText = computed<string>((): string => {
      if (view.triggerType.show || view.generalInfo.show) {
        return context.root.$t('application.buttons.close.title').toString()
      }

      return context.root.$t('application.buttons.back.title').toString()
    })

    function submitBtnCallback(): void {
      if (view.generalInfo.show) {
        submitTrigger()
      } else if (view.selectConditionDevice.show) {
        submitConditionDevice()
      } else if (view.selectActionDevice.show) {
        submitActionDevice()
      } else if (view.configureDate.show) {
        submitDate()
      } else if (view.configureTime.show) {
        submitTime()
      }
    }

    function cancelBtnCallback(): void {
      if (view.triggerType.show || view.generalInfo.show) {
        closeView()
      } else if (
        view.configureDate.show ||
        view.configureTime.show ||
        view.listActionDevices.show ||
        view.listConditionDevices.show
      ) {
        openView(ViewTypes.GENERAL_INFO)
      } else if (view.selectActionDevice.show) {
        openView(ViewTypes.LIST_ACTION_DEVICES)
      } else if (view.selectConditionDevice.show) {
        openView(ViewTypes.LIST_CONDITION_DEVICES)
      }
    }

    function openedType(): string {
      if (view.selectActionDevice.show || view.selectConditionDevice.show) {
        return 'select-device'
      } else if (view.listActionDevices.show || view.listConditionDevices.show) {
        return 'list-devices'
      } else if (view.configureDate.show || view.configureTime.show) {
        return 'select-date-time'
      }

      return 'other'
    }

    return {
      remoteSubmit,
      remoteFormResult,
      hasConditionDate,
      hasConditionTime,
      hasConditionDevice,
      hasActionDevice,
      view,
      form,
      trigger,
      submitBtnShow,
      cancelBtnText,
      conditions,
      actions,
      submitBtnCallback,
      cancelBtnCallback,
      openView,
      closeView,
      triggerType,
      listConditionDevices,
      listActionDevices,
      closeCreateTrigger,
      openedType,
      viewTypes: ViewTypes,
      selectDeviceViewTypes: SelectViewType,
      triggerTypes: TriggerType,
      sizeTypes: FbSizeTypes,
      formResultTypes: FbFormResultType,
      buttonVariantTypes: FbUiButtonVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
