<template>
  <list-item
    :show-status="true"
    :status="routine.enabled"
    class="fb-routines-list-item__container"
    @click="oneClick"
  >
    <template slot="icon">
      <font-awesome-icon :icon="$routineIcon(routine)" />
    </template>

    <template slot="heading">
      {{ routine.name }}
    </template>

    <template slot="sub-heading">
      {{ subHeading }}
    </template>

    <template slot="detail">
      <div class="fb-routines-list-item__info">
        <small>{{ $tc('routines.texts.routineThings', thingsCount, { count: thingsCount }) }}</small>

        <font-awesome-icon
          icon="chevron-right"
          role="button"
        />
      </div>
    </template>
  </list-item>
</template>

<script>
export default {

  name: 'RoutinesListItem',

  props: {

    routine: {
      type: Object,
      required: true,
    },

  },

  computed: {

    /**
     * Count total things count (actions)
     *
     * @returns {Number}
     */
    thingsCount() {
      return this._.uniq(this._.get(this.routine, 'actions', [])
        .map((item) => {
          return item.channel_id
        }))
        .length
    },

    /**
     * @returns {String}
     */
    subHeading() {
      if (this.routine.hasComment) {
        return this.routine.comment
      }

      return this.routine.isAutomatic ? this.$t('routines.headings.automaticRoutine') : this.$t('routines.headings.manualRoutine')
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

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
