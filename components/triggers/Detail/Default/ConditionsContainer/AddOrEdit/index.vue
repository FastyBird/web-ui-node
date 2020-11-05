<template>
  <fb-ui-modal-form
    :lock-submit-button="formResult !== formResultTypes.NONE"
    :state="formResult"
    :submit-btn-label="submitBtnLabel"
    :cancel-btn-label="cancelBtnLabel"
    class="fb-triggers-detail-default-conditions-container-add-or-edit__container"
    @submit="submitBtnCallback"
    @cancel="cancelBtnCallback"
    @close="closeWindow"
  >
    <fb-ui-modal-header
      v-if="view.selectType.show"
      slot="modal-header"
      @close="closeWindow"
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
      v-if="view.listDevices.show"
      slot="modal-header"
      @close="closeWindow"
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
      v-if="view.listSensors.show"
      slot="modal-header"
      @close="closeWindow"
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
      v-if="view.configureTime.show"
      slot="modal-header"
      @close="closeWindow"
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
      v-if="view.configureDate.show"
      slot="modal-header"
      @close="closeWindow"
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
      v-if="view.selectDevice.show && view.selectDevice.device !== null"
      slot="modal-header"
      @close="closeWindow"
    >
      <font-awesome-icon
        slot="icon"
        :icon="view.selectDevice.device.icon"
        class="fb-triggers-detail-default-conditions-container-add-or-edit__icon"
      />

      <template slot="heading">
        {{ view.selectDevice.device.title }}
      </template>

      <template slot="description">
        Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
        consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
      </template>
    </fb-ui-modal-header>

    <fb-ui-modal-header
      v-if="view.selectSensor.show && view.selectSensor.device !== null"
      slot="modal-header"
      @close="closeWindow"
    >
      <font-awesome-icon
        slot="icon"
        :icon="view.selectSensor.device.icon"
        class="fb-triggers-detail-default-conditions-container-add-or-edit__icon"
      />

      <template slot="heading">
        {{ view.selectSensor.device.title }}
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
      <fb-ui-transition-expand>
        <div
          v-if="view.selectType.show"
          class="fb-triggers-detail-default-conditions-container-add-or-edit__type"
        >
          <div class="fb-triggers-detail-default-conditions-container-add-or-edit__type-row">
            <div class="fb-triggers-detail-default-conditions-container-add-or-edit__type-row-item">
              <fb-ui-button
                :disabled="trigger.isTime"
                block
                variant="outline-primary"
                size="lg"
                name="condition"
                @click.prevent="openWindow(viewTypes.CONFIGURE_DATE)"
              >
                <font-awesome-icon icon="calendar" />
                {{ $t('triggers.buttons.addTypeDate.title') }}
              </fb-ui-button>
            </div>

            <div class="fb-triggers-detail-default-conditions-container-add-or-edit__type-row-item">
              <fb-ui-button
                :disabled="trigger.isDate"
                block
                variant="outline-primary"
                size="lg"
                name="condition"
                @click.prevent="openWindow(viewTypes.CONFIGURE_TIME)"
              >
                <font-awesome-icon icon="clock" />
                {{ $t('triggers.buttons.addTypeTimeOfDay.title') }}
              </fb-ui-button>
            </div>

            <div class="fb-triggers-detail-default-conditions-container-add-or-edit__type-row-item">
              <fb-ui-button
                block
                variant="outline-primary"
                size="lg"
                name="condition"
                @click.prevent="openWindow(viewTypes.LIST_DEVICES)"
              >
                <font-awesome-icon icon="plug" />
                {{ $t('triggers.buttons.addTypeDeviceControlled.title') }}
              </fb-ui-button>
            </div>

            <div class="fb-triggers-detail-default-conditions-container-add-or-edit__type-row-item">
              <fb-ui-button
                block
                variant="outline-primary"
                size="lg"
                name="sensor"
                @click.prevent="openWindow(viewTypes.LIST_SENSORS)"
              >
                <font-awesome-icon icon="thermometer-half" />
                {{ $t('triggers.buttons.addTypeSensorDetect.title') }}
              </fb-ui-button>
            </div>
          </div>
        </div>
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <triggers-list-devices
          v-if="view.listDevices.show"
          :type="selectDeviceViewTypes.DEVICES"
          :items="conditions"
          @select="listDevices"
        />
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <triggers-list-devices
          v-if="view.listSensors.show"
          :type="selectDeviceViewTypes.SENSORS"
          :items="conditions"
          @select="listSensors"
        />
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <triggers-select-condition-device
          v-if="view.selectDevice.show && Object.keys(form.model.devices).length > 0"
          v-model="form.model.devices"
          :device="view.selectDevice.device"
        />
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <triggers-select-condition-device
          v-if="view.selectSensor.show && Object.keys(form.model.devices).length > 0"
          v-model="form.model.devices"
          :device="view.selectSensor.device"
        />
      </fb-ui-transition-expand>

      <triggers-select-time
        v-if="view.configureTime.show && Object.keys(form.model.time).length > 0"
        v-model="form.model.time"
      />

      <fb-ui-transition-expand>
        <triggers-select-date
          v-if="view.configureDate.show && Object.keys(form.model.date).length > 0"
          v-model="form.model.date"
        />
      </fb-ui-transition-expand>
    </div>

    <template
      v-if="view.selectType.show || view.listDevices.show || view.listSensors.show"
      slot="modal-footer"
    >
      <fb-ui-button
        v-if="view.listDevices.show || view.listSensors.show"
        uppercase
        variant="link"
        size="lg"
        name="close"
        @click.prevent="openWindow(viewTypes.SELECT_TYPE)"
      >
        {{ $t('application.buttons.back.title') }}
      </fb-ui-button>

      <fb-ui-button
        v-else
        uppercase
        variant="link"
        size="lg"
        name="close"
        @click.prevent="closeWindow"
      >
        {{ $t('application.buttons.close.title') }}
      </fb-ui-button>
    </template>
  </fb-ui-modal-form>
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

