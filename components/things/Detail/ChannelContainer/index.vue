<template>
  <layout-list-item
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-container__container"
  >
    <template slot="icon">
      <template v-if="slotExists('icon')">
        <slot name="icon" />
      </template>
      <div
        v-else
        class="circle text-center"
      >
        <font-awesome-icon :icon="$channelIcon(thing, channel)" />
      </div>
    </template>

    <template slot="heading">
      <template v-if="slotExists('heading')">
        <slot name="heading" />
      </template>
      <template v-else>
        {{ $tChannel(thing, channel) }}
      </template>
    </template>

    <template
      v-if="slotExists('sub-heading')"
      slot="sub-heading"
    >
      <slot name="sub-heading" />
    </template>

    <template
      v-if="slotExists('channel')"
      slot="detail"
    >
      <slot name="channel" />
    </template>
  </layout-list-item>
</template>

<script>
  import LayoutListItem from '@/components/layout/ListItem'

  export default {

    name: 'ThingsDetailChannelContainer',

    components: {
      LayoutListItem,
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
