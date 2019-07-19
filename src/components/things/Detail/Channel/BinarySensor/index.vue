<template web>
  <div :data-state="thing.state ? 'on' : 'off'">
    <template v-if="!thing.state">
      {{ $t('states.notAvailable.title') }}
    </template>
    <template v-else-if="propertyValue === true">
      {{ $t('states.on.title') }}
    </template>
    <template v-else>
      {{ $t('states.off.title') }}
    </template>
  </div>
</template>

<script>
  import ChannelPropertyValue from '@/store/modules/io-server/ChannelPropertyValue'

  import {
    DATA_TYPE_BOOLEAN,
    DATA_TYPE_ENUM,

    PROPERTY_TYPE_STATE,
  } from '@/constants'

  export default {

    name: 'ThingsDetailChannelBinarySensor',

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channel: {
        type: Object,
        required: true,
      },

    },

    data() {
      return {
        property: this._.find(this.channel.properties, { 'property': PROPERTY_TYPE_STATE }),
      }
    },

    computed: {

      /**
       * Get channel state property value
       *
       * @returns {Boolean}
       */
      propertyValue() {
        if (this.property === undefined) {
          return false
        }

        const propertyValue = ChannelPropertyValue
          .query()
          .where('channel_id', this.channel.id)
          .where('property_id', this.property.id)
          .first()

        if (propertyValue) {
          if (this.property.data_type === DATA_TYPE_BOOLEAN) {
            return !!propertyValue.value
          } else if (this.property.data_type === DATA_TYPE_ENUM) {
            return propertyValue.value === 'on'
          }
        }

        return false
      },

    },

  }
</script>

<i18n src="./locales.json" />
