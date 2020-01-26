<template>
  <div class="fb-iot-things-detail-button__container">
    <fb-loading-box
      v-if="fetchingTriggers || !triggersLoaded"
      :text="$t('things.texts.loadingTriggers')"
    />

    <template v-else>
      <template v-if="triggers.length === 0">
        <no-results
          :message="$t('things.texts.noThingsActions')"
          icon="plug"
          second-icon="plus"
        />

        <div class="fb-iot-things-detail-button__new-action">
          <fb-button
            variant="outline-primary"
            name="press"
            @click.prevent="$emit('view', 'type')"
          >
            {{ $t('things.buttons.addTriggerAction.title') }}
          </fb-button>
        </div>
      </template>

      <template v-else>
        <button-trigger
          v-for="(trigger, index) in triggers"
          :key="index"
          :thing="thing"
          :trigger="trigger"
        />
      </template>
    </template>
  </div>
</template>

<script>
const ButtonTrigger = () => import('./Trigger')

export default {

  name: 'ThingsDetailButton',

  components: {
    ButtonTrigger,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  computed: {

    /**
     * Thing direct triggers
     *
     * @returns {Array}
     */
    triggers() {
      if (typeof this._.first(this.thing.channel.properties) === 'undefined') {
        return []
      }

      return this.$store.getters['entities/trigger/query']()
        .with('condition')
        .with('actions')
        .where('channel_id', this.thing.channel_id)
        .where('property_id', this._.first(this.thing.channel.properties).id)
        .orderBy('operand', 'asc')
        .all()
    },

    /**
     * Flag signalizing that things are loading from server
     *
     * @returns {Boolean}
     */
    fetchingThings() {
      return this.$store.getters['entities/thing/fetching']()
    },

    /**
     * Flag signalizing that things are loaded from server
     *
     * @returns {Boolean}
     */
    thingsLoaded() {
      return this.$store.getters['entities/thing/firstLoadFinished']()
    },

    /**
     * Flag signalizing that triggers are loading from server
     *
     * @returns {Boolean}
     */
    fetchingTriggers() {
      return this.$store.getters['entities/trigger/fetching']()
    },

    /**
     * Flag signalizing that triggers are loaded from server
     *
     * @returns {Boolean}
     */
    triggersLoaded() {
      return this.$store.getters['entities/trigger/firstLoadFinished']()
    },

  },

  beforeMount() {
    if (
      this.$store.getters['entities/trigger/query']().count() === 0 &&
      !this.fetchingTriggers &&
      !this.triggersLoaded
    ) {
      this.$store.dispatch('entities/trigger/fetch', null, {
        root: true,
      })
        .catch(() => {
          this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
        })
    }

    if (
      !this.fetchingThings &&
      !this.thingsLoaded
    ) {
      this.$store.dispatch('entities/thing/fetch', null, {
        root: true,
      })
        .catch(() => {
          this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
        })
    }
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
