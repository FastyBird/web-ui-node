<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-settings-thing__container"
  >
    <list-items-container
      v-if="isCustom || hasSettings"
      :heading="$t('things.headings.thingSettings')"
    >
      <settings-list-item
        v-if="isCustom"
        type="button"
        class="fb-iot-things-settings-thing__item"
        @click="openForm('credentials')"
      >
        <span class="fb-iot-things-settings-thing__item-icon">
          <font-awesome-icon icon="angle-right" />
        </span>
        <fb-spinner
          v-if="loading.credentials"
          size="sm"
        />
        {{ $t('things.buttons.credentials.title') }}
      </settings-list-item>

      <device-parameter
        v-for="parameter in deviceParameters"
        :key="parameter.name"
        :thing="thing"
        :parameter="parameter"
        :hardware="hardware"
        :loading="_.get(loading.deviceParameterForm, parameter.name, false) === true"
        class="fb-iot-things-settings-thing__item-property"
        @submit="submit(parameter, 'device')"
        @openForm="openForm('deviceParameterForm', parameter)"
      />

      <settings-list-item
        v-if="hasSensorsSettings"
        type="button"
        class="fb-iot-things-settings-thing__item fb-iot-things-settings-thing__item-property"
        @click="openModuleForm('sensor_', $t('things.headings.moduleSensorSettings'))"
      >
        <span class="fb-iot-things-settings-thing__item-icon">
          <font-awesome-icon icon="angle-right" />
        </span>
        <fb-spinner
          v-if="loading.sensorsSettings"
          size="sm"
        />
        {{ $t('things.buttons.sensorConfiguration.title') }}
        <small>
          {{ $t('things.buttons.sensorConfiguration.description') }}
        </small>
      </settings-list-item>

      <settings-list-item
        v-if="hasTimeSettings"
        type="button"
        class="fb-iot-things-settings-thing__item fb-iot-things-settings-thing__item-property"
        @click="openModuleForm('ntp_', $t('things.headings.moduleTimeSettings'))"
      >
        <span class="fb-iot-things-settings-thing__item-icon">
          <font-awesome-icon icon="angle-right" />
        </span>
        <fb-spinner
          v-if="loading.timeSettings"
          size="sm"
        />
        {{ $t('things.buttons.timeConfiguration.title') }}
        <small>
          {{ $t('things.buttons.timeConfiguration.description') }}
        </small>
      </settings-list-item>

      <settings-list-item
        v-if="hasEnergyCalibration"
        type="button"
        class="fb-iot-things-settings-thing__item fb-iot-things-settings-thing__item-property"
        @click="openForm('energyCalibration')"
      >
        <span class="fb-iot-things-settings-thing__item-icon">
          <font-awesome-icon icon="angle-right" />
        </span>
        <fb-spinner
          v-if="loading.energyCalibration"
          size="sm"
        />
        {{ $t('things.buttons.energyCalibration.title') }}
      </settings-list-item>

      <channel-parameter
        v-for="parameter in channelParameters"
        :key="parameter.name"
        :thing="thing"
        :parameter="parameter"
        :hardware="hardware"
        :loading="_.get(loading.channelParameterForm, parameter.name, false) === true"
        @submit="submit(parameter, 'channel')"
        @openForm="openForm('channelParameterForm', parameter)"
      />
    </list-items-container>

    <list-items-container :heading="$t('things.headings.generalSettings')">
      <settings-list-item
        type="button"
        class="fb-iot-things-settings-thing__item"
        @click="openWindow('rename')"
      >
        <span class="fb-iot-things-settings-thing__item-icon">
          <font-awesome-icon icon="angle-right" />
        </span>
        <fb-spinner
          v-if="loading.rename"
          size="sm"
        />
        {{ $t('things.buttons.rename.title') }}
      </settings-list-item>

      <settings-list-item
        type="button"
        class="fb-iot-things-settings-thing__item fb-iot-things-settings-thing__item-remove"
        @click="openWindow('remove')"
      >
        <span class="fb-iot-things-settings-thing__item-icon">
          <font-awesome-icon icon="exclamation-triangle" />
        </span>
        <fb-spinner
          v-if="loading.remove"
          size="sm"
        />
        {{ $t('things.buttons.remove.title') }}
      </settings-list-item>
    </list-items-container>

    <list-items-container :heading="$t('things.headings.manufacturerAndNetwork')">
      <ul>
        <li>
          <div>
            <img
              width="40"
              height="40"
              src="/manufacturers/itead.jpg"
              :alt="hardwareManufacturer"
            >
          </div>
          <div>
            <h5>
              <strong>{{ $t('things.texts.hardware.manufacturer') }}:</strong> {{ hardwareManufacturer }}
            </h5>
            <small><strong>{{ $t('things.texts.hardware.model') }}:</strong> {{ hardwareModel }} - ver. {{ firmwareVersion }}</small>
          </div>
        </li>

        <li>
          <div>
            <font-awesome-icon icon="wifi" />
          </div>
          <div>
            <h5>
              <strong>{{ $t('things.texts.wifi.name') }}:</strong> {{ wifiSSID }}
            </h5>
            <small><strong>{{ $t('things.texts.wifi.ip') }}:</strong> {{ wifiIPAddress }}</small>
          </div>
        </li>
      </ul>
    </list-items-container>

    <thing-credentials
      v-if="isCustom && credentials.show"
      :thing="thing"
      :transparent-bg="transparentModal"
      @loaded="loading.credentials = false"
      @close="closeWindow('credentials')"
    />

    <thing-module-configuration
      v-if="moduleSettings.show"
      :thing="thing"
      :title="moduleSettings.title"
      :key-prefix="moduleSettings.prefix"
      :transparent-bg="transparentModal"
      @loaded="moduleFormLoaded"
      @close="closeWindow('moduleSettings')"
    />

    <thing-energy-calibration
      v-if="hasEnergyCalibration && energyCalibration.show"
      :thing="thing"
      :transparent-bg="transparentModal"
      @loaded="loading.energyCalibration = false"
      @close="closeWindow('energyCalibration')"
    />

    <thing-rename
      v-if="rename.show"
      :thing="thing"
      :transparent-bg="transparentModal"
      @loaded="loading.rename = false"
      @close="closeWindow('rename')"
    />

    <thing-remove
      v-if="remove.show"
      :thing="thing"
      :transparent-bg="transparentModal"
      @loaded="loading.remove = false"
      @close="closeWindow('remove')"
    />

    <thing-device-parameter-edit
      v-if="deviceParameterForm.show"
      :thing="thing"
      :parameter="deviceParameterForm.parameter"
      :transparent-bg="transparentModal"
      @loaded="loading.deviceParameterForm = []"
      @close="closeForm($event, 'deviceParameterForm')"
    />

    <thing-channel-parameter-edit
      v-if="channelParameterForm.show"
      :thing="thing"
      :parameter="channelParameterForm.parameter"
      :transparent-bg="transparentModal"
      @loaded="loading.channelParameterForm = []"
      @close="closeForm($event, 'channelParameterForm')"
    />
  </div>
