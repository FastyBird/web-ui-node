<template>
  <validation-observer ref="validator">
    <validation-provider
      v-slot="{ errors }"
      name="currentPassword"
      rules="required"
    >
      <fb-form-input
        v-model="form.model.password.current"
        :error="errors[0]"
        :has-error="errors.length > 0"
        :label="$t('account.fields.password.current.title')"
        :required="true"
        :type="formInputTypes.PASSWORD"
        name="currentPassword"
        spellcheck="false"
      >
        <template slot="help-line">
          {{ $t('account.fields.password.current.help') }}
        </template>
      </fb-form-input>
    </validation-provider>

    <validation-provider
      v-slot="{ errors }"
      name="newPassword"
      rules="required"
    >
      <fb-form-input
        v-model="form.model.password.new"
        :error="errors[0]"
        :has-error="errors.length > 0"
        :label="$t('account.fields.password.new.title')"
        :required="true"
        :type="formInputTypes.PASSWORD"
        name="newPassword"
        spellcheck="false"
      >
        <template slot="help-line">
          {{ $t('account.fields.password.new.help') }}
        </template>
      </fb-form-input>
    </validation-provider>

    <validation-provider
      v-slot="{ errors }"
      name="repeatPassword"
      rules="required|confirmed:newPassword"
    >
      <fb-form-input
        v-model="form.model.password.repeat"
        :error="errors[0]"
        :has-error="errors.length > 0"
        :label="$t('account.fields.password.repeat.title')"
        :required="true"
        :type="formInputTypes.PASSWORD"
        name="repeatPassword"
        spellcheck="false"
      >
        <template slot="help-line">
          {{ $t('account.fields.password.repeat.help') }}
        </template>
      </fb-form-input>
    </validation-provider>
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
import { confirmed } from 'vee-validate/dist/rules.umd'

import {
  FbFormInputTypeTypes,
  FbFormResultTypes,
  FbSizeTypes,
} from '@fastybird/web-ui-theme'

import Identity from '~/models/auth-module/identities/Identity'
import { IdentityInterface } from '~/models/auth-module/identities/types'

interface AccountSettingsPasswordFormInterface {
  model: {
    password: {
      current: string
      new: string
      repeat: string
    }
  }
}

interface AccountSettingsPasswordPropsInterface {
  identity: IdentityInterface
  remoteFormSubmit: boolean
  remoteFormResult: FbFormResultTypes
  remoteFormReset: boolean
}

export default defineComponent({

  name: 'AccountSettingsPassword',

  props: {

    identity: {
      type: Object as PropType<IdentityInterface>,
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

  setup(props: AccountSettingsPasswordPropsInterface, context: SetupContext) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const form = reactive<AccountSettingsPasswordFormInterface>({
      model: {
        password: {
          current: '',
          new: '',
          repeat: '',
        },
      },
    })

    localize({
      en: {
        fields: {
          currentPassword: {
            required: context.root.$t('account.fields.password.current.validation.required').toString(),
          },
          newPassword: {
            required: context.root.$t('account.fields.password.new.validation.required').toString(),
          },
          repeatPassword: {
            required: context.root.$t('account.fields.password.repeat.validation.required').toString(),
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

    extend('confirmed', confirmed)

    let timer: number

    function clearResult(): void {
      window.clearTimeout(timer)

      context.emit('update:remoteFormResult', FbFormResultTypes.NONE)
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

                  const errorMessage = context.root.$t('account.messages.passwordNotEdited').toString()

                  try {
                    await Identity.dispatch('edit', {
                      identity: props.identity,
                      data: {
                        password: {
                          current: form.model.password.current,
                          new: form.model.password.new,
                        },
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
          form.model.password.current = ''
          form.model.password.new = ''
          form.model.password.repeat = ''
        }
      },
    )

    return {
      validator,
      form,
      sizeTypes: FbSizeTypes,
      formInputTypes: FbFormInputTypeTypes,
    }
  },

})
</script>
