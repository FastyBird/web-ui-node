<template>
  <div
    v-if="device"
    :data-device-state="device.state"
  >
    <fb-ui-items-container v-if="hasSettings">
      <template slot="heading">
        {{ $t('devices.headings.channelSettings') }}
      </template>

      <devices-settings-channel-parameter
        v-for="parameter in parameters"
        :key="parameter.configuration"
        :device="device"
        :channel="channel"
        :parameter="parameter"
        :class="['fb-devices-desktop-settings-channel__item', {'fb-devices-desktop-settings-channel__item-action': parameter.isBefore}, 'fb-devices-desktop-settings-channel__item-single-row']"
        @edit="handleOpenForm(viewTypes.PARAMETER_FORM, parameter)"
      />
    </fb-ui-items-container>

    <devices-settings-channel-parameter-edit
      v-if="view.parameterForm.show"
      :device="device"
      :channel="channel"
      :parameter="view.parameterForm.parameter"
      :transparent-bg="true"
      @close="handleCloseForm(viewTypes.PARAMETER_FORM)"
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

import Device from '~/models/devices-module/devices/Device'
import { DeviceInterface } from '~/models/devices-module/devices/types'
import { ChannelInterface } from '~/models/devices-module/channels/types'
import ChannelConfiguration from '~/models/devices-module/channel-configuration/ChannelConfiguration'
import { ChannelConfigurationInterface } from '~/models/devices-module/channel-configuration/types'

import DevicesSettingsChannelParameter from '~/components/devices/Settings/Channel/Parameter/index.vue'
import DevicesSettingsChannelParameterEdit from '~/components/devices/Settings/Channel/ParameterEdit/index.vue'

enum ViewTypes {
  PARAMETER_FORM = 'parameterForm',
}

interface DevicesSettingsChannelViewInterface {
  parameterForm: {
    show: boolean
    parameter: ChannelConfigurationInterface | null
  }
}

interface DevicesSettingsChannelFormInterface {
  model: {
    parameter: { [key: string]: any }
  }
}

interface DevicesSettingsChannelPropsInterface {
  channel: ChannelInterface
}

export default defineComponent({

  name: 'DevicesDesktopSettingsChannel',

  props: {

    channel: {
      type: Object as PropType<ChannelInterface>,
      required: true,
    },

  },

  components: {
    DevicesSettingsChannelParameter,
    DevicesSettingsChannelParameterEdit,
  },

  setup(props: DevicesSettingsChannelPropsInterface, context: SetupContext) {
    const view = reactive<DevicesSettingsChannelViewInterface>({
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

    function handleOpenForm(type: ViewTypes, parameter?: ChannelConfigurationInterface): void {
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
    }

    function handleCloseForm(type: ViewTypes, event?: MouseEvent): void {
      event && event.preventDefault()

      view[type].show = false
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
      form,
      device,
      parameters,
      hasSettings,
      handleOpenForm,
      handleCloseForm,
      viewTypes: ViewTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'components/devices/Desktop/Settings/Channel/index';
</style>
