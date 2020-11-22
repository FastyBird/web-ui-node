<template>
  <div class="fb-triggers-detail-default-conditions-container-add-or-edit__outer">
    <template v-if="windowScreen.selectType.opened && $windowSize.isExtraSmall()">
      <fb-layout-phone-menu-content>
        <div class="fb-triggers-detail-default-conditions-container-add-or-edit__select-type">
          <template v-if="!trigger.isTime">
            <fb-ui-button
              :variant="buttonVariantTypes.LINK"
              @click.prevent="handleOpenWindow(windowScreenTypes.CONFIGURE_DATE)"
              block
              name="condition"
            >
              {{ $t('triggers.buttons.addTypeDate.title') }}
            </fb-ui-button>

            <fb-ui-divider :type="dividerVariantTypes.HORIZONTAL">
              {{ $t('application.misc.or') }}
            </fb-ui-divider>
          </template>

          <template v-if="!trigger.isDate">
            <fb-ui-button
              :variant="buttonVariantTypes.LINK"
              @click.prevent="handleOpenWindow(windowScreenTypes.CONFIGURE_TIME)"
              block
              name="action"
            >
              {{ $t('triggers.buttons.addTypeTimeOfDay.title') }}
            </fb-ui-button>

            <fb-ui-divider :type="dividerVariantTypes.HORIZONTAL">
              {{ $t('application.misc.or') }}
            </fb-ui-divider>
          </template>

          <fb-ui-button
            :variant="buttonVariantTypes.LINK"
            @click.prevent="handleOpenWindow(windowScreenTypes.LIST_DEVICES)"
            block
            name="action"
          >
            {{ $t('triggers.buttons.addTypeDeviceControlled.title') }}
          </fb-ui-button>

          <fb-ui-divider :type="dividerVariantTypes.HORIZONTAL">
            {{ $t('application.misc.or') }}
          </fb-ui-divider>

          <fb-ui-button
            :variant="buttonVariantTypes.LINK"
            @click.prevent="handleOpenWindow(windowScreenTypes.LIST_SENSORS)"
            block
            name="action"
          >
            {{ $t('triggers.buttons.addTypeSensorDetect.title') }}
          </fb-ui-button>
        </div>
      </fb-layout-phone-menu-content>

      <fb-layout-phone-menu-heading>
        {{ $t('triggers.headings.addNewCondition') }}
      </fb-layout-phone-menu-heading>

      <fb-layout-phone-menu-button>
        <fb-ui-button
          :variant="buttonVariantTypes.LINK"
          :size="sizeTypes.LARGE"
          @click.prevent="handleCloseWindow"
          block
          name="close"
        >
          {{ $t('application.buttons.close.title') }}
        </fb-ui-button>
      </fb-layout-phone-menu-button>
    </template>

    <fb-ui-modal-form
      v-else
      :lock-submit-button="formResult !== formResultTypes.NONE"
      :state="formResult"
      :submit-btn-text="$t('application.buttons.done.title')"
      :submit-btn-show="!windowScreen.listDevices.opened"
      :cancel-btn-text="cancelBtnText"
      :variant="modalVariant"
      :data-type="openedType"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @close="handleCloseWindow"
      class="fb-triggers-detail-default-conditions-container-add-or-edit__container"
    >
      <fb-ui-modal-header
        slot="modal-header"
        v-if="windowScreen.selectType.opened"
        :variant="modalVariant"
        :ok-btn-text="$t('application.buttons.done.title')"
        :ok-btn-show="!windowScreen.listDevices.opened"
        :cancel-btn-text="cancelBtnText"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @close="handleCloseWindow"
      >
        <font-awesome-icon
          slot="icon"
          icon="magic"
          class="fb-triggers-detail-default-conditions-container-add-or-edit__icon"
        />

        <template slot="heading">
          {{ $t('triggers.headings.addNewCondition') }}
        </template>

        <template slot="description">
          Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
          consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
        </template>
      </fb-ui-modal-header>

      <fb-ui-modal-header
        slot="modal-header"
        v-if="windowScreen.listDevices.opened"
        :variant="modalVariant"
        :ok-btn-text="$t('application.buttons.done.title')"
        :ok-btn-show="!windowScreen.listDevices.opened"
        :cancel-btn-text="cancelBtnText"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @close="handleCloseWindow"
      >
        <font-awesome-icon
          slot="icon"
          icon="plug"
          class="fb-triggers-detail-default-conditions-container-add-or-edit__icon"
        />

        <template slot="heading">
          {{ $t('triggers.headings.typeDevice') }}
        </template>

        <template slot="description">
          Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
          consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
        </template>
      </fb-ui-modal-header>

      <fb-ui-modal-header
        slot="modal-header"
        v-if="windowScreen.listSensors.opened"
        :variant="modalVariant"
        :ok-btn-text="$t('application.buttons.done.title')"
        :ok-btn-show="!windowScreen.listDevices.opened"
        :cancel-btn-text="cancelBtnText"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @close="handleCloseWindow"
      >
        <font-awesome-icon
          slot="icon"
          icon="thermometer-half"
          class="fb-triggers-detail-default-conditions-container-add-or-edit__icon"
        />

        <template slot="heading">
          {{ $t('triggers.headings.typeSensor') }}
        </template>

        <template slot="description">
          Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
          consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
        </template>
      </fb-ui-modal-header>

      <fb-ui-modal-header
        slot="modal-header"
        v-if="windowScreen.configureTime.opened"
        :variant="modalVariant"
        :ok-btn-text="$t('application.buttons.done.title')"
        :ok-btn-show="!windowScreen.listDevices.opened"
        :cancel-btn-text="cancelBtnText"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @close="handleCloseWindow"
      >
        <font-awesome-icon
          slot="icon"
          icon="clock"
          class="fb-triggers-detail-default-conditions-container-add-or-edit__icon"
        />

        <template slot="heading">
          {{ $t('triggers.headings.typeTime') }}
        </template>

        <template slot="description">
          Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
          consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
        </template>
      </fb-ui-modal-header>

      <fb-ui-modal-header
        slot="modal-header"
        v-if="windowScreen.configureDate.opened"
        :variant="modalVariant"
        :ok-btn-text="$t('application.buttons.done.title')"
        :ok-btn-show="!windowScreen.listDevices.opened"
        :cancel-btn-text="cancelBtnText"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @close="handleCloseWindow"
      >
        <font-awesome-icon
          slot="icon"
          icon="calendar"
          class="fb-triggers-detail-default-conditions-container-add-or-edit__icon"
        />

        <template slot="heading">
          {{ $t('triggers.headings.typeTime') }}
        </template>

        <template slot="description">
          Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
          consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
        </template>
      </fb-ui-modal-header>

      <fb-ui-modal-header
        slot="modal-header"
        v-if="windowScreen.selectDevice.opened && windowScreen.selectDevice.device !== null"
        :variant="modalVariant"
        :ok-btn-text="$t('application.buttons.done.title')"
        :ok-btn-show="!windowScreen.listDevices.opened"
        :cancel-btn-text="cancelBtnText"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @close="handleCloseWindow"
      >
        <font-awesome-icon
          slot="icon"
          :icon="windowScreen.selectDevice.device.icon"
          class="fb-triggers-detail-default-conditions-container-add-or-edit__icon"
        />

        <template slot="heading">
          {{ windowScreen.selectDevice.device.title }}
        </template>

        <template slot="description">
          Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
          consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
        </template>
      </fb-ui-modal-header>

      <fb-ui-modal-header
        slot="modal-header"
        v-if="windowScreen.selectSensor.opened && windowScreen.selectSensor.device !== null"
        :variant="modalVariant"
        :ok-btn-text="$t('application.buttons.done.title')"
        :ok-btn-show="!windowScreen.listDevices.opened"
        :cancel-btn-text="cancelBtnText"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @close="handleCloseWindow"
      >
        <font-awesome-icon
          slot="icon"
          :icon="windowScreen.selectSensor.device.icon"
          class="fb-triggers-detail-default-conditions-container-add-or-edit__icon"
        />

        <template slot="heading">
          {{ windowScreen.selectSensor.device.title }}
        </template>

        <template slot="description">
          Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
          consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
        </template>
      </fb-ui-modal-header>

      <div
        slot="form"
        class="fb-triggers-detail-default-conditions-container-add-or-edit__content"
      >
        <div
          v-if="windowScreen.selectType.opened"
          class="fb-triggers-detail-default-conditions-container-add-or-edit__type"
        >
          <div class="fb-triggers-detail-default-conditions-container-add-or-edit__type-row">
            <div class="fb-triggers-detail-default-conditions-container-add-or-edit__type-row-item">
              <fb-ui-button
                :disabled="trigger.isTime"
                :variant="buttonVariantTypes.OUTLINE_PRIMARY"
                :size="sizeTypes.LARGE"
                @click.prevent="handleOpenWindow(windowScreenTypes.CONFIGURE_DATE)"
                block
                name="condition"
              >
                <font-awesome-icon icon="calendar" />
                {{ $t('triggers.buttons.addTypeDate.title') }}
              </fb-ui-button>
            </div>

            <div class="fb-triggers-detail-default-conditions-container-add-or-edit__type-row-item">
              <fb-ui-button
                :disabled="trigger.isDate"
                :variant="buttonVariantTypes.OUTLINE_PRIMARY"
                :size="sizeTypes.LARGE"
                @click.prevent="handleOpenWindow(windowScreenTypes.CONFIGURE_TIME)"
                block
                name="condition"
              >
                <font-awesome-icon icon="clock" />
                {{ $t('triggers.buttons.addTypeTimeOfDay.title') }}
              </fb-ui-button>
            </div>

            <div class="fb-triggers-detail-default-conditions-container-add-or-edit__type-row-item">
              <fb-ui-button
                :variant="buttonVariantTypes.OUTLINE_PRIMARY"
                :size="sizeTypes.LARGE"
                @click.prevent="handleOpenWindow(windowScreenTypes.LIST_DEVICES)"
                block
                name="condition"
              >
                <font-awesome-icon icon="plug" />
                {{ $t('triggers.buttons.addTypeDeviceControlled.title') }}
              </fb-ui-button>
            </div>

            <div class="fb-triggers-detail-default-conditions-container-add-or-edit__type-row-item">
              <fb-ui-button
                :variant="buttonVariantTypes.OUTLINE_PRIMARY"
                :size="sizeTypes.LARGE"
                @click.prevent="handleOpenWindow(windowScreenTypes.LIST_SENSORS)"
                block
                name="condition"
              >
                <font-awesome-icon icon="thermometer-half" />
                {{ $t('triggers.buttons.addTypeSensorDetect.title') }}
              </fb-ui-button>
            </div>
          </div>
        </div>

        <triggers-list-devices
          v-if="windowScreen.listDevices.opened"
          :type="selectDeviceViewTypes.DEVICES"
          :items="conditions"
          @select="handleListDevices"
        />

        <triggers-list-devices
          v-if="windowScreen.listSensors.opened"
          :type="selectDeviceViewTypes.SENSORS"
          :items="conditions"
          @select="handleListSensors"
        />

        <triggers-select-condition-device
          v-if="windowScreen.selectDevice.opened && Object.keys(form.model.devices).length > 0"
          v-model="form.model.devices"
          :device="windowScreen.selectDevice.device"
        />

        <triggers-select-condition-device
          v-if="windowScreen.selectSensor.opened && Object.keys(form.model.devices).length > 0"
          v-model="form.model.devices"
          :device="windowScreen.selectSensor.device"
        />

        <triggers-select-time
          v-if="windowScreen.configureTime.opened && Object.keys(form.model.time).length > 0"
          v-model="form.model.time"
        />

        <triggers-select-date
          v-if="windowScreen.configureDate.opened && Object.keys(form.model.date).length > 0"
          v-model="form.model.date"
        />
      </div>

      <template
        slot="modal-footer"
        v-if="windowScreen.selectType.opened || windowScreen.listDevices.opened || windowScreen.listSensors.opened"
      >
        <fb-ui-button
          v-if="windowScreen.listDevices.opened || windowScreen.listSensors.opened"
          :variant="buttonVariantTypes.LINK"
          :size="sizeTypes.LARGE"
          @click.prevent="handleOpenWindow(windowScreenTypes.SELECT_TYPE)"
          uppercase
          name="close"
        >
          {{ $t('application.buttons.back.title') }}
        </fb-ui-button>

        <fb-ui-button
          v-else
          :variant="buttonVariantTypes.LINK"
          :size="sizeTypes.LARGE"
          @click.prevent="handleCloseWindow"
          uppercase
          name="close"
        >
          {{ $t('application.buttons.close.title') }}
        </fb-ui-button>
      </template>
    </fb-ui-modal-form>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref,
  reactive,
  SetupContext,
  computed,
} from '@vue/composition-api'

