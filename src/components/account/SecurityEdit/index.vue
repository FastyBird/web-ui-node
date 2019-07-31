<template>
  <fb-modal-form
    icon="user-shield"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.securitySettings') }}
    </template>

    <template slot="form">
      <fieldset
        v-if="question !== null"
        class="m-b-md"
      >
        <fb-md-form-input
          v-model="form.model.currentAnswer"
          v-validate="'required|checkCurrentAnswer'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.current_answer')"
          :has-error="errors.has(form.scope + '.current_answer')"
          :name="'current_answer'"
          :label="(question.is_custom ? question.question : $t(`field.securityQuestion.question.values.${question.question}`))"
          :required="true"
          data-vv-validate-on="blur"
          spellcheck="false"
        >
          <template
            v-if="!errors.has(form.scope + '.current_answer')"
            slot="help-line"
          >
            {{ $t('field.securityQuestion.currentAnswer.help') }}
          </template>
        </fb-md-form-input>
      </fieldset>

      <fieldset>
        <fb-md-form-select
          v-model="form.model.question"
          v-validate="'required'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.question')"
          :has-error="errors.has(form.scope + '.question')"
          :label="$t('field.securityQuestion.question.title')"
          :items="form.options.questions"
          name="question"
          class="m-b-md"
        />

        <fb-md-form-input
          v-model="form.model.otherQuestion"
          v-validate="form.model.question === 'custom' ? 'required':''"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.other_question')"
          :has-error="errors.has(form.scope + '.other_question')"
          :name="'other_question'"
          :label="$t('field.securityQuestion.customQuestion.title')"
          :required="true"
          :class="['m-b-md', {'hidden':form.model.question!=='custom'}]"
          spellcheck="false"
          data-vv-validate-on="blur"
        >
          <template
            v-if="!errors.has(form.scope + '.other_question')"
            slot="help-line"
          >
            {{ $t('field.securityQuestion.customQuestion.help') }}
          </template>
        </fb-md-form-input>

        <fb-md-form-input
          v-model="form.model.answer"
          v-validate="'required'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.answer')"
          :has-error="errors.has(form.scope + '.answer')"
          :name="'answer'"
          :label="$t('field.securityQuestion.answer.title')"
          :required="true"
          spellcheck="false"
          class="m-b-md"
        >
          <template
            v-if="!errors.has(form.scope + '.answer')"
            slot="help-line"
          >
            {{ $t('field.securityQuestion.answer.help') }}
          </template>
        </fb-md-form-input>

        <fb-md-form-checkbox
          v-model="form.model.lockingNotice"
          v-validate="'required'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.locking_notice')"
          :has-error="errors.has(form.scope + '.locking_notice')"
          :name="'locking_notice'"
        >
          {{ $t('field.securityQuestion.lockingNotice.title') }}
        </fb-md-form-checkbox>
      </fieldset>
    </template>
  </fb-modal-form>
</template>

