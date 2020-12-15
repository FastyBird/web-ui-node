<template>
  <fb-ui-modal-form
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
    class="fb-triggers-detail-default-actions-container-add-or-edit__container"
  >
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
        class="fb-triggers-detail-default-actions-container-add-or-edit__icon"
      />

      <template slot="heading">
        {{ windowScreen.selectDevice.device.title }}
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
      <triggers-list-devices
        v-if="windowScreen.listDevices.opened"
        :type="selectDeviceViewTypes.ACTORS"
        :items="actions"
        @select="handleListDevices"
      />

      <triggers-select-action-device
        v-if="windowScreen.selectDevice.opened && Object.keys(form.model.devices).length > 0"
        v-model="form.model.devices"
        :device="windowScreen.selectDevice.device"
      />
    </div>
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

import get from 'lodash/get'

import {
  FbSizeTypes,
  FbFormResultTypes,
  FbUiModalVariantTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import { TriggerInterface } from '~/models/triggers-module/triggers/types'
import Action from '~/models/triggers-module/actions/Action'
import {
  ActionEntityTypes,
  ActionInterface,
} from '~/models/triggers-module/actions/types'

import { DeviceInterface } from '~/models/devices-module/devices/types'
import DeviceProperty from '~/models/devices-module/device-properties/DeviceProperty'
import ChannelProperty from '~/models/devices-module/channel-properties/ChannelProperty'

import TriggersListDevices, { ViewType as SelectViewTypes } from '~/components/triggers/ListDevices/index.vue'
import TriggersSelectActionDevice from '~/components/triggers/SelectActionDevice/index.vue'

enum WindowScreenTypes {
  LIST_DEVICES = 'listDevices',
  SELECT_DEVICE = 'selectDevice',
}

enum ItemType {
  DEVICE_ACTION = 'deviceAction',
  CHANNEL_ACTION = 'channelAction',
}

interface TriggersDetailDefaultActionsContainerAddOrEditFormInterface {
  model: {
    devices?: {
      [key: string]: {
        selected: boolean
        operation: string | boolean | null
        type: ItemType
        action: string | null
      }
    }
  }
}

interface TriggersDetailDefaultActionsAddOrEditWindowInterface {
  listDevices: {
    opened: boolean
  }
  selectDevice: {
    opened: boolean
    device: DeviceInterface | null
  }
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

    const formResult = ref<FbFormResultTypes>(FbFormResultTypes.NONE)

    const windowScreen = reactive<TriggersDetailDefaultActionsAddOrEditWindowInterface>({
      listDevices: {
        opened: true,
      },
      selectDevice: {
        opened: false,
        device: null,
      },
    })

    const form = reactive<TriggersDetailDefaultActionsContainerAddOrEditFormInterface>({
      model: {},
    })

    const openedType = computed<string>((): string => {
      if (windowScreen.listDevices.opened) {
        return 'list-devices'
      }

      return 'select-device'
    })

    let timer: number

    function handleOpenWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = true

      Object.keys(windowScreen)
        .forEach((key: string): void => {
          if (
            (
              key === WindowScreenTypes.LIST_DEVICES ||
              key === WindowScreenTypes.SELECT_DEVICE
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
            key === WindowScreenTypes.LIST_DEVICES ||
            key === WindowScreenTypes.SELECT_DEVICE
          ) {
            windowScreen[key].opened = false
          }
        })

      window.clearInterval(timer)

      context.emit('close')
    }

    function handleListDevices(device: DeviceInterface): void {
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

      windowScreen[WindowScreenTypes.SELECT_DEVICE].device = device

      handleOpenWindow(WindowScreenTypes.SELECT_DEVICE)
    }

    function error(): void {
      window.clearInterval(timer)

      formResult.value = FbFormResultTypes.NONE
    }

    function handleSubmit(): void {
      formResult.value = FbFormResultTypes.WORKING

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

          formResult.value = FbFormResultTypes.NONE

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
                    const errorMessage = context.root.$t('triggers.messages.actionNotUpdated', {
                      trigger: props.trigger.name,
                    }).toString()

                    try {
                      await Action.dispatch('edit', {
                        action,
                        data: {
                          value: form.model.devices[key].operation,
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
                      const errorMessage = context.root.$t('triggers.messages.actionNotCreated', {
                        trigger: props.trigger.name,
                      }).toString()

                      try {
                        await Action.dispatch('add', {
                          trigger: props.trigger,
                          data: {
                            type: ActionEntityTypes.DEVICE_PROPERTY,
                            enabled: true,
                            value: form.model.devices[key].operation,
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
                  const errorMessage = context.root.$t('triggers.messages.actionNotRemoved', {
                    trigger: props.trigger.name,
                  }).toString()

                  try {
                    await Action.dispatch('remove', {
                      action,
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
              } else if (form.model.devices[key].type === ItemType.CHANNEL_ACTION) {
                if (form.model.devices[key].selected) {
                  if (action !== null) {
                    const errorMessage = context.root.$t('triggers.messages.actionNotUpdated', {
                      trigger: props.trigger.name,
                    }).toString()

                    try {
                      await Action.dispatch('edit', {
                        action,
                        data: {
                          value: form.model.devices[key].operation,
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
                      const errorMessage = context.root.$t('triggers.messages.actionNotCreated', {
                        trigger: props.trigger.name,
                      }).toString()

                      try {
                        await Action.dispatch('add', {
                          trigger: props.trigger,
                          data: {
                            type: ActionEntityTypes.CHANNEL_PROPERTY,
                            enabled: true,
                            value: form.model.devices[key].operation,
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
                  const errorMessage = context.root.$t('triggers.messages.actionNotRemoved', {
                    trigger: props.trigger.name,
                  }).toString()

                  try {
                    await Action.dispatch('remove', {
                      action,
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

    function handleCancel(): void {
      if (windowScreen.selectDevice.opened) {
        handleOpenWindow(WindowScreenTypes.LIST_DEVICES)
      } else {
        handleCloseWindow()
      }
    }

    const cancelBtnText = computed<string>((): string => {
      if (windowScreen.selectDevice.opened) {
        return context.root.$t('application.buttons.back.title').toString()
      }

      return context.root.$t('application.buttons.cancel.title').toString()
    })

    return {
      hasActionDevice,
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
      modalVariant: context.root.$windowSize.isExtraSmall() ? FbUiModalVariantTypes.PHONE : (!context.root.$windowSize.isExtraLarge() ? FbUiModalVariantTypes.TABLET : FbUiModalVariantTypes.DEFAULT),
      windowScreenTypes: WindowScreenTypes,
      selectDeviceViewTypes: SelectViewTypes,
      formResultTypes: FbFormResultTypes,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
