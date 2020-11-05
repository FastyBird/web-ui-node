<template>
  <fb-ui-modal-form
    :lock-submit-button="remoteFormResult !== formResultTypes.NONE"
    :state="remoteFormResult"
    class="fb-triggers-desktop-create__container"
    @submit="submitTrigger"
    @cancel="closeWindow"
    @close="closeWindow"
  >
    <fb-ui-modal-header
      v-if="view.triggerType.show"
      slot="modal-header"
      @close="closeWindow"
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
      v-if="view.generalInfo.show"
      slot="modal-header"
      @close="closeWindow"
    >
      <font-awesome-icon
        v-if="view.generalInfo.type === triggerTypes.TIME_SCHEDULED"
        slot="icon"
        icon="clock"
        class="fb-triggers-desktop-create__icon"
      />

      <font-awesome-icon
        v-if="view.generalInfo.type === triggerTypes.DATE_SCHEDULED"
        slot="icon"
        icon="calendar"
        class="fb-triggers-desktop-create__icon"
      />

      <font-awesome-icon
        v-if="view.generalInfo.type === triggerTypes.DEVICE"
        slot="icon"
        icon="plug"
        class="fb-triggers-desktop-create__icon"
      />

      <font-awesome-icon
        v-if="view.generalInfo.type === triggerTypes.SENSOR"
        slot="icon"
        icon="thermometer-half"
        class="fb-triggers-desktop-create__icon"
      />

      <font-awesome-icon
        v-if="view.generalInfo.type === triggerTypes.MANUAL"
        slot="icon"
        icon="gamepad"
        class="fb-triggers-desktop-create__icon"
      />

      <template
        v-if="view.generalInfo.type === triggerTypes.TIME_SCHEDULED"
        slot="heading"
      >
        {{ $t('triggers.headings.createTimeScheduledTrigger') }}
      </template>

      <template
        v-if="view.generalInfo.type === triggerTypes.DATE_SCHEDULED"
        slot="heading"
      >
        {{ $t('triggers.headings.createDateScheduledTrigger') }}
      </template>

      <template
        v-if="view.generalInfo.type === triggerTypes.DEVICE"
        slot="heading"
      >
        {{ $t('triggers.headings.createDeviceTrigger') }}
      </template>

      <template
        v-if="view.generalInfo.type === triggerTypes.SENSOR"
        slot="heading"
      >
        {{ $t('triggers.headings.createSensorTrigger') }}
      </template>

      <template
        v-if="view.generalInfo.type === triggerTypes.MANUAL"
        slot="heading"
      >
        {{ $t('triggers.headings.createManualTrigger') }}
      </template>

      <template slot="description">
        Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
        consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
      </template>
    </fb-ui-modal-header>

    <fb-ui-modal-header
      v-if="view.listConditionDevices.show || view.listActionDevices.show"
      slot="modal-header"
      @close="closeWindow"
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
      v-if="view.selectConditionDevice.show && view.selectConditionDevice.device !== null"
      slot="modal-header"
      @close="closeWindow"
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
      v-if="view.selectActionDevice.show && view.selectActionDevice.device !== null"
      slot="modal-header"
      @close="closeWindow"
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
      v-if="view.configureTime.show"
      slot="modal-header"
      @close="closeWindow"
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

    <div
      slot="form"
      class="fb-triggers-desktop-create__content"
    >
      <fb-ui-transition-expand>
        <div
          v-if="view.triggerType.show"
          class="fb-triggers-desktop-create__select-type"
        >
          <div class="fb-triggers-desktop-create__select-type-item">
            <fb-ui-button
              block
              variant="outline-primary"
              name="scheduled"
              size="lg"
              @click.prevent="triggerType(triggerTypes.TIME_SCHEDULED)"
            >
              <font-awesome-icon icon="clock" />
              {{ $t('triggers.buttons.addTypeTimeOfDay.title') }}
            </fb-ui-button>
          </div>
          <div class="fb-triggers-desktop-create__select-type-item">
            <fb-ui-button
              block
              variant="outline-primary"
              name="device"
              size="lg"
              @click.prevent="triggerType(triggerTypes.DEVICE)"
            >
              <font-awesome-icon icon="plug" />
              {{ $t('triggers.buttons.addTypeDeviceControlled.title') }}
            </fb-ui-button>
          </div>
          <div class="fb-triggers-desktop-create__select-type-item">
            <fb-ui-button
              block
              variant="outline-primary"
              name="sensor"
              size="lg"
              @click.prevent="triggerType(triggerTypes.SENSOR)"
            >
              <font-awesome-icon icon="thermometer-half" />
              {{ $t('triggers.buttons.addTypeSensorDetect.title') }}
            </fb-ui-button>
          </div>
          <div class="fb-triggers-desktop-create__select-type-item">
            <fb-ui-button
              block
              variant="outline-primary"
              name="scene"
              size="lg"
              @click.prevent="triggerType(triggerTypes.MANUAL)"
            >
              <font-awesome-icon icon="gamepad" />
              {{ $t('triggers.buttons.addTypeManual.title') }}
            </fb-ui-button>
          </div>
        </div>
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <div
          v-if="view.generalInfo.show"
          class="fb-triggers-desktop-create__content"
        >
          <trigger-create
            :trigger="trigger"
            :type="view.generalInfo.type"
            :remote-submit.sync="remoteSubmit"
            :remote-form-result.sync="remoteFormResult"
            @addCondition="openWindow(viewTypes.LIST_CONDITION_DEVICES)"
            @addAction="openWindow(viewTypes.LIST_ACTION_DEVICES)"
            @addTimeSchedule="openWindow(viewTypes.CONFIGURE_TIME)"
            @addDateSchedule="openWindow(viewTypes.CONFIGURE_DATE)"
            @close="close"
          />
        </div>
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <div
          v-if="view.listConditionDevices.show"
          class="fb-triggers-desktop-create__content"
        >
          <triggers-list-devices
            :type="selectDeviceViewTypes.SENSORS"
            :items="conditions"
            @select="listConditionDevices"
          />
        </div>
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <div
          v-if="view.listActionDevices.show"
          class="fb-triggers-desktop-create__content"
        >
          <triggers-list-devices
            :type="selectDeviceViewTypes.ACTORS"
            :items="actions"
            @select="listActionDevices"
          />
        </div>
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <div
          v-if="view.selectConditionDevice.show && Object.keys(form.model.conditions).length > 0"
          class="fb-triggers-desktop-create__content"
        >
          <triggers-select-condition-device
            v-model="form.model.conditions"
            :device="view.selectConditionDevice.device"
          />
        </div>
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <div
          v-if="view.selectActionDevice.show && Object.keys(form.model.actions).length > 0"
          class="fb-triggers-desktop-create__content"
        >
          <triggers-select-action-device
            v-model="form.model.actions"
            :device="view.selectActionDevice.device"
          />
        </div>
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <div
          v-if="view.configureTime.show && Object.keys(form.model.time).length > 0"
          class="fb-triggers-desktop-create__content"
        >
          <triggers-select-time v-model="form.model.time" />
        </div>
      </fb-ui-transition-expand>
    </div>

    <template
      v-if="!view.generalInfo.show"
      slot="modal-footer"
    >
      <fb-ui-button
        v-if="view.triggerType.show"
        uppercase
        variant="link"
        size="lg"
        name="close"
        @click.prevent="closeWindow"
      >
        {{ $t('application.buttons.close.title') }}
      </fb-ui-button>

      <template v-if="view.listConditionDevices.show || view.listActionDevices.show">
        <fb-ui-button
          uppercase
          variant="link"
          size="lg"
          name="back"
          @click.prevent="openWindow(viewTypes.GENERAL_INFO)"
        >
          {{ $t('application.buttons.back.title') }}
        </fb-ui-button>
      </template>

      <template v-if="view.selectConditionDevice.show">
        <fb-ui-button
          uppercase
          variant="link"
          size="lg"
          name="back"
          @click.prevent="openWindow(viewTypes.LIST_CONDITION_DEVICES)"
        >
          {{ $t('application.buttons.back.title') }}
        </fb-ui-button>

        <fb-ui-button
          uppercase
          variant="outline-primary"
          size="lg"
          name="add"
          @click.prevent="submitConditionDevice"
        >
          <template v-if="hasConditionDevice">
            {{ $t('triggers.buttons.updateDevice.title') }}
          </template>
          <template v-else>
            {{ $t('triggers.buttons.addDevice.title') }}
          </template>
        </fb-ui-button>
      </template>

      <template v-if="view.selectActionDevice.show">
        <fb-ui-button
          uppercase
          variant="link"
          size="lg"
          name="back"
          @click.prevent="openWindow(viewTypes.LIST_ACTION_DEVICES)"
        >
          {{ $t('application.buttons.back.title') }}
        </fb-ui-button>

        <fb-ui-button
          uppercase
          variant="outline-primary"
          size="lg"
          name="add"
          @click.prevent="submitActionDevice"
        >
          <template v-if="hasActionDevice">
            {{ $t('triggers.buttons.updateDevice.title') }}
          </template>
          <template v-else>
            {{ $t('triggers.buttons.addDevice.title') }}
          </template>
        </fb-ui-button>
      </template>

      <template v-if="view.configureDate.show">
        <fb-ui-button
          uppercase
          variant="outline-primary"
          size="lg"
          name="add"
          @click.prevent="submitDate"
        >
          <template v-if="hasConditionDate">
            {{ $t('triggers.buttons.updateDate.title') }}
          </template>
          <template v-else>
            {{ $t('triggers.buttons.addDate.title') }}
          </template>
        </fb-ui-button>
      </template>

      <template v-if="view.configureTime.show">
        <fb-ui-button
          uppercase
          variant="outline-primary"
          size="lg"
          name="add"
          @click.prevent="submitTime"
        >
          <template v-if="hasConditionTime">
            {{ $t('triggers.buttons.updateTime.title') }}
          </template>
          <template v-else>
            {{ $t('triggers.buttons.addTime.title') }}
          </template>
        </fb-ui-button>
      </template>
    </template>
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

