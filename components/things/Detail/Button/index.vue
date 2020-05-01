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
          icon="project-diagram"
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
          v-for="trigger in triggers"
          :key="trigger.id"
          :thing="thing"
          :trigger="trigger"
        />
      </template>
    </template>
  </div>
</template>

<script>
import ChannelProperty from '~/models/devices-node/ChannelProperty'
import Trigger from '~/models/triggers-node/Trigger'
import Thing from '~/models/things/Thing'

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
      const property = ChannelProperty
        .query()
        .where('channel_id', this.thing.channel_id)
        .first()

      if (property === null) {
        return []
      }

      return Trigger
        .query()
        .with('actions')
        .where('device', this.thing.device.identifier)
        .where('channel', this.thing.channel.channel)
        .where('property', property.property)
        .orderBy('operand', 'asc')
        .get()
    },

    /**
     * Flag signalizing that things are loading from server
     *
     * @returns {Boolean}
     */
    fetchingThings() {
      return Thing.getters('fetching')()
    },

    /**
     * Flag signalizing that things are loaded from server
     *
     * @returns {Boolean}
     */
    thingsLoaded() {
      return Thing.getters('firstLoadFinished')()
    },

    /**
     * Flag signalizing that triggers are loading from server
     *
     * @returns {Boolean}
     */
    fetchingTriggers() {
      return Trigger.getters('fetching')()
    },

    /**
     * Flag signalizing that triggers are loaded from server
     *
     * @returns {Boolean}
     */
    triggersLoaded() {
      return Trigger.getters('firstLoadFinished')()
    },

  },

  beforeMount() {
    if (
      Trigger.query().count() === 0 &&
      !this.fetchingTriggers &&
      !this.triggersLoaded
    ) {
      Trigger.dispatch('fetch')
        .catch(() => {
          this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
        })
    }

    if (
      !this.fetchingThings &&
      !this.thingsLoaded
    ) {
      Thing.dispatch('fetch')
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
