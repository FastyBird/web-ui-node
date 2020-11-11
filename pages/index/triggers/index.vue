<template>
  <div
    :class="['fb-triggers-list-view__container', {'fb-triggers-list-view__container-loading': (isLoading)}, {'fb-triggers-list-view__container-empty': (noResults)}]"
  >
    <client-only>
      <fb-ui-loading-box
        v-if="isLoading"
        class="fb-triggers-list-view__loading"
      >
        <p>
          {{ $t('triggers.texts.loadingTriggers') }}
        </p>
      </fb-ui-loading-box>

      <list-layout
        v-else
        :search-placeholder="$t('triggers.fields.search.placeholder')"
      >
        <fb-ui-no-results
          slot="items"
          v-if="noResults"
        >
          <font-awesome-icon
            slot="icon"
            icon="magic"
          />

          <font-awesome-icon
            slot="second-icon"
            icon="exclamation-triangle"
          />

          {{ $t('triggers.texts.noTriggers') }}
        </fb-ui-no-results>

        <template v-else>
          <list-item
            slot="items"
            v-for="trigger in triggers"
            :key="trigger.id"
            :variant="listItemTypes.LIST"
            @click="openDetail(trigger.id)"
          >
            <font-awesome-icon
              slot="icon"
              :icon="trigger.icon"
            />

            <template slot="heading">
              {{ trigger.name }}
            </template>

            <template slot="sub-heading">
              {{ trigger.description }}
            </template>
          </list-item>
        </template>

        <div
          slot="detail"
          v-if="!view.detail.opened || openedDetail === null"
          class="fb-triggers-list-view__detail-info"
        >
          <fb-ui-content ml="md">
            <fb-ui-media-item>
              <font-awesome-icon
                slot="left"
                icon="magic"
              />

              <template slot="heading">
                {{ $t('triggers.headings.allTriggers') }}
              </template>

              <template slot="description">
                {{ $tc('triggers.subHeadings.allTriggers', triggers.length, { count: triggers.length }) }}
              </template>
            </fb-ui-media-item>

            <fb-ui-media-item>
              <font-awesome-icon
                slot="left"
                icon="plus"
              />

              <template slot="heading">
                {{ $t('triggers.headings.addNewTrigger') }}
              </template>

              <template slot="description">
                {{ $t('triggers.subHeadings.addNewTrigger') }}
              </template>

              <fb-ui-button
                slot="action"
                :variant="buttonVariantTypes.OUTLINE_PRIMARY"
                @click.prevent="openView(viewTypes.CREATE)"
              >
                {{ $t('triggers.buttons.addNew.title') }}
              </fb-ui-button>
            </fb-ui-media-item>

            <fb-ui-media-item>
              <font-awesome-icon
                slot="left"
                icon="sync-alt"
              />

              <template slot="heading">
                {{ $t('triggers.headings.syncTriggers') }}
              </template>

              <template slot="description">
                {{ $t('triggers.subHeadings.syncTriggers') }}
              </template>

              <fb-ui-button
                slot="action"
                :variant="buttonVariantTypes.OUTLINE_DEFAULT"
                @click.prevent="synchroniseTriggers"
              >
                {{ $t('triggers.buttons.sync.title') }}
              </fb-ui-button>
            </fb-ui-media-item>
          </fb-ui-content>
        </div>

        <template v-if="view.detail.opened && openedDetail !== null">
          <triggers-desktop-detail-toolbar
            slot="toolbar"
            :trigger="openedDetail"
            :edit-mode="editMode"
            :page="view.detail.index + 1"
            :total="triggers.length"
            @close="closeView(viewTypes.DETAIL)"
            @toggleEdit="toggleEditMode"
            @previous="openPreviousItem"
            @next="openNextItem"
          />

          <triggers-desktop-detail-header
            slot="heading"
            :trigger="openedDetail"
            :edit-mode="editMode"
          />

          <triggers-detail
            slot="detail"
            :trigger="openedDetail"
            :edit-mode="editMode"
            @close="closeView(viewTypes.DETAIL)"
          />
        </template>
      </list-layout>

      <triggers-desktop-create
        v-if="view.create.opened && !$windowSize.isExtraSmall()"
        @close="closeView(viewTypes.CREATE)"
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
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import { orderBy } from 'natural-orderby'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import {
  TRIGGERS_HASH_DETAIL,
  TRIGGERS_HASH_CREATE,
} from '~/configuration/routes'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'

