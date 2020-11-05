<template>
  <div
    :data-state="device.isReady ? 'on' : 'off'"
    class="fb-devices-settings-device__container"
  >
    <fb-ui-items-container v-if="hasSettings">
      <template slot="heading">
        {{ $t('devices.headings.deviceSettings') }}
      </template>

      <settings-list-item
        type="button"
        class="fb-devices-settings-device__item fb-devices-settings-device__item-single-row"
        @click="openForm(viewTypes.CREDENTIALS_FORM)"
      >
        <fb-ui-spinner
          v-if="view.loading.credentialsForm"
          slot="prefix"
          size="sm"
        />
        <font-awesome-icon
          slot="suffix"
          icon="angle-right"
        />

        {{ $t('devices.buttons.credentials.title') }}
      </settings-list-item>

      <devices-settings-device-parameter
        v-for="parameter in parameters"
        :key="parameter.configuration"
        :device="device"
        :parameter="parameter"
        :hardware="hardware"
        :loading="_.get(view.loading.parameterForm, parameter.configuration, false) === true"
        :class="['fb-devices-settings-device__item', {'fb-devices-settings-device__item-action': parameter.isBefore}, 'fb-devices-settings-device__item-single-row']"
        @submit="submit(parameter)"
        @openForm="openForm(viewTypes.PARAMETER_FORM, parameter)"
      />

      <settings-list-item
        v-if="hasSensorsSettings"
        type="button"
        class="fb-devices-settings-device__item fb-devices-settings-device__item-multi-row fb-devices-settings-device__item-property"
        @click="openModuleForm('sensor_', $t('devices.headings.moduleSensorSettings').toString())"
      >
        <fb-ui-spinner
          v-if="view.loading.moduleSettingsForm"
          slot="prefix"
          size="sm"
        />
        <font-awesome-icon
          slot="suffix"
          icon="angle-right"
        />

        {{ $t('devices.buttons.sensorConfiguration.title') }}
        <small>
          {{ $t('devices.buttons.sensorConfiguration.description') }}
        </small>
      </settings-list-item>

      <settings-list-item
        v-if="hasTimeSettings"
        type="button"
        class="fb-devices-settings-device__item fb-devices-settings-device__item-multi-row fb-devices-settings-device__item-property"
        @click="openModuleForm('ntp_', $t('devices.headings.moduleTimeSettings').toString())"
      >
        <fb-ui-spinner
          v-if="view.loading.moduleSettingsForm"
          slot="prefix"
          size="sm"
        />
        <font-awesome-icon
          slot="suffix"
          icon="angle-right"
        />

        {{ $t('devices.buttons.timeConfiguration.title') }}
        <small>
          {{ $t('devices.buttons.timeConfiguration.description') }}
        </small>
      </settings-list-item>

      <settings-list-item
        v-if="hasSensorsCalibration"
        type="button"
        class="fb-devices-settings-device__item fb-devices-settings-device__item-single-row fb-devices-settings-device__item-property"
        @click="openForm(viewTypes.SENSORS_CALIBRATION_FORM)"
      >
        <fb-ui-spinner
          v-if="view.loading.sensorsCalibrationForm"
          slot="prefix"
          size="sm"
        />
        <font-awesome-icon
          slot="suffix"
          icon="angle-right"
        />

        {{ $t('devices.buttons.sensorsCalibration.title') }}
      </settings-list-item>
    </fb-ui-items-container>

    <fb-ui-items-container>
      <template slot="heading">
        {{ $t('devices.headings.generalSettings') }}
      </template>

      <settings-list-item
        type="button"
        class="fb-devices-settings-device__item fb-devices-settings-device__item-single-row"
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

        {{ $t('devices.buttons.renameDevice.title') }}
      </settings-list-item>

      <settings-list-item
        type="button"
        class="fb-devices-settings-device__item fb-devices-settings-device__item-single-row fb-devices-settings-device__item-remove"
        @click="openWindow(viewTypes.REMOVE_CONFIRMATION)"
      >
        <fb-ui-spinner
          v-if="view.loading.removeConfirmation"
          slot="prefix"
          size="sm"
        />
        <font-awesome-icon
          slot="suffix"
          icon="angle-right"
        />

        {{ $t('devices.buttons.removeDevice.title') }}
      </settings-list-item>
    </fb-ui-items-container>

    <devices-settings-credentials
      v-if="view.credentialsForm.show"
      :device="device"
      :transparent-bg="true"
      @loaded="view.loading.credentialsForm = false"
      @close="closeForm(viewTypes.CREDENTIALS_FORM)"
    />

    <devices-settings-module-configuration
      v-if="view.moduleSettingsForm.show"
      :device="device"
      :title="view.moduleSettingsForm.title"
      :key-prefix="view.moduleSettingsForm.prefix"
      :transparent-bg="true"
      @loaded="view.loading.moduleSettingsForm = false"
      @close="closeForm(viewTypes.MODULE_SETTINGS_FORM)"
    />

    <devices-settings-sensors-calibration
      v-if="hasSensorsCalibration && view.sensorsCalibrationForm.show"
      :device="device"
      :transparent-bg="true"
      @loaded="view.loading.sensorsCalibrationForm = false"
      @close="closeForm(viewTypes.SENSORS_CALIBRATION_FORM)"
    />

    <devices-settings-rename
      v-if="view.renameForm.show"
      :device="device"
      :transparent-bg="true"
      @loaded="view.loading.renameForm = false"
      @close="closeForm(viewTypes.RENAME_FORM)"
    />

    <devices-settings-remove
      v-if="view.removeConfirmation.show"
      :device="device"
      :transparent-bg="true"
      @loaded="view.loading.removeConfirmation = false"
      @close="closeWindow(viewTypes.REMOVE_CONFIRMATION)"
      @removed="deviceRemoved"
    />

    <devices-settings-device-parameter-edit
      v-if="view.parameterForm.show"
      :device="device"
      :parameter="view.parameterForm.parameter"
      :hardware="hardware"
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

