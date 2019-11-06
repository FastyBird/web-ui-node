<template>
  <div class="fb-iot-things-settings-thing__container">
    <div class="fb-iot-things-settings-thing__heading p-x-md p-y-0 m-a-0">
      <h3>
        {{ $t('headings.thingSettings') }}
      </h3>
    </div>

    <div class="list-group">
      <button
        v-if="isCustom"
        class="list-group-item"
        role="button"
        @click.prevent="openForm('credentials')"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.credentials"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.credentials.title') }}
      </button>
      <template v-for="parameter in parameters">
        <parameter
          :key="parameter.name"
          :thing="thing"
          :parameter="parameter"
          :hardware="hardware"
          :loading="_.get(loading.parameterForm, parameter.name, false) === true"
          @submit="submit(parameter)"
          @openForm="openForm('parameterForm', parameter)"
        />
      </template>

      <button
        v-if="hasSensorsSettings"
        class="list-group-item"
        role="button"
        @click.prevent="openModuleForm('sensor_', $t('headings.moduleSensorSettings'))"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.sensorsSettings"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.sensorConfiguration.title') }}
        <small class="d-b fz-sm">
          {{ $t('buttons.sensorConfiguration.description') }}
        </small>
      </button>

      <button
        v-if="hasTimeSettings"
        class="list-group-item"
        role="button"
        @click.prevent="openModuleForm('ntp_', $t('headings.moduleTimeSettings'))"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.timeSettings"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.timeConfiguration.title') }}
        <small class="d-b fz-sm">
          {{ $t('buttons.timeConfiguration.description') }}
        </small>
      </button>

      <button
        v-if="hasEnergyCalibration"
        class="list-group-item"
        role="button"
        @click.prevent="openForm('energyCalibration')"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.energyCalibration"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.energyCalibration.title') }}
      </button>
    </div>

    <fb-loading-box
      v-if="fetchingChannels"
      :text="$t('texts.loading')"
    />

    <template v-if="!fetchingChannels && channels.length">
      <div class="fb-iot-things-settings-thing__heading p-x-md p-y-0 m-a-0">
        <h3>
          {{ $tc('headings.channelsSettings', channels.length) }}
        </h3>
      </div>

      <div class="list-group">
        <button
          v-for="channel in channels"
          :key="channel.id"
          class="list-group-item"
          @click.prevent="$emit('channelSettings', channel)"
        >
          <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
          {{ $tChannel(thing, channel) }}
        </button>
      </div>
    </template>

    <div class="fb-iot-things-settings-thing__heading p-x-md p-y-0 m-a-0">
      <h3>
        {{ $t('headings.generalSettings') }}
      </h3>
    </div>

    <div class="list-group">
      <button
        class="list-group-item"
        role="button"
        @click.prevent="openWindow('rename')"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.rename"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.rename.title') }}
      </button>
      <button
        class="list-group-item text-danger"
        role="button"
        @click.prevent="openWindow('remove')"
      >
        <span class="pull-right"><font-awesome-icon icon="exclamation-triangle" /></span>
        <span
          v-show="loading.remove"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.remove.title') }}
      </button>
    </div>

    <div class="fb-iot-things-settings-thing__heading p-x-md p-y-0 m-a-0">
      <h3>
        {{ $t('headings.manufacturerAndNetwork') }}
      </h3>
    </div>

    <ul class="media-list">
      <li class="media p-x-md p-y-sm">
        <div class="media-middle media-left">
          <img
            width="40"
            height="40"
            src="/manufacturers/itead.jpg"
            :alt="hardwareManufacturer"
          >
        </div>
        <div class="media-middle media-body">
          <h5 class="m-y-0">
            <strong>{{ $t('texts.hardware.manufacturer') }}:</strong> {{ hardwareManufacturer }}
          </h5>
          <small><strong>{{ $t('texts.hardware.model') }}:</strong> {{ hardwareModel }} - ver. {{ firmwareVersion }}</small>
        </div>
      </li>

      <li class="media p-x-md p-y-sm m-t-0">
        <div class="media-middle media-left">
          <font-awesome-icon icon="wifi" />
        </div>
        <div class="media-middle media-body">
          <h5 class="m-y-0">
            <strong>{{ $t('texts.wifi.name') }}:</strong> {{ wifiSSID }}
          </h5>
          <small><strong>{{ $t('texts.wifi.ip') }}:</strong> {{ wifiIPAddress }}</small>
        </div>
      </li>
    </ul>

    <things-edit-thing-credentials
      v-if="isCustom && credentials.show"
      :thing="thing"
      :transparent-bg="transparentModal"
      @loaded="loading.credentials = false"
      @close="closeWindow('credentials')"
    />

    <things-edit-thing-module-configuration
      v-if="moduleSettings.show"
      :thing="thing"
      :title="moduleSettings.title"
      :key-prefix="moduleSettings.prefix"
      :transparent-bg="transparentModal"
      @loaded="moduleFormLoaded"
      @close="closeWindow('moduleSettings')"
    />

    <things-edit-thing-energy-calibration
      v-if="hasEnergyCalibration && energyCalibration.show"
      :thing="thing"
      :transparent-bg="transparentModal"
      @loaded="loading.energyCalibration = false"
      @close="closeWindow('energyCalibration')"
    />

    <things-edit-thing-rename
      v-if="rename.show"
      :thing="thing"
      :transparent-bg="transparentModal"
      @loaded="loading.rename = false"
      @close="closeWindow('rename')"
    />

    <things-remove
      v-if="remove.show"
      :thing="thing"
      :transparent-bg="transparentModal"
      @loaded="loading.remove = false"
      @close="closeWindow('remove')"
    />

    <things-edit-thing-parameter
      v-if="parameterForm.show"
      :thing="thing"
      :parameter="parameterForm.parameter"
      :transparent-bg="transparentModal"
      @loaded="loading.parameterForm = []"
      @close="closeForm($event, 'parameterForm')"
    />
  </div>
