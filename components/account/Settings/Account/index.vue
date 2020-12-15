<template>
  <validation-observer ref="validator">
    <fb-ui-content
      :mb="sizeTypes.LARGE"
      class="fb-account-settings-account__columns"
    >
      <div class="fb-account-settings-account__column">
        <validation-provider
          v-slot="{ errors }"
          name="emailAddress"
          rules="required|email"
        >
          <fb-form-input
            v-model="form.model.emailAddress"
            :error="errors[0]"
            :has-error="errors.length > 0"
            :label="$t('account.fields.emailAddress.title')"
            :required="true"
            :type="formInputTypes.EMAIL"
            name="emailAddress"
            spellcheck="false"
          >
            <template slot="help-line">
              {{ $t('account.fields.emailAddress.help') }}
            </template>
          </fb-form-input>
        </validation-provider>
      </div>

      <div class="fb-account-settings-account__column">
        <fb-form-select
          v-model="form.model.language"
          :label="$t('account.fields.language.title')"
          :items="languagesOptions"
          name="language"
        />
      </div>
    </fb-ui-content>

    <fb-ui-content
      :mb="sizeTypes.LARGE"
      class="fb-account-settings-account__columns"
    >
      <div class="fb-account-settings-account__name-column">
        <validation-provider
          v-slot="{ errors }"
          name="firstName"
          rules="required"
        >
          <fb-form-input
            v-model="form.model.firstName"
            :error="errors[0]"
            :has-error="errors.length > 0"
            :label="$t('account.fields.firstName.title')"
            :required="true"
            name="firstName"
            spellcheck="false"
          >
            <template slot="help-line">
              {{ $t('account.fields.firstName.help') }}
            </template>
          </fb-form-input>
        </validation-provider>
      </div>

      <div class="fb-account-settings-account__name-column">
        <validation-provider
          v-slot="{ errors }"
          name="lastName"
          rules="required"
        >
          <fb-form-input
            v-model="form.model.lastName"
            :error="errors[0]"
            :has-error="errors.length > 0"
            :label="$t('account.fields.lastName.title')"
            :required="true"
            name="lastName"
            spellcheck="false"
          >
            <template slot="help-line">
              {{ $t('account.fields.lastName.help') }}
            </template>
          </fb-form-input>
        </validation-provider>
      </div>

      <div class="fb-account-settings-account__name-column">
        <fb-form-input
          v-model="form.model.middleName"
          :label="$t('account.fields.middleName.title')"
          :required="true"
          name="middleName"
          spellcheck="false"
        />
      </div>
    </fb-ui-content>

    <hr>

    <fb-ui-content
      :mb="sizeTypes.LARGE"
      class="fb-account-settings-account__columns"
    >
      <div class="fb-account-settings-account__column">
        <fb-form-select
          v-model="form.model.timezone"
          :label="$t('account.fields.datetime.timezone.title')"
          :items="zonesOptions"
          name="zone"
        />
      </div>

      <div class="fb-account-settings-account__column">
        <fb-form-select
          v-model="form.model.weekStart"
          :label="$t('account.fields.datetime.weekStartOn.title')"
          :items="weekStartOptions"
          name="weekStart"
        />
      </div>
    </fb-ui-content>

    <fb-ui-content
      :mb="sizeTypes.LARGE"
      class="fb-account-settings-account__columns"
    >
      <div class="fb-account-settings-account__column">
        <fb-form-select
          v-model="form.model.dateFormat"
          :label="$t('account.fields.datetime.dateFormat.title')"
          :items="dateFormatOptions"
          name="dateFormat"
        />
      </div>

      <div class="fb-account-settings-account__column">
        <fb-form-select
          v-model="form.model.timeFormat"
          :label="$t('account.fields.datetime.timeFormat.title')"
          :items="timeFormatOptions"
          name="timeFormat"
        />
      </div>
    </fb-ui-content>
  </validation-observer>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import get from 'lodash/get'
import {
  ValidationProvider,
  ValidationObserver,
  extend,
  localize,
} from 'vee-validate'
// @ts-ignore
import { email } from 'vee-validate/dist/rules.umd'

import {
  FbFormInputTypeTypes,
  FbFormResultTypes,
  FbSizeTypes,
} from '@fastybird/web-ui-theme'

