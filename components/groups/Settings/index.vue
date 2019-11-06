<template>
  <div class="fb-iot-groups-settings-group__container">
    <div class="fb-iot-groups-settings-group__heading p-x-md p-y-0 m-a-0">
      <h3>
        {{ $t('headings.generalSettings') }}
      </h3>
    </div>

    <div class="list-group">
      <button
        class="list-group-item"
        role="button"
        @click.prevent="openWindow('rename')"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.rename"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.rename.title') }}
      </button>
      <button
        class="list-group-item text-danger"
        role="button"
        @click.prevent="openWindow('remove')"
      >
        <span class="pull-right"><font-awesome-icon icon="exclamation-triangle" /></span>
        <span
          v-show="loading.remove"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.remove.title') }}
      </button>
    </div>

    <groups-edit-group-rename
      v-if="rename.show"
      :group="group"
      :transparent-bg="transparentModal"
      @loaded="loading.rename = false"
      @close="closeWindow('rename')"
    />

    <groups-remove
      v-if="remove.show"
      :group="group"
      :transparent-bg="transparentModal"
      @loaded="loading.remove = false"
      @close="closeWindow('remove')"
    />
  </div>
</template>

<script>
  const GroupsEditGroupRename = () => import('../Edit/Rename')
  const GroupsRemove = () => import('../Remove')

  export default {

    name: 'GroupsSettingsGroup',

    components: {
      GroupsEditGroupRename,
      GroupsRemove,
    },

    props: {

      group: {
        type: Object,
        required: true,
      },

      channels: {
        type: Array,
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
        if (this.hasOwnProperty(window)) {
          this[window].show = true

          if (this.loading.hasOwnProperty(window)) {
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
        if (this.hasOwnProperty(window)) {
          this[window].show = false
        }
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
