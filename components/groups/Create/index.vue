<template>
  <div class="fb-iot-groups-create__container">
    <form @submit.prevent="submit">
      <fb-form-input
        v-model="form.model.title"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.title')"
        :has-error="errors.has(form.scope + '.title')"
        :name="'title'"
        :label="$t('field.title.title')"
        :required="true"
      />

      <fb-form-text-area
        v-model="form.model.comment"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.comment')"
        :has-error="errors.has(form.scope + '.comment')"
        :name="'comment'"
        :label="$t('field.comment.title')"
        :tab-index="3"
      />

      <div class="row">
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="blender"
              class="icon-3x"
            />
          </a>
        </div>
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="baby"
              class="icon-3x"
            />
          </a>
        </div>
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="bath"
              class="icon-3x"
            />
          </a>
        </div>
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="shower"
              class="icon-3x"
            />
          </a>
        </div>
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="toilet"
              class="icon-3x"
            />
          </a>
        </div>
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="chair"
              class="icon-3x"
            />
          </a>
        </div>
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="couch"
              class="icon-3x"
            />
          </a>
        </div>
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="tv"
              class="icon-3x"
            />
          </a>
        </div>
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="gamepad"
              class="icon-3x"
            />
          </a>
        </div>
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="hot-tub"
              class="icon-3x"
            />
          </a>
        </div>
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="swimming-pool"
              class="icon-3x"
            />
          </a>
        </div>
        <div class="col-4 text-center">
          <a
            href="#"
            class="fb-iot-groups-create__icon"
          >
            <font-awesome-icon
              icon="bed"
              class="icon-3x"
            />
          </a>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
  export default {

    name: 'GroupsCreate',

    props: {

      transparentBg: {
        type: Boolean,
        default: false,
      },

    },

    data() {
      return {
        form: {
          scope: 'io_server_group_create',
          model: {
            title: null,
            comment: null,
          },
        },
      }
    },

    created() {
      this.$validator.localize({
        en: {
          custom: {
            title: {
              required: this.$t('field.title.validation.required'),
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
       * Submit group form
       *
       * @param {Object} event
       */
      submit(event) {
        event && event.preventDefault()

        this.$validator.validateAll(this.form.scope)
          .then(result => {
            if (result) {
              const errorMessage = this.$t('messages.notCreated')

              this.$store.dispatch('entities/group/create', {
                data: this.form.model,
              }, {
                root: true,
              })
                .catch(e => {
                  if (this._.get(e, 'exception', null) !== null) {
                    this.handleFormError(e.exception, errorMessage)
                  } else {
                    this.$toasted.error(errorMessage, {
                      action: {
                        text: this.$t('application.buttons.close.title'),
                        onClick: (evnt, toastObject) => {
                          toastObject.goAway(0)
                        },
                      },
                    })
                  }
                })

              this.$toasted.success(this.$t('messages.created', {
                group: this.form.model.title,
              }), {
                action: {
                  text: this.$t('application.buttons.close.title'),
                  onClick: (evnt, toastObject) => {
                    toastObject.goAway(0)
                  },
                },
              })

              this._initModel()

              this.$emit('close')
            } else {
              this.$toasted.info(this.$t('application.messages.fixAllFormErrors'), {
                action: {
                  text: this.$t('application.buttons.close.title'),
                  onClick: (evnt, toastObject) => {
                    toastObject.goAway(0)
                  },
                },
              })
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
       * Close group rename confirmation window
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
        this.errors.clear(this.form.scope)
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
