<template>
  <div class="p-a-sm fb-iot-things-settings-channel__container">
    <template v-if="parameters.length">
      <h5 class="fw-b text-capitalize text-primary">
        {{ $t('headings.channelSettings') }}
      </h5>

      <div class="list-group">
        <template v-for="parameter in parameters">
          <div
            v-if="isBooleanSettingsRow(parameter)"
            :key="parameter.name"
            :class="['list-group-item', {'text-warning':!thing.state}]"
          >
            <span class="pull-right">
              <switch-element
                :ref="parameter.name"
                :status="form.parameter[parameter.name]"
                :disabled="!thing.state"
                @change="submit(parameter)"
              />
            </span>
            <template v-if="$t(`things.vendors.${_.get(hardware, 'manufacturer', manufacturer.generic)}.${parameter.name}.button`).indexOf('things.vendors.') === -1">
              {{ $t(`things.vendors.${_.get(hardware, 'manufacturer', manufacturer.generic)}.${parameter.name}.button`) }}
            </template>
            <template v-else>
              {{ parameter.name }}
            </template>
          </div>

          <button
            v-else
            :key="parameter.name"
            :class="['list-group-item', {'text-warning':!thing.state}]"
            role="button"
            @click.prevent="openForm('parameterForm', parameter)"
          >
            <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
            <span
              v-show="_.get(loading.parameterForm, parameter.name, false) === true"
              class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
            />
            <template v-if="$t(`things.vendors.${_.get(hardware, 'manufacturer', manufacturer.generic)}.${parameter.name}.button`).indexOf('things.vendors.') === -1">
              {{ $t(`things.vendors.${_.get(hardware, 'manufacturer', manufacturer.generic)}.${parameter.name}.button`) }}
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
                <strong>{{ _.get(values, parameter.id, null) }}</strong>
              </template>
            </small>
          </button>
        </template>
      </div>
    </template>

    <h5 class="fw-b text-capitalize text-primary">
      {{ $t('headings.generalSettings') }}
    </h5>

    <div class="list-group">
      <button
        class="list-group-item"
        role="button"
        @click.prevent="openForm('rename')"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.rename"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.rename.title') }}
      </button>
    </div>

    <things-edit-channel-rename
      v-if="rename.show"
      :thing="thing"
      :channel="channel"
      :transparent-bg="transparentModal"
      @loaded="loading.rename = false"
      @close="closeForm($event, 'rename')"
    />

    <things-edit-channel-parameter
      v-if="parameterForm.show"
      :thing="thing"
      :channel="channel"
      :parameter="parameterForm.parameter"
      :transparent-bg="transparentModal"
      @loaded="loading.parameterForm = []"
      @close="closeForm($event, 'parameterForm')"
    />
  </div>
</template>

<script>
  import {
    IO_SERVER_CHANNEL_CONFIGURATION_BOOLEAN,
    IO_SERVER_CHANNEL_CONFIGURATION_SELECT,
  } from '@/api/server/types'

  import {
    MANUFACTURER_GENERIC,
  } from '@/constants'

  import { WAMP_TOPIC_THING_CHANNEL } from '@/config'

  const ThingsEditChannelRename = () => import('../../Edit/Channel/Rename')
  const ThingsEditChannelParameter = () => import('../../Edit/Channel/Parameter')

  import SwitchElement from '@/components/layout/SwitchElement'

  import Hardware from '@/store/modules/io-server/Hardware'
  import ChannelConfiguration from '@/store/modules/io-server/ChannelConfiguration'
  import ChannelConfigurationValue from '@/store/modules/io-server/ChannelConfigurationValue'

  export default {

    name: 'ThingsSettingsChannel',

    components: {
      ThingsEditChannelRename,
      ThingsEditChannelParameter,

      SwitchElement,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channel: {
        type: Object,
        required: true,
      },

    },

    data() {
      return {
        transparentModal: false,
        manufacturer: {
          generic: MANUFACTURER_GENERIC,
        },
        loading: {
          rename: false,
          parameterForm: [],
        },
        rename: {
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
       * Get all channel configuration parameters
       *
       * @returns {Array}
       */
      parameters() {
        return ChannelConfiguration
          .findIn(this.channel.configuration_ids)
      },

      values() {
        const values = []

        const stored = ChannelConfigurationValue
          .query()
          .where('channel_id', this.channel.id)
          .where('configuration_id', this.channel.configuration_ids)
          .all()

        stored
          .forEach(item => {
            values[item.configuration_id] = item.value
          })

        return values
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
    },

    methods: {

      /**
       * Check if settings row is boolean type
       *
       * @param {ChannelConfiguration} row
       * @param {String} row.type
       *
       * @return {Boolean}
       */
      isBooleanSettingsRow(row) {
        return row.type === IO_SERVER_CHANNEL_CONFIGURATION_BOOLEAN
      },

      /**
       * Check if settings parameter is selectable type
       *
       * @return {Boolean}
       */
      isSelectSettingsRow(row) {
        return row.type === IO_SERVER_CHANNEL_CONFIGURATION_SELECT
      },

      /**
       * Parse parameter items for select box
       *
       * @returns {String}
       */
      getSelectSettingsRowValue(row) {
        for (const key in row.values) {
          // eslint-disable-next-line
          if (row.values.hasOwnProperty(key)&& row.values[key].value == this._.get(this.values, row.id)) {
            if (this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.${row.name}.values.${row.values[key].name}`).indexOf('things.vendors.') === -1) {
              return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.${row.name}.values.${row.values[key].name}`)
            } else {
              return this._.get(this.values, row.id)
            }
          }
        }

        return this._.get(this.values, row.id)
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
       * @param {String} [parameter]
       */
      openForm(type, parameter) {
        if (type === 'parameterForm' && !this.thing.state) {
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
       * Close channel edit window
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
       * @param {ChannelConfiguration} parameter
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

        let topic = WAMP_TOPIC_THING_CHANNEL
        topic = topic.replace('{thing_id}', this.channel.thing_id)
        topic = topic.replace('{channel_id}', this.channel.id)

        const data = {}
        data[parameter.name] = this.form.parameter[parameter.name]

        this.$wamp.call(topic, {
          action: 'channel.configure',
          payload: data,
        })
          .then(cmdResult => {
            if (this._.get(cmdResult, 'response') === 'accepted') {
              ChannelConfigurationValue.update({
                where: parameter.id + this.channel.id,
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