import { DeviceInterface } from '~/models/devices-node/devices/types'
import DeviceConfiguration from '~/models/devices-node/device-configuration/DeviceConfiguration'
import { DeviceConfigurationInterface } from '~/models/devices-node/device-configuration/types'
import Hardware from '~/models/devices-node/hardwares/Hardware'
import { HardwareInterface } from '~/models/devices-node/hardwares/types'

import DevicesSettingsDeviceParameter from '~/components/devices/Settings/Device/Parameter/index.vue'

const DevicesSettingsCredentials = () => import('~/components/devices/Settings/Device/Credentials/index.vue')
const DevicesSettingsRename = () => import('~/components/devices/Settings/Device/Rename/index.vue')
const DevicesSettingsRemove = () => import('~/components/devices/Settings/Device/Remove/index.vue')
const DevicesSettingsSensorsCalibration = () => import('~/components/devices/Settings/Device/SensorsCalibration/index.vue')
const DevicesSettingsModuleConfiguration = () => import('~/components/devices/Settings/Device/ModuleConfiguration/index.vue')
const DevicesSettingsDeviceParameterEdit = () => import('~/components/devices/Settings/Device/ParameterEdit/index.vue')

enum ViewTypes {
  RENAME_FORM = 'renameForm',
  PARAMETER_FORM = 'parameterForm',
  CREDENTIALS_FORM = 'credentialsForm',
  MODULE_SETTINGS_FORM = 'moduleSettingsForm',
  SENSORS_CALIBRATION_FORM = 'sensorsCalibrationForm',
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface DevicesSettingsDeviceViewLoadingParameterInterface {
  [key: string]: boolean
}

interface DevicesSettingsDeviceViewLoadingInterface {
  renameForm: boolean
  parameterForm: DevicesSettingsDeviceViewLoadingParameterInterface
  credentialsForm: boolean
  moduleSettingsForm: boolean
  sensorsCalibrationForm: boolean
  removeConfirmation: boolean
}

interface DevicesSettingsDeviceViewRenameInterface {
  show: boolean
}

interface DevicesSettingsDeviceViewParameterInterface {
  show: boolean
  parameter: DeviceConfigurationInterface | null
}

interface DevicesSettingsDeviceViewCredentialsInterface {
  show: boolean
}

interface DevicesSettingsDeviceViewModuleSettingsInterface {
  show: boolean
  prefix: string | null
  title: string | null
}

interface DevicesSettingsDeviceViewSensorsCalibrationInterface {
  show: boolean
}

interface DevicesSettingsDeviceViewRemoveConfirmationInterface {
  show: boolean
}

interface DevicesSettingsDeviceViewInterface {
  loading: DevicesSettingsDeviceViewLoadingInterface
  renameForm: DevicesSettingsDeviceViewRenameInterface
  parameterForm: DevicesSettingsDeviceViewParameterInterface
  credentialsForm: DevicesSettingsDeviceViewCredentialsInterface
  moduleSettingsForm: DevicesSettingsDeviceViewModuleSettingsInterface
  sensorsCalibrationForm: DevicesSettingsDeviceViewSensorsCalibrationInterface
  removeConfirmation: DevicesSettingsDeviceViewRemoveConfirmationInterface
}

interface DevicesSettingsDeviceFormModelInterface {
  parameter: { [key: string]: any }
}

interface DevicesSettingsDeviceFormInterface {
  model: DevicesSettingsDeviceFormModelInterface
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
    DevicesSettingsCredentials,
    DevicesSettingsRename,
    DevicesSettingsRemove,
    DevicesSettingsSensorsCalibration,
    DevicesSettingsModuleConfiguration,
    DevicesSettingsDeviceParameterEdit,

