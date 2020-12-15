<template>
  <div class="fb-triggers-create-view__container">
    <client-only>
      <fb-layout-header-button
        :label="leftBtnText"
        :type="menuItemTypes.BUTTON"
        @click="handleLeftBtnCallback"
        small
        left
      />

      <fb-layout-header-button
        v-if="rightBtnShow"
        :label="$t('application.buttons.done.title')"
        :type="menuItemTypes.BUTTON"
        @click="handleRightBtnCallback"
        small
        right
      />

      <fb-layout-header-spacer small />

      <div
        v-if="remoteFormResult === formResultTypes.WORKING"
        class="fb-triggers-create-view__result"
      >
        <fb-ui-spinner />
      </div>

      <div
        v-if="remoteFormResult === formResultTypes.OK"
        class="fb-triggers-create-view__result"
      >
        <fb-ui-result-ok />
      </div>

      <div
        v-if="remoteFormResult === formResultTypes.ERROR"
        class="fb-triggers-create-view__result"
      >
        <fb-ui-result-err />
      </div>

      <triggers-create-general
        v-if="view.generalInfo.opened"
        :trigger="trigger"
        :type="$route.query.type"
        :remote-form-submit.sync="remoteFormSubmit"
        :remote-form-result.sync="remoteFormResult"
        @addCondition="handleOpenView(viewTypes.LIST_CONDITION_DEVICES)"
        @addAction="handleOpenView(viewTypes.LIST_ACTION_DEVICES)"
        @addTimeSchedule="handleOpenView(viewTypes.CONFIGURE_TIME)"
        @addDateSchedule="handleOpenView(viewTypes.CONFIGURE_DATE)"
        @created="handleTriggerCreated"
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

      <triggers-select-date
        v-if="view.configureDate.opened && Object.keys(form.model.date).length > 0"
        v-model="form.model.date"
      />

      <triggers-select-time
        v-if="view.configureTime.opened && Object.keys(form.model.time).length > 0"
        v-model="form.model.time"
      />

      <fb-ui-loading-box slot="placeholder">
        <p>
          {{ $t('triggers.texts.loadingTrigger') }}
        </p>
      </fb-ui-loading-box>
    </client-only>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import {
  FbFormResultTypes,
  FbMenuItemTypes,
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import Trigger from '~/models/triggers-module/triggers/Trigger'
import { TriggerEntityTypes } from '~/models/triggers-module/triggers/types'

import { DeviceInterface } from '~/models/devices-module/devices/types'

import TriggersCreateGeneral from '~/components/triggers/Create/General/index.vue'
import TriggersListDevices, { ViewType as SelectViewType } from '~/components/triggers/ListDevices/index.vue'
import TriggersSelectConditionDevice from '~/components/triggers/SelectConditionDevice/index.vue'
import TriggersSelectTime from '~/components/triggers/SelectTime/index.vue'
import TriggersSelectDate from '~/components/triggers/SelectDate/index.vue'
import TriggersSelectActionDevice from '~/components/triggers/SelectActionDevice/index.vue'

import useTriggerCreate, { TriggersCreateFormInterface, TriggerTypes } from '~/components/triggers/Create/create.ts'

import {
  TRIGGERS_HASH_CREATE,
} from '~/configuration/routes'

enum ViewTypes {
  GENERAL_INFO = 'generalInfo',
  LIST_CONDITION_DEVICES = 'listConditionDevices',
  LIST_ACTION_DEVICES = 'listActionDevices',
  SELECT_CONDITION_DEVICE = 'selectConditionDevice',
  SELECT_ACTION_DEVICE = 'selectActionDevice',
  CONFIGURE_TIME = 'configureTime',
  CONFIGURE_DATE = 'configureDate',
}

interface TriggerCreatePageViewInterface {
  generalInfo: {
    opened: boolean
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

export default defineComponent({

  name: 'TriggerCreatePage',

  transition: 'fade',

  components: {
    TriggersCreateGeneral,
    TriggersListDevices,
    TriggersSelectConditionDevice,
    TriggersSelectTime,
    TriggersSelectDate,
    TriggersSelectActionDevice,
  },

  setup(props: {}, context: SetupContext) {
    const isMounted = ref<boolean>(false)

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    const form = reactive<TriggersCreateFormInterface>({
      model: {},
    })

    const remoteFormSubmit = ref<boolean>(false)
    const remoteFormResult = ref<FbFormResultTypes>(FbFormResultTypes.NONE)

    const view = reactive<TriggerCreatePageViewInterface>({
      generalInfo: {
        opened: true,
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
    // @ts-ignore
    } = useTriggerCreate(context.root.$route.query.type, form)

    const leftBtnText = computed<string>((): string => {
      if (view.generalInfo.opened) {
        return context.root.$t('application.buttons.cancel.title').toString()
      }

      return context.root.$t('application.buttons.back.title').toString()
    })

    const rightBtnShow = computed<boolean>((): boolean => {
      return !(view.listConditionDevices.opened || view.listActionDevices.opened)
    })

    if (context.root.$route.query.type === TriggerTypes.MANUAL) {
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

    function setHeading(): void {
      let subHeading = null
      let icon = 'magic'

      if (context.root.$route.query.type === TriggerTypes.DATE_SCHEDULED) {
        subHeading = context.root.$t('triggers.subHeadings.createDateScheduledTrigger')
        icon = 'calendar'
      } else if (context.root.$route.query.type === TriggerTypes.TIME_SCHEDULED) {
        subHeading = context.root.$t('triggers.subHeadings.createTimeScheduledTrigger')
        icon = 'clock'
      } else if (context.root.$route.query.type === TriggerTypes.DEVICE) {
        subHeading = context.root.$t('triggers.subHeadings.createDeviceControlTrigger')
        icon = 'plug'
      } else if (context.root.$route.query.type === TriggerTypes.SENSOR) {
        subHeading = context.root.$t('triggers.subHeadings.createSensorTrigger')
        icon = 'thermometer-half'
      } else if (context.root.$route.query.type === TriggerTypes.MANUAL) {
        subHeading = context.root.$t('triggers.subHeadings.createManualTrigger')
        icon = 'gamepad'
      }

      context.root.$store.dispatch('app/setHeading', {
        heading: context.root.$t('triggers.headings.createTrigger'),
        subHeading,
        icon,
      }, {
        root: true,
      })
    }

    function handleOpenView(type: ViewTypes): void {
      switch (type) {
        case ViewTypes.CONFIGURE_DATE:
          form.model.date = configureDate()

          context.root.$store.dispatch('app/setHeading', {
            heading: context.root.$t('triggers.headings.configureDate'),
            subHeading: context.root.$t('triggers.subHeadings.configureDate'),
            icon: 'calendar',
          }, {
            root: true,
          })
          break

        case ViewTypes.CONFIGURE_TIME:
          form.model.time = configureTime()

          context.root.$store.dispatch('app/setHeading', {
            heading: context.root.$t('triggers.headings.configureTime'),
            subHeading: context.root.$t('triggers.subHeadings.configureTime'),
            icon: 'clock',
          }, {
            root: true,
          })
          break

        case ViewTypes.LIST_ACTION_DEVICES:
        case ViewTypes.LIST_CONDITION_DEVICES:
          context.root.$store.dispatch('app/setHeading', {
            heading: context.root.$t('triggers.headings.selectDevice'),
            subHeading: context.root.$t('triggers.subHeadings.selectDevice'),
            icon: 'plug',
          }, {
            root: true,
          })
          break

        case ViewTypes.GENERAL_INFO:
          setHeading()
          break
      }

      view[type].opened = true

      Object.keys(view)
        .forEach((key: string): void => {
          if (
            (
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

    function handleTriggerCreated(): void {
      context.root.$router.push(context.root.localePath({
        name: context.root.$routes.triggers.detail,
        params: {
          id: triggerId,
        },
      }))
    }

    function handleListConditionDevices(device: DeviceInterface): void {
      form.model.conditions = configureDeviceCondition(device)

      view[ViewTypes.SELECT_CONDITION_DEVICE].device = device

      context.root.$store.dispatch('app/setHeading', {
        heading: device.title,
        icon: device.icon,
      }, {
        root: true,
      })

      handleOpenView(ViewTypes.SELECT_CONDITION_DEVICE)
    }

    function handleListActionDevices(device: DeviceInterface): void {
      form.model.actions = configureDeviceAction(device)

      view[ViewTypes.SELECT_ACTION_DEVICE].device = device

      context.root.$store.dispatch('app/setHeading', {
        heading: device.title,
        icon: device.icon,
      }, {
        root: true,
      })

      handleOpenView(ViewTypes.SELECT_ACTION_DEVICE)
    }

    function handleLeftBtnCallback(): void {
      if (view.generalInfo.opened) {
        context.root.$router.push(context.root.localePath(context.root.$routes.triggers.list))
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

    function handleRightBtnCallback(): void {
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

    onMounted((): void => {
      isMounted.value = true

      context.root.$bus.$emit('wait-page_reloading', false)
    })

    onUnmounted((): void => {
      try {
        destroy()
      } catch (e) {
        context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
      }
    })

    watch(
      (): string => windowSize.value,
      (val): void => {
        if (val !== FbSizeTypes.EXTRA_SMALL && isMounted.value) {
          context.root.$router.push(context.root.localePath({
            name: context.root.$routes.triggers.list,
            hash: `${TRIGGERS_HASH_CREATE}`,
          }))
        }
      },
    )

    setHeading()

    return {
      view,
      remoteFormSubmit,
      remoteFormResult,
      form,
      trigger,
      conditions,
      actions,
      leftBtnText,
      rightBtnShow,
      handleOpenView,
      handleTriggerCreated,
      handleLeftBtnCallback,
      handleRightBtnCallback,
      handleListConditionDevices,
      handleListActionDevices,
      viewTypes: ViewTypes,
      selectDeviceViewTypes: SelectViewType,
      triggerTypes: TriggerTypes,
      sizeTypes: FbSizeTypes,
      formResultTypes: FbFormResultTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
      menuItemTypes: FbMenuItemTypes,
    }
  },

  // @ts-ignore
  validate({ query }) {
    return [
      TriggerTypes.DATE_SCHEDULED,
      TriggerTypes.TIME_SCHEDULED,
      TriggerTypes.DEVICE,
      TriggerTypes.SENSOR,
      TriggerTypes.MANUAL,
    ].includes(query.type)
  },

  head() {
    return {
      title: this.$t('meta.triggers.create.title'),
    }
  },

  meta: {
    hideTabs: true,
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
