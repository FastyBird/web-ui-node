<template>
  <fb-modal-form
    :transparent-bg="transparentBg"
    :submit-button="buttonText"
    icon="sliders-h"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.action') }}
    </template>

    <template slot="form">
      <fb-md-form-select
        v-model="form.model.thing"
        v-validate="'required'"
        :items="things"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.thing')"
        :has-error="errors.has(form.scope + '.thing')"
        :label="$t('field.thing.title')"
        :required="true"
        :blank-select="$t('field.thing.prompt')"
        name="thing"
        class="m-b-0"
      />

      <fb-md-form-select
        v-model="form.model.channel"
        v-validate="'required'"
        :items="channels"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.channel')"
        :has-error="errors.has(form.scope + '.channel')"
        :label="$t('field.channel.title')"
        :required="true"
        :blank-select="$t('field.channel.prompt')"
        name="channel"
        class="m-b-0"
      />

      <fb-md-form-select
        v-if="properties.length > 1"
        v-model="form.model.property"
        v-validate="'required'"
        :items="properties"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.property')"
        :has-error="errors.has(form.scope + '.property')"
        :name="'property'"
        :label="$t('field.property.title')"
        :required="true"
        :blank-select="$t('field.property.prompt')"
        class="m-b-0"
      />

      <div
        v-if="property !== null && property.data_type === dataType.enum && actions.length"
        class="row"
      >
        <div
          v-for="(action, index) of actions"
          :key="index"
          class="col-6"
        >
          <fb-md-form-radio-button
            v-model="form.model.value"
            v-validate="'required'"
            :data-vv-scope="form.scope"
            :has-error="errors.has(form.scope + '.value')"
            name="value"
            class="p-y-0"
            :label="action.value"
          >
            <template v-if="$te(`field.value.values.${action.name}`)">
              {{ $t(`field.value.values.${action.name}`) }}
            </template>
            <template v-else>
              {{ action.name }}
            </template>
          </fb-md-form-radio-button>
        </div>
      </div>

      <div
        v-if="property !== null && property.data_type === dataType.boolean"
        class="row"
      >
        <div class="col-6">
          <fb-md-form-radio-button
            v-model="form.model.value"
            v-validate="'required'"
            :data-vv-scope="form.scope"
            :has-error="errors.has(form.scope + '.value')"
            name="value"
            class="p-y-0"
            :label="true"
          >
            {{ $t('field.value.values.on') }}
          </fb-md-form-radio-button>
        </div>

        <div class="col-6">
          <fb-md-form-radio-button
            v-model="form.model.value"
            v-validate="'required'"
            :data-vv-scope="form.scope"
            :has-error="errors.has(form.scope + '.value')"
            name="value"
            class="p-y-0"
            :label="false"
          >
            {{ $t('field.value.values.off') }}
          </fb-md-form-radio-button>
        </div>
      </div>

      <div
        v-if="property !== null && (property.data_type === dataType.integer || property.data_type === dataType.float)"
        class="row"
      >
        <div class="col-9">
          <fb-md-form-input
            v-model="form.model.value"
            v-validate="'required'"
            :data-vv-scope="form.scope"
            :error="errors.first(form.scope + '.value')"
            :has-error="errors.has(form.scope + '.value')"
            :name="'value'"
            :label="$t('field.value.title')"
            :required="true"
            data-vv-validate-on="custom"
            class="m-b-0"
          />
        </div>
      </div>
    </template>
  </fb-modal-form>
</template>

