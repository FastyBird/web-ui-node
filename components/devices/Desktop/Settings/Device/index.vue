<template>
  <div :data-device-state="device.state">
    <fb-ui-items-container v-if="hasSettings">
      <template slot="heading">
        {{ $t('devices.headings.deviceSettings') }}
      </template>

      <list-item
        :type="listItemTypes.DEFAULT"
        @click="handleOpenForm(formTypes.CREDENTIALS_FORM)"
        class="fb-devices-desktop-settings-device__item fb-devices-desktop-settings-device__item-single-row"
      >
        <template slot="heading">
          {{ $t('devices.buttons.credentials.title') }}
        </template>
      </list-item>

      <devices-settings-device-parameter
        v-for="parameter in deviceParameters"
        :key="parameter.configuration"
        :device="device"
        :parameter="parameter"
        :hardware="hardware"
        :class="['fb-devices-desktop-settings-device__item', {'fb-devices-desktop-settings-device__item-action': parameter.isBefore}, 'fb-devices-desktop-settings-device__item-single-row']"
        @edit="handleOpenForm(formTypes.PARAMETER_FORM, parameter)"
      />

      <list-item
        v-if="hasSensorsSettings"
        :type="listItemTypes.DEFAULT"
        @click="handleOpenModuleForm('sensor_', $t('devices.headings.moduleSensorSettings').toString())"
        class="fb-devices-desktop-settings-device__item fb-devices-desktop-settings-device__item-multi-row fb-devices-desktop-settings-device__item-property"
      >
        <template slot="heading">
          {{ $t('devices.buttons.sensorConfiguration.title') }}
        </template>

        <template slot="sub-heading">
          {{ $t('devices.buttons.sensorConfiguration.description') }}
        </template>
      </list-item>

      <list-item
        v-if="hasTimeSettings"
        :type="listItemTypes.DEFAULT"
        @click="handleOpenModuleForm('ntp_', $t('devices.headings.moduleTimeSettings').toString())"
        class="fb-devices-desktop-settings-device__item fb-devices-desktop-settings-device__item-multi-row fb-devices-desktop-settings-device__item-property"
      >
        <template slot="heading">
          {{ $t('devices.buttons.timeConfiguration.title') }}
        </template>

        <template slot="sub-heading">
          {{ $t('devices.buttons.timeConfiguration.description') }}
        </template>
      </list-item>

      <list-item
        v-if="hasSensorsCalibration"
        :type="listItemTypes.DEFAULT"
        @click="handleOpenForm(formTypes.SENSORS_CALIBRATION_FORM)"
        class="fb-devices-desktop-settings-device__item fb-devices-desktop-settings-device__item-single-row fb-devices-desktop-settings-device__item-property"
      >
        <template slot="heading">
          {{ $t('devices.buttons.sensorsCalibration.title') }}
        </template>
      </list-item>
    </fb-ui-items-container>

    <devices-desktop-settings-device-credentials
      v-if="forms.credentialsForm.opened"
      :device="device"
      @close="handleCloseForm(formTypes.CREDENTIALS_FORM)"
    />

    <devices-settings-device-module-configuration
      v-if="forms.moduleSettingsForm.opened"
      :device="device"
      :title="forms.moduleSettingsForm.title"
      :key-prefix="forms.moduleSettingsForm.prefix"
      :transparent-bg="true"
      @close="handleCloseForm(formTypes.MODULE_SETTINGS_FORM)"
    />

    <devices-settings-device-sensors-calibration
      v-if="hasSensorsCalibration && forms.sensorsCalibrationForm.opened"
      :device="device"
      :transparent-bg="true"
      @close="handleCloseForm(formTypes.SENSORS_CALIBRATION_FORM)"
    />

    <devices-settings-device-parameter-edit
      v-if="forms.deviceParameterForm.opened"
      :device="device"
      :parameter="forms.deviceParameterForm.parameter"
      :hardware="hardware"
      :transparent-bg="true"
      @close="handleCloseForm(formTypes.PARAMETER_FORM)"
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

import { DeviceInterface } from '~/models/devices-module/devices/types'
import DeviceConfiguration from '~/models/devices-module/device-configuration/DeviceConfiguration'
import { DeviceConfigurationInterface } from '~/models/devices-module/device-configuration/types'
import Hardware from '~/models/devices-module/hardwares/Hardware'
import { HardwareInterface } from '~/models/devices-module/hardwares/types'

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

import DevicesDesktopSettingsDeviceCredentials from '~/components/devices/Desktop/Settings/Device/Credentials/index.vue'

import DevicesSettingsDeviceSensorsCalibration from '~/components/devices/Settings/Device/SensorsCalibration/index.vue'
import DevicesSettingsDeviceModuleConfiguration from '~/components/devices/Settings/Device/ModuleConfiguration/index.vue'
import DevicesSettingsDeviceParameter from '~/components/devices/Settings/Device/Parameter/index.vue'
import DevicesSettingsDeviceParameterEdit from '~/components/devices/Settings/Device/ParameterEdit/index.vue'

enum FormTypes {
  PARAMETER_FORM = 'deviceParameterForm',
  CREDENTIALS_FORM = 'credentialsForm',
  MODULE_SETTINGS_FORM = 'moduleSettingsForm',
  SENSORS_CALIBRATION_FORM = 'sensorsCalibrationForm',
}

