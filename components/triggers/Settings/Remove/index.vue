<template>
  <fb-ui-confirmation-window
    :transparent-bg="transparentBg"
    @confirmed="handleRemove"
    @close="handleClose"
  >
    <font-awesome-icon
      slot="icon"
      icon="trash"
      class="fb-triggers-settings-trigger-remove__icon"
    />

    <template slot="header">
      {{ $t('triggers.headings.removeTrigger') }}
    </template>

    <template slot="question">
      <i18n
        path="triggers.messages.confirmRemoveTrigger"
        tag="p"
      >
        <strong slot="trigger">{{ trigger.name }}</strong>
      </i18n>
    </template>
  </fb-ui-confirmation-window>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  SetupContext,
} from '@vue/composition-api'

import get from 'lodash/get'

import Trigger from '~/models/triggers-module/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-module/triggers/types'

interface TriggersSettingsTriggerRemovePropsInterface {
  trigger: TriggerInterface
  transparentBg: boolean
}

export default defineComponent({

  name: 'TriggersSettingsTriggerRemove',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

    transparentBg: {
      type: Boolean,
      default: false,
    },

  },

  setup(props: TriggersSettingsTriggerRemovePropsInterface, context: SetupContext) {
    function handleRemove(): void {
      const errorMessage = context.root.$t('triggers.messages.triggerNotRemoved', {
        trigger: props.trigger.name,
      }).toString()

      Trigger.dispatch('remove', {
        trigger: props.trigger,
      })
        .catch((e): void => {
          if (get(e, 'exception', null) !== null) {
            context.root.handleException(e.exception, errorMessage)
          } else {
            context.root.$flashMessage(errorMessage, 'error')
          }
        })

      context.emit('removed')
    }

    function handleClose(): void {
      context.emit('close')
    }

    return {
      handleRemove,
      handleClose,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