import { FbFormResultType } from '@fastybird/web-ui-theme'

import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import Condition from '~/models/triggers-node/conditions/Condition'
import {
  ConditionEntityTypeType,
  ConditionInterface,
} from '~/models/triggers-node/conditions/types'
import { ConditionOperatorType } from '~/models/triggers-node/types'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import DeviceProperty from '~/models/devices-node/device-properties/DeviceProperty'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'

import TriggersListDevices, { ViewType as SelectViewType } from '~/components/triggers/ListDevices/index.vue'
import TriggersSelectConditionDevice from '~/components/triggers/SelectConditionDevice/index.vue'
import TriggersSelectDate from '~/components/triggers/SelectDate/index.vue'
import TriggersSelectTime from '~/components/triggers/SelectTime/index.vue'

enum ViewTypes {
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

interface TriggersDetailDefaultConditionsContainerAddOrEditFormModelDeviceInterface {
  selected: boolean
  operator: ConditionOperatorType
  operand: string | boolean | null
  type: ItemType
  condition: string | null
}

interface TriggersDetailDefaultConditionsContainerAddOrEditFormModelTimeInterface {
  selected: boolean
  time: string
  days: Array<number>
  condition: string | null
}

interface TriggersDetailDefaultConditionsContainerAddOrEditFormModelDateInterface {
  selected: boolean
  date: string
  condition: string | null
}

interface TriggersDetailDefaultConditionsContainerAddOrEditFormModelInterface {
  devices?: { [key: string]: TriggersDetailDefaultConditionsContainerAddOrEditFormModelDeviceInterface }
  time?: TriggersDetailDefaultConditionsContainerAddOrEditFormModelTimeInterface
  date?: TriggersDetailDefaultConditionsContainerAddOrEditFormModelDateInterface
}

interface TriggersDetailDefaultConditionsContainerAddOrEditFormInterface {
  model: TriggersDetailDefaultConditionsContainerAddOrEditFormModelInterface
}

interface TriggersDetailDefaultConditionsAddOrEditViewSelectTypeInterface {
  show: boolean
}

interface TriggersDetailDefaultConditionsAddOrEditViewListDevicesInterface {
  show: boolean
}

interface TriggersDetailDefaultConditionsAddOrEditViewListSensorsInterface {
  show: boolean
}

interface TriggersDetailDefaultConditionsAddOrEditViewSelectDeviceInterface {
  show: boolean
  device: DeviceInterface | null
}

interface TriggersDetailDefaultConditionsAddOrEditViewSelectSensorInterface {
  show: boolean
  device: DeviceInterface | null
}

interface TriggersDetailDefaultConditionsAddOrEditViewConfigureTimeInterface {
  show: boolean
}

interface TriggersDetailDefaultConditionsAddOrEditViewConfigureDateInterface {
  show: boolean
}

interface TriggersDetailDefaultConditionsAddOrEditViewInterface {
  selectType: TriggersDetailDefaultConditionsAddOrEditViewSelectTypeInterface
  listDevices: TriggersDetailDefaultConditionsAddOrEditViewListDevicesInterface
  listSensors: TriggersDetailDefaultConditionsAddOrEditViewListSensorsInterface
  selectDevice: TriggersDetailDefaultConditionsAddOrEditViewSelectDeviceInterface
  selectSensor: TriggersDetailDefaultConditionsAddOrEditViewSelectSensorInterface
  configureTime: TriggersDetailDefaultConditionsAddOrEditViewConfigureTimeInterface
  configureDate: TriggersDetailDefaultConditionsAddOrEditViewConfigureDateInterface
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