</template>

<script>
  const ThingsEditThingCredentials = () => import('../../Edit/Thing/Credentials')
  const ThingsEditThingEnergyCalibration = () => import('../../Edit/Thing/EnergyCalibration')
  const ThingsEditThingModuleConfiguration = () => import('../../Edit/Thing/ModuleConfiguration')
  const ThingsEditThingRename = () => import('../../Edit/Thing/Rename')
  const ThingsRemove = () => import('../../Remove')
  const ThingsEditThingParameter = () => import('../../Edit/Thing/Parameter')

  import Parameter from './Parameter'

  export default {

    name: 'ThingsSettingsThing',

    components: {
      ThingsEditThingCredentials,
      ThingsEditThingEnergyCalibration,
      ThingsEditThingModuleConfiguration,
      ThingsEditThingRename,
      ThingsRemove,
      ThingsEditThingParameter,

      Parameter,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channels: {
        type: Array,
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
          parameterForm: [],
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
        parameterForm: {
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
       * Get all thing configuration parameters
       *
       * @returns {Array}
       */
      parameters() {
        return this.$store.getters['entities/thing_configuration/query']()
          .where('thing_id', this.thing.id)
          .where(item => {
            return this._.get(item, 'name').indexOf('ntp_') !== 0 &&
              this._.get(item, 'name').indexOf('sensor_') !== 0
          })
          .orderBy('name')
          .all()
      },

      /**
       * Get thing hardware info
       *
       * @returns {(Hardware|null)}
       */
      hardware() {
        return this.$store.getters['entities/hardware/query']()
          .where('thing_id', this.thing.id)
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
          .where('thing_id', this.thing.id)
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
        const property = this.$store.getters['entities/thing_property/query']()
          .where('thing_id', this.thing.id)
          .where('name', 'ssid')
          .first()

        return property !== null && property.value !== null ? property.value : 'N/A'
      },

      /**
       * Get thing network IP address
       *
       * @returns {String}
       */
      wifiIPAddress() {
        const property = this.$store.getters['entities/thing_property/query']()
          .where('thing_id', this.thing.id)
          .where('name', 'ip-address')
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

        return this.$store.getters['entities/thing_configuration/query']()
          .where('thing_id', this.thing.id)
          .where(item => {
            return this._.get(item, 'name').indexOf('ntp_') === 0
          })
          .count() > 0 ? true : false
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

        return this.$store.getters['entities/thing_configuration/query']()
          .where('thing_id', this.thing.id)
          .where(item => {
            return this._.get(item, 'name').indexOf('sensor_') === 0 &&
              this._.get(item, 'name').indexOf('sensor_expected_') === -1
          })
          .count() > 0 ? true : false
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

        return this.$store.getters['entities/thing_configuration/query']()
          .where('thing_id', this.thing.id)
          .where(item => {
            return this._.get(item, 'name').indexOf('sensor_expected_') === 0
          })
          .count() > 0 ? true : false
      },

      /**
       * Flag signalizing that thing channels are loading from server
       *
       * @returns {Boolean}
       */
      fetchingChannels() {
        if (this.$store.getters['entities/channel/fetching'](this.thing.id)) {
          return true
        }

        this.thing.channel_ids.forEach(item => {
          if (this.$store.getters['entities/channel/getting'](item.id)) {
            return true
          }
        })

        return false
      },

    },

    watch: {

      'thing.state'(val) {
        this.parameters
          .forEach(parameter => {
            if (this.$refs.hasOwnProperty(parameter.name)) {
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

      this.parameters
        .forEach(parameter => {
          this.form.parameter[parameter.name] = parameter.value

          if (!this.thing.state && this.$refs.hasOwnProperty(parameter.name)) {
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
        if (this.hasOwnProperty(window)) {
          this[window].show = true

          if (this.loading.hasOwnProperty(window)) {
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
        if (this.hasOwnProperty(window)) {
          this[window].show = false
        }
      },

      /**
       * Open thing edit form
       *
       * @param {String} type
       * @param {ThingConfiguration} [parameter]
       */
      openForm(type, parameter) {
        if ((type === 'parameterForm') && !this.thing.state) {
          this.$toasted.error(this.$t('things.messages.notOnline', {
            thing: this.thing.label,
          }), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        this[type].show = true

        if (parameter !== null) {
          this[type].parameter = parameter
        }

        if (this.loading.hasOwnProperty(type)) {
          if (parameter !== undefined) {
            this.loading.parameterForm[parameter.name] = true
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
          this.$toasted.error(this.$t('things.messages.notOnline', {
            thing: this.thing.label,
          }), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        this.moduleSettings.show = true
        this.moduleSettings.prefix = prefix
        this.moduleSettings.title = title

        if (this.loading.hasOwnProperty('moduleSettings')) {
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
       * @param {ThingConfiguration} parameter
       */
      submit(parameter) {
        if (!this.thing.state) {
          this.$toasted.error(this.$t('things.messages.notOnline', {
            thing: this.thing.label,
          }), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        this.$store.dispatch('entities/thing_configuration/edit', {
          thing_id: this.thing.id,
          parameter_id: parameter.id,
          data: this.form.parameter[parameter.name],
        }, {
          root: true,
        })

        this.$toasted.success(this.$t('things.messages.edited', {
          thing: this.thing.label,
        }), {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
        })
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
