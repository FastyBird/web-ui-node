<template>
  <fb-ui-modal-form
    :lock-submit-button="remoteFormResult !== formResultTypes.NONE"
    :state="remoteFormResult"
    :submit-btn-text="$t('application.buttons.done.title')"
    :submit-btn-show="submitBtnShow"
    :cancel-btn-text="cancelBtnText"
    :variant="modalVariant"
    :data-type="openedType"
    @submit="handleSubmit"
    @cancel="handleCancel"
    @close="handleCloseView"
    class="fb-triggers-desktop-create__container"
  >
    <fb-ui-modal-header
      slot="modal-header"
      v-if="view.triggerType.opened"
      :variant="modalVariant"
      :ok-btn-text="$t('application.buttons.done.title')"
      :ok-btn-show="submitBtnShow"
      :cancel-btn-text="cancelBtnText"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @close="handleCloseView"
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
      v-if="view.generalInfo.opened"
      :variant="modalVariant"
      :ok-btn-text="$t('application.buttons.done.title')"
      :ok-btn-show="submitBtnShow"
      :cancel-btn-text="cancelBtnText"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @close="handleCloseView"
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
      v-if="view.listConditionDevices.opened || view.listActionDevices.opened"
      :variant="modalVariant"
      :ok-btn-text="$t('application.buttons.done.title')"
      :ok-btn-show="submitBtnShow"
      :cancel-btn-text="cancelBtnText"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @close="handleCloseView"
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
      v-if="view.selectConditionDevice.opened && view.selectConditionDevice.device !== null"
      :variant="modalVariant"
      :ok-btn-text="$t('application.buttons.done.title')"
      :ok-btn-show="submitBtnShow"
      :cancel-btn-text="cancelBtnText"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @close="handleCloseView"
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
      v-if="view.selectActionDevice.opened && view.selectActionDevice.device !== null"
      :variant="modalVariant"
      :ok-btn-text="$t('application.buttons.done.title')"
      :ok-btn-show="submitBtnShow"
      :cancel-btn-text="cancelBtnText"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @close="handleCloseView"
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
      v-if="view.configureTime.opened"
      :variant="modalVariant"
      :ok-btn-text="$t('application.buttons.done.title')"
      :ok-btn-show="submitBtnShow"
      :cancel-btn-text="cancelBtnText"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @close="handleCloseView"
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

    <template slot="form">
      <div
        v-if="view.triggerType.opened"
        class="fb-triggers-desktop-create__select-type"
      >
        <div class="fb-triggers-desktop-create__select-type-item">
          <fb-ui-button
            :variant="buttonVariantTypes.OUTLINE_PRIMARY"
            :size="sizeTypes.LARGE"
            @click.prevent="handleSelectType(triggerTypes.TIME_SCHEDULED)"
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
            @click.prevent="handleSelectType(triggerTypes.DEVICE)"
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
            @click.prevent="handleSelectType(triggerTypes.SENSOR)"
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
            @click.prevent="handleSelectType(triggerTypes.MANUAL)"
            block
            name="scene"
          >
            <font-awesome-icon icon="gamepad" />
            {{ $t('triggers.buttons.addTypeManual.title') }}
          </fb-ui-button>
        </div>
      </div>

      <triggers-create-general
        v-if="view.generalInfo.opened"
        :trigger="trigger"
        :type="view.generalInfo.type"
        :remote-form-submit.sync="remoteFormSubmit"
        :remote-form-result.sync="remoteFormResult"
        @addCondition="handleOpenView(viewTypes.LIST_CONDITION_DEVICES)"
        @addAction="handleOpenView(viewTypes.LIST_ACTION_DEVICES)"
        @addTimeSchedule="handleOpenView(viewTypes.CONFIGURE_TIME)"
        @addDateSchedule="handleOpenView(viewTypes.CONFIGURE_DATE)"
        @created="$emit('created', triggerId, $event)"
      />

      <triggers-list-devices
        v-if="view.listConditionDevices.opened"
        :type="selectDeviceViewTypes.SENSORS"
        :items="conditions"
        @select="handleListConditionDevices"
      />

      <triggers-list-devices
        v-if="view.listActionDevices.opened"
        :type="selectDeviceViewTypes.ACTORS"
        :items="actions"
        @select="handleListActionDevices"
      />

      <triggers-select-condition-device
        v-if="view.selectConditionDevice.opened && Object.keys(form.model.conditions).length > 0"
        v-model="form.model.conditions"
        :device="view.selectConditionDevice.device"
      />

      <triggers-select-action-device
        v-if="view.selectActionDevice.opened && Object.keys(form.model.actions).length > 0"
        v-model="form.model.actions"
        :device="view.selectActionDevice.device"
      />

      <triggers-select-time
        v-if="view.configureTime.opened && Object.keys(form.model.time).length > 0"
        v-model="form.model.time"
      />
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

