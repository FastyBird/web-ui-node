<template>
  <list-item
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-property__container"
  >
    <template slot="icon">
      <template v-if="slotExists('icon')">
        <slot name="icon" />
      </template>

      <font-awesome-icon
        v-else
        :icon="$channelPropertyIcon(thing, property, 'plug')"
      />
    </template>

    <template slot="heading">
      <template v-if="slotExists('heading')">
        <slot name="heading" />
      </template>
      <template v-else>
        {{ $tChannelProperty(thing, property) }}
      </template>
    </template>

    <template
      v-if="slotExists('sub-heading')"
      slot="sub-heading"
    >
      <slot name="sub-heading" />
    </template>

    <template
      v-if="slotExists('property')"
      slot="detail"
    >
      <slot name="property" />
    </template>
  </list-item>
</template>

<script>
  export default {

    name: 'ThingsDetailPropertyContainer',

    props: {

      thing: {
        type: Object,
        required: true,
      },

      property: {
        type: Object,
        required: true,
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
