<template>
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

      <template
        v-if="trigger.hasComment"
        slot="sub-heading"
      >
        {{ trigger.comment }}
      </template>

      <template slot="buttons">
        <fb-button
          v-if="trigger.conditions.length"
          variant="outline-primary"
          :class="[ {'spinner': loadingConditions, 'spinner-inverse': loadingConditions, 'spinner-sm': loadingConditions }]"
          size="sm"
          @click.prevent="openConditions"
        >
          <font-awesome-icon icon="info" />
          {{ $tc('texts.conditions', trigger.conditions.length, { count: trigger.conditions.length }) }}
        </fb-button>

        <fb-button
          v-if="trigger.actions.length"
          variant="outline-primary"
          :class="[ {'spinner': loadingActions, 'spinner-inverse': loadingActions, 'spinner-sm': loadingActions }]"
          size="sm"
          @click.prevent="openActions"
        >
          <font-awesome-icon icon="info" />
          {{ $tc('texts.actions', trigger.actions.length, { count: trigger.actions.length }) }}
        </fb-button>

        <fb-button
          v-if="trigger.notifications.length"
          variant="outline-primary"
          :class="[ {'spinner': loadingNotifications, 'spinner-inverse': loadingNotifications, 'spinner-sm': loadingNotifications }]"
          size="sm"
          @click.prevent="openNotifications"
        >
          <font-awesome-icon icon="info" />
          {{ $tc('texts.notifications', trigger.notifications.length, { count: trigger.notifications.length }) }}
        </fb-button>
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

      loadingConditions: {
        type: Boolean,
        default: false,
      },

      loadingActions: {
        type: Boolean,
        default: false,
      },

      loadingNotifications: {
        type: Boolean,
        default: false,
      },

    },

    methods: {

      /**
       * Open trigger conditions info window
       *
       * @param {Object} event
       */
      openConditions(event) {
        this.$emit('conditions', event, this.trigger)
      },

      /**
       * Open trigger actions info window
       *
       * @param {Object} event
       */
      openActions(event) {
        this.$emit('actions', event, this.trigger)
      },

      /**
       * Open trigger notifications info window
       *
       * @param {Object} event
       */
      openNotifications(event) {
        this.$emit('notifications', event, this.trigger)
      },

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
