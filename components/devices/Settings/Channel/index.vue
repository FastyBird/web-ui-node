<template>
  <div
    :data-state="device.isReady ? 'on' : 'off'"
    class="fb-devices-settings-channel__container"
  >
    <fb-ui-items-container v-if="hasSettings">
      <template slot="heading">
        {{ $t('devices.headings.channelSettings') }}
      </template>

      <devices-settings-channel-parameter
        v-for="parameter in parameters"
        :key="parameter.configuration"
        :device="device"
        :parameter="parameter"
        :loading="_.get(view.loading.parameterForm, parameter.configuration, false) === true"
        :class="['fb-devices-settings-channel__item', {'fb-devices-settings-channel__item-action': parameter.isBefore}, 'fb-devices-settings-channel__item-single-row']"
        @submit="submit(parameter)"
        @openForm="openForm(viewTypes.PARAMETER_FORM, parameter)"
      />
    </fb-ui-items-container>

    <fb-ui-items-container>
      <template slot="heading">
        {{ $t('devices.headings.generalSettings') }}
      </template>

      <settings-list-item
        type="button"
        class="fb-devices-settings-channel__item fb-devices-settings-channel__item-single-row"
        @click="openForm(viewTypes.RENAME_FORM)"
      >
        <fb-ui-spinner
          v-if="view.loading.renameForm"
          slot="prefix"
          size="sm"
        />
        <font-awesome-icon
          slot="suffix"
          icon="angle-right"
        />

        {{ $t('devices.buttons.renameChannel.title') }}
      </settings-list-item>
    </fb-ui-items-container>

    <devices-settings-channel-rename
      v-if="view.renameForm.show"
      :device="device"
      :channel="channel"
      :transparent-bg="true"
      @loaded="view.loading.renameForm = false"
      @close="closeForm(viewTypes.RENAME_FORM)"
    />

    <devices-settings-channel-parameter-edit
      v-if="view.parameterForm.show"
      :device="device"
      :channel="channel"
      :parameter="view.parameterForm.parameter"
      :transparent-bg="true"
      @loaded="view.loading.parameterForm = {}"
      @close="closeForm(viewTypes.PARAMETER_FORM)"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  reactive,
  SetupContext,
  watch,
} from '@vue/composition-api'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'
import { ChannelInterface } from '~/models/devices-node/channels/types'
import ChannelConfiguration from '~/models/devices-node/channel-configuration/ChannelConfiguration'
import { ChannelConfigurationInterface } from '~/models/devices-node/channel-configuration/types'

import DevicesSettingsChannelParameter from '~/components/devices/Settings/Channel/Parameter/index.vue'

const DevicesSettingsChannelRename = () => import('~/components/devices/Settings/Channel/Rename/index.vue')
const DevicesSettingsChannelParameterEdit = () => import('~/components/devices/Settings/Channel/ParameterEdit/index.vue')

enum ViewTypes {
  RENAME_FORM = 'renameForm',
  PARAMETER_FORM = 'parameterForm',
}

interface DevicesSettingsChannelViewLoadingParameterInterface {
  [key: string]: boolean
}

interface DevicesSettingsChannelViewLoadingInterface {
  renameForm: boolean
  parameterForm: DevicesSettingsChannelViewLoadingParameterInterface
}

interface DevicesSettingsChannelViewRenameInterface {
  show: boolean
}

interface DevicesSettingsChannelViewParameterInterface {
  show: boolean
  parameter: ChannelConfigurationInterface | null
}

interface DevicesSettingsChannelViewInterface {
  loading: DevicesSettingsChannelViewLoadingInterface
  renameForm: DevicesSettingsChannelViewRenameInterface
  parameterForm: DevicesSettingsChannelViewParameterInterface
}

interface DevicesSettingsChannelFormModelInterface {
  parameter: { [key: string]: any }
}

interface DevicesSettingsChannelFormInterface {
  model: DevicesSettingsChannelFormModelInterface
}

