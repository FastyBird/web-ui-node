<template>
  <desktop-detail-toolbar class="fb-triggers-desktop-detail-toolbar__container">
    <template slot="left">
      <fb-ui-button
        variant="link-default"
        size="xs"
        @click.prevent="$emit('close', $event)"
      >
        <font-awesome-icon icon="times" />
        {{ $t('application.buttons.close.title') }}
      </fb-ui-button>

      <fb-ui-button
        v-if="!editMode"
        variant="link-default"
        size="xs"
        @click.prevent="$emit('toggleEdit', $event)"
      >
        <font-awesome-icon icon="pencil-alt" />
        {{ $t('application.buttons.edit.title') }}
      </fb-ui-button>

      <fb-ui-button
        v-if="editMode"
        variant="link"
        size="xs"
        @click.prevent="$emit('toggleEdit', $event)"
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
        variant="link-default"
        size="xs"
        @click.prevent="$emit('previous', $event)"
      >
        <font-awesome-icon icon="angle-left" />
      </fb-ui-button>
      <fb-ui-button
        :disabled="page >= total"
        variant="link-default"
        size="xs"
        @click.prevent="$emit('next', $event)"
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
} from '@vue/composition-api'

import { TriggerInterface } from '~/models/triggers-node/triggers/types'

interface TriggersDesktopDetailHeaderPropsInterface {
  trigger: TriggerInterface
  editMode: boolean
  page: number
  total: number
}

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

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
