<template>
  <div>
    <div
      v-if="parameter.isBoolean"
      :class="['list-group-item', {'text-warning': !thing.state}]"
    >
      <span class="pull-right">
        <switch-element
          :ref="parameter.name"
          :status="parameter.value"
          :disabled="!thing.state"
          @change="$emit('submit')"
        />
      </span>
      <template
        v-if="$t(`things.vendors.${hardware.manufacturer}.${parameter.name}.button`).indexOf('things.vendors.') === -1"
      >
        {{ $t(`things.vendors.${hardware.manufacturer}.${parameter.name}.button`) }}
      </template>
      <template v-else>
        {{ parameter.name }}
      </template>
    </div>

    <button
      v-else
      :class="['list-group-item', {'text-warning': !thing.state}]"
      role="button"
      @click.prevent="$emit('openForm')"
    >
      <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
      <span
        v-show="loading"
        class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
      />
      <template
        v-if="$t(`things.vendors.${hardware.manufacturer}.${parameter.name}.button`).indexOf('things.vendors.') === -1"
      >
        {{ $t(`things.vendors.${hardware.manufacturer}.${parameter.name}.button`) }}
      </template>
      <template v-else>
        {{ parameter.name }}
      </template>
      <small class="d-b">
        {{ $t('texts.actual') }}:
        <template v-if="parameter.isSelect">
          <strong>{{ selectValue }}</strong>
        </template>
        <template v-else>
          <strong>{{ parameter.value }}</strong>
        </template>
      </small>
    </button>
  </div>
</template>

<script>
  import SwitchElement from '@/components/layout/SwitchElement'

  export default {

    name: 'ThingsSettingsParameter',

    components: {
      SwitchElement,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      parameter: {
        type: Object,
        required: true,
      },

      hardware: {
        type: Object,
        required: true,
      },

      loading: {
        type: Boolean,
        default: false,
      },

    },

    computed: {

      /**
       * Parse parameter items for select box
       *
       * @returns {String}
       */
      selectValue() {
        for (const key in this.parameter.values) {
          // eslint-disable-next-line
          if (this.parameter.values.hasOwnProperty(key)&& this.parameter.values[key].value == this.parameter.value) {
            if (this.$t(`things.vendors.${this.hardware.manufacturer}.${this.parameter.name}.values.${this.parameter.values[key].name}`).indexOf('things.vendors.') === -1) {
              return this.$t(`things.vendors.${this.hardware.manufacturer}.${this.parameter.name}.values.${this.parameter.values[key].name}`)
            } else {
              return this.parameter.value
            }
          }
        }

        return this.parameter.value
      },

    },

  }
</script>

<i18n src="./locales.json" />
