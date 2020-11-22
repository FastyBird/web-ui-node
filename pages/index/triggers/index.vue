<template>
  <div :class="['fb-triggers-list-view__container', {'fb-triggers-list-view__container-loading': (isLoading)}]">
    <client-only>
      <fb-layout-header-menu-button
        :label="$t('application.buttons.menu.title')"
        @toggleMenu="$bus.$emit('toggle-menu')"
        type="button"
        small
        left
      />

      <fb-layout-header-button
        :label="$t('application.buttons.new.title')"
        @click="handleOpenView(viewTypes.TYPE)"
        type="button"
        small
        right
      />

      <fb-layout-header-spacer small />

      <fb-ui-loading-box
        v-if="isLoading"
        class="fb-triggers-list-view__loading"
      >
        <p>
          {{ $t('triggers.texts.loadingTriggers') }}
        </p>
      </fb-ui-loading-box>

      <triggers-list-triggers
        v-else
        :active-item="openedDetail"
        @open="handleOpenDetail"
        v-slot="{ previous, next, page, total }"
      >
        <triggers-desktop-info
          v-if="!view.detail.opened || openedDetail === null"
          :total="total"
          @create="handleOpenView(viewTypes.CREATE)"
          @synchronise="handleSynchroniseTriggers"
        />

        <triggers-desktop-detail
          v-else
          :id="openedDetail"
          :page="page"
          :total="total"
          @close="handleCloseDetail"
          @previous="handleOpenPreviousItem(previous)"
          @next="handleOpenNextItem(next)"
          @removed="handleCloseDetail"
        />
      </triggers-list-triggers>

      <triggers-desktop-create
        v-if="view.create.opened && !$windowSize.isExtraSmall()"
        @close="handleCloseView(viewTypes.CREATE)"
        @created="(id) => {handleCloseView(viewTypes.CREATE); handleOpenDetail(id)}"
      />

      <triggers-phone-select-type
        v-if="view.type.opened"
        @close="handleCloseView(viewTypes.TYPE)"
      />

      <fb-ui-loading-box
        slot="placeholder"
        class="fb-triggers-list-view__loading"
      >
        <p>
          {{ $t('triggers.texts.loadingTriggers') }}
        </p>
      </fb-ui-loading-box>
    </client-only>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import {
  FbSizeTypes,
} from '@fastybird/web-ui-theme'

import {
  TRIGGERS_HASH_DETAIL,
  TRIGGERS_HASH_CREATE,
} from '~/configuration/routes'

import Trigger from '~/models/triggers-node/triggers/Trigger'

import TriggersListTriggers from '~/components/triggers/ListTriggers/index.vue'

import TriggersDesktopDetail from '~/components/triggers/Desktop/Detail/index.vue'
import TriggersDesktopCreate from '~/components/triggers/Desktop/Create/index.vue'
import TriggersDesktopInfo from '~/components/triggers/Desktop/Info/index.vue'

import TriggersPhoneSelectType from '~/components/triggers/Phone/SelectType/index.vue'

enum ViewTypes {
  CREATE = 'create',
  DETAIL = 'detail',
  TYPE = 'type',
}

interface TriggersIndexPageViewInterface {
  create: {
    opened: boolean
  }
  detail: {
    opened: boolean
  }
  type: {
    opened: boolean
  }
}