interface DevicesSettingsChannelPropsInterface {
  channel: ChannelInterface
}

export default defineComponent({

  name: 'DevicesSettingsChannel',

  props: {

    channel: {
      type: Object as PropType<ChannelInterface>,
      required: true,
    },

  },

  components: {
    DevicesSettingsChannelRename,
    DevicesSettingsChannelParameterEdit,

    DevicesSettingsChannelParameter,
  },

  setup(props: DevicesSettingsChannelPropsInterface, context: SetupContext) {
    const view = reactive<DevicesSettingsChannelViewInterface>({
      loading: {
        renameForm: false,
        parameterForm: {},
      },
      renameForm: {
        show: false,
      },
      parameterForm: {
        show: false,
        parameter: null,
      },
    })

    const form = reactive<DevicesSettingsChannelFormInterface>({
      model: {
        parameter: {},
      },
    })

    const device = computed<DeviceInterface | null>((): DeviceInterface | null => Device.find(props.channel.deviceId))

    const parameters = computed<Array<ChannelConfigurationInterface>>((): Array<ChannelConfigurationInterface> => {
      return ChannelConfiguration
        .query()
        .where('channelId', props.channel.id)
        .orderBy('title')
        .get()
    })

    const hasSettings = computed<boolean>((): boolean => parameters.value.length > 0)

    parameters.value
      .forEach((parameter): void => {
        form.model.parameter[parameter.configuration] = parameter.value

        if (Object.prototype.hasOwnProperty.call(context.root.$refs, parameter.configuration)) {
          const refs = context.root.$refs[parameter.configuration]

          if (
            device.value !== null &&
            !device.value.isReady &&
            Array.isArray(refs) &&
            refs.length >= 1 &&
            'setAttribute' in refs[0]
          ) {
            refs[0].setAttribute('disabled', 'disabled')
          }
        }
      })

    // Open edit form
    function openForm(type: ViewTypes, parameter?: ChannelConfigurationInterface): void {
      if (type === ViewTypes.PARAMETER_FORM && (device.value === null || !device.value.isReady)) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: device.value !== null ? device.value.title : 'unknown',
        }).toString(), 'error')

        return
      }

      view[type].show = true

      if (type === ViewTypes.PARAMETER_FORM && typeof parameter !== 'undefined') {
        view[type].parameter = parameter
      }

      if (Object.prototype.hasOwnProperty.call(view.loading, type)) {
        if (type === ViewTypes.PARAMETER_FORM && parameter !== undefined) {
          view.loading.parameterForm[parameter.configuration] = true
        } else if (type === ViewTypes.RENAME_FORM) {
          view.loading[type] = true
        }
      }
    }

    // Close edit form
    function closeForm(type: ViewTypes, event?: MouseEvent): void {
      event && event.preventDefault()

      view[type].show = false
    }

    // Submit edit parameter
    async function submit(parameter: ChannelConfigurationInterface): Promise<void> {
      if (device.value === null || !device.value.isReady) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: device.value !== null ? device.value.title : 'unknown',
        }).toString(), 'error')

        return
      }

      await ChannelConfiguration.dispatch('edit', {
        channel: props.channel,
        parameter,
        value: form.model.parameter[parameter.configuration],
      })
    }

    watch(
      (): boolean => device.value !== null && device.value.isReady,
      (val): void => {
        parameters.value
          .forEach((parameter): void => {
            if (Object.prototype.hasOwnProperty.call(context.root.$refs, parameter.configuration)) {
              const refs = context.root.$refs[parameter.configuration]

              if (
                Array.isArray(refs) &&
                refs.length >= 1 &&
                'setAttribute' in refs[0]
              ) {
                if (val) {
                  refs[0].removeAttribute('disabled')
                } else {
                  refs[0].setAttribute('disabled', 'disabled')
                }
              }
            }
          })
      },
    )

    return {
      view,
      viewTypes: ViewTypes,
      form,
      device,
      parameters,
      hasSettings,
      openForm,
      closeForm,
      submit,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
