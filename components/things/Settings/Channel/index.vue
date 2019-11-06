<template>
  <div class="fb-iot-things-settings-channel__container">
    <template v-if="parameters.length">
      <div class="fb-iot-things-settings-channel__heading p-x-md p-y-0 m-a-0">
        <h3>
          {{ $t('headings.channelSettings') }}
        </h3>
      </div>

      <div class="list-group">
        <template v-for="parameter in parameters">
          <parameter
            :key="parameter.name"
            :thing="thing"
            :channel="channel"
            :parameter="parameter"
            :hardware="hardware"
            :loading="_.get(loading.parameterForm, parameter.name, false) === true"
            @submit="submit(parameter)"
            @openForm="openForm('parameterForm', parameter)"
          />
        </template>
      </div>
    </template>

    <div class="fb-iot-things-settings-channel__heading p-x-md p-y-0 m-a-0">
      <h3>
        {{ $t('headings.generalSettings') }}
      </h3>
    </div>

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
  const ThingsEditChannelRename = () => import('../../Edit/Channel/Rename')
  const ThingsEditChannelParameter = () => import('../../Edit/Channel/Parameter')

  import Parameter from './Parameter'

  export default {

    name: 'ThingsSettingsChannel',

    components: {
      ThingsEditChannelRename,
      ThingsEditChannelParameter,

      Parameter,
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
        return this.$store.getters['entities/channel_configuration/query']()
          .where('id', this.channel.configuration_ids)
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

        this.$store.dispatch('entities/channel_configuration_value/edit', {
          thing_id: this.thing.id,
          channel_id: this.channel.id,
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