<script>
  import SecurityQuestion from '@/store/modules/profile/SecurityQuestion'

  export default {

    name: 'SecurityEdit',

    props: {

      account: {
        type: Object,
        required: true,
      },

    },

    data() {
      return {
        form: {
          scope: 'account_security_question',
          model: {
            question: '',
            otherQuestion: null,
            answer: null,
            lockingNotice: false,
            currentAnswer: null,
          },
          options: {
            questions: [
              {
                value: '',
                name: this.$t('field.securityQuestion.question.prompt'),
              }, {
                value: 'motherMaidenName',
                name: this.$t('field.securityQuestion.question.values.motherMaidenName'),
              }, {
                value: 'firstPetName',
                name: this.$t('field.securityQuestion.question.values.firstPetName'),
              }, {
                value: 'elementarySchoolName',
                name: this.$t('field.securityQuestion.question.values.elementarySchoolName'),
              }, {
                value: 'elementarySchoolMascot',
                name: this.$t('field.securityQuestion.question.values.elementarySchoolMascot'),
              }, {
                value: 'friedNickname',
                name: this.$t('field.securityQuestion.question.values.friedNickname'),
              }, {
                value: 'favoriteSportsTeam',
                name: this.$t('field.securityQuestion.question.values.favoriteSportsTeam'),
              }, {
                value: 'favoriteWriter',
                name: this.$t('field.securityQuestion.question.values.favoriteWriter'),
              }, {
                value: 'favoriteActor',
                name: this.$t('field.securityQuestion.question.values.favoriteActor'),
              }, {
                value: 'favoriteSinger',
                name: this.$t('field.securityQuestion.question.values.favoriteSinger'),
              }, {
                value: 'favoriteSong',
                name: this.$t('field.securityQuestion.question.values.favoriteSong'),
              }, {
                value: 'grewUpStreetName',
                name: this.$t('field.securityQuestion.question.values.grewUpStreetName'),
              }, {
                value: 'makeOfFirstCar',
                name: this.$t('field.securityQuestion.question.values.makeOfFirstCar'),
              }, {
                value: 'cityWhereYouMetSpouse',
                name: this.$t('field.securityQuestion.question.values.cityWhereYouMetSpouse'),
              }, {
                value: 'custom',
                name: this.$t('field.securityQuestion.question.values.other'),
              },
            ],
          },
        },
      }
    },

    computed: {

      question() {
        return SecurityQuestion.query().first()
      },

    },

    created() {
      this._initModel()

      this.$validator.localize({
        en: {
          custom: {
            current_answer: {
              required: this.$t('field.securityQuestion.currentAnswer.validation.required'),
            },
            question: {
              required: this.$t('field.securityQuestion.question.validation.required'),
            },
            otherQuestion: {
              required: this.$t('field.securityQuestion.customQuestion.validation.required'),
            },
            answer: {
              required: this.$t('field.securityQuestion.answer.validation.required'),
            },
            locking_notice: {
              required: this.$t('field.securityQuestion.lockingNotice.validation.required'),
            },
          },
        },
      })

      this.$validator.extend('checkCurrentAnswer', {
        validate: this.checkCurrentAnswer,
        getMessage: (field, params, data) => {
          return data.message
        },
      })
    },

    methods: {

      /**
       * Check if provided current answer is correct
       *
       * @param {String} value
       *
       * @returns {Object}
       */
      checkCurrentAnswer(value) {
        return this.$store.dispatch('entities/security_question/validate', {
          data: {
            current_answer: value,
          },
        }, {
          root: true,
        })
          .then(() => {
            return {
              valid: true,
            }
          })
          .catch(e => {
            if (this._.get(e, 'response', null) !== null && this._.get(e, 'response.data.errors', null) !== null) {
              this._.get(e, 'response.data.errors', [])
                .forEach(error => {
                  if (parseInt(this._.get(error, 'code', 0), 10) === 422) {
                    return {
                      valid: false,
                      data: {
                        message: this._.get(error, 'detail'),
                      },
                    }
                  }
                })
            }

            return {
              valid: false,
              data: {
                message: this.$t('application.messages.valueIsNotValid'),
              },
            }
          })
      },

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
              const errorMessage = this.$t('messages.profileNotEdited')

              const data = {
                question: this.form.model.question === 'custom' ? this.form.model.otherQuestion : this.form.model.question,
                is_custom: this.form.model.question === 'custom',
                answer: this.form.model.answer,
                locking_notice: this.form.model.lockingNotice,
              }

              if (this.question !== null) {
                data.current_answer = this.form.model.currentAnswer

                this.$store.dispatch('entities/security_question/edit', {
                  id: this.question.id,
                  data,
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

                this.$toasted.success(this.$t('messages.questionChanged'), {
                  action: {
                    text: this.$t('application.buttons.close.title'),
                    onClick: (evnt, toastObject) => {
                      toastObject.goAway(0)
                    },
                  },
                })
              } else {
                this.$store.dispatch('entities/security_question/add', {
                  data,
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

                this.$toasted.success(this.$t('messages.questionCreated'), {
                  action: {
                    text: this.$t('application.buttons.close.title'),
                    onClick: (evnt, toastObject) => {
                      toastObject.goAway(0)
                    },
                  },
                })
              }

              this._initModel()

              this.$emit('close', false)
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
          .catch((e) => {
            console.log(e)
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
       * Close account edit window
       *
       * @param {Object} event
       */
      close(event) {
        event && event.preventDefault()

        this._initModel()

        this.$emit('close', false)
      },

      /**
       * Initialize form model object
       *
       * @private
       */
      _initModel() {
        this.form.model = {
          question: '',
          otherQuestion: '',
          answer: '',
          lockingNotice: false,
          currentAnswer: '',
        }

        this.errors.clear(this.form.scope)
      },

    },

  }
</script>

<i18n src="./locales.json" />