    DevicesSettingsDeviceParameter,
  },

  setup(props: DevicesSettingsDevicePropsInterface, context: SetupContext) {
    const view = reactive<DevicesSettingsDeviceViewInterface>({
      loading: {
        renameForm: false,
        parameterForm: {},
        credentialsForm: false,
        moduleSettingsForm: false,
        sensorsCalibrationForm: false,
        removeConfirmation: false,
      },
      renameForm: {
        show: false,
      },
      parameterForm: {
        show: false,
        parameter: null,
      },
      credentialsForm: {
        show: false,
      },
      moduleSettingsForm: {
        show: false,
        prefix: null,
        title: null,
      },
      sensorsCalibrationForm: {
        show: false,
      },
      removeConfirmation: {
        show: false,
      },
    })

    const form = reactive<DevicesSettingsDeviceFormInterface>({
      model: {
        parameter: {},
      },
    })

    const parameters = computed<Array<DeviceConfigurationInterface>>((): Array<DeviceConfigurationInterface> => {
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
        parameters.value.length ||
        hasTimeSettings ||
        hasSensorsSettings ||
        hasSensorsCalibration
      )
    })

    parameters.value
      .forEach((parameter): void => {
        form.model.parameter[parameter.configuration] = parameter.value

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

    // Open edit form
    function openForm(type: ViewTypes, parameter?: DeviceConfigurationInterface): void {
      if (type === ViewTypes.PARAMETER_FORM && !props.device.isReady) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: props.device.title,
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
        } else if (
          type === ViewTypes.RENAME_FORM ||
          type === ViewTypes.CREDENTIALS_FORM ||
          type === ViewTypes.MODULE_SETTINGS_FORM ||
          type === ViewTypes.SENSORS_CALIBRATION_FORM
        ) {
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
    async function submit(parameter: DeviceConfigurationInterface): Promise<void> {
      if (props.device.isReady) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: props.device.title,
        }).toString(), 'error')

        return
      }

      await DeviceConfiguration.dispatch('edit', {
        device: props.device,
        parameter,
        value: form.model.parameter[parameter.configuration],
      })
    }

    // Open device module edit form
    function openModuleForm(prefix: string, title: string): void {
      if (!props.device.isReady) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: props.device.title,
        }).toString(), 'error')

        return
      }

      view.moduleSettingsForm.show = true
      view.moduleSettingsForm.prefix = prefix
      view.moduleSettingsForm.title = title

      view.loading.moduleSettingsForm = true
    }

    // Open info window
    function openWindow(type: ViewTypes): void {
      view[type].show = true

      if (type !== ViewTypes.PARAMETER_FORM) {
        view.loading[type] = true
      }
    }

    // Close opened window
    function closeWindow(type: ViewTypes): void {
      view[type].show = false
    }

    // Fired when opened item is removed
    function deviceRemoved(): void {
      closeWindow(ViewTypes.REMOVE_CONFIRMATION)

      context.emit('removed')
    }

    watch(
      (): boolean => props.device.isReady,
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
      isCustom: hardware.value === null || hardware.value.isCustom,
      form,
      parameters,
      hardware,
      hasTimeSettings,
      hasSensorsSettings,
      hasSensorsCalibration,
      hasSettings,
      openForm,
      closeForm,
      submit,
      openModuleForm,
      openWindow,
      closeWindow,
      deviceRemoved,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
