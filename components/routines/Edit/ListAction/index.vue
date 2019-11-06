<template>
  <layout-list-item class="fb-routines-action__container">
    <template slot="icon">
      <font-awesome-icon :icon="$thingIcon(thing)" />
    </template>

    <template slot="heading">
      {{ thing.label }}
    </template>

    <template slot="sub-heading">
      Switch turn on
    </template>

    <template slot="detail-large">
      <switch-element
        :status="enabled"
        class="pull-left"
        @change="toggleThing"
      />

      <fb-button
        size="sm"
        variant="link"
        @click="editThing"
      >
        {{ $t('buttons.edit.title') }}
      </fb-button>
    </template>
  </layout-list-item>
</template>

<script>
  import LayoutListItem from '@/components/layout/ListItem'
  import SwitchElement from '@/components/layout/SwitchElement'

  export default {

    name: 'RoutinesEditListAction',

    components: {
      LayoutListItem,
      SwitchElement,
    },

    props: {

      action: {
        type: Object,
        required: true,
        validator: (value) => {
          return !(
            !value.hasOwnProperty('enabled') ||
            !value.hasOwnProperty('thing') ||
            !value.hasOwnProperty('rows') ||
            !Array.isArray(value.rows) ||
            !value.rows.length
          )
        },
      },

    },

    data() {
      return {
        enabled: true,
      }
    },

    computed: {

      thing() {
        return this.$store.getters['entities/thing/find'](this.action.thing)
      },

      properties() {
        return this.$store.getters['entities/channel_property/query']()
          .with('channel')
          .where('id', this.action.rows.map(item => { return item.property }))
          .first()
      },

    },

    methods: {

      toggleThing() {
        this.$emit('toggle')
      },

      editThing() {
        this.$emit('edit')
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>

<i18n src="./locales.json" />
