<template>
  <div class="fb-iot-groups-settings-group__container">
    <list-items-container :heading="$t('groups.headings.generalSettings')">
      <settings-list-item
        type="button"
        class="fb-iot-groups-settings-group__item"
        @click="openWindow('rename')"
      >
        <span class="fb-iot-groups-settings-group__item-icon">
          <font-awesome-icon icon="angle-right" />
        </span>
        <fb-spinner
          v-if="loading.rename"
          size="sm"
        />
        {{ $t('groups.buttons.rename.title') }}
      </settings-list-item>

      <settings-list-item
        type="button"
        class="fb-iot-groups-settings-group__item fb-iot-groups-settings-group__item-remove"
        @click="openWindow('remove')"
      >
        <span class="fb-iot-groups-settings-group__item-icon">
          <font-awesome-icon icon="exclamation-triangle" />
        </span>
        <fb-spinner
          v-if="loading.remove"
          size="sm"
        />
        {{ $t('groups.buttons.remove.title') }}
      </settings-list-item>
    </list-items-container>

    <group-rename
      v-if="rename.show"
      :group="group"
      :transparent-bg="transparentModal"
      @loaded="loading.rename = false"
      @close="closeWindow('rename')"
    />

    <group-remove
      v-if="remove.show"
      :group="group"
      :transparent-bg="transparentModal"
      @loaded="loading.remove = false"
      @close="closeWindow('remove')"
    />
  </div>
</template>

<script>
const GroupRename = () => import('./Rename')
const GroupRemove = () => import('./Remove')

export default {

  name: 'GroupsSettingsGroup',

  components: {
    GroupRename,
    GroupRemove,
  },

  props: {

    group: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      isCustom: false,
      transparentModal: false,
      loading: {
        rename: false,
        remove: false,
      },
      rename: {
        show: false,
      },
      remove: {
        show: false,
      },
    }
  },

  created() {
    this.transparentModal = this.$parent.$options.name !== 'Layout'
  },

  methods: {

    /**
     * Open edit|info window
     *
     * @param {String} window
     */
    openWindow(window) {
      if (Object.prototype.hasOwnProperty.call(this, window)) {
        this[window].show = true

        if (Object.prototype.hasOwnProperty.call(this.loading, window)) {
          this.loading[window] = true
        }
      }
    },

    /**
     * Close opened window
     *
     * @param {String} window
     */
    closeWindow(window) {
      if (Object.prototype.hasOwnProperty.call(this, window)) {
        this[window].show = false
      }
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