export default defineComponent({

  name: 'TriggersIndexPage',

  transition: 'fade',

  components: {
    TriggersListTriggers,
    TriggersDesktopDetail,
    TriggersDesktopCreate,
    TriggersDesktopInfo,
    TriggersPhoneSelectType,
  },

  setup(props: {}, context: SetupContext) {
    const isMounted = ref<boolean>(false)

    const view = reactive<TriggersIndexPageViewInterface>({
      type: {
        opened: false,
      },
      create: {
        opened: false,
      },
      detail: {
        opened: false,
      },
    })

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    const fetchingTriggers = computed<boolean>((): boolean => Trigger.getters('fetching')())

    const triggersCount = computed<number>((): number => Trigger.query().count())

    const isLoading = computed<boolean>((): boolean => fetchingTriggers.value)

    const openedDetail = ref<string | null>(null)

    context.root.$store.dispatch('app/setHeading', {
      heading: context.root.$t('triggers.headings.allTriggers'),
      subHeading: context.root.$tc('triggers.subHeadings.allTriggers', triggersCount.value, { count: triggersCount.value }),
      icon: 'magic',
    }, {
      root: true,
    })

    function handleCloseView(type: ViewTypes) {
      if (Object.prototype.hasOwnProperty.call(view, type)) {
        switch (type) {
          case ViewTypes.DETAIL:
            view.detail.opened = false

            context.root.$router.push(context.root.localePath(context.root.$routes.triggers.list))
            break

          case ViewTypes.TYPE:
            view.type.opened = false
            break

          case ViewTypes.CREATE:
            view.create.opened = false

            context.root.$router.push(context.root.localePath(context.root.$routes.triggers.list))
            break
        }
      }
    }

    function handleOpenView(type: ViewTypes) {
      if (Object.prototype.hasOwnProperty.call(view, type)) {
        switch (type) {
          case ViewTypes.DETAIL:
            if (openedDetail.value) {
              if (context.root.$windowSize.isExtraSmall()) {
                context.root.$router.push(context.root.localePath({
                  name: context.root.$routes.triggers.detail,
                  params: {
                    id: openedDetail.value,
                  },
                }))
              } else {
                context.root.$router.push(context.root.localePath({
                  name: context.root.$routes.triggers.list,
                  hash: `${TRIGGERS_HASH_DETAIL}-${openedDetail.value}`,
                }))
              }
            }
            break

          case ViewTypes.CREATE:
            if (context.root.$windowSize.isExtraSmall()) {
              handleCloseView(ViewTypes.CREATE)

              context.root.$router.push(context.root.localePath(context.root.$routes.triggers.list))
            } else {
              context.root.$router.push(context.root.localePath({
                name: context.root.$routes.triggers.list,
                hash: TRIGGERS_HASH_CREATE,
              }))
            }
            break
        }

        view[type].opened = true
      }
    }

    function handleCloseDetail(): void {
      openedDetail.value = null

      handleCloseView(ViewTypes.DETAIL)
    }

    function handleOpenDetail(id: string): void {
      if (Trigger.query().where('id', id).exists()) {
        openedDetail.value = id

        handleOpenView(ViewTypes.DETAIL)
      }
    }

    function handleOpenPreviousItem(id: string | null): void {
      if (id !== null) {
        handleOpenDetail(id)
      }
    }

    function handleOpenNextItem(id: string | null): void {
      if (id !== null) {
        handleOpenDetail(id)
      }
    }

    function checkRoute() {
      if (context.root.$route.hash !== '') {
        if (context.root.$route.hash.includes(TRIGGERS_HASH_DETAIL)) {
          handleOpenDetail(context.root.$route.hash.substring(TRIGGERS_HASH_DETAIL.length + 1))
        } else if (context.root.$route.hash.includes(TRIGGERS_HASH_CREATE)) {
          handleOpenView(ViewTypes.CREATE)
        }
      }
    }

    function handleSynchroniseTriggers(): void {
      // TODO: do sync here
    }

    onMounted((): void => {
      if (!fetchingTriggers.value) {
        checkRoute()
      }

      context.root.$bus.$emit('wait-page_reloading', false)

      isMounted.value = true
    })

    watch(
      (): string => windowSize.value,
      (val): void => {
        if (val === FbSizeTypes.EXTRA_SMALL && isMounted.value) {
          if (view.detail.opened && openedDetail.value !== null) {
            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.triggers.detail,
              params: {
                id: openedDetail.value,
              },
            }))
          } else if (view.create.opened) {
            handleCloseView(ViewTypes.CREATE)

            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.triggers.list,
            }))
          }
        }
      },
    )

    watch(
      (): boolean => fetchingTriggers.value,
      (val): void => {
        if (!val && isMounted.value) {
          checkRoute()
        }
      },
    )

    watch(
      () => triggersCount.value,
      (val): void => {
        context.root.$store.dispatch('app/setHeading', {
          heading: context.root.$t('triggers.headings.allTriggers'),
          subHeading: context.root.$tc('triggers.subHeadings.allTriggers', val, { count: val }),
          icon: 'magic',
        }, {
          root: true,
        })
      },
    )

    return {
      view,
      isLoading,
      openedDetail,
      handleOpenDetail,
      handleCloseDetail,
      handleOpenView,
      handleCloseView,
      handleSynchroniseTriggers,
      handleOpenPreviousItem,
      handleOpenNextItem,
      viewTypes: ViewTypes,
    }
  },

  head() {
    return {
      title: this.$t('meta.triggers.list.title'),
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
