<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-list-item__container"
    @click="oneClick"
  >
    <layout-list-item>
      <template slot="icon">
        <icon-with-child :primary-icon="$thingIcon(thing)" />
      </template>

      <template slot="heading">
        {{ thing.label }}
      </template>

      <template
        v-if="thing.hasComment"
        slot="sub-heading"
      >
        {{ thing.comment }}
      </template>

      <template
        v-if="(fetchingChannels || !channelsFirstLoadFinished) || switchChannels.length === 1 || environmentChannels.length === 1"
        slot="detail"
      >
        <spinner v-if="fetchingChannels || !channelsFirstLoadFinished" />

        <switch-actor
          v-else-if="switchChannels.length === 1"
          :thing="thing"
          :channel="_.get(switchChannels, '[0]', null)"
        />

        <div v-else-if="environmentChannels.length === 1">
          <template v-if="thing.state">
            <span class="fb-iot-things-list-item__value">{{ environmentChannelPropertyValue }}</span>
            <span class="fb-iot-things-list-item__units">{{ _.get(environmentChannelProperty, 'units', null) }}</span>
          </template>
          <template v-else>
            <span class="fb-iot-things-list-item__value">{{ $t('states.notAvailable.title') }}</span>
          </template>
        </div>
      </template>
    </layout-list-item>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import number from '@/helpers/number'

  import IconWithChild from '@/components/layout/IconWithChild'
  import LayoutListItem from '@/components/layout/ListItem'
  import Spinner from '@/components/layout/Spinner'

  import SwitchActor from '@/components/things/Channels/SwitchActor'

  export default {

    name: 'ThingsListItem',

    components: {
      IconWithChild,
      LayoutListItem,
      Spinner,

      SwitchActor,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

    },

    computed: {

      ...mapState('wamp', {
        exchangeConnected: state => state.isConnected,
      }),

      /**
       * Thing channels data
       *
       * @returns {Channel[]}
       */
      channels() {
        return this.$store.getters['entities/channel/query']()
          .with('properties')
          .where('thing_id', this.thing.id)
          .orderBy('name')
          .all()
      },

      /**
       * Get all relay switch channels
       *
       * @returns {Array}
       */
      switchChannels() {
        return this._.filter(this.channels, 'isSwitch')
      },

      /**
       * Get all energy meter channels
       *
       * @returns {Array}
       */
      environmentChannels() {
        if (this._.get(this.hardware, 'isManufacturerItead') && this._.get(this.hardware, 'model') === 'sonoff_sc') {
          return this._.filter(this.channels, 'isEnvironment')
        }

        return []
      },

      /**
       * Get value for current property
       *
       * @returns {String}
       */
      environmentChannelProperty() {
        const properties = this._.get(this.environmentChannels, '[0].properties', []).filter(property => property.property === 'temperature')

        return properties.length ? properties[0] : null
      },

      environmentChannelPropertyValue() {
        const propertyValue = this.$store.getters['entities/channel_property_value/query']()
          .where('channel_id', this._.get(this.environmentChannels, '[0].id', null))
          .where('property_id', this._.get(this.environmentChannelProperty, 'id', null))
          .first()

        return propertyValue !== null ? number.format(parseFloat(propertyValue.value), 2, ',', ' ') : '-'
      },

      /**
       * Get thing hardware info
       *
       * @returns {(Hardware|null)}
       */
      hardware() {
        return this.$store.getters['entities/hardware/query']()
          .where('thing_id', this.thing.id)
          .first()
      },

      /**
       * Flag signalizing that thing channels are loading from server
       *
       * @returns {Boolean}
       */
      fetchingChannels() {
        return this.$store.getters['entities/channel/fetching'](this.thing.id)
      },

      /**
       * Flag signalizing that thing channels were loaded from server
       *
       * @returns {Boolean}
       */
      channelsFirstLoadFinished() {
        return this.$store.getters['entities/channel/firstLoadFinished'](this.thing.id)
      },

    },

    watch: {

      fetchingChannels() {
        this._subscribeSockets()
      },

      exchangeConnected() {
        this._subscribeSockets()
      },

    },

    beforeMount() {
      if (
        this.channels.length === 0 &&
        !this.fetchingChannels &&
        !this.channelsFirstLoadFinished
      ) {
        this.$store.dispatch('entities/channel/fetch', {
          thing_id: this.thing.id,
        }, {
          root: true,
        })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })
      }

      this._subscribeSockets()
    },

    beforeDestroy() {
      if (
        (this.switchChannels.length === 1 || this.environmentChannels.length === 1) &&
        this.exchangeConnected
      ) {
        if (this.$route.path !== this.localePath({ name: this.$routes.things.detail, params: { id: this.thing.id } })) {
          this.$store.dispatch('entities/thing_socket/unsubscribe', {
            thing_id: this.thing.id,
          }, {
            root: true,
          })
        }
      }
    },

    methods: {

      /**
       * Double click and single click event handler
       *
       * @param {Object} event
       */
      oneClick(event) {
        this.$emit('click', event, this.thing)
      },

      /**
       * If it is possible and necessary, connect thing to sockets
       *
       * @private
       */
      _subscribeSockets() {
        if (
          (this.switchChannels.length === 1 || this.environmentChannels.length === 1) &&
          this.exchangeConnected
        ) {
          this.$store.dispatch('entities/thing_socket/subscribe', {
            thing_id: this.thing.id,
          }, {
            root: true,
          })
        }
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
