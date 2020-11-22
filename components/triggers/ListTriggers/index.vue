<template>
  <list-layout
    :search-placeholder="$t('triggers.fields.search.placeholder')"
    :class="['fb-triggers-list-triggers__container', {'fb-triggers-list-triggers__container-empty': noResults}]"
  >
    <template slot="items">
      <no-results
        v-if="noResults"
        icon="magic"
      >
        {{ $t('triggers.texts.noTriggers') }}
      </no-results>

      <template v-else>
        <swipe-list
          ref="list"
          :items="items"
          :disabled="!$windowSize.isExtraSmall()"
        >
          <template v-slot="{ item }">
            <triggers-list-trigger
              :key="item.id"
              :trigger="item"
              @click="handleOpen(item)"
            />
          </template>

          <template v-slot:right="{ item }">
            <div
              @click.prevent="handleOpenRemoveConfirmation(item)"
              class="fb-triggers-list-triggers__item-remove"
            >
              <font-awesome-icon icon="trash" />
            </div>
          </template>
        </swipe-list>
      </template>

      <triggers-settings-remove
        v-if="windowScreen.removeConfirmation.opened"
        :trigger="windowScreen.removeConfirmation.trigger"
        @close="handleCloseWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
        @removed="handleCloseWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
      />
    </template>

    <template slot="detail">
      <slot
        :previous="previousItem"
        :next="nextItem"
        :total="items.length"
        :page="page"
      />
    </template>
  </list-layout>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  reactive,
  SetupContext,
} from '@vue/composition-api'

// @ts-ignore
import { SwipeList } from 'vue-swipe-actions'

import { orderBy } from 'natural-orderby'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'

import TriggersListTrigger from '~/components/triggers/ListTrigger/index.vue'
import TriggersSettingsRemove from '~/components/triggers/Settings/Remove/index.vue'

enum WindowScreenTypes {
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface TriggersListTriggersWindowInterface {
  removeConfirmation: {
    opened: boolean
    trigger: TriggerInterface | null
  }
}

interface TriggersListTriggersPropsInterface {
  activeItem: string
}

export default defineComponent({

  name: 'TriggersListTriggers',

  components: {
    TriggersListTrigger,
    TriggersSettingsRemove,

    SwipeList,
  },

  props: {

    activeItem: {
      type: String,
      default: null,
    },

  },

  setup(props: TriggersListTriggersPropsInterface, context: SetupContext) {
    const windowScreen = reactive<TriggersListTriggersWindowInterface>({
      removeConfirmation: {
        opened: false,
        trigger: null,
      },
    })

    const fetchingTriggers = computed<boolean>((): boolean => Trigger.getters('fetching')())

    const items = computed<Array<TriggerInterface>>((): Array<TriggerInterface> => {
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

    const previousItem = computed((): string | null => {
      const index = items.value.findIndex(({ id }) => id === props.activeItem) - 1

      if (index <= items.value.length && index >= 0 && typeof items.value[index] !== 'undefined') {
        return items.value[index].id
      }

      return null
    })

    const nextItem = computed((): string | null => {
      const index = items.value.findIndex(({ id }) => id === props.activeItem) + 1

      if (index <= items.value.length && index >= 0 && typeof items.value[index] !== 'undefined') {
        return items.value[index].id
      }

      return null
    })

    const page = computed<number>((): number => {
      const index = items.value.findIndex(({ id }) => id === props.activeItem)

      if (index !== -1) {
        return index + 1
      }

      return 0
    })

    const noResults = computed<boolean>((): boolean => !fetchingTriggers.value && items.value.length === 0)

    function handleOpenWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = true
    }

    function handleCloseWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = false
    }

    function handleOpenRemoveConfirmation(trigger: TriggerInterface): void {
      // @ts-ignore
      windowScreen.removeConfirmation.trigger = trigger

      handleOpenWindow(WindowScreenTypes.REMOVE_CONFIRMATION)
    }

    function handleOpen(item: TriggerInterface): void {
      context.emit('open', item.id)
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

    return {
      windowScreen,
      fetchingTriggers,
      items,
      previousItem,
      nextItem,
      page,
      noResults,
      handleCloseWindow,
      handleOpenRemoveConfirmation,
      handleOpen,
      windowScreenTypes: WindowScreenTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
