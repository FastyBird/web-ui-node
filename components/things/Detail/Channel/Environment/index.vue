<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-environment__container"
  >
    <things-detail-channel-environment-property
      v-for="property in channel.properties"
      :key="property.id"
      :thing="thing"
      :channel="channel"
      :property="property"
    />
  </div>
</template>

<script>
  const ThingsDetailChannelEnvironmentProperty = () => import('./Property')

  export default {

    name: 'ThingsDetailChannelEnvironment',

    components: {
      ThingsDetailChannelEnvironmentProperty,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channel: {
        type: Object,
        required: true,
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