interface DevicesSettingsFormsInterface {
  deviceParameterForm: {
    opened: boolean
    parameter: DeviceConfigurationInterface | null
  }
  credentialsForm: {
    opened: boolean
  }
  moduleSettingsForm: {
    opened: boolean
    prefix: string | null
    title: string | null
  }
  sensorsCalibrationForm: {
    opened: boolean
  }
}

interface DevicesSettingsFormInterface {
  model: {
    deviceParameter: { [key: string]: any }
  }
}

interface DevicesSettingsDevicePropsInterface {
  device: DeviceInterface
}

export default defineComponent({

  name: 'DevicesSettingsDevice',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

  },

  components: {
    DevicesDesktopSettingsDeviceCredentials,

    DevicesSettingsDeviceSensorsCalibration,
    DevicesSettingsDeviceModuleConfiguration,
    DevicesSettingsDeviceParameter,
    DevicesSettingsDeviceParameterEdit,
  },

  setup(props: DevicesSettingsDevicePropsInterface, context: SetupContext) {
    const forms = reactive<DevicesSettingsFormsInterface>({
      deviceParameterForm: {
        opened: false,
        parameter: null,
      },
      credentialsForm: {
        opened: false,
      },
      moduleSettingsForm: {
        opened: false,
        prefix: null,
        title: null,
      },
      sensorsCalibrationForm: {
        opened: false,
      },
    })

    const form = reactive<DevicesSettingsFormInterface>({
      model: {
        deviceParameter: {},
      },
    })

    const deviceParameters = computed<Array<DeviceConfigurationInterface>>((): Array<DeviceConfigurationInterface> => {
      return DeviceConfiguration
        .query()
        .where('deviceId', props.device.id)
        .where((item: DeviceConfigurationInterface): boolean => {
          return item.configuration.indexOf('ntp_') !== 0 && item.configuration.indexOf('sensor_') !== 0
        })
        .orderBy('title')
        .get()
    })

    const hardware = computed<HardwareInterface | null>((): HardwareInterface | null => {
      return Hardware
        .query()
        .where('deviceId', props.device.id)
        .first()
    })

    const hasTimeSettings = computed<boolean>((): boolean => {
      if (hardware.value === null || hardware.value.isManufacturerItead === false) {
        return false
      }

      return DeviceConfiguration
        .query()
        .where('deviceId', props.device.id)
        .where((item: DeviceConfigurationInterface): boolean => {
          return item.configuration.indexOf('ntp_') === 0
        })
        .count() > 0
    })

    const hasSensorsSettings = computed<boolean>((): boolean => {
      if (hardware.value === null || hardware.value.isManufacturerItead === false) {
        return false
      }

      return DeviceConfiguration
        .query()
        .where('deviceId', props.device.id)
        .where((item: DeviceConfigurationInterface): boolean => {
          return item.configuration.indexOf('sensor_') === 0 && !item.configuration.includes('sensor_expected_')
        })
        .count() > 0
    })

    const hasSensorsCalibration = computed<boolean>((): boolean => {
      if (hardware.value === null || hardware.value.isManufacturerItead === false) {
        return false
      }

      return DeviceConfiguration
        .query()
        .where('deviceId', props.device.id)
        .where((item: DeviceConfigurationInterface): boolean => {
          return item.configuration.indexOf('sensor_expected_') === 0
        })
        .count() > 0
    })

    const hasSettings = computed<boolean>((): boolean => {
      return !!(
        deviceParameters.value.length ||
        hasTimeSettings ||
        hasSensorsSettings ||
        hasSensorsCalibration
      )
    })

    deviceParameters.value
      .forEach((parameter): void => {
        form.model.deviceParameter[parameter.configuration] = parameter.value

        if (Object.prototype.hasOwnProperty.call(context.root.$refs, parameter.configuration)) {
          const refs = context.root.$refs[parameter.configuration]

          if (
            props.device.isReady &&
            Array.isArray(refs) &&
            refs.length >= 1 &&
            'setAttribute' in refs[0]
          ) {
            refs[0].setAttribute('disabled', 'disabled')
          }
        }
      })

    function handleOpenForm(type: FormTypes, parameter?: DeviceConfigurationInterface): void {
      if (type === FormTypes.PARAMETER_FORM && !props.device.isReady) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: props.device.title,
        }).toString(), 'error')

        return
      }

      forms[type].opened = true

      if (type === FormTypes.PARAMETER_FORM && typeof parameter !== 'undefined') {
        forms[type].parameter = parameter
      }
    }

    function handleCloseForm(type: FormTypes): void {
      forms[type].opened = false
    }

    function handleOpenModuleForm(prefix: string, title: string): void {
      if (!props.device.isReady) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: props.device.title,
        }).toString(), 'error')

        return
      }

      forms.moduleSettingsForm.opened = true
      forms.moduleSettingsForm.prefix = prefix
      forms.moduleSettingsForm.title = title
    }

    watch(
      (): boolean => props.device.isReady,
      (val): void => {
        deviceParameters.value
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
      forms,
      isCustom: hardware.value === null || hardware.value.isCustom,
      form,
      deviceParameters,
      hardware,
      hasTimeSettings,
      hasSensorsSettings,
      hasSensorsCalibration,
      hasSettings,
      handleOpenForm,
      handleCloseForm,
      handleOpenModuleForm,
      formTypes: FormTypes,
      listItemTypes: ListItemSizeTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