    const formResult = ref<FbFormResultType>(FbFormResultType.NONE)

    const view = reactive<TriggersDetailDefaultConditionsAddOrEditViewInterface>({
      selectType: {
        show: true,
      },
      listDevices: {
        show: false,
      },
      listSensors: {
        show: false,
      },
      selectDevice: {
        show: false,
        device: null,
      },
      selectSensor: {
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

    const form = reactive<TriggersDetailDefaultConditionsContainerAddOrEditFormInterface>({
      model: {},
    })

    // Processing timer
    let timer: number

    // Open info window
    function openWindow(type: ViewTypes): void {
      if (type === ViewTypes.CONFIGURE_TIME) {
        form.model.devices = {}

        const condition = Condition
          .query()
          .where('triggerId', props.trigger.id)
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
        const condition = Condition
          .query()
          .where('triggerId', props.trigger.id)
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
              key === ViewTypes.SELECT_TYPE ||
              key === ViewTypes.SELECT_DEVICE ||
              key === ViewTypes.SELECT_SENSOR ||
              key === ViewTypes.LIST_DEVICES ||
              key === ViewTypes.LIST_SENSORS ||
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
            key === ViewTypes.SELECT_TYPE ||
            key === ViewTypes.SELECT_DEVICE ||
            key === ViewTypes.SELECT_SENSOR ||
            key === ViewTypes.LIST_DEVICES ||
            key === ViewTypes.LIST_SENSORS ||
            key === ViewTypes.CONFIGURE_TIME ||
            key === ViewTypes.CONFIGURE_DATE
          ) {
            view[key].show = false
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
                  operator: ConditionOperatorType.STATE_VALUE_EQUAL,
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
              operator: ConditionOperatorType.STATE_VALUE_EQUAL,
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

    function listDevices(device: DeviceInterface): void {
      listDevicesOrSensors(device)

      view[ViewTypes.SELECT_DEVICE].device = device

      openWindow(ViewTypes.SELECT_DEVICE)
    }

    function listSensors(device: DeviceInterface): void {
      listDevicesOrSensors(device)

      view[ViewTypes.SELECT_SENSOR].device = device

      openWindow(ViewTypes.SELECT_SENSOR)
    }

    // Form could not be submitted
    function error(): void {
      window.clearInterval(timer)

      formResult.value = FbFormResultType.NONE
    }

    async function submitTime(): Promise<void> {
      formResult.value = FbFormResultType.WORKING

      let result = true

      if (typeof form.model.time !== 'undefined') {
        if (form.model.time.condition !== null) {
          const condition = Condition.find(form.model.time.condition)

          if (condition !== null) {
            await Condition.dispatch('edit', {
              condition,
              data: {
                time: form.model.time.time,
                days: form.model.time.days,
              },
            })
          } else {
            result = false
          }
        } else {
          await Condition.dispatch('add', {
            trigger: props.trigger,
            data: {
              type: ConditionEntityTypeType.TIME,
              enabled: true,
              time: form.model.time.time,
              days: form.model.time.days,
            },
          })
        }
      }

      if (result) {
        formResult.value = FbFormResultType.OK

        timer = window.setInterval(closeWindow, 2000)
      } else {
        formResult.value = FbFormResultType.ERROR

        timer = window.setInterval(error, 2000)
      }
    }

    async function submitDate(): Promise<void> {
      formResult.value = FbFormResultType.WORKING

      let result = true

      if (typeof form.model.date !== 'undefined') {
        if (form.model.date.condition !== null) {
          const condition = Condition.find(form.model.date.condition)

          if (condition !== null) {
            await Condition.dispatch('edit', {
              condition,
              data: {
                date: form.model.date.date,
              },
            })
          } else {
            result = false
          }
        } else {
          await Condition.dispatch('add', {
            trigger: props.trigger,
            data: {
              type: ConditionEntityTypeType.DATE,
              enabled: true,
              date: form.model.date.date,
            },
          })
        }
      }

      if (result) {
        formResult.value = FbFormResultType.OK

        timer = window.setInterval(closeWindow, 2000)
      } else {
        formResult.value = FbFormResultType.ERROR

        timer = window.setInterval(error, 2000)
      }
    }

    function submitDeviceOrSensor(): void {
      formResult.value = FbFormResultType.WORKING

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

          formResult.value = FbFormResultType.NONE

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
                    await Condition.dispatch('edit', {
                      condition,
                      data: {
                        operator: form.model.devices[key].operator,
                        operand: form.model.devices[key].operand,
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
                      await Condition.dispatch('add', {
                        trigger: props.trigger,
                        data: {
                          type: ConditionEntityTypeType.DEVICE_PROPERTY,
                          enabled: true,
                          operator: form.model.devices[key].operator,
                          operand: form.model.devices[key].operand,
                          device: property.deviceBackward?.identifier,
                          property: property.property,
                        },
                      })
                    } else {
                      result = false
                    }
                  }
                } else {
                  await Condition.dispatch('remove', {
                    condition,
                  })
                }
              } else if (form.model.devices[key].type === ItemType.CHANNEL_CONDITION) {
                if (form.model.devices[key].selected) {
                  if (condition !== null) {
                    await Condition.dispatch('edit', {
                      condition,
                      data: {
                        operator: form.model.devices[key].operator,
                        operand: form.model.devices[key].operand,
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
                      await Condition.dispatch('add', {
                        trigger: props.trigger,
                        data: {
                          type: ConditionEntityTypeType.CHANNEL_PROPERTY,
                          enabled: true,
                          operator: form.model.devices[key].operator,
                          operand: form.model.devices[key].operand,
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
                  await Condition.dispatch('remove', {
                    condition,
                  })
                }
              }
            }
          })
      }

      if (result) {
        formResult.value = FbFormResultType.OK

        timer = window.setInterval(closeWindow, 2000)
      } else {
        formResult.value = FbFormResultType.ERROR

        timer = window.setInterval(error, 2000)
      }
    }

    function submitBtnCallback(): void {
      if (view.selectDevice.show) {
        submitDeviceOrSensor()
      } else if (view.selectSensor.show) {
        submitDeviceOrSensor()
      } else if (view.configureDate.show) {
        submitDate()
      } else if (view.configureTime.show) {
        submitTime()
      }
    }

    function cancelBtnCallback(): void {
      if (view.selectDevice.show) {
        openWindow(ViewTypes.LIST_DEVICES)
      } else if (view.selectSensor.show) {
        openWindow(ViewTypes.LIST_SENSORS)
      } else if (view.configureDate.show) {
        openWindow(ViewTypes.SELECT_TYPE)
      } else if (view.configureTime.show) {
        openWindow(ViewTypes.SELECT_TYPE)
      }
    }

    const submitBtnLabel = computed<string>((): string => {
      if (view.selectDevice.show) {
        return hasConditionDevice.value ? context.root.$t('triggers.buttons.updateDevice.title').toString() : context.root.$t('triggers.buttons.addDevice.title').toString()
      } else if (view.selectSensor.show) {
        return hasConditionDevice.value ? context.root.$t('triggers.buttons.updateSensor.title').toString() : context.root.$t('triggers.buttons.addSensor.title').toString()
      } else if (view.configureDate.show) {
        return hasConditionDate.value ? context.root.$t('triggers.buttons.updateDate.title').toString() : context.root.$t('triggers.buttons.addDate.title').toString()
      } else if (view.configureTime.show) {
        return hasConditionTime.value ? context.root.$t('triggers.buttons.updateTime.title').toString() : context.root.$t('triggers.buttons.addTime.title').toString()
      }

      return context.root.$t('application.buttons.save.title').toString()
    })

    const cancelBtnLabel = computed<string>((): string => {
      return context.root.$t('application.buttons.back.title').toString()
    })

    return {
      hasConditionDate,
      hasConditionTime,
      hasConditionDevice,
      formResult,
      view,
      form,
      submitBtnLabel,
      cancelBtnLabel,
      viewTypes: ViewTypes,
      selectDeviceViewTypes: SelectViewType,
      formResultTypes: FbFormResultType,
      cancelBtnCallback,
      submitBtnCallback,
      openWindow,
      closeWindow,
      listDevicesOrSensors,
      listDevices,
      listSensors,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
