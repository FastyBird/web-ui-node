<template>
  <layout-list-item
    class="fb-iot-things-list-item__container"
    @click="oneClick"
  >
    <template slot="icon">
      <font-awesome-icon icon="project-diagram" />
    </template>

    <template slot="heading">
      {{ routine.name }}
    </template>

    <template
      v-if="routine.hasComment"
      slot="sub-heading"
    >
      {{ routine.comment }}
    </template>
  </layout-list-item>
</template>

<script>
  import LayoutListItem from '@/components/layout/ListItem'

  export default {

    name: 'RoutinesListItem',

    components: {
      LayoutListItem,
    },

    props: {

      routine: {
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
        this.$emit('click', event, this.routine)
      },

    },

  }
</script>

<i18n src="./locales.json" />
