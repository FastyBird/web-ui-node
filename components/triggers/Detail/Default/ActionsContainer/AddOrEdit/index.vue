<template>
  <fb-ui-modal-form
    :lock-submit-button="formResult !== formResultTypes.NONE"
    :state="formResult"
    :submit-btn-label="submitBtnLabel"
    :cancel-btn-label="cancelBtnLabel"
    :variant="'phone'"
    class="fb-triggers-detail-default-actions-container-add-or-edit__container"
    @submit="submitBtnCallback"
    @cancel="cancelBtnCallback"
    @close="closeWindow"
  >
    <fb-ui-modal-header
      v-if="view.listDevices.show"
      slot="modal-header"
      @close="closeWindow"
    >
      <font-awesome-icon
        slot="icon"
        icon="magic"
        class="fb-triggers-detail-default-actions-container-add-or-edit__icon"
      />

      <template slot="heading">
        {{ $t('triggers.headings.typeActor') }}
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
        class="fb-triggers-detail-default-actions-container-add-or-edit__icon"
      />

      <template slot="heading">
        {{ view.selectDevice.device.title }}
      </template>

      <template slot="description">
        Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
        consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.
      </template>
    </fb-ui-modal-header>

    <div
      slot="form"
      class="fb-triggers-detail-default-actions-container-add-or-edit__content"
    >
      <fb-ui-transition-expand>
        <triggers-list-devices
          v-if="view.listDevices.show"
          :type="selectDeviceViewTypes.ACTORS"
          :items="actions"
          @select="listDevices"
        />
      </fb-ui-transition-expand>

      <triggers-select-action-device
        v-if="view.selectDevice.show && Object.keys(form.model.devices).length > 0"
        v-model="form.model.devices"
        :device="view.selectDevice.device"
      />
    </div>

    <template
      v-if="view.listDevices.show"
      slot="modal-footer"
    >
      <fb-ui-button
        v-if="view.listDevices.show"
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
import Action from '~/models/triggers-node/actions/Action'
import {
  ActionEntityTypeType,
  ActionInterface,
} from '~/models/triggers-node/actions/types'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import DeviceProperty from '~/models/devices-node/device-properties/DeviceProperty'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'

import TriggersListDevices, { ViewType as SelectViewType } from '~/components/triggers/ListDevices/index.vue'
import TriggersSelectActionDevice from '~/components/triggers/SelectActionDevice/index.vue'

enum ViewTypes {
  LIST_DEVICES = 'listDevices',
  SELECT_DEVICE = 'selectDevice',
}

enum ItemType {
  DEVICE_ACTION = 'deviceAction',
  CHANNEL_ACTION = 'channelAction',
}

interface TriggersDetailDefaultActionsContainerAddOrEditFormModelDeviceInterface {
  selected: boolean
  operation: string | boolean | null
  type: ItemType
  action: string | null
}

interface TriggersDetailDefaultActionsContainerAddOrEditFormModelInterface {
  devices?: { [key: string]: TriggersDetailDefaultActionsContainerAddOrEditFormModelDeviceInterface }
}

interface TriggersDetailDefaultActionsContainerAddOrEditFormInterface {
  model: TriggersDetailDefaultActionsContainerAddOrEditFormModelInterface
}

interface TriggersDetailDefaultActionsAddOrEditViewListDevicesInterface {
  show: boolean
}

interface TriggersDetailDefaultActionsAddOrEditViewSelectDeviceInterface {
  show: boolean
  device: DeviceInterface | null
}

interface TriggersDetailDefaultActionsAddOrEditViewInterface {
  listDevices: TriggersDetailDefaultActionsAddOrEditViewListDevicesInterface
  selectDevice: TriggersDetailDefaultActionsAddOrEditViewSelectDeviceInterface
}

interface TriggersDetailDefaultActionsContainerAddOrEditPropsInterface {
  trigger: TriggerInterface
  actions: Array<ActionInterface>
}

