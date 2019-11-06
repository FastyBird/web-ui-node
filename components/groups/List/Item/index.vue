<template>
  <layout-list-item
    class="fb-iot-groups-list-item__container"
    @click="oneClick"
  >
    <template slot="icon">
      <font-awesome-icon :icon="$groupIcon(group)" />
    </template>

    <template slot="heading">
      {{ group.label }}
    </template>

    <template
      v-if="group.hasComment"
      slot="sub-heading"
    >
      {{ group.comment }}
    </template>
  </layout-list-item>
</template>

<script>
  import LayoutListItem from '@/components/layout/ListItem'

  export default {

    name: 'GroupsListItem',

    components: {
      LayoutListItem,
    },

    props: {

      group: {
        type: Object,
        required: true,
      },

    },

    methods: {

      /**
       * Double click and single click event handler
       *
       * @param {Object} event
       */
      oneClick(event) {
        this.$emit('click', event, this.group)
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
