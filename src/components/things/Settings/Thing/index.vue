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
      <template v-for="(parameter, index) in parameters">
        <div
          v-if="isBooleanSettingsRow(parameter)"
          :key="index"
          :class="['list-group-item', {'text-warning': !thing.state}]"
        >
          <span class="pull-right">
            <switch-element
              :ref="parameter.name"
              :status="form.parameter[parameter.name]"
              :disabled="!thing.state"
              @change="submit(parameter)"
            />
          </span>
          <template v-if="$t(`things.vendors.${_.get(hardware, 'manufacturer', 'custom')}.${parameter.name}.button`).indexOf('things.vendors.') === -1">
            {{ $t(`things.vendors.${_.get(hardware, 'manufacturer', 'custom')}.${parameter.name}.button`) }}
          </template>
          <template v-else>
            {{ parameter.name }}
          </template>
        </div>

        <button
          v-else
          :key="index"
          :class="['list-group-item', {'text-warning': !thing.state}]"
          role="button"
          @click.prevent="openForm('parameterForm', parameter)"
        >
          <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
          <span
            v-show="_.get(loading.parameterForm, parameter.name, false) === true"
            class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
          />
          <template v-if="$t(`things.vendors.${_.get(hardware, 'manufacturer', 'custom')}.${parameter.name}.button`).indexOf('things.vendors.') === -1">
            {{ $t(`things.vendors.${_.get(hardware, 'manufacturer', 'custom')}.${parameter.name}.button`) }}
          </template>
          <template v-else>
            {{ parameter.name }}
          </template>
          <small class="d-b">
            {{ $t('texts.actual') }}:
            <template v-if="isSelectSettingsRow(parameter)">
              <strong>{{ getSelectSettingsRowValue(parameter) }}</strong>
            </template>
            <template v-else>
              <strong>{{ parameter.value }}</strong>
            </template>
          </small>
        </button>
      </template>
    </div>

    <template v-if="channels.length">
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
          {{ channel.label }}
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
  import {
    IO_SERVER_THING_CONFIGURATION_BOOLEAN,
    IO_SERVER_THING_CONFIGURATION_SELECT,
  } from '@/api/server/types'

  import { WAMP_TOPIC_THING } from '@/config'

  const ThingsInfoThing = () => import('../../Info/Thing')
  const ThingsInfoNetwork = () => import('../../Info/Network')
  const ThingsEditThingCredentials = () => import('../../Edit/Thing/Credentials')
  const ThingsEditThingRename = () => import('../../Edit/Thing/Rename')
  const ThingsRemove = () => import('../../Remove')
  const ThingsEditThingParameter = () => import('../../Edit/Thing/Parameter')

  import SwitchElement from '@/components/layout/SwitchElement'

  import ThingConfiguration from '@/store/modules/io-server/ThingConfiguration'
  import Hardware from '@/store/modules/io-server/Hardware'

  export default {

    name: 'ThingsSettingsThing',

    components: {
      ThingsInfoThing,
      ThingsInfoNetwork,
      ThingsEditThingCredentials,
      ThingsEditThingRename,
      ThingsRemove,
      ThingsEditThingParameter,

      SwitchElement,
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
          rename: false,
          remove: false,
          thingInfo: false,
          networkInfo: false,
          parameterForm: [],
        },
        credentials: {
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
        return ThingConfiguration
          .query()
          .where('thing_id', this.thing.id)
          .all()
      },

      /**
       * Get thing hardware info
       *
       * @returns {(Hardware|null)}
       */
      hardware() {
        return Hardware
          .query()
          .where('thing_id', this.thing.id)
          .first()
      },

      /**
       * Flag signalizing that thing is loading from server
       *
       * @returns {Boolean}
       */
      fetchingChannel() {
        return this.$store.state.entities.thing.semaphore.fetching.items
          || this.$store.state.entities.thing.semaphore.fetching.item.indexOf(this.thing.id) !== -1
          || this.$store.state.entities.channel.semaphore.fetching.items.indexOf(this.thing.id) !== -1
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

      this.isCustom = this.hardware === null || this.hardware.model === 'custom'
    },

    methods: {

      /**
       * Check if settings row is boolean type
       *
       * @param {ThingConfiguration} row
       * @param {String} row.type
       *
       * @return {Boolean}
       */
      isBooleanSettingsRow(row) {
        return row.type === IO_SERVER_THING_CONFIGURATION_BOOLEAN
      },

      /**
       * Check if settings parameter is selectable type
       *
       * @return {Boolean}
       */
      isSelectSettingsRow(row) {
        return row.type === IO_SERVER_THING_CONFIGURATION_SELECT
      },

      /**
       * Parse parameter items for select box
       *
       * @returns {String}
       */
      getSelectSettingsRowValue(row) {
        for (const key in row.values) {
          // eslint-disable-next-line
          if (row.values.hasOwnProperty(key)&& row.values[key].value == row.value) {
            if (this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', 'custom')}.${row.name}.values.${row.values[key].name}`).indexOf('things.vendors.') === -1) {
              return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', 'custom')}.${row.name}.values.${row.values[key].name}`)
            } else {
              return row.value
            }
          }
        }

        return row.value
      },

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

        const topic = WAMP_TOPIC_THING.replace('{thing_id}', this.thing.id)

        const data = {}
        data[parameter.name] = this.form.parameter[parameter.name]

        this.$wamp.call(topic, {
          action: 'thing.configure',
          payload: data,
        })
          .then(cmdResult => {
            if (this._.get(cmdResult, 'response') === 'accepted') {
              ThingConfiguration.update({
                where: this.parameter.id,
                data: {
                  value: this.form.model,
                },
              })
                .catch(() => {
                  // Something went wrong
                })
            } else {
              // Something went wrong
            }
          })
          .catch(() => {
            // Something went wrong
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
