<template>
  <div :class="['fb-triggers-detail-view__container', {'fb-triggers-detail-view__container-loading': (isLoading)}]">
    <client-only>
      <fb-ui-loading-box
        v-if="isLoading"
        class="fb-triggers-detail-view__loading"
      >
        <p>
          {{ $t('triggers.texts.loadingTrigger') }}
        </p>
      </fb-ui-loading-box>

      <template v-else>
        <fb-layout-header-button
          v-if="!view.settings.opened"
          :type="menuItemTypes.BUTTON"
          @click="handleCloseView(viewTypes.DETAIL)"
          small
          left
        >
          <template slot="icon">
            <font-awesome-icon icon="angle-left" />
          </template>
        </fb-layout-header-button>

        <fb-layout-header-button
          v-if="view.settings.opened"
          :label="$t('application.buttons.cancel.title')"
          :type="menuItemTypes.BUTTON"
          @click="handleCloseView(viewTypes.SETTINGS)"
          small
          left
        />

        <fb-layout-header-button
          v-if="!view.settings.opened"
          :label="$t('application.buttons.edit.title')"
          :type="menuItemTypes.BUTTON"
          @click="handleOpenView(viewTypes.SETTINGS)"
          small
          right
        />

        <fb-layout-header-button
          v-if="view.settings.opened"
          :label="$t('application.buttons.done.title')"
          :type="menuItemTypes.BUTTON"
          @click="handleSubmitUpdate"
          small
          right
        />

        <fb-layout-header-spacer small />

        <expandable-box :show="view.detail.opened">
          <triggers-detail
            :trigger="trigger"
          />
        </expandable-box>

        <expandable-box :show="view.settings.opened">
          <trigger-settings
            :trigger="trigger"
            :remote-form-submit.sync="remoteFormSubmit"
            :remote-form-result.sync="remoteFormResult"
            :remote-form-reset.sync="remoteFormReset"
            @removed="handleTriggerRemoved"
            class="fb-triggers-detail-view__container-settings"
          />
        </expandable-box>
      </template>

      <fb-ui-loading-box
        slot="placeholder"
        class="fb-triggers-list-view__loading"
      >
        <p>
          {{ $t('triggers.texts.loadingTrigger') }}
        </p>
      </fb-ui-loading-box>
    </client-only>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import get from 'lodash/get'

import {
  FbFormResultTypes,
  FbSizeTypes,
  FbMenuItemTypes,
} from '@fastybird/web-ui-theme'

import {
  TRIGGERS_HASH_DETAIL,
  TRIGGERS_HASH_SETTINGS,
} from '~/configuration/routes'

import Trigger from '~/models/triggers-module/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-module/triggers/types'

import TriggersDetail from '~/components/triggers/Detail/index.vue'
import TriggerSettings from '~/components/triggers/Phone/Settings/index.vue'

enum ViewTypes {
  DETAIL = 'detail',
  SETTINGS = 'settings',
}

