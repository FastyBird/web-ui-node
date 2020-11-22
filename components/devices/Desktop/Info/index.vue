<template>
  <div class="fb-devices-desktop-info__container">
    <fb-ui-content :ml="sizeTypes.MEDIUM">
      <fb-ui-media-item>
        <font-awesome-icon
          slot="left"
          icon="magic"
        />

        <template slot="heading">
          {{ $t('devices.headings.allDevices') }}
        </template>

        <template slot="description">
          {{ $tc('devices.subHeadings.allDevices', total, { count: total }) }}
        </template>
      </fb-ui-media-item>

      <fb-ui-media-item>
        <font-awesome-icon
          slot="left"
          icon="plus"
        />

        <template slot="heading">
          {{ $t('devices.headings.addNewDevice') }}
        </template>

        <template slot="description">
          {{ $t('devices.subHeadings.addNewDevice') }}
        </template>

        <fb-ui-button
          slot="action"
          :variant="buttonVariantTypes.OUTLINE_PRIMARY"
          :size="sizeTypes.LARGE"
          @click.prevent="$emit('connect', $emit)"
        >
          {{ $t('devices.buttons.addNew.title') }}
        </fb-ui-button>
      </fb-ui-media-item>

      <fb-ui-media-item>
        <font-awesome-icon
          slot="left"
          icon="sync-alt"
        />

        <template slot="heading">
          {{ $t('devices.headings.syncDevices') }}
        </template>

        <template slot="description">
          {{ $t('devices.subHeadings.syncDevices') }}
        </template>

        <fb-ui-button
          slot="action"
          :variant="buttonVariantTypes.OUTLINE_DEFAULT"
          :size="sizeTypes.LARGE"
          @click.prevent="$emit('synchronise', $emit)"
        >
          {{ $t('devices.buttons.sync.title') }}
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

  name: 'DevicesDesktopInfo',

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