</template>

<script>
import DeviceParameter from './DeviceParameter'
import ChannelParameter from './ChannelParameter'

const ThingCredentials = () => import('./Credentials')
const ThingRename = () => import('./Rename')
const ThingRemove = () => import('./Remove')
const ThingEnergyCalibration = () => import('./EnergyCalibration')
const ThingModuleConfiguration = () => import('./ModuleConfiguration')
const ThingDeviceParameterEdit = () => import('./DeviceParameterEdit')
const ThingChannelParameterEdit = () => import('./ChannelParameterEdit')

export default {

  name: 'ThingsSettingsThing',

  components: {
    ThingCredentials,
    ThingRename,
    ThingRemove,
    ThingEnergyCalibration,
    ThingModuleConfiguration,
    ThingDeviceParameterEdit,
    ThingChannelParameterEdit,

    DeviceParameter,
    ChannelParameter,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      isCustom: false,
      transparentModal: false,
      loading: {
        credentials: false,
        moduleSettings: false,
        sensorsSettings: false,
        timeSettings: false,
        energyCalibration: false,
        rename: false,
        remove: false,
        thingInfo: false,
        networkInfo: false,
        deviceParameterForm: [],
        channelParameterForm: [],
      },
      credentials: {
        show: false,
      },
      moduleSettings: {
        show: false,
        prefix: null,
        title: null,
      },
      energyCalibration: {
        show: false,
      },
      rename: {
        show: false,
      },
      remove: {
        show: false,
      },
      thingInfo: {
        show: false,
      },
      networkInfo: {
        show: false,
      },
      deviceParameterForm: {
        show: false,
        parameter: null,
      },
      channelParameterForm: {
        show: false,
        parameter: null,
      },
      form: {
        parameter: {},
      },
    }
  },

  computed: {

    /**
     * Get all device configuration parameters
     *
     * @returns {Array}
     */
    deviceParameters() {
      return this.$store.getters['entities/device_configuration/query']()
        .where('device_id', this.thing.device_id)
        .where((item) => {
          return this._.get(item, 'name').indexOf('ntp_') !== 0 &&
            this._.get(item, 'name').indexOf('sensor_') !== 0
        })
        .orderBy('name')
        .all()
    },

    /**
     * Get all channel configuration parameters
     *
     * @returns {Array}
     */
    channelParameters() {
      return this.$store.getters['entities/channel_configuration/query']()
        .where('id', this.thing.channel.configuration_ids)
        .all()
    },

    /**
     * Get thing hardware info
     *
     * @returns {(Hardware|null)}
     */
    hardware() {
      return this.$store.getters['entities/hardware/query']()
        .where('device_id', this.thing.device_id)
        .first()
    },

    /**
     * Get thing model name
     *
     * @returns {String}
     */
    hardwareModel() {
      if (!this._.get(this.hardware, 'isCustom', true)) {
        return this.hardware.model
      }

      return 'N/A'
    },

    /**
     * Get thing manufacturer name
     *
     * @returns {String}
     */
    hardwareManufacturer() {
      if (this.hardware !== null && this._.get(this.hardware, 'manufacturer', null) !== null) {
        return this.hardware.manufacturer
      }

      return 'N/A'
    },

    /**
     * Find thing firmware info
     *
     * @returns {(Firmware|null)}
     */
    firmware() {
      return this.$store.getters['entities/firmware/query']()
        .where('device_id', this.thing.device_id)
        .first()
    },

    /**
     * Get thing firmware version
     *
     * @returns {String}
     */
    firmwareVersion() {
      if (this.firmware !== null && this._.get(this.firmware, 'version', null) !== null) {
        return this.firmware.version
      }

      return 'N/A'
    },

    /**
     * Get thing network wifi SSID name
     *
     * @returns {String}
     */
    wifiSSID() {
      const property = this.$store.getters['entities/device_property/query']()
        .where('device_id', this.thing.device_id)
        .where('property', 'ssid')
        .first()

      return property !== null && property.value !== null ? property.value : 'N/A'
    },

    /**
     * Get thing network IP address
     *
     * @returns {String}
     */
    wifiIPAddress() {
      const property = this.$store.getters['entities/device_property/query']()
        .where('device_id', this.thing.device_id)
        .where('property', 'ip-address')
        .first()

      return property !== null && property.value !== null ? property.value : 'N/A'
    },

    /**
     * Check if thing has time settings options
     *
     * @returns {Boolean}
     */
    hasTimeSettings() {
      if (!this._.get(this.hardware, 'isManufacturerItead')) {
        return false
      }

      return this.$store.getters['entities/device_configuration/query']()
        .where('device_id', this.thing.device_id)
        .where((item) => {
          return this._.get(item, 'name').indexOf('ntp_') === 0
        })
        .count() > 0
    },

    /**
     * Check if thing has sensors settings options
     *
     * @returns {Boolean}
     */
    hasSensorsSettings() {
      if (!this._.get(this.hardware, 'isManufacturerItead')) {
        return false
      }

      return this.$store.getters['entities/device_configuration/query']()
        .where('device_id', this.thing.device_id)
        .where((item) => {
          return this._.get(item, 'name').indexOf('sensor_') === 0 &&
            !this._.get(item, 'name').includes('sensor_expected_')
        })
        .count() > 0
    },

    /**
     * Check if thing has energy calibration settings options
     *
     * @returns {Boolean}
     */
    hasEnergyCalibration() {
      if (!this._.get(this.hardware, 'isManufacturerItead')) {
        return false
      }

      return this.$store.getters['entities/device_configuration/query']()
        .where('device_id', this.thing.device_id)
        .where((item) => {
          return this._.get(item, 'name').indexOf('sensor_expected_') === 0
        })
        .count() > 0
    },

    /**
     * Check if thing has some custom settings
     *
     * @returns {Boolean}
     */
    hasSettings() {
      return !!(this.deviceParameters.length ||
        this.channelParameters.length ||
        this.hasTimeSettings ||
        this.hasSensorsSettings ||
        this.hasEnergyCalibration)
    },

  },

  watch: {

    'thing.state'(val) {
      this.deviceParameters
        .forEach((parameter) => {
          if (Object.prototype.hasOwnProperty.call(this.$refs, parameter.name)) {
            if (val) {
              this.$refs[parameter.name][0].removeAttribute('disabled')
            } else {
              this.$refs[parameter.name][0].setAttribute('disabled', 'disabled')
            }
          }
        })

      this.channelParameters
        .forEach((parameter) => {
          if (Object.prototype.hasOwnProperty.call(this.$refs, parameter.name)) {
            if (val) {
              this.$refs[parameter.name][0].removeAttribute('disabled')
            } else {
              this.$refs[parameter.name][0].setAttribute('disabled', 'disabled')
            }
          }
        })
    },

  },

  created() {
    this.transparentModal = this.$parent.$options.name !== 'Layout'

    this.deviceParameters
      .forEach((parameter) => {
        this.form.parameter[parameter.name] = parameter.value

        if (!this.thing.state && Object.prototype.hasOwnProperty.call(this.$refs, parameter.name)) {
          this.$refs[parameter.name][0].setAttribute('disabled', 'disabled')
        }
      })

    this.deviceParameters
      .forEach((parameter) => {
        this.form.parameter[parameter.name] = parameter.value

        if (!this.thing.state && Object.prototype.hasOwnProperty.call(this.$refs, parameter.name)) {
          this.$refs[parameter.name][0].setAttribute('disabled', 'disabled')
        }
      })

    this.isCustom = this.hardware === null || this._.get(this.hardware, 'isCustom', true)
  },

  methods: {

    /**
     * Open edit|info window
     *
     * @param {String} window
     */
    openWindow(window) {
      if (Object.prototype.hasOwnProperty.call(this, window)) {
        this[window].show = true

        if (Object.prototype.hasOwnProperty.call(this.loading, window)) {
          this.loading[window] = true
        }
      }
    },

    /**
     * Close opened window
     *
     * @param {String} window
     */
    closeWindow(window) {
      if (Object.prototype.hasOwnProperty.call(this, window)) {
        this[window].show = false
      }
    },

    /**
     * Open thing edit form
     *
     * @param {String} type
     * @param {(ThingConfiguration|ChannelConfiguration)} [parameter]
     */
    openForm(type, parameter) {
      if ((type === 'deviceParameterForm' || type === 'channelParameterForm') && !this.thing.state) {
        this.$flashMessage(this.$t('things.messages.notOnline', {
          thing: this.$tThing(this.thing),
        }), 'error')

        return
      }

      this[type].show = true

      if (parameter !== null) {
        this[type].parameter = parameter
      }

      if (Object.prototype.hasOwnProperty.call(this.loading, type)) {
        if (parameter !== undefined) {
          if (type === 'deviceParameterForm') {
            this.loading.deviceParameterForm[parameter.name] = true
          } else if (type === 'channelParameterForm') {
            this.loading.channelParameterForm[parameter.name] = true
          }
        } else {
          this.loading[type] = true
        }
      }
    },

    /**
     * Open thing module edit form
     *
     * @param {String} prefix
     * @param {String} title
     */
    openModuleForm(prefix, title) {
      if (!this.thing.state) {
        this.$flashMessage(this.$t('things.messages.notOnline', {
          thing: this.$tThing(this.thing),
        }), 'error')

        return
      }

      this.moduleSettings.show = true
      this.moduleSettings.prefix = prefix
      this.moduleSettings.title = title

      if (Object.prototype.hasOwnProperty.call(this.loading, 'moduleSettings')) {
        this.loading.moduleSettings = true

        if (prefix === 'sensor_') {
          this.loading.sensorsSettings = true
        }

        if (prefix === 'ntp_') {
          this.loading.timeSettings = true
        }
      }
    },

    moduleFormLoaded() {
      this.loading.moduleSettings = false
      this.loading.sensorsSettings = false
      this.loading.timeSettings = false
    },

    /**
     * Close thing edit window
     *
     * @param {Object} event
     * @param {String} type
     */
    closeForm(event, type) {
      event && event.preventDefault()

      this[type].show = false
    },

    /**
     * Submit thing edit parameter
     *
     * @param {(ThingConfiguration|ChannelConfiguration)} parameter
     * @param {String} type
     */
    submit(parameter, type) {
      if (!this.thing.state) {
        this.$flashMessage(this.$t('things.messages.notOnline', {
          thing: this.$tThing(this.thing),
        }), 'error')

        return
      }

      if (type === 'device') {
        this.$store.dispatch('entities/device_configuration/edit', {
          device_id: this.thing.device_id,
          parameter_id: parameter.id,
          data: this.form.parameter[parameter.name],
        }, {
          root: true,
        })
      } else if (type === 'channel') {
        this.$store.dispatch('entities/channel_configuration_value/edit', {
          device_id: this.thing.device_id,
          channel_id: this.thing.channel_id,
          parameter_id: parameter.id,
          data: this.form.parameter[parameter.name],
        }, {
          root: true,
        })
      }
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
