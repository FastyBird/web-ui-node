<template>
  <div class="fb-triggers-phone-select-type__container">
    <fb-layout-phone-menu-content>
      <div class="fb-triggers-phone-select-type__select-type">
        <fb-ui-button
          :variant="buttonVariantTypes.LINK"
          @click.prevent="handleOpenView(triggerTypes.DATE_SCHEDULED)"
          block
          name="condition"
        >
          {{ $t('triggers.buttons.addTypeDate.title') }}
        </fb-ui-button>

        <fb-ui-divider :type="dividerVariantTypes.HORIZONTAL">
          {{ $t('application.misc.or') }}
        </fb-ui-divider>

        <fb-ui-button
          :variant="buttonVariantTypes.LINK"
          @click.prevent="handleOpenView(triggerTypes.TIME_SCHEDULED)"
          block
          name="action"
        >
          {{ $t('triggers.buttons.addTypeTimeOfDay.title') }}
        </fb-ui-button>

        <fb-ui-divider :type="dividerVariantTypes.HORIZONTAL">
          {{ $t('application.misc.or') }}
        </fb-ui-divider>

        <fb-ui-button
          :variant="buttonVariantTypes.LINK"
          @click.prevent="handleOpenView(triggerTypes.DEVICE)"
          block
          name="action"
        >
          {{ $t('triggers.buttons.addTypeDeviceControlled.title') }}
        </fb-ui-button>

        <fb-ui-divider :type="dividerVariantTypes.HORIZONTAL">
          {{ $t('application.misc.or') }}
        </fb-ui-divider>

        <fb-ui-button
          :variant="buttonVariantTypes.LINK"
          @click.prevent="handleOpenView(triggerTypes.SENSOR)"
          block
          name="action"
        >
          {{ $t('triggers.buttons.addTypeSensorDetect.title') }}
        </fb-ui-button>

        <fb-ui-divider :type="dividerVariantTypes.HORIZONTAL">
          {{ $t('application.misc.or') }}
        </fb-ui-divider>

        <fb-ui-button
          :variant="buttonVariantTypes.LINK"
          @click.prevent="handleOpenView(triggerTypes.MANUAL)"
          block
          name="action"
        >
          {{ $t('triggers.buttons.addTypeManual.title') }}
        </fb-ui-button>
      </div>
    </fb-layout-phone-menu-content>

    <fb-layout-phone-menu-heading>
      {{ $t('triggers.headings.addNewTrigger') }}
    </fb-layout-phone-menu-heading>

    <fb-layout-phone-menu-button>
      <fb-ui-button
        :variant="buttonVariantTypes.LINK"
        :size="sizeTypes.LARGE"
        @click.prevent="handleClose"
        block
        name="close"
      >
        {{ $t('application.buttons.close.title') }}
      </fb-ui-button>
    </fb-layout-phone-menu-button>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
} from '@vue/composition-api'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
  FbUiDividerVariantTypes,
} from '@fastybird/web-ui-theme'

import { TriggerTypes } from '~/components/triggers/Create/create'

export default defineComponent({

  name: 'TriggersPhoneSelectType',

  setup(props: {}, context: SetupContext) {
    function handleOpenView(type: TriggerTypes): void {
      context.root.$router.push(context.root.localePath({
        name: context.root.$routes.triggers.create,
        query: {
          type,
        },
      }))
    }

    function handleClose(): void {
      context.emit('close')
    }

    return {
      handleOpenView,
      handleClose,
      triggerTypes: TriggerTypes,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
      dividerVariantTypes: FbUiDividerVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