export default defineComponent({

  name: 'TriggersDetailDefaultActionsContainerAddOrEdit',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

    actions: {
      type: Array as PropType<Array<ActionInterface>>,
      required: true,
    },

  },

  components: {
    TriggersListDevices,
    TriggersSelectActionDevice,
  },

  setup(props: TriggersDetailDefaultActionsContainerAddOrEditPropsInterface, context: SetupContext) {
    const hasActionDevice = ref<boolean>(false)

    const formResult = ref<FbFormResultType>(FbFormResultType.NONE)

    const view = reactive<TriggersDetailDefaultActionsAddOrEditViewInterface>({
      listDevices: {
        show: true,
      },
      selectDevice: {
        show: false,
        device: null,
      },
    })

    const form = reactive<TriggersDetailDefaultActionsContainerAddOrEditFormInterface>({
      model: {},
    })

    // Processing timer
    let timer: number

    // Open info window
    function openWindow(type: ViewTypes): void {
      view[type].show = true

      Object.keys(view)
        .forEach((key: string): void => {
          if (
            (
              key === ViewTypes.LIST_DEVICES ||
              key === ViewTypes.SELECT_DEVICE
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
            key === ViewTypes.LIST_DEVICES ||
            key === ViewTypes.SELECT_DEVICE
          ) {
            view[key].show = false
          }
        })

      window.clearInterval(timer)

      context.emit('close')
    }

    function listDevices(device: DeviceInterface): void {
      form.model.devices = {}

      device.channels
        .forEach((channel): void => {
          channel.properties
            .forEach((property): void => {
              if (typeof form.model.devices !== 'undefined') {
                form.model.devices[property.id] = {
                  selected: false,
                  operation: null,
                  type: ItemType.CHANNEL_ACTION,
                  action: null,
                }
              }
            })
        })

      device.properties
        .forEach((property): void => {
          if (typeof form.model.devices !== 'undefined') {
            form.model.devices[property.id] = {
              selected: false,
              operation: null,
              type: ItemType.DEVICE_ACTION,
              action: null,
            }
          }
        })

      props.actions
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
            Object.prototype.hasOwnProperty.call(form.model.devices, property.id) &&
            typeof form.model.devices !== 'undefined'
          ) {
            Object.assign(form.model.devices[property.id], {
              selected: true,
              operation: action.value,
              action: action.id,
            })
          }
        })

      Object.keys(form.model.devices)
        .forEach((key): void => {
          if (
            typeof form.model.devices !== 'undefined' &&
            form.model.devices[key].action !== null
          ) {
            hasActionDevice.value = true
          }
        })

      view[ViewTypes.SELECT_DEVICE].device = device

      openWindow(ViewTypes.SELECT_DEVICE)
    }

    // Form could not be submitted
    function error(): void {
      window.clearInterval(timer)

      formResult.value = FbFormResultType.NONE
    }

    function submitDevice(): void {
      formResult.value = FbFormResultType.WORKING

      let result = true

      if (typeof form.model.devices !== 'undefined') {
        let isValid = false

        Object.keys(form.model.devices)
          .forEach((key): void => {
            if (
              typeof form.model.devices !== 'undefined' &&
              form.model.devices[key].selected &&
              form.model.devices[key].operation !== null
            ) {
              isValid = true
            }
          })

        if (!isValid) {
          context.root.$flashMessage(context.root.$t('triggers.messages.atLeastOneActionProperty').toString(), 'error')

          formResult.value = FbFormResultType.NONE

          return
        }

        Object.keys(form.model.devices)
          .forEach(async(key): Promise<void> => {
            if (typeof form.model.devices !== 'undefined') {
              const actionId = form.model.devices[key].action

              let action = null

              if (actionId !== null) {
                action = Action.find(actionId)

                if (action === null) {
                  result = false

                  return
                }
              }

              if (form.model.devices[key].type === ItemType.DEVICE_ACTION) {
                if (form.model.devices[key].selected) {
                  if (action !== null) {
                    await Action.dispatch('edit', {
                      action,
                      data: {
                        value: form.model.devices[key].operation,
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
                      await Action.dispatch('add', {
                        trigger: props.trigger,
                        data: {
                          type: ActionEntityTypeType.DEVICE_PROPERTY,
                          enabled: true,
                          value: form.model.devices[key].operation,
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
              } else if (form.model.devices[key].type === ItemType.CHANNEL_ACTION) {
                if (form.model.devices[key].selected) {
                  if (action !== null) {
                    await Action.dispatch('edit', {
                      action,
                      data: {
                        value: form.model.devices[key].operation,
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
                      await Action.dispatch('add', {
                        trigger: props.trigger,
                        data: {
                          type: ActionEntityTypeType.CHANNEL_PROPERTY,
                          enabled: true,
                          value: form.model.devices[key].operation,
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
        formResult.value = FbFormResultType.OK

        timer = window.setInterval(closeWindow, 2000)
      } else {
        formResult.value = FbFormResultType.ERROR

        timer = window.setInterval(error, 2000)
      }
    }

    function submitBtnCallback(): void {
      if (view.selectDevice.show) {
        submitDevice()
      }
    }

    function cancelBtnCallback(): void {
      if (view.selectDevice.show) {
        openWindow(ViewTypes.LIST_DEVICES)
      }
    }

    const submitBtnLabel = computed<string>((): string => {
      if (view.selectDevice.show) {
        return hasActionDevice.value ? context.root.$t('triggers.buttons.updateDevice.title').toString() : context.root.$t('triggers.buttons.addDevice.title').toString()
      }

      return context.root.$t('application.buttons.save.title').toString()
    })

    const cancelBtnLabel = computed<string>((): string => {
      return context.root.$t('application.buttons.back.title').toString()
    })

    return {
      hasActionDevice,
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
      listDevices,
      submitDevice,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