export default defineComponent({

  name: 'TriggerDetailPage',

  transition: 'fade',

  components: {
    TriggersDetail,
    TriggerSettings,
  },

  setup(props: {}, context: SetupContext) {
    if (!context.root.$validateUUID(context.root.$route.params.id)) {
      context.root.$nuxt.error({
        statusCode: 404,
        message: 'Trigger Not Found',
      })
    }

    const view = reactive({
      detail: {
        opened: !context.root.$route.hash.includes(TRIGGERS_HASH_SETTINGS),
      },
      settings: {
        opened: context.root.$route.hash.includes(TRIGGERS_HASH_SETTINGS),
      },
    })

    const detailComponent = ref<HTMLElement | null>(null)

    const settingsComponent = ref<HTMLElement | null>(null)

    const isMounted = ref<boolean>(false)

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    const trigger = computed<TriggerInterface | null>((): TriggerInterface | null => {
      return Trigger
        .query()
        .with('trigger')
        .with('actions')
        .with('actions.rows')
        .with('actions.rows.action')
        .with('conditions')
        .with('conditions.rows')
        .with('conditions.rows.condition')
        .with('schedule')
        .with('schedule.condition')
        .where('id', context.root.$route.params.id)
        .first()
    })

    const fetchingTriggers = computed<boolean>((): boolean => Trigger.getters('fetching')())

    const fetchingTrigger = computed<boolean>((): boolean => Trigger.getters('getting')(context.root.$route.params.id))

    const isLoading = computed<boolean>((): boolean => fetchingTriggers.value || fetchingTrigger.value || trigger.value === null)

    const remoteFormSubmit = ref<boolean>(false)

    const remoteFormResult = ref<FbFormResultTypes>(FbFormResultTypes.NONE)

    const remoteFormReset = ref<boolean>(false)

    function handleTriggerRemoved(): void {
      context.root.$router.push(context.root.localePath(context.root.$routes.triggers.list))
    }

    function handleOpenView(type: ViewTypes): void {
      switch (type) {
        case ViewTypes.DETAIL:
          break

        case ViewTypes.SETTINGS:
          view.detail.opened = false

          remoteFormReset.value = true

          context.root.$nextTick((): void => {
            view.settings.opened = true

            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.triggers.detail,
              params: {
                id: context.root.$route.params.id,
              },
              hash: TRIGGERS_HASH_SETTINGS,
            }))
          })
          break
      }
    }

    function handleCloseView(type: ViewTypes): void {
      switch (type) {
        case ViewTypes.DETAIL:
          context.root.$router.push(context.root.localePath({ name: context.root.$routes.triggers.list }))
          break

        case ViewTypes.SETTINGS:
          view.detail.opened = true

          context.root.$nextTick((): void => {
            view.settings.opened = false

            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.triggers.detail,
              params: {
                id: context.root.$route.params.id,
              },
            }))
          })
          break
      }
    }

    function handleSubmitUpdate(): void {
      remoteFormSubmit.value = true
    }

    onBeforeMount((): void => {
      if (
        Trigger.query().count() === 0 &&
        !fetchingTriggers.value &&
        !fetchingTrigger.value &&
        !Trigger.getters('firstLoadFinished')()
      ) {
        Trigger.dispatch('get', {
          id: context.root.$route.params.id,
        })
          .catch((e): void => {
            if (get(e, 'exception.response.status', 0) === 404) {
              context.root.$nuxt.error({
                statusCode: 404,
                message: 'Trigger Not Found',
              })
            } else {
              context.root.$nuxt.error({
                statusCode: 503,
                message: 'Something went wrong',
              })
            }
          })
      }

      if (!fetchingTrigger.value && trigger.value === null) {
        context.root.$nuxt.error({
          statusCode: 404,
          message: 'Trigger Not Found',
        })
      }
    })

    onMounted((): void => {
      isMounted.value = true

      context.root.$bus.$emit('wait-page_reloading', false)
    })

    watch(
      (): string => windowSize.value,
      (val): void => {
        if (val !== FbSizeTypes.EXTRA_SMALL && isMounted.value) {
          context.root.$router.push(context.root.localePath({
            name: context.root.$routes.triggers.list,
            hash: `${TRIGGERS_HASH_DETAIL}-${context.root.$route.params.id}`,
          }))
        }
      },
    )

    watch(
      (): boolean => fetchingTrigger.value,
      (val): void => {
        if (!val && trigger.value === null && isMounted.value) {
          context.root.$nuxt.error({
            statusCode: 404,
            message: 'Trigger Not Found',
          })
        }
      },
    )

    watch(
      (): TriggerInterface | null => trigger.value,
      (val): void => {
        if (val !== null) {
          context.root.$store.dispatch('app/setHeading', {
            heading: val.name,
            subHeading: val.description,
            icon: trigger.value ? trigger.value.icon : null,
          }, {
            root: true,
          })
        }
      },
    )

    watch(
      (): FbFormResultTypes => remoteFormResult.value,
      (val): void => {
        if (val === FbFormResultTypes.WORKING && isMounted.value) {
          handleCloseView(ViewTypes.SETTINGS)
        }
      },
    )

    return {
      id: context.root.$route.params.id,
      view,
      isMounted,
      windowSize,
      trigger,
      isLoading,
      fetchingTriggers,
      fetchingTrigger,
      detailComponent,
      settingsComponent,
      remoteFormSubmit,
      remoteFormResult,
      remoteFormReset,
      handleOpenView,
      handleCloseView,
      handleSubmitUpdate,
      handleTriggerRemoved,
      viewTypes: ViewTypes,
      menuItemTypes: FbMenuItemTypes,
    }
  },

  // @ts-ignore
  validate({ app, params }) {
    return app.$validateUUID(params.id)
  },

  head() {
    return {
      title: this.$t('meta.triggers.detail.title', { trigger: this._.get(this.trigger, 'name') }),
    }
  },

  meta: {
    hideTabs: true,
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
