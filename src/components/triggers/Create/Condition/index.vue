<template web>
  <fb-modal-form
    :transparent-bg="transparentBg"
    :submit-button="buttonText"
    icon="sliders-h"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.condition') }}
    </template>

    <template slot="form">
      <fb-md-form-select
        v-model="form.model.thing"
        v-validate="'required'"
        :items="things"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.thing')"
        :has-error="errors.has(form.scope + '.thing')"
        :name="'thing'"
        :label="$t('field.thing.title')"
        :required="true"
        :blank-select="$t('field.thing.prompt')"
        class="m-b-0"
      />

      <fb-md-form-select
        v-model="form.model.trigger"
        v-validate="'required'"
        :items="triggers"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.trigger')"
        :has-error="errors.has(form.scope + '.trigger')"
        :name="'trigger'"
        :label="$t('field.trigger.title')"
        :required="true"
        :blank-select="$t('field.trigger.prompt')"
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

      <fb-md-form-checkboxes-group
        v-if="property !== null && property.data_type === dataType.enum && actions.length"
        v-model="form.model.operands"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.operands')"
        :has-error="errors.has(form.scope + '.operands')"
        :name="'operands'"
        data-vv-validate-on="custom"
        class="row"
      >
        <div
          v-for="(action, index) of actions"
          :key="index"
          class="col-6"
        >
          <fb-md-form-checkbox
            :has-error="errors.has(form.scope + '.operands')"
            name="operands[]"
            class="p-y-0"
            :label="action.value"
          >
            <template v-if="$te(`field.operands.values.${action.name}`)">
              {{ $t(`field.operands.values.${action.name}`) }}
            </template>
            <template v-else>
              {{ action.name }}
            </template>
          </fb-md-form-checkbox>
        </div>
      </fb-md-form-checkboxes-group>

      <fb-md-form-checkboxes-group
        v-if="property !== null && property.data_type === dataType.boolean"
        v-model="form.model.operands"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.operands')"
        :has-error="errors.has(form.scope + '.operands')"
        :name="'operands'"
        data-vv-validate-on="custom"
        class="row"
      >
        <div class="col-6">
          <fb-md-form-checkbox
            :has-error="errors.has(form.scope + '.operands')"
            name="operands[]"
            class="p-y-0"
            :label="true"
          >
            {{ $t('field.operands.values.on') }}
          </fb-md-form-checkbox>
        </div>
        <div class="col-6">
          <fb-md-form-checkbox
            :has-error="errors.has(form.scope + '.operands')"
            name="operands[]"
            class="p-y-0"
            :label="false"
          >
            {{ $t('field.operands.values.off') }}
          </fb-md-form-checkbox>
        </div>
      </fb-md-form-checkboxes-group>

      <div
        v-if="property !== null && (property.data_type === dataType.integer || property.data_type === dataType.float)"
        class="row"
      >
        <div class="col-3">
          <fb-md-form-select
            v-model="form.model.operator"
            :items="values.operator"
            :data-vv-scope="form.scope"
            :error="errors.first(form.scope + '.operator')"
            :has-error="errors.has(form.scope + '.operator')"
            :label="$t('field.operator.title')"
            :required="true"
            name="operator"
            data-vv-as="operator"
            data-vv-validate-on="custom"
            class="m-b-0"
          />
        </div>
        <div class="col-9">
          <fb-md-form-input
            v-model="form.model.operands"
            v-validate="'required'"
            :data-vv-scope="form.scope"
            :error="errors.first(form.scope + '.operands')"
            :has-error="errors.has(form.scope + '.operands')"
            :name="'operands'"
            :label="$t('field.operands.title')"
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
  import ThingProperty from '@/store/modules/io-server/ThingProperty'
  import Channel from '@/store/modules/io-server/Channel'
  import ChannelProperty from '@/store/modules/io-server/ChannelProperty'

  import {
    DATA_TYPE_BOOLEAN,
    DATA_TYPE_ENUM,
    DATA_TYPE_FLOAT,
    DATA_TYPE_INTEGER,
    DATA_TYPE_STRING,

    PROPERTY_TYPE_STATE,
  } from '@/constants'

  export default {

    name: 'TriggersCreateCondition',

    props: {

      transparentBg: {
        type: Boolean,
        default: false,
      },

    },

    data() {
      return {
        form: {
          scope: 'triggers_create_condition',
          model: {
            thing: null,
            trigger: null,
            property: null,
            operator: undefined,
            operands: undefined,
          },
        },
        values: {
          operator: [
            {
              value: 'above',
              name: this.$t('field.operator.values.above'),
            }, {
              value: 'eq',
              name: this.$t('field.operator.values.eq'),
            }, {
              value: 'below',
              name: this.$t('field.operator.values.below'),
            },
          ],
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
        if (this.form.model.trigger === 'state') {
          return null
        }

        return Channel
          .query()
          .with('properties')
          .where('id', this.form.model.trigger)
          .first()
      },

      /**
       * Selected property
       *
       * @returns {(ThingProperty|ChannelProperty|null)}
       */
      property() {
        if (this.form.model.trigger === 'state') {
          return ThingProperty
            .query()
            .where('thing_id', this.form.model.thing)
            .where('property', PROPERTY_TYPE_STATE)
            .first()
        }

        return ChannelProperty
          .query()
          .where('id', this.form.model.property)
          .first()
      },

      /**
       * Find all registered things
       *
       * @returns {Array}
       */
      things() {
        const options = []

        for (const thing of Thing.all()) {
          options.push({
            value: thing.id,
            name: thing.label,
          })
        }

        return options
      },

      /**
       * Prepare all possible triggers (thing property or channel)
       *
       * @returns {Array}
       */
      triggers() {
        const options = []

        if (this.form.model.thing !== null) {
          options.push({
            value: [{
              value: 'state',
              name: this.$t('field.trigger.values.onOff'),
            }],
            name: this.$t('groups.state'),
          })

          const channels = Channel
            .query()
            .with('properties')
            .where('thing_id', this.form.model.thing)
            .has('properties')
            .orderBy('name')
            .all()

          const channelsGroups = []

          for (const channel of channels) {
            if (!channelsGroups.hasOwnProperty(channel.structure_type)) {
              channelsGroups[channel.structure_type] = []
            }

            channelsGroups[channel.structure_type].push({
              value: channel.id,
              name: channel.label,
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
       * Find all channel properties for channel trigger
       *
       * @returns {Array}
       */
      properties() {
        const options = []

        if (this.form.model.trigger === 'state') {
          const property = ThingProperty
            .query()
            .where('thing_id', this.form.model.thing)
            .where('property', PROPERTY_TYPE_STATE)
            .first()

          options.push({
            value: property.id,
            name: property.name,
          })

          return options
        } else if (this.channel !== null) {
          for (const property of this.channel.properties) {
            options.push({
              value: property.id,
              name: property.name,
            })
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

        this.form.model.trigger = null
      },

      'form.model.trigger'(val) {
        this.errors.clear(this.form.scope)

        this.form.model.operands = undefined
        this.form.model.operator = undefined

        if (val === 'state') {
          if (this.property !== null) {
            this.form.model.property = this.property.id
          }

          return
        }

        if (this.channel !== null) {
          if (this.channel.properties.length > 0 && this.channel.properties.length <= 1) {
            this.form.model.property = this.channel.properties[0].id
          }
        }
      },

      'form.model.property'() {
        if (this.property !== null) {
          if (this.property.data_type === DATA_TYPE_INTEGER || this.property.data_type === DATA_TYPE_FLOAT) {
            this.form.model.operator = 'above'
            this.form.model.operand = 0
          } else if (this.property.data_type === DATA_TYPE_BOOLEAN) {
            this.form.model.operator = 'eq'
          } else if (this.property.data_type === DATA_TYPE_STRING) {

          } else if (this.property.data_type === DATA_TYPE_ENUM) {
            this.form.model.operator = 'eq'
          }
        }
      },

    },

    created() {
      this._initModel()

      this.$validator.localize({
        en: {
          custom: {
            operands: {
              required: this.$t('field.operands.validation.required'),
            },
            operator: {
              required: this.$t('field.operator.validation.required'),
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
          trigger: null,
          property: null,
          operands: undefined,
          operator: undefined,
        }

        this.errors.clear(this.form.scope)
      },

    },

  }
</script>

<i18n src="./locales.json" />
