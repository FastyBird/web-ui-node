<template>
  <fb-modal-form
    icon="user-shield"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('account.headings.securitySettings') }}
    </template>

    <template slot="form">
      <template v-if="account.security_question !== null">
        <fb-form-input
          v-model="form.model.currentAnswer"
          v-validate="'required|checkCurrentAnswer'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.current_answer')"
          :has-error="errors.has(form.scope + '.current_answer')"
          :name="'current_answer'"
          :label="(account.security_question.is_custom ? account.security_question.question : $t(`account.fields.securityQuestion.question.values.${account.security_question.question}`))"
          :required="true"
          data-vv-validate-on="blur"
          spellcheck="false"
        >
          <template
            v-if="!errors.has(form.scope + '.current_answer')"
            slot="help-line"
          >
            {{ $t('account.fields.securityQuestion.currentAnswer.help') }}
          </template>
        </fb-form-input>
      </template>

      <fb-form-select
        v-model="form.model.question"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.question')"
        :has-error="errors.has(form.scope + '.question')"
        :label="$t('account.fields.securityQuestion.question.title')"
        :items="form.options.questions"
        name="question"
      />

      <fb-form-input
        v-show="form.model.question !== 'custom'"
        v-model="form.model.otherQuestion"
        v-validate="form.model.question === 'custom' ? 'required':''"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.other_question')"
        :has-error="errors.has(form.scope + '.other_question')"
        :name="'other_question'"
        :label="$t('account.fields.securityQuestion.customQuestion.title')"
        :required="true"
        spellcheck="false"
        data-vv-validate-on="blur"
      >
        <template
          v-if="!errors.has(form.scope + '.other_question')"
          slot="help-line"
        >
          {{ $t('account.fields.securityQuestion.customQuestion.help') }}
        </template>
      </fb-form-input>

      <fb-form-input
        v-model="form.model.answer"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.answer')"
        :has-error="errors.has(form.scope + '.answer')"
        :name="'answer'"
        :label="$t('account.fields.securityQuestion.answer.title')"
        :required="true"
        spellcheck="false"
      >
        <template
          v-if="!errors.has(form.scope + '.answer')"
          slot="help-line"
        >
          {{ $t('account.fields.securityQuestion.answer.help') }}
        </template>
      </fb-form-input>

      <fb-form-checkbox
        v-model="form.model.lockingNotice"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.locking_notice')"
        :has-error="errors.has(form.scope + '.locking_notice')"
        :name="'locking_notice'"
      >
        {{ $t('account.fields.securityQuestion.lockingNotice.title') }}
      </fb-form-checkbox>
    </template>
  </fb-modal-form>
</template>

<script>
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
              name: this.$t('account.fields.securityQuestion.question.prompt'),
            }, {
              value: 'motherMaidenName',
              name: this.$t('account.fields.securityQuestion.question.values.motherMaidenName'),
            }, {
              value: 'firstPetName',
              name: this.$t('account.fields.securityQuestion.question.values.firstPetName'),
            }, {
              value: 'elementarySchoolName',
              name: this.$t('account.fields.securityQuestion.question.values.elementarySchoolName'),
            }, {
              value: 'elementarySchoolMascot',
              name: this.$t('account.fields.securityQuestion.question.values.elementarySchoolMascot'),
            }, {
              value: 'friedNickname',
              name: this.$t('account.fields.securityQuestion.question.values.friedNickname'),
            }, {
              value: 'favoriteSportsTeam',
              name: this.$t('account.fields.securityQuestion.question.values.favoriteSportsTeam'),
            }, {
              value: 'favoriteWriter',
              name: this.$t('account.fields.securityQuestion.question.values.favoriteWriter'),
            }, {
              value: 'favoriteActor',
              name: this.$t('account.fields.securityQuestion.question.values.favoriteActor'),
            }, {
              value: 'favoriteSinger',
              name: this.$t('account.fields.securityQuestion.question.values.favoriteSinger'),
            }, {
              value: 'favoriteSong',
              name: this.$t('account.fields.securityQuestion.question.values.favoriteSong'),
            }, {
              value: 'grewUpStreetName',
              name: this.$t('account.fields.securityQuestion.question.values.grewUpStreetName'),
            }, {
              value: 'makeOfFirstCar',
              name: this.$t('account.fields.securityQuestion.question.values.makeOfFirstCar'),
            }, {
              value: 'cityWhereYouMetSpouse',
              name: this.$t('account.fields.securityQuestion.question.values.cityWhereYouMetSpouse'),
            }, {
              value: 'custom',
              name: this.$t('account.fields.securityQuestion.question.values.other'),
            },
          ],
        },
      },
    }
  },

  created() {
    this._initModel()

    this.$validator.localize({
      en: {
        custom: {
          current_answer: {
            required: this.$t('account.fields.securityQuestion.currentAnswer.validation.required'),
          },
          question: {
            required: this.$t('account.fields.securityQuestion.question.validation.required'),
          },
          otherQuestion: {
            required: this.$t('account.fields.securityQuestion.customQuestion.validation.required'),
          },
          answer: {
            required: this.$t('account.fields.securityQuestion.answer.validation.required'),
          },
          locking_notice: {
            required: this.$t('account.fields.securityQuestion.lockingNotice.validation.required'),
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
        answer: value,
      }, {
        root: true,
      })
        .then(() => {
          return {
            valid: true,
          }
        })
        .catch((e) => {
          if (this._.get(e, 'response', null) !== null && this._.get(e, 'response.data.errors', null) !== null) {
            this._.get(e, 'response.data.errors', [])
              .forEach((error) => {
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
        .then((result) => {
          if (result) {
            const errorMessage = this.$t('account.messages.questionNotSaved')

            if (this.account.security_question !== null) {
              this.$store.dispatch('entities/security_question/edit', {
                id: this.account.security_question.id,
                current_answer: this.form.model.currentAnswer,
                question: this.form.model.question === 'custom' ? this.form.model.otherQuestion : this.form.model.question,
                is_custom: this.form.model.question === 'custom',
                answer: this.form.model.answer,
                locking_notice: this.form.model.lockingNotice,
              }, {
                root: true,
              })
                .catch((e) => {
                  if (this._.get(e, 'exception', null) !== null) {
                    this.handleFormError(e.exception, errorMessage)
                  } else {
                    this.$flashMessage(errorMessage, 'error')
                  }
                })
            } else {
              this.$store.dispatch('entities/security_question/add', {
                question: this.form.model.question === 'custom' ? this.form.model.otherQuestion : this.form.model.question,
                is_custom: this.form.model.question === 'custom',
                answer: this.form.model.answer,
                locking_notice: this.form.model.lockingNotice,
              }, {
                root: true,
              })
                .catch((e) => {
                  if (this._.get(e, 'exception', null) !== null) {
                    this.handleFormError(e.exception, errorMessage)
                  } else {
                    this.$flashMessage(errorMessage, 'error')
                  }
                })
            }

            this._initModel()

            this.$emit('close', false)
          }
        })
        .catch((e) => {
          if (Object.prototype.hasOwnProperty.call(this, '$sentry')) {
            this.$sentry.captureException(e)
          }
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