<script>
  import Thing from '@/store/modules/io-server/Thing'
  import Channel from '@/store/modules/io-server/Channel'
  import ChannelProperty from '@/store/modules/io-server/ChannelProperty'

  import {
    DATA_TYPE_BOOLEAN,
    DATA_TYPE_ENUM,
    DATA_TYPE_FLOAT,
    DATA_TYPE_INTEGER,
    DATA_TYPE_STRING,
  } from '@/constants'

  export default {

    name: 'TriggersCreateAction',

    props: {

      transparentBg: {
        type: Boolean,
        default: false,
      },

    },

    data() {
      return {
        form: {
          scope: 'triggers_create_action',
          model: {
            thing: null,
            channel: null,
            property: null,
            value: undefined,
          },
        },
        dataType: {
          enum: DATA_TYPE_ENUM,
          float: DATA_TYPE_FLOAT,
          integer: DATA_TYPE_INTEGER,
          boolean: DATA_TYPE_BOOLEAN,
        },
      }
    },

    computed: {

      /**
       * Selected channel
       *
       * @returns {(Channel|null)}
       */
      channel() {
        return Channel
          .query()
          .with('properties')
          .where('id', this.form.model.channel)
          .first()
      },

      /**
       * Selected property
       *
       * @returns {(ChannelProperty|null)}
       */
      property() {
        if (this.channel === null) {
          return null
        }

        return ChannelProperty
          .query()
          .where('id', this.form.model.property)
          .first()
      },

      /**
       * Find all registered things with channels with settable properties
       *
       * @returns {Array}
       */
      things() {
        const options = []

        for (const thing of Thing.all()) {
          const channels = Channel
            .query()
            .with('properties')
            .where('thing_id', thing.id)
            .whereHas('properties', (query) => {
              query.where('is_settable', true)
            })
            .all()

          if (channels.length) {
            options.push({
              value: thing.id,
              name: thing.label,
            })
          }
        }

        return options
      },

      /**
       * Find all thing channels with settable properties
       *
       * @returns {Array}
       */
      channels() {
        const options = []

        if (this.form.model.thing !== null) {
          const thing = Thing.find(this.form.model.thing)

          const channels = Channel
            .query()
            .with('properties')
            .where('thing_id', this.form.model.thing)
            .whereHas('properties', (query) => {
              query.where('is_settable', true)
            })
            .orderBy('name')
            .all()

          const channelsGroups = []

          for (const channel of channels) {
            if (!channelsGroups.hasOwnProperty(channel.structure_type)) {
              channelsGroups[channel.structure_type] = []
            }

            channelsGroups[channel.structure_type].push({
              value: channel.id,
              name: this.$tChannel(thing, channel),
            })
          }

          for (const group in channelsGroups) {
            options.push({
              value: channelsGroups[group],
              name: this.$t(`groups.${group}`),
            })
          }
        }

        return options
      },

      /**
       * Find all channel properties for channel
       *
       * @returns {Array}
       */
      properties() {
        const options = []

        if (this.channel) {
          const thing = Thing.find(this.form.model.thing)

          for (const property of this.channel.properties) {
            if (property.is_settable) {
              options.push({
                value: property.id,
                name: this.$tChannelProperty(thing, this.channel, property),
              })
            }
          }
        }

        return options
      },

      actions() {
        const options = []

        if (this.property !== null) {
          if (this.property.data_type === DATA_TYPE_INTEGER || this.property.data_type === DATA_TYPE_FLOAT) {

          } else if (this.property.data_type === DATA_TYPE_BOOLEAN) {

          } else if (this.property.data_type === DATA_TYPE_STRING) {

          } else if (this.property.data_type === DATA_TYPE_ENUM) {
            const values = this.property.format.split(',')

            for (const value of values) {
              options.push({
                value: value.trim(),
                name: value.trim(),
              })
            }
          }
        }

        return options
      },

      buttonText() {
        if (this.$parent.$options.name !== 'TriggersDetail') {
          return this.$t('application.buttons.add.title')
        }

        return this.$t('application.buttons.save.title')
      },

    },

    watch: {

      'form.model.thing'() {
        this.errors.clear(this.form.scope)

        this.form.model.channel = null
      },

      'form.model.channel'() {
        this.errors.clear(this.form.scope)

        this.form.model.property = null
        this.form.model.value = undefined

        if (this.channel !== null) {
          const properties = this._.filter(this.channel.properties, { 'is_settable': true })

          if (properties.length > 0 && properties.length <= 1) {
            this.form.model.property = properties[0].id
          }
        }
      },

    },

    created() {
      this._initModel()

      this.$validator.localize({
        en: {
          custom: {
            thing: {
              required: this.$t('field.thing.validation.required'),
            },
            channel: {
              required: this.$t('field.channel.validation.required'),
            },
            value: {
              required: this.$t('field.value.validation.required'),
            },
          },
        },
      })
    },

    mounted() {
      this.$emit('loaded')
    },

    methods: {

      /**
       * Submit form values
       *
       * @param {Object} event
       */
      submit(event) {
        event && event.preventDefault()

        this.$validator.validateAll(this.form.scope)
          .then(result => {
            if (result) {
              this.$emit('add', this.form.model)
            }
          })
          .catch(() => {
            this.$toasted.info(this.$t('application.messages.fixAllFormErrors'), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })
          })
      },

      /**
       * Close trigger create window
       *
       * @param {Object} event
       */
      close(event) {
        event && event.preventDefault()

        this._initModel()

        this.$emit('close')
      },

      /**
       * Initialize form model object
       *
       * @private
       */
      _initModel() {
        this.form.model = {
          thing: null,
          channel: null,
          value: undefined,
        }

        this.errors.clear(this.form.scope)
      },

    },

  }
</script>

<i18n src="./locales.json" />
