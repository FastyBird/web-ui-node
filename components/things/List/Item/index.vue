<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-list-item__container"
    @click="oneClick"
  >
    <layout-list-item>
      <template slot="icon">
        <font-awesome-icon icon="plug" />
      </template>

      <template slot="heading">
        {{ thing.label }}
      </template>

      <template
        v-if="thing.hasComment"
        slot="sub-heading"
      >
        {{ thing.comment }}
      </template>

      <template slot="buttons">
        <fb-button
          :variant="thing.state ? 'outline-primary' : 'outline-default'"
          :class="[ {'spinner': loadingAbout, 'spinner-inverse': loadingAbout, 'spinner-sm': loadingAbout }]"
          size="sm"
          @click.prevent="openAbout"
        >
          <font-awesome-icon icon="info" />
          {{ $t('buttons.thingInfo.title') }}
        </fb-button>

        <fb-button
          :variant="thing.state ? 'outline-primary' : 'outline-default'"
          :class="[ {'spinner': loadingNetwork, 'spinner-inverse': loadingNetwork, 'spinner-sm': loadingNetwork }]"
          size="sm"
          @click.prevent="openNetwork"
        >
          <font-awesome-icon icon="wifi" />
          {{ $t('buttons.networkInfo.title') }}
        </fb-button>
      </template>
    </layout-list-item>
  </div>
</template>

<script>
  import LayoutListItem from '@/components/layout/ListItem'

  export default {

    name: 'ThingsListItem',

    components: {
      LayoutListItem,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      loadingAbout: {
        type: Boolean,
        default: false,
      },

      loadingNetwork: {
        type: Boolean,
        default: false,
      },

    },

    methods: {

      /**
       * Open thing about info window
       *
       * @param {Object} event
       */
      openAbout(event) {
        this.$emit('about', event, this.thing)
      },

      /**
       * Open thing network info window
       *
       * @param {Object} event
       */
      openNetwork(event) {
        this.$emit('network', event, this.thing)
      },

      /**
       * Double click and single click event handler
       *
       * @param {Object} event
       */
      oneClick(event) {
        this.$emit('click', event, this.thing)
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
