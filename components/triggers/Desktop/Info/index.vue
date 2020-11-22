<template>
  <div class="fb-triggers-desktop-info__container">
    <fb-ui-content :ml="sizeTypes.MEDIUM">
      <fb-ui-media-item>
        <font-awesome-icon
          slot="left"
          icon="magic"
        />

        <template slot="heading">
          {{ $t('triggers.headings.allTriggers') }}
        </template>

        <template slot="description">
          {{ $tc('triggers.subHeadings.allTriggers', total, { count: total }) }}
        </template>
      </fb-ui-media-item>

      <fb-ui-media-item>
        <font-awesome-icon
          slot="left"
          icon="plus"
        />

        <template slot="heading">
          {{ $t('triggers.headings.addNewTrigger') }}
        </template>

        <template slot="description">
          {{ $t('triggers.subHeadings.addNewTrigger') }}
        </template>

        <fb-ui-button
          slot="action"
          :variant="buttonVariantTypes.OUTLINE_PRIMARY"
          :size="sizeTypes.LARGE"
          @click.prevent="$emit('create', $emit)"
        >
          {{ $t('triggers.buttons.addNew.title') }}
        </fb-ui-button>
      </fb-ui-media-item>

      <fb-ui-media-item>
        <font-awesome-icon
          slot="left"
          icon="sync-alt"
        />

        <template slot="heading">
          {{ $t('triggers.headings.syncTriggers') }}
        </template>

        <template slot="description">
          {{ $t('triggers.subHeadings.syncTriggers') }}
        </template>

        <fb-ui-button
          slot="action"
          :variant="buttonVariantTypes.OUTLINE_DEFAULT"
          :size="sizeTypes.LARGE"
          @click.prevent="$emit('synchronise', $emit)"
        >
          {{ $t('triggers.buttons.sync.title') }}
        </fb-ui-button>
      </fb-ui-media-item>
    </fb-ui-content>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from '@vue/composition-api'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

export default defineComponent({

  name: 'TriggersDesktopInfo',

  props: {

    total: {
      type: Number,
      default: 0,
    },

  },

  setup() {
    return {
      buttonVariantTypes: FbUiButtonVariantTypes,
      sizeTypes: FbSizeTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