import get from 'lodash/get'

import {
  FbSizeTypes,
  FbFormResultTypes,
  FbUiModalVariantTypes,
  FbUiButtonVariantTypes,
  FbUiDividerVariantTypes,
} from '@fastybird/web-ui-theme'

import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import Condition from '~/models/triggers-node/conditions/Condition'
import {
  ConditionEntityTypes,
  ConditionInterface,
} from '~/models/triggers-node/conditions/types'
import { ConditionOperatorTypes } from '~/models/triggers-node/types'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import DeviceProperty from '~/models/devices-node/device-properties/DeviceProperty'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'

import TriggersListDevices, { ViewType as SelectViewTypes } from '~/components/triggers/ListDevices/index.vue'
import TriggersSelectConditionDevice from '~/components/triggers/SelectConditionDevice/index.vue'
import TriggersSelectDate from '~/components/triggers/SelectDate/index.vue'
import TriggersSelectTime from '~/components/triggers/SelectTime/index.vue'

enum WindowScreenTypes {
  SELECT_TYPE = 'selectType',
  SELECT_DEVICE = 'selectDevice',
  SELECT_SENSOR = 'selectSensor',
  LIST_DEVICES = 'listDevices',
  LIST_SENSORS = 'listSensors',
  CONFIGURE_TIME = 'configureTime',
  CONFIGURE_DATE = 'configureDate',
}

