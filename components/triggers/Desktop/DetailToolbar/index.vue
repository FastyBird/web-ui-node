<template>
  <desktop-detail-toolbar class="fb-triggers-desktop-detail-toolbar__container">
    <template slot="left">
      <fb-ui-button
        :variant="buttonVariantTypes.LINK_DEFAULT"
        :size="sizeTypes.EXTRA_SMALL"
        @click.prevent="handleClose"
      >
        <font-awesome-icon icon="times" />
        {{ $t('application.buttons.close.title') }}
      </fb-ui-button>

      <fb-ui-button
        v-if="!editMode"
        :variant="buttonVariantTypes.LINK_DEFAULT"
        :size="sizeTypes.EXTRA_SMALL"
        @click.prevent="handleToggleEditMode"
      >
        <font-awesome-icon icon="pencil-alt" />
        {{ $t('application.buttons.edit.title') }}
      </fb-ui-button>

      <fb-ui-button
        v-if="editMode"
        :variant="buttonVariantTypes.LINK"
        :size="sizeTypes.EXTRA_SMALL"
        @click.prevent="handleToggleEditMode"
      >
        <font-awesome-icon icon="check" />
        {{ $t('application.buttons.done.title') }}
      </fb-ui-button>
    </template>

    <template slot="right">
      <i18n
        path="application.misc.paging"
        tag="div"
        class="fb-triggers-desktop-detail-toolbar__paging"
      >
        <span
          slot="page"
          class="fb-triggers-desktop-detail-toolbar__paging-page"
        >
          {{ page }}
        </span>
        <span
          slot="total"
          class="fb-triggers-desktop-detail-toolbar__paging-total"
        >
          {{ total }}
        </span>
      </i18n>

      <fb-ui-button
        :disabled="page <= 1"
        :variant="buttonVariantTypes.LINK_DEFAULT"
        :size="sizeTypes.EXTRA_SMALL"
        @click.prevent="handlePreviousItem"
      >
        <font-awesome-icon icon="angle-left" />
      </fb-ui-button>

      <fb-ui-button
        :disabled="page >= total"
        :variant="buttonVariantTypes.LINK_DEFAULT"
        :size="sizeTypes.EXTRA_SMALL"
        @click.prevent="handleNextItem"
      >
        <font-awesome-icon icon="angle-right" />
      </fb-ui-button>
    </template>
  </desktop-detail-toolbar>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  SetupContext,
} from '@vue/composition-api'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import { TriggerInterface } from '~/models/triggers-module/triggers/types'

export default defineComponent({

  name: 'TriggersDesktopDetailToolbar',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

    editMode: {
      type: Boolean,
      default: false,
    },

    page: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

  },

  setup(props: {}, context: SetupContext) {
    function handlePreviousItem(): void {
      context.emit('previous')
    }

    function handleNextItem(): void {
      context.emit('next')
    }

    function handleToggleEditMode(): void {
      context.emit('toggleEdit')
    }

    function handleClose(): void {
      context.emit('close')
    }

    return {
      handlePreviousItem,
      handleNextItem,
      handleToggleEditMode,
      handleClose,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
