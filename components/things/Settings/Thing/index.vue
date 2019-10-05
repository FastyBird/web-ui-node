<template>
  <div class="p-a-sm fb-iot-things-settings-thing__container">
    <h5 class="fw-b text-capitalize text-primary">
      {{ $t('headings.thingSettings') }}
    </h5>

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
        v-if="hasTimeSettings"
        class="list-group-item"
        role="button"
        @click.prevent="openModuleForm('ntp_', $t('headings.moduleTimeSettings'))"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.moduleSettings"
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
      <h5 class="fw-b text-capitalize text-primary">
        {{ $tc('headings.channelsSettings', channels.length) }}
      </h5>

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

    <h5 class="fw-b text-capitalize text-primary">
      {{ $t('headings.generalSettings') }}
    </h5>

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
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.remove"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.remove.title') }}
      </button>
    </div>

    <div class="list-group">
      <button
        class="list-group-item"
        role="button"
        @click.prevent="openWindow('thingInfo')"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.thingInfo"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.about.title') }}
      </button>
      <button
        class="list-group-item"
        role="button"
        @click.prevent="openWindow('networkInfo')"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.networkInfo"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.networkInfo.title') }}
      </button>
    </div>

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
      @loaded="loading.moduleSettings = false"
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

    <things-info-thing
      v-if="thingInfo.show"
      :thing="thing"
      :transparent-bg="transparentModal"
      @loaded="loading.thingInfo = false"
      @close="closeWindow('thingInfo')"
    />

    <things-info-network
      v-if="networkInfo.show"
      :thing="thing"
      :transparent-bg="transparentModal"
      @loaded="loading.networkInfo = false"
      @close="closeWindow('networkInfo')"
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
  const ThingsInfoThing = () => import('../../Info/Thing')
  const ThingsInfoNetwork = () => import('../../Info/Network')
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
      ThingsInfoThing,
      ThingsInfoNetwork,
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
        const parameters = this.$store.getters['entities/thing_configuration/query']()
          .where('thing_id', this.thing.id)
          .orderBy('name')
          .all()

        let filtered = []

        if (this._.get(this.hardware, 'isManufacturerItead')) {
          parameters.forEach(item => {
            if (
              this._.get(item, 'name').indexOf('sensor_expected_') !== 0
              && this._.get(item, 'name').indexOf('ntp_') !== 0
            ) {
              filtered.push(item)
            }
          })
        } else {
          filtered = parameters
        }

        return filtered
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
       * Check if thing has time settings options
       *
       * @returns {Boolean}
       */
      hasTimeSettings() {
        if (!this._.get(this.hardware, 'isManufacturerItead')) {
          return false
        }

        const parameters = this.$store.getters['entities/thing_configuration/query']()
          .where('thing_id', this.thing.id)
          .orderBy('name')
          .all()

        let result = false

        parameters.forEach(item => {
          if (this._.get(item, 'name').indexOf('ntp_') === 0) {
            result = true
          }
        })

        return result
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

        const parameters = this.$store.getters['entities/thing_configuration/query']()
          .where('thing_id', this.thing.id)
          .orderBy('name')
          .all()

        let result = false

        parameters.forEach(item => {
          if (this._.get(item, 'name').indexOf('sensor_expected_') === 0) {
            result = true
          }
        })

        return result
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
        }
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