enum ItemType {
  DEVICE_CONDITION = 'deviceCondition',
  CHANNEL_CONDITION = 'channelCondition',
}

interface TriggersDetailDefaultConditionsContainerAddOrEditFormInterface {
  model: {
    devices?: {
      [key: string]: {
        selected: boolean
        operator: ConditionOperatorTypes
        operand: string | boolean | null
        type: ItemType
        condition: string | null
      }
    }
    time?: {
      selected: boolean
      time: string
      days: Array<number>
      condition: string | null
    }
    date?: {
      selected: boolean
      date: string
      condition: string | null
    }
  }
}

interface TriggersDetailDefaultConditionsAddOrEditWindowInterface {
  selectType: {
    opened: boolean
  }
  listDevices: {
    opened: boolean
  }
  listSensors: {
    opened: boolean
  }
  selectDevice: {
    opened: boolean
    device: DeviceInterface | null
  }
  selectSensor: {
    opened: boolean
    device: DeviceInterface | null
  }
  configureTime: {
    opened: boolean
  }
  configureDate: {
    opened: boolean
  }
}

interface TriggersDetailDefaultConditionsContainerAddOrEditPropsInterface {
  trigger: TriggerInterface
  conditions: Array<ConditionInterface>
}

export default defineComponent({

  name: 'TriggersDetailDefaultConditionsContainerAddOrEdit',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

    conditions: {
      type: Array as PropType<Array<ConditionInterface>>,
      required: true,
    },

  },

  components: {
    TriggersListDevices,
    TriggersSelectConditionDevice,
    TriggersSelectDate,
    TriggersSelectTime,
  },

  setup(props: TriggersDetailDefaultConditionsContainerAddOrEditPropsInterface, context: SetupContext) {
    const hasConditionDate = ref<boolean>(false)
    const hasConditionTime = ref<boolean>(false)
    const hasConditionDevice = ref<boolean>(false)

    const formResult = ref<FbFormResultTypes>(FbFormResultTypes.NONE)

    const windowScreen = reactive<TriggersDetailDefaultConditionsAddOrEditWindowInterface>({
      selectType: {
        opened: true,
      },
      listDevices: {
        opened: false,
      },
      listSensors: {
        opened: false,
      },
      selectDevice: {
        opened: false,
        device: null,
      },
      selectSensor: {
        opened: false,
        device: null,
      },
      configureTime: {
        opened: false,
      },
      configureDate: {
        opened: false,
      },
    })

    const form = reactive<TriggersDetailDefaultConditionsContainerAddOrEditFormInterface>({
      model: {},
    })

    const openedType = computed<string>((): string => {
      if (windowScreen.listDevices.opened) {
        return 'list-devices'
      }

      if (windowScreen.configureDate.opened || windowScreen.configureTime.opened) {
        return 'configure-date-time'
      }

      return 'select-device'
    })

    let timer: number

    function handleOpenWindow(type: WindowScreenTypes): void {
      if (type === WindowScreenTypes.CONFIGURE_TIME) {
        form.model.devices = {}

        const condition = Condition
          .query()
          .where('triggerId', props.trigger.id)
          .where('type', ConditionEntityTypes.TIME)
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
      } else if (type === WindowScreenTypes.CONFIGURE_DATE) {
        const condition = Condition
          .query()
          .where('triggerId', props.trigger.id)
          .where('type', ConditionEntityTypes.DATE)
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

      windowScreen[type].opened = true

      Object.keys(windowScreen)
        .forEach((key: string): void => {
          if (
            (
              key === WindowScreenTypes.SELECT_TYPE ||
              key === WindowScreenTypes.SELECT_DEVICE ||
              key === WindowScreenTypes.SELECT_SENSOR ||
              key === WindowScreenTypes.LIST_DEVICES ||
              key === WindowScreenTypes.LIST_SENSORS ||
              key === WindowScreenTypes.CONFIGURE_TIME ||
              key === WindowScreenTypes.CONFIGURE_DATE
            ) &&
            type !== key
          ) {
            windowScreen[key].opened = false
          }
        })
    }

    function handleCloseWindow(): void {
      Object.keys(windowScreen)
        .forEach((key: string): void => {
          if (
            key === WindowScreenTypes.SELECT_TYPE ||
            key === WindowScreenTypes.SELECT_DEVICE ||
            key === WindowScreenTypes.SELECT_SENSOR ||
            key === WindowScreenTypes.LIST_DEVICES ||
            key === WindowScreenTypes.LIST_SENSORS ||
            key === WindowScreenTypes.CONFIGURE_TIME ||
            key === WindowScreenTypes.CONFIGURE_DATE
          ) {
            windowScreen[key].opened = false
          }
        })

      window.clearInterval(timer)

      context.emit('close')
    }

    function listDevicesOrSensors(device: DeviceInterface): void {
      form.model.devices = {}

      device.channels
        .forEach((channel): void => {
          channel.properties
            .forEach((property): void => {
              if (typeof form.model.devices !== 'undefined') {
                form.model.devices[property.id] = {
                  selected: false,
                  type: ItemType.CHANNEL_CONDITION,
                  operator: ConditionOperatorTypes.STATE_VALUE_EQUAL,
                  operand: null,
                  condition: null,
                }
              }
            })
        })

      device.properties
        .forEach((property): void => {
          if (typeof form.model.devices !== 'undefined') {
            form.model.devices[property.id] = {
              selected: false,
              type: ItemType.DEVICE_CONDITION,
              operator: ConditionOperatorTypes.STATE_VALUE_EQUAL,
              operand: null,
              condition: null,
            }
          }
        })

      props.conditions
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
            Object.prototype.hasOwnProperty.call(form.model.devices, property.id) &&
            typeof form.model.devices !== 'undefined'
          ) {
            Object.assign(form.model.devices[property.id], {
              selected: true,
              operator: condition.operator,
              operand: condition.operand,
              condition: condition.id,
            })
          }
        })

      Object.keys(form.model.devices)
        .forEach((key): void => {
          if (
            typeof form.model.devices !== 'undefined' &&
            form.model.devices[key].condition !== null
          ) {
            hasConditionDevice.value = true
          }
        })
    }

    function handleListDevices(device: DeviceInterface): void {
      listDevicesOrSensors(device)

      windowScreen[WindowScreenTypes.SELECT_DEVICE].device = device

      handleOpenWindow(WindowScreenTypes.SELECT_DEVICE)
    }

    function handleListSensors(device: DeviceInterface): void {
      listDevicesOrSensors(device)

      windowScreen[WindowScreenTypes.SELECT_SENSOR].device = device

      handleOpenWindow(WindowScreenTypes.SELECT_SENSOR)
    }

    function error(): void {
      window.clearInterval(timer)

      formResult.value = FbFormResultTypes.NONE
    }

    async function submitTime(): Promise<void> {
      formResult.value = FbFormResultTypes.WORKING

      let result = true

      if (typeof form.model.time !== 'undefined') {
        if (form.model.time.condition !== null) {
          const condition = Condition.find(form.model.time.condition)

          if (condition !== null) {
            const errorMessage = context.root.$t('triggers.messages.conditionNotUpdated', {
              trigger: props.trigger.name,
            }).toString()

            try {
              await Condition.dispatch('edit', {
                condition,
                data: {
                  time: form.model.time.time,
                  days: form.model.time.days,
                },
              })
            } catch (e) {
              result = false

              if (get(e, 'exception', null) !== null) {
                context.root.handleException(e.exception, errorMessage)
              } else {
                context.root.$flashMessage(errorMessage, 'error')
              }
            }
          } else {
            result = false
          }
        } else {
          const errorMessage = context.root.$t('triggers.messages.conditionNotCreated', {
            trigger: props.trigger.name,
          }).toString()

          try {
            await Condition.dispatch('add', {
              trigger: props.trigger,
              data: {
                type: ConditionEntityTypes.TIME,
                enabled: true,
                time: form.model.time.time,
                days: form.model.time.days,
              },
            })
          } catch (e) {
            result = false

            if (get(e, 'exception', null) !== null) {
              context.root.handleException(e.exception, errorMessage)
            } else {
              context.root.$flashMessage(errorMessage, 'error')
            }
          }
        }
      }

      if (result) {
        formResult.value = FbFormResultTypes.OK

        timer = window.setInterval(handleCloseWindow, 2000)
      } else {
        formResult.value = FbFormResultTypes.ERROR

        timer = window.setInterval(error, 2000)
      }
    }

    async function submitDate(): Promise<void> {
      formResult.value = FbFormResultTypes.WORKING

      let result = true

      if (typeof form.model.date !== 'undefined') {
        if (form.model.date.condition !== null) {
          const condition = Condition.find(form.model.date.condition)

          if (condition !== null) {
            const errorMessage = context.root.$t('triggers.messages.conditionNotUpdated', {
              trigger: props.trigger.name,
            }).toString()

            try {
              await Condition.dispatch('edit', {
                condition,
                data: {
                  date: form.model.date.date,
                },
              })
            } catch (e) {
              result = false

              if (get(e, 'exception', null) !== null) {
                context.root.handleException(e.exception, errorMessage)
              } else {
                context.root.$flashMessage(errorMessage, 'error')
              }
            }
          } else {
            result = false
          }
        } else {
          const errorMessage = context.root.$t('triggers.messages.conditionNotCreated', {
            trigger: props.trigger.name,
          }).toString()

          try {
            await Condition.dispatch('add', {
              trigger: props.trigger,
              data: {
                type: ConditionEntityTypes.DATE,
                enabled: true,
                date: form.model.date.date,
              },
            })
          } catch (e) {
            result = false

            if (get(e, 'exception', null) !== null) {
              context.root.handleException(e.exception, errorMessage)
            } else {
              context.root.$flashMessage(errorMessage, 'error')
            }
          }
        }
      }

      if (result) {
        formResult.value = FbFormResultTypes.OK

        timer = window.setInterval(handleCloseWindow, 2000)
      } else {
        formResult.value = FbFormResultTypes.ERROR

        timer = window.setInterval(error, 2000)
      }
    }

    function submitDeviceOrSensor(): void {
      formResult.value = FbFormResultTypes.WORKING

      let result = true

      if (typeof form.model.devices !== 'undefined') {
        let isValid = false

        Object.keys(form.model.devices)
          .forEach((key): void => {
            if (
              typeof form.model.devices !== 'undefined' &&
              form.model.devices[key].selected &&
              form.model.devices[key].operand !== null
            ) {
              isValid = true
            }
          })

        if (!isValid) {
          context.root.$flashMessage(context.root.$t('triggers.messages.atLeastOneConditionProperty').toString(), 'error')

          formResult.value = FbFormResultTypes.NONE

          return
        }

        Object.keys(form.model.devices)
          .forEach(async(key): Promise<void> => {
            if (typeof form.model.devices !== 'undefined') {
              const conditionId = form.model.devices[key].condition

              let condition = null

              if (conditionId !== null) {
                condition = Condition.find(conditionId)

                if (condition === null) {
                  result = false

                  return
                }
              }

              if (form.model.devices[key].type === ItemType.DEVICE_CONDITION) {
                if (form.model.devices[key].selected) {
                  if (condition !== null) {
                    const errorMessage = context.root.$t('triggers.messages.conditionNotUpdated', {
                      trigger: props.trigger.name,
                    }).toString()

                    try {
                      await Condition.dispatch('edit', {
                        condition,
                        data: {
                          operator: form.model.devices[key].operator,
                          operand: form.model.devices[key].operand,
                        },
                      })
                    } catch (e) {
                      result = false

                      if (get(e, 'exception', null) !== null) {
                        context.root.handleException(e.exception, errorMessage)
                      } else {
                        context.root.$flashMessage(errorMessage, 'error')
                      }
                    }
                  } else {
                    const property = DeviceProperty
                      .query()
                      .with('deviceBackward')
                      .where('id', key)
                      .has('deviceBackward')
                      .first()

                    if (property !== null) {
                      const errorMessage = context.root.$t('triggers.messages.conditionNotCreated', {
                        trigger: props.trigger.name,
                      }).toString()

                      try {
                        await Condition.dispatch('add', {
                          trigger: props.trigger,
                          data: {
                            type: ConditionEntityTypes.DEVICE_PROPERTY,
                            enabled: true,
                            operator: form.model.devices[key].operator,
                            operand: form.model.devices[key].operand,
                            device: property.deviceBackward?.identifier,
                            property: property.property,
                          },
                        })
                      } catch (e) {
                        result = false

                        if (get(e, 'exception', null) !== null) {
                          context.root.handleException(e.exception, errorMessage)
                        } else {
                          context.root.$flashMessage(errorMessage, 'error')
                        }
                      }
                    } else {
                      result = false
                    }
                  }
                } else {
                  const errorMessage = context.root.$t('triggers.messages.conditionNotRemoved', {
                    trigger: props.trigger.name,
                  }).toString()

                  try {
                    await Condition.dispatch('remove', {
                      condition,
                    })
                  } catch (e) {
                    result = false

                    if (get(e, 'exception', null) !== null) {
                      context.root.handleException(e.exception, errorMessage)
                    } else {
                      context.root.$flashMessage(errorMessage, 'error')
                    }
                  }
                }
              } else if (form.model.devices[key].type === ItemType.CHANNEL_CONDITION) {
                if (form.model.devices[key].selected) {
                  if (condition !== null) {
                    const errorMessage = context.root.$t('triggers.messages.conditionNotUpdated', {
                      trigger: props.trigger.name,
                    }).toString()

                    try {
                      await Condition.dispatch('edit', {
                        condition,
                        data: {
                          operator: form.model.devices[key].operator,
                          operand: form.model.devices[key].operand,
                        },
                      })
                    } catch (e) {
                      result = false

                      if (get(e, 'exception', null) !== null) {
                        context.root.handleException(e.exception, errorMessage)
                      } else {
                        context.root.$flashMessage(errorMessage, 'error')
                      }
                    }
                  } else {
                    const property = ChannelProperty
                      .query()
                      .with('channelBackward')
                      .with('channelBackward.deviceBackward')
                      .has('channelBackward')
                      .where('id', key)
                      .first()

                    if (property !== null) {
                      const errorMessage = context.root.$t('triggers.messages.conditionNotCreated', {
                        trigger: props.trigger.name,
                      }).toString()

                      try {
                        await Condition.dispatch('add', {
                          trigger: props.trigger,
                          data: {
                            type: ConditionEntityTypes.CHANNEL_PROPERTY,
                            enabled: true,
                            operator: form.model.devices[key].operator,
                            operand: form.model.devices[key].operand,
                            device: property.channelBackward?.deviceBackward?.identifier,
                            channel: property.channelBackward?.channel,
                            property: property.property,
                          },
                        })
                      } catch (e) {
                        result = false

                        if (get(e, 'exception', null) !== null) {
                          context.root.handleException(e.exception, errorMessage)
                        } else {
                          context.root.$flashMessage(errorMessage, 'error')
                        }
                      }
                    } else {
                      result = false
                    }
                  }
                } else {
                  const errorMessage = context.root.$t('triggers.messages.conditionNotRemoved', {
                    trigger: props.trigger.name,
                  }).toString()

                  try {
                    await Condition.dispatch('remove', {
                      condition,
                    })
                  } catch (e) {
                    result = false

                    if (get(e, 'exception', null) !== null) {
                      context.root.handleException(e.exception, errorMessage)
                    } else {
                      context.root.$flashMessage(errorMessage, 'error')
                    }
                  }
                }
              }
            }
          })
      }

      if (result) {
        formResult.value = FbFormResultTypes.OK

        timer = window.setInterval(handleCloseWindow, 2000)
      } else {
        formResult.value = FbFormResultTypes.ERROR

        timer = window.setInterval(error, 2000)
      }
    }

    function handleSubmit(): void {
      if (windowScreen.selectDevice.opened) {
        submitDeviceOrSensor()
      } else if (windowScreen.selectSensor.opened) {
        submitDeviceOrSensor()
      } else if (windowScreen.configureDate.opened) {
        submitDate()
      } else if (windowScreen.configureTime.opened) {
        submitTime()
      }
    }

    function handleCancel(): void {
      if (windowScreen.selectDevice.opened) {
        handleOpenWindow(WindowScreenTypes.LIST_DEVICES)
      } else if (windowScreen.selectSensor.opened) {
        handleOpenWindow(WindowScreenTypes.LIST_SENSORS)
      } else {
        handleCloseWindow()
      }
    }

    const cancelBtnText = computed<string>((): string => {
      if (windowScreen.selectDevice.opened || windowScreen.selectSensor.opened) {
        return context.root.$t('application.buttons.back.title').toString()
      }

      return context.root.$t('application.buttons.cancel.title').toString()
    })

    return {
      hasConditionDate,
      hasConditionTime,
      hasConditionDevice,
      formResult,
      windowScreen,
      form,
      cancelBtnText,
      openedType,
      handleCancel,
      handleSubmit,
      handleOpenWindow,
      handleCloseWindow,
      handleListDevices,
      handleListSensors,
      modalVariant: context.root.$windowSize.isExtraSmall() ? FbUiModalVariantTypes.PHONE : (!context.root.$windowSize.isExtraLarge() ? FbUiModalVariantTypes.TABLET : FbUiModalVariantTypes.DEFAULT),
      windowScreenTypes: WindowScreenTypes,
      selectDeviceViewTypes: SelectViewTypes,
      formResultTypes: FbFormResultTypes,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
      dividerVariantTypes: FbUiDividerVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