import {
  FbSizeTypes,
  FbFormResultTypes,
  FbUiButtonVariantTypes,
  FbUiModalVariantTypes,
} from '@fastybird/web-ui-theme'

import Trigger from '~/models/triggers-module/triggers/Trigger'
import { TriggerEntityTypes } from '~/models/triggers-module/triggers/types'

import { DeviceInterface } from '~/models/devices-module/devices/types'

import TriggersCreateGeneral from '~/components/triggers/Create/General/index.vue'
import TriggersListDevices, { ViewType as SelectViewTypes } from '~/components/triggers/ListDevices/index.vue'
import TriggersSelectConditionDevice from '~/components/triggers/SelectConditionDevice/index.vue'
import TriggersSelectTime from '~/components/triggers/SelectTime/index.vue'
import TriggersSelectActionDevice from '~/components/triggers/SelectActionDevice/index.vue'

import useTriggerCreate, { TriggersCreateFormInterface, TriggerTypes } from '~/components/triggers/Create/create.ts'

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

interface TriggersDesktopCreateViewInterface {
  triggerType: {
    opened: boolean
  }
  generalInfo: {
    opened: boolean
    type: TriggerTypes
  }
  listConditionDevices: {
    opened: boolean
  }
  listActionDevices: {
    opened: boolean
  }
  selectConditionDevice: {
    opened: boolean
    device: DeviceInterface | null
  }
  selectActionDevice: {
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

interface TriggersDesktopCreatePropsInterface {
  type: string
}

export default defineComponent({

  name: 'TriggersDesktopCreate',

  components: {
    TriggersCreateGeneral,
    TriggersListDevices,
    TriggersSelectConditionDevice,
    TriggersSelectTime,
    TriggersSelectActionDevice,
  },

  setup(props: TriggersDesktopCreatePropsInterface, context: SetupContext) {
    const form = reactive<TriggersCreateFormInterface>({
      model: {},
    })

    const remoteFormSubmit = ref<boolean>(false)
    const remoteFormResult = ref<FbFormResultTypes>(FbFormResultTypes.NONE)

    const view = reactive<TriggersDesktopCreateViewInterface>({
      triggerType: {
        opened: true,
      },
      generalInfo: {
        opened: false,
        type: TriggerTypes.DEVICE,
      },
      listConditionDevices: {
        opened: false,
      },
      listActionDevices: {
        opened: false,
      },
      selectConditionDevice: {
        opened: false,
        device: null,
      },
      selectActionDevice: {
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

    const openedType = computed<string>((): string => {
      if (view.selectActionDevice.opened || view.selectConditionDevice.opened) {
        return 'select-device'
      } else if (view.listActionDevices.opened || view.listConditionDevices.opened) {
        return 'list-devices'
      } else if (view.configureDate.opened || view.configureTime.opened) {
        return 'select-date-time'
      } else if (view.generalInfo.opened) {
        return 'general'
      }

      return 'other'
    })

    const submitBtnShow = computed<boolean>((): boolean => {
      return !(view.triggerType.opened || view.listConditionDevices.opened || view.listActionDevices.opened)
    })

    const cancelBtnText = computed<string>((): string => {
      if (view.triggerType.opened || view.generalInfo.opened) {
        return context.root.$t('application.buttons.cancel.title').toString()
      }

      return context.root.$t('application.buttons.back.title').toString()
    })

    const {
      triggerId,
      conditions,
      actions,
      trigger,
      configureDate,
      configureTime,
      configureDeviceCondition,
      configureDeviceAction,
      submitConditionDevice,
      submitActionDevice,
      submitDate,
      submitTime,
      destroy,
    } = useTriggerCreate(view.generalInfo.type, form)

    function handleOpenView(type: ViewTypes): void {
      if (type === ViewTypes.CONFIGURE_TIME) {
        form.model.time = configureTime()
      } else if (type === ViewTypes.CONFIGURE_DATE) {
        form.model.date = configureDate()
      }

      view[type].opened = true

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
            view[key].opened = false
          }
        })
    }

    function handleCloseView(): void {
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
            view[key].opened = false
          }
        })

      context.emit('close')
    }

    function handleSelectType(type: TriggerTypes): void {
      if (type === TriggerTypes.MANUAL) {
        Trigger.dispatch('add', {
          id: triggerId,
          draft: true,
          data: {
            type: TriggerEntityTypes.MANUAL,
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
            type: TriggerEntityTypes.AUTOMATIC,
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

      handleOpenView(ViewTypes.GENERAL_INFO)
    }

    function handleSubmit(): void {
      if (view.generalInfo.opened) {
        remoteFormSubmit.value = true
      } else if (view.selectConditionDevice.opened) {
        try {
          if (submitConditionDevice()) {
            handleOpenView(ViewTypes.GENERAL_INFO)
          } else {
            context.root.$flashMessage(context.root.$t('triggers.messages.atLeastOneConditionProperty').toString(), 'error')
          }
        } catch (e) {
          context.root.$flashMessage(context.root.$t('application.messages.unknownError').toString(), 'error')
        }
      } else if (view.selectActionDevice.opened) {
        try {
          if (submitActionDevice()) {
            handleOpenView(ViewTypes.GENERAL_INFO)
          } else {
            context.root.$flashMessage(context.root.$t('triggers.messages.atLeastOneActionProperty').toString(), 'error')
          }
        } catch (e) {
          context.root.$flashMessage(context.root.$t('application.messages.unknownError').toString(), 'error')
        }
      } else if (view.configureDate.opened) {
        try {
          if (submitDate()) {
            handleOpenView(ViewTypes.GENERAL_INFO)
          }
        } catch (e) {
          context.root.$flashMessage(context.root.$t('application.messages.unknownError').toString(), 'error')
        }
      } else if (view.configureTime.opened) {
        try {
          if (submitTime()) {
            handleOpenView(ViewTypes.GENERAL_INFO)
          }
        } catch (e) {
          context.root.$flashMessage(context.root.$t('application.messages.unknownError').toString(), 'error')
        }
      }
    }

    function handleCancel(): void {
      if (view.triggerType.opened || view.generalInfo.opened) {
        handleCloseView()
      } else if (
        view.configureDate.opened ||
        view.configureTime.opened ||
        view.listActionDevices.opened ||
        view.listConditionDevices.opened
      ) {
        handleOpenView(ViewTypes.GENERAL_INFO)
      } else if (view.selectActionDevice.opened) {
        handleOpenView(ViewTypes.LIST_ACTION_DEVICES)
      } else if (view.selectConditionDevice.opened) {
        handleOpenView(ViewTypes.LIST_CONDITION_DEVICES)
      }
    }

    function handleListConditionDevices(device: DeviceInterface): void {
      form.model.conditions = configureDeviceCondition(device)

      view[ViewTypes.SELECT_CONDITION_DEVICE].device = device

      handleOpenView(ViewTypes.SELECT_CONDITION_DEVICE)
    }

    function handleListActionDevices(device: DeviceInterface): void {
      form.model.actions = configureDeviceAction(device)

      view[ViewTypes.SELECT_ACTION_DEVICE].device = device

      handleOpenView(ViewTypes.SELECT_ACTION_DEVICE)
    }

    onUnmounted((): void => {
      try {
        destroy()
      } catch (e) {
        context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
      }
    })

    return {
      triggerId,
      view,
      openedType,
      remoteFormSubmit,
      remoteFormResult,
      form,
      trigger,
      submitBtnShow,
      cancelBtnText,
      conditions,
      actions,
      handleSubmit,
      handleCancel,
      handleOpenView,
      handleCloseView,
      handleSelectType,
      handleListConditionDevices,
      handleListActionDevices,
      modalVariant: context.root.$windowSize.isExtraSmall() ? FbUiModalVariantTypes.PHONE : (!context.root.$windowSize.isExtraLarge() ? FbUiModalVariantTypes.TABLET : FbUiModalVariantTypes.DEFAULT),
      viewTypes: ViewTypes,
      selectDeviceViewTypes: SelectViewTypes,
      triggerTypes: TriggerTypes,
      sizeTypes: FbSizeTypes,
      formResultTypes: FbFormResultTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
