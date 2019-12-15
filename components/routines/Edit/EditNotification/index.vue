<template>
  <fb-modal-form
    :transparent-bg="transparentBg"
    :submit-button="buttonText"
    icon="project-diagram"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.notification') }}
    </template>

    <template slot="form">
      <fb-md-form-select
        v-model="form.model.type"
        v-validate="'required'"
        :items="values.type"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.type')"
        :has-error="errors.has(form.scope + '.type')"
        :label="$t('field.type.title')"
        :required="true"
        :blank-select="$t('field.type.prompt')"
        name="type"
      />

      <template v-if="form.model.type === 'sms'">
        <fb-md-form-input
          v-model="form.model.value"
          v-validate="'required'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.value')"
          :has-error="errors.has(form.scope + '.value')"
          :label="$t('field.sms.title')"
          :required="true"
          data-vv-validate-on="blur"
          name="value"
        />
      </template>
      <template v-else-if="form.model.type === 'email'">
        <fb-md-form-select
          v-model="form.model.email"
          v-validate="'required'"
          :items="emails"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.email')"
          :has-error="errors.has(form.scope + '.email')"
          :label="$t('field.email.title')"
          :required="true"
          :blank-select="$t('field.email.prompt')"
          data-vv-validate-on="blur"
          name="email"
        />

        <template v-if="form.model.email === 'custom'">
          <fb-md-form-input
            v-model="form.model.value"
            v-validate="'required|email'"
            :data-vv-scope="form.scope"
            :error="errors.first(form.scope + '.value')"
            :has-error="errors.has(form.scope + '.value')"
            :name="'value'"
            :label="$t('field.value.values.email')"
            :required="true"
            data-vv-validate-on="blur"
          />
        </template>
      </template>
    </template>
  </fb-modal-form>
</template>

<script>
  export default {

    name: 'RoutinesCreateNotification',

    props: {

      transparentBg: {
        type: Boolean,
        default: false,
      },

    },

    data() {
      return {
        form: {
          scope: 'routines_create_notification',
          model: {
            type: null,
            value: null,
          },
        },
        values: {
          type: [
            {
              value: 'sms',
              name: this.$t('field.type.values.sms'),
            },
            {
              value: 'email',
              name: this.$t('field.type.values.email'),
            },
          ],
        },
      }
    },

    computed: {

      emails() {
        const emails = []

        for (const email of this.$store.getters['entities/email/all']()) {
          emails.push({
            value: email.id,
            name: email.address,
          })
        }

        emails.push({
          value: 'custom',
          name: this.$t('field.email.values.custom'),
        })

        return emails
      },

      buttonText() {
        if (this.$parent.$options.name !== 'RoutinesDetail') {
          return this.$t('application.buttons.add.title')
        }

        return this.$t('application.buttons.save.title')
      },

    },

    watch: {

      'form.model.type'() {
        this.form.model.value = null
      },

    },

    created() {
      this._initModel()

      this.$validator.localize({
        en: {
          custom: {
            type: {
              required: this.$t('field.type.validation.required'),
            },
            email: {
              required: this.$t('field.email.validation.required'),
            },
            value: {
              required: this.$t('field.value.validation.required'),
              email: this.$t('field.value.validation.invalidAddress'),
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
              const data = {
                type: this.form.model.type,
              }

              if (this.form.model.type === 'sms') {
                data.value = this.form.model.value
              } else if (this.form.model.type === 'email') {
                if (this.form.model.email === 'custom') {
                  data.value = this.form.model.value
                } else {
                  data.value = this.form.model.email
                }
              } else {
                this.$flashMessage(this.$t('application.messages.fixAllFormErrors'), 'info')

                return
              }

              this.$emit('add', data)
            }
          })
          .catch(() => {
            this.$flashMessage(this.$t('application.messages.fixAllFormErrors'), 'info')
          })
      },

      /**
       * Close routine create window
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
          type: null,
          value: null,
        }

        this.errors.clear(this.form.scope)
      },

    },

  }
</script>
