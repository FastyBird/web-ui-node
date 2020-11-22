<template>
  <h3 class="fb-account-sign-header__heading">
    {{ heading }}
  </h3>
</template>

<script lang="ts">
import {
  defineComponent,
} from '@vue/composition-api'

export default defineComponent({

  name: 'AccountSignHeader',

  props: {

    heading: {
      type: String,
      required: true,
    },

  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