import { FbFormResultType } from '@fastybird/web-ui-theme'

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
      }
    })

    // Open info window
    function openWindow(type: ViewTypes): void {
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
    function closeWindow(): void {
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
      }

      view[ViewTypes.GENERAL_INFO].type = type

      openWindow(ViewTypes.GENERAL_INFO)
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

      openWindow(ViewTypes.SELECT_CONDITION_DEVICE)
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

      openWindow(ViewTypes.SELECT_ACTION_DEVICE)
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
        openWindow(ViewTypes.GENERAL_INFO)
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
                  await Action.dispatch('remove', {
                    action,
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
                  await Action.dispatch('remove', {
                    action,
                  })
                }
              }
            }
          })
      }

      if (result) {
        openWindow(ViewTypes.GENERAL_INFO)
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
        openWindow(ViewTypes.GENERAL_INFO)
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
        openWindow(ViewTypes.GENERAL_INFO)
      } else {
        context.root.$flashMessage(context.root.$t('application.messages.unknownError').toString(), 'error')
      }
    }

    function submitTrigger(): void {
      remoteSubmit.value = true
    }

    function close(): void {
      closeWindow()

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
      viewTypes: ViewTypes,
      selectDeviceViewTypes: SelectViewType,
      triggerTypes: TriggerType,
      conditions,
      actions,
      openWindow,
      closeWindow,
      triggerType,
      listConditionDevices,
      listActionDevices,
      submitConditionDevice,
      submitActionDevice,
      submitDate,
      submitTime,
      submitTrigger,
      close,
      formResultTypes: FbFormResultType,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
