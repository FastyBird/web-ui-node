<template>
  <list-item
    class="fb-groups-list-item__container"
    @click="oneClick"
  >
    <template slot="icon">
      <font-awesome-icon :icon="$groupIcon(group)" />
    </template>

    <template slot="heading">
      {{ group.name }}
    </template>

    <template
      v-if="group.hasComment"
      slot="sub-heading"
    >
      {{ group.comment }}
    </template>
  </list-item>
</template>

<script>
export default {

  name: 'GroupsListItem',

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