import Account from '~/models/auth-module/accounts/Account'
import { AccountInterface } from '~/models/auth-module/accounts/types'
import Email from '~/models/auth-module/emails/Email'

import timezones from '~/helpers/timezones'

interface AccountSettingsAccountFormOptionsInterface {
  value: string | number
  name: string
}

interface AccountSettingsAccountFormInterface {
  model: {
    emailAddress?: string
    firstName: string
    lastName: string
    middleName: string | null
    language: string
    weekStart: number
    timezone: string
    dateFormat: string
    timeFormat: string
  }
}

interface AccountSettingsAccountPropsInterface {
  account: AccountInterface
  remoteFormSubmit: boolean
  remoteFormResult: FbFormResultTypes
  remoteFormReset: boolean
}

/**
 * Get list of timezones for given country
 *
 * @param {String} country
 */
function _getCountryTimezones(country: string): Array<AccountSettingsAccountFormOptionsInterface> {
  return timezones
    .filter(zone => zone.substring(0, zone.search('/')) === country)
    .map((timezone) => {
      return {
        value: timezone,
        name: timezone.substring(timezone.search('/') + 1),
      }
    })
}

export default defineComponent({

  name: 'AccountSettingsAccount',

  props: {

    account: {
      type: Object as PropType<AccountInterface>,
      required: true,
    },

    remoteFormSubmit: {
      type: Boolean,
      default: false,
    },

    remoteFormResult: {
      type: String as PropType<FbFormResultTypes>,
      default: FbFormResultTypes.NONE,
    },

    remoteFormReset: {
      type: Boolean,
      default: false,
    },

  },

  components: {
    ValidationProvider,
    ValidationObserver,
  },

  setup(props: AccountSettingsAccountPropsInterface, context: SetupContext) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const countries: Array<string> = ['Africa', 'America', 'Antarctica', 'Arctic', 'Asia', 'Atlantic', 'Australia', 'Europe', 'Indian', 'Pacific']

    const languagesOptions: Array<AccountSettingsAccountFormOptionsInterface> = [
      {
        value: 'en',
        name: 'English',
      }, {
        value: 'cs',
        name: 'Czech',
      },
    ]

    const weekStartOptions: Array<AccountSettingsAccountFormOptionsInterface> = [
      {
        value: 1,
        name: context.root.$t('account.fields.datetime.weekStartOn.values.monday').toString(),
      }, {
        value: 6,
        name: context.root.$t('account.fields.datetime.weekStartOn.values.saturday').toString(),
      }, {
        value: 7,
        name: context.root.$t('account.fields.datetime.weekStartOn.values.sunday').toString(),
      },
    ]

    const dateFormatOptions: Array<AccountSettingsAccountFormOptionsInterface> = [
      {
        value: 'MM/dd/YYYY',
        name: 'mm/dd/yyyy',
      }, {
        value: 'DD/MM/YYYY',
        name: 'dd/mm/yyyy',
      }, {
        value: 'DD.MM.YYYY',
        name: 'dd.mm.yyyy',
      }, {
        value: 'YYYY-MM-DD',
        name: 'yyyy-mm-dd',
      },
    ]

    const timeFormatOptions: Array<AccountSettingsAccountFormOptionsInterface> = [
      {
        value: 'HH:mm',
        name: 'hh:mm',
      }, {
        value: 'hh:mm a',
        name: 'hh:mm am/pm',
      },
    ]

    const zonesOptions = countries.map((country): Array<{ value: Array<AccountSettingsAccountFormOptionsInterface>; name: string }> => {
      return {
        // @ts-ignore
        value: _getCountryTimezones(country),
        name: country,
      }
    })

    const form = reactive<AccountSettingsAccountFormInterface>({
      model: {
        emailAddress: props.account.email?.address,
        firstName: props.account.firstName,
        lastName: props.account.lastName,
        middleName: props.account.middleName,
        language: props.account.language,
        weekStart: props.account.weekStart,
        timezone: props.account.timezone,
        dateFormat: props.account.dateFormat,
        timeFormat: props.account.timeFormat,
      },
    })

    localize({
      en: {
        fields: {
          emailAddress: {
            required: context.root.$t('account.fields.emailAddress.validation.required').toString(),
            email: context.root.$t('account.fields.emailAddress.validation.email').toString(),
          },
          firstName: {
            required: context.root.$t('account.fields.firstName.validation.required').toString(),
          },
          lastName: {
            required: context.root.$t('account.fields.lastName.validation.required').toString(),
          },
        },
      },
    })

    extend('required', {
      validate: (value) => {
        return {
          required: true,
          valid: !['', null, undefined].includes(value),
        }
      },
      computesRequired: true,
    })

    extend('email', email)

    let timer: number

    function clearResult(): void {
      window.clearTimeout(timer)

      context.emit('update:remoteFormResult', FbFormResultTypes.NONE)
    }

    async function updateAccount(): Promise<void> {
      const errorMessage = context.root.$t('account.messages.accountNotEdited').toString()

      try {
        await Account.dispatch('edit', {
          account: props.account,
          data: {
            firstName: form.model.firstName,
            lastName: form.model.lastName,
            middleName: form.model.middleName,
            language: form.model.language,
            weekStart: form.model.weekStart,
            timezone: form.model.timezone,
            dateFormat: form.model.dateFormat,
            timeFormat: form.model.timeFormat,
          },
        })

        context.emit('update:remoteFormResult', FbFormResultTypes.OK)

        timer = window.setTimeout(clearResult, 2000)
      } catch (e) {
        if (get(e, 'exception', null) !== null) {
          context.root.handleException(e.exception, errorMessage)
        } else {
          context.root.$flashMessage(errorMessage, 'error')
        }

        context.emit('update:remoteFormResult', FbFormResultTypes.ERROR)

        timer = window.setTimeout(clearResult, 2000)
      }
    }

    watch(
      (): boolean => props.remoteFormSubmit,
      (val): void => {
        if (val) {
          context.emit('update:remoteFormSubmit', false)

          if (validator.value !== null) {
            validator.value
              .validate()
              .then(async(success: boolean): Promise<void> => {
                if (success) {
                  context.emit('update:remoteFormResult', FbFormResultTypes.WORKING)

                  // Email has been changed
                  if (form.model.emailAddress !== props.account.email?.address) {
                    const storedEmail = Email
                      .query()
                      .where('address', form.model.emailAddress)
                      .first()

                    const emailErrorMessage = context.root.$t('account.messages.emailNotEdited').toString()

                    if (storedEmail !== null) {
                      try {
                        await Email.dispatch('edit', {
                          email: storedEmail,
                          default: true,
                          private: storedEmail.private,
                        })

                        await updateAccount()
                      } catch (e) {
                        if (get(e, 'exception', null) !== null) {
                          context.root.handleException(e.exception, emailErrorMessage)
                        } else {
                          context.root.$flashMessage(emailErrorMessage, 'error')
                        }

                        context.emit('update:remoteFormResult', FbFormResultTypes.ERROR)

                        timer = window.setTimeout(clearResult, 2000)
                      }
                    } else {
                      try {
                        await Email.dispatch('add', {
                          account: props.account,
                          address: form.model.emailAddress,
                          default: true,
                          private: false,
                        })

                        await updateAccount()
                      } catch (e) {
                        if (get(e, 'exception', null) !== null) {
                          context.root.handleException(e.exception, emailErrorMessage)
                        } else {
                          context.root.$flashMessage(emailErrorMessage, 'error')
                        }

                        context.emit('update:remoteFormResult', FbFormResultTypes.ERROR)

                        timer = window.setTimeout(clearResult, 2000)
                      }
                    }
                  } else {
                    await updateAccount()
                  }
                }
              })
          }
        }
      },
    )

    watch(
      (): boolean => props.remoteFormReset,
      (val): void => {
        context.emit('update:remoteFormReset', false)

        if (val) {
          form.model.emailAddress = props.account.email?.address
          form.model.firstName = props.account.firstName
          form.model.lastName = props.account.lastName
          form.model.middleName = props.account.middleName
          form.model.language = props.account.language
          form.model.weekStart = props.account.weekStart
          form.model.timezone = props.account.timezone
          form.model.dateFormat = props.account.dateFormat
          form.model.timeFormat = props.account.timeFormat
        }
      },
    )

    return {
      validator,
      languagesOptions,
      weekStartOptions,
      dateFormatOptions,
      timeFormatOptions,
      zonesOptions,
      form,
      sizeTypes: FbSizeTypes,
      formInputTypes: FbFormInputTypeTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