import TriggersDetail from '~/components/triggers/Detail/index.vue'
import TriggersDesktopCreate from '~/components/triggers/Desktop/Create/index.vue'
import TriggersDesktopDetailHeader from '~/components/triggers/Desktop/DetailHeader/index.vue'
import TriggersDesktopDetailToolbar from '~/components/triggers/Desktop/DetailToolbar/index.vue'

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

enum ViewTypes {
  CREATE = 'create',
  DETAIL = 'detail',
  TYPE = 'type',
}

interface TriggersIndexPageViewCreateInterface {
  opened: boolean
  type: string | null
}

interface TriggersIndexPageViewDetailInterface {
  opened: boolean
  id: string | null,
  index: number,
}

interface TriggersIndexPageViewTypeInterface {
  opened: boolean
}

interface TriggersIndexPageViewInterface {
  create: TriggersIndexPageViewCreateInterface
  detail: TriggersIndexPageViewDetailInterface
  type: TriggersIndexPageViewTypeInterface
}

export default defineComponent({

  name: 'TriggersIndexPage',

  transition: 'fade',

  components: {
    TriggersDetail,
    TriggersDesktopCreate,
    TriggersDesktopDetailHeader,
    TriggersDesktopDetailToolbar,
  },

  setup(props: {}, context: SetupContext) {
    const view = reactive<TriggersIndexPageViewInterface>({
      type: {
        opened: false,
      },
      create: {
        opened: false,
        type: null,
      },
      detail: {
        opened: false,
        id: null,
        index: 0,
      },
    })

    const isMounted = ref<boolean>(false)

    const editMode = ref<boolean>(false)

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    const triggers = computed<Array<TriggerInterface>>((): Array<TriggerInterface> => {
      return orderBy(
        Trigger
          .query()
          .with('actions')
          .with('conditions')
          .with('notifications')
          .where('isForChannel', false)
          .where('draft', false)
          .orderBy('name')
          .get(),
        [
          v => v.name,
          v => v.comment,
        ],
        ['asc'],
      )
    })

    const fetchingTriggers = computed<boolean>((): boolean => Trigger.getters('fetching')())

    const isLoading = computed<boolean>((): boolean => fetchingTriggers.value && triggers.value.length === 0)

    const noResults = computed<boolean>((): boolean => !fetchingTriggers.value && triggers.value.length === 0)

    const openedDetail = computed<TriggerInterface | null>((): TriggerInterface | null => {
      if (view.detail.opened && view.detail.id !== null) {
        return Trigger.find(view.detail.id)
      }

      return null
    })

    context.root.$store.dispatch('app/setHeading', {
      heading: context.root.$t('triggers.headings.allTriggers'),
      subHeading: context.root.$tc('triggers.subHeadings.allTriggers', triggers.value.length, { count: triggers.value.length }),
    }, {
      root: true,
    })

    function toggleEditMode(): void {
      editMode.value = !editMode.value
    }

    function disableEditMode(): void {
      editMode.value = false
    }

    // Close opened view
    function closeView(type: ViewTypes) {
      if (Object.prototype.hasOwnProperty.call(view, type)) {
        switch (type) {
          case ViewTypes.DETAIL:
            view.detail.opened = false
            view.detail.id = null

            // Force close edit mode
            disableEditMode()

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

    // Open selected view
    function openView(type: ViewTypes, id?: string) {
      if (Object.prototype.hasOwnProperty.call(view, type)) {
        switch (type) {
          case ViewTypes.DETAIL:
            if (context.root.$windowSize.isExtraSmall()) {
              if (typeof id !== 'undefined') {
                context.root.$router.push(context.root.localePath({
                  name: context.root.$routes.triggers.detail,
                  params: {
                    id,
                  },
                }))
              }

              return
            } else {
              // Force close edit mode
              disableEditMode()

              context.root.$router.push(context.root.localePath({
                name: context.root.$routes.triggers.list,
                hash: `${TRIGGERS_HASH_DETAIL}-${id}`,
              }))
            }
            break

          case ViewTypes.CREATE:
            if (context.root.$windowSize.isExtraSmall()) {
              context.root.$bus.$emit('wait-page_reloading', 10)

              context.root.$router.push(context.root.localePath(context.root.$routes.triggers.create))

              return
            } else {
              context.root.$router.push(context.root.localePath({
                name: context.root.$routes.triggers.list,
                hash: TRIGGERS_HASH_CREATE,
              }))
            }
            break
        }

        view[type].opened = true

        if (
          type === ViewTypes.DETAIL &&
          typeof id !== 'undefined'
        ) {
          view[type].id = id

          const index = triggers.value.findIndex(item => item.id === id)

          if (index === -1) {
            closeView(type)
          }

          view[type].index = index
        }
      }
    }

    function openDetail(id: string): void {
      openView(ViewTypes.DETAIL, id)
    }

    function openPreviousItem(): void {
      const newIndex = view.detail.index - 1

      if (newIndex >= 0) {
        openDetail(triggers.value[newIndex].id)
      }
    }

    function openNextItem(): void {
      const newIndex = view.detail.index + 1

      if (newIndex <= triggers.value.length) {
        openDetail(triggers.value[newIndex].id)
      }
    }

    // Check route and if is needed open detail window
    function checkRoute() {
      if (context.root.$route.hash !== '') {
        if (context.root.$route.hash.includes(TRIGGERS_HASH_DETAIL)) {
          openView(ViewTypes.DETAIL, context.root.$route.hash.substring(TRIGGERS_HASH_DETAIL.length + 1))
        } else if (context.root.$route.hash.includes(TRIGGERS_HASH_CREATE)) {
          openView(ViewTypes.CREATE)
        }
      }
    }

    onBeforeMount((): void => {
      if (
        !fetchingTriggers.value &&
        !Trigger.getters('firstLoadFinished')()
      ) {
        Trigger.dispatch('fetch')
          .catch(() => {
            context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          })
      }
    })

    onMounted((): void => {
      if (!fetchingTriggers.value) {
        checkRoute()
      }

      context.root.$bus.$emit('wait-page_reloading', false)

      isMounted.value = true
    })

    function synchroniseTriggers(): void {
      // do sync here
    }

    watch(
      (): string => windowSize.value,
      (val): void => {
        if (val === FbSizeTypes.EXTRA_SMALL && isMounted.value) {
          if (view.detail.opened && view.detail.id !== null) {
            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.triggers.detail,
              params: {
                id: view.detail.id,
              },
            }))
          } else if (view.create.opened) {
            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.triggers.create,
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
      () => triggers.value,
      (val): void => {
        context.root.$store.dispatch('app/setHeading', {
          heading: context.root.$t('triggers.headings.allTriggers'),
          subHeading: context.root.$tc('triggers.subHeadings.allTriggers', val.length, { count: val.length }),
        }, {
          root: true,
        })
      },
    )

    watch(
      () => context.root.$route,
      (): void => {
        if (isMounted.value) {
          checkRoute()
        }
      },
    )

    return {
      view,
      viewTypes: ViewTypes,
      isMounted,
      editMode,
      triggers,
      isLoading,
      noResults,
      openedDetail,
      openDetail,
      openView,
      closeView,
      synchroniseTriggers,
      toggleEditMode,
      openPreviousItem,
      openNextItem,
      listItemTypes: ListItemSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
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
