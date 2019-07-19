<template web>
  <div
    class="fb-triggers-list-item__container"
    @click="oneClick"
  >
    <layout-list-item>
      <template slot="icon">
        <font-awesome-icon icon="sliders-h" />
      </template>

      <template slot="heading">
        {{ trigger.name }}
      </template>

      <template slot="sub-heading">
        {{ $tc('texts.conditions', trigger.conditions.length, { count: trigger.conditions.length }) }}
        <template v-if="trigger.hasOwnProperty('actions')">
          {{ $tc('texts.actions', trigger.actions.length, { count: trigger.actions.length }) }}
        </template>
        <template v-if="trigger.hasOwnProperty('notifications')">
          {{ $tc('texts.notifications', trigger.notifications.length, { count: trigger.notifications.length }) }}
        </template>
      </template>
    </layout-list-item>
  </div>
</template>

<script>
  import LayoutListItem from '@/components/layout/ListItem'

  export default {

    name: 'TriggersListItem',

    components: {
      LayoutListItem,
    },

    props: {

      trigger: {
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
        this.$emit('click', event, this.trigger)
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>

<i18n src="./locales.json" />
