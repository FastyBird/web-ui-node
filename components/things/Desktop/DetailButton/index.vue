<template>
  <div class="fb-things-desktop-detail-button__container">
    <button-thing
      :thing="thing"
      @view="openView"
    />

    <fb-ui-button
      v-if="triggers.length"
      variant="outline-primary"
      uppercase
      pill
      class="fb-things-desktop-detail-button__add-button"
      @click.prevent="openView('type')"
    >
      <font-awesome-icon icon="plus" />
    </fb-ui-button>

    <fb-ui-modal-window
      v-if="view.opened !== null"
      :transparent-bg="true"
      @close="closeView"
    >
      <div
        slot="modal-content"
        class="fb-ui-modal-window__content"
      >
        <div class="fb-ui-modal-window__header">
          <button
            type="button"
            class="fb-ui-modal-window__close"
            @click.prevent="closeView"
          >
            <span aria-hidden="true">×</span>
            <span class="sr-only">{{ $t('application.buttons.close.title') }}</span>
          </button>

          <div>
            <template v-if="view.opened === view.items.type.name">
              <font-awesome-icon icon="project-diagram" />

              <h4>
                {{ $t('things.headings.newAction') }}
              </h4>

              <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
                consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
            </template>

            <template v-else-if="view.opened === view.items.selectThing.name">
              <font-awesome-icon icon="plug" />

              <h4>
                {{ $t('things.headings.selectTriggerThing') }}
              </h4>

              <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
                consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
            </template>

            <template v-else-if="view.opened === view.items.actionThing.name">
              <font-awesome-icon :icon="view.items.actionThing.thing.device.icon" />

              <h4>
                {{ view.items.actionThing.thing.channel.title }}
              </h4>

              <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
                consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
            </template>
          </div>
        </div>

        <div class="fb-ui-modal-window__body">
          <div
            v-if="view.opened === view.items.type.name"
            class="fb-things-desktop-detail-button__type"
          >
            <div>
              <fb-ui-button
                block
                variant="outline-primary"
                size="lg"
                name="press"
                @click.prevent="openView(view.items.selectThing.name, 'press')"
              >
                {{ $t('things.buttons.press.title') }}
              </fb-ui-button>
            </div>
            <div>
              <fb-ui-button
                block
                variant="outline-primary"
                size="lg"
                name="click"
                @click.prevent="openView(view.items.selectThing.name, 'click')"
              >
                {{ $t('things.buttons.click.title') }}
              </fb-ui-button>
            </div>
            <div>
              <fb-ui-button
                block
                variant="outline-primary"
                size="lg"
                name="dblClick"
                @click.prevent="openView(view.items.selectThing.name, 'dblClick')"
              >
                {{ $t('things.buttons.dblClick.title') }}
              </fb-ui-button>
            </div>
          </div>

          <select-thing
            v-if="view.opened === view.items.selectThing.name"
            :items="view.items[view.opened].items"
            :type-actor="true"
            @select="thingSelected"
            @close="closeView"
          />

          <edit-action
            v-if="view.opened === view.items.actionThing.name"
            :thing="view.items.actionThing.thing"
            :action="view.items.actionThing.item"
            :remote-submit.sync="submitSelect"
            @add="addThingAction"
            @remove="removeThingAction"
            @back="openView(view.items.selectThing.name, actionType)"
            @close="closeView"
          />
        </div>

        <div class="fb-ui-modal-window__footer">
          <template v-if="view.opened === view.items.type.name || view.opened === view.items.selectThing.name">
            <fb-ui-button
              uppercase
              variant="link"
              size="lg"
              name="close"
              @click.prevent="closeView"
            >
              {{ $t('application.buttons.close.title') }}
            </fb-ui-button>
          </template>

          <template v-else>
            <fb-ui-button
              uppercase
              variant="link"
              size="lg"
              name="back"
              @click.prevent="openView(view.items.selectThing.name, actionType)"
            >
              {{ $t('application.buttons.back.title') }}
            </fb-ui-button>

            <fb-ui-button
              uppercase
              variant="outline-primary"
              size="lg"
              name="save"
              @click.prevent="submit"
            >
              <template v-if="view.items.actionThing.item">
                {{ $t('things.buttons.updateThing.title') }}
              </template>
              <template v-else>
                {{ $t('things.buttons.addThing.title') }}
              </template>
            </fb-ui-button>
          </template>
        </div>
      </div>
    </fb-ui-modal-window>
  </div>
</template>

<script>
import { FbUiComponentLoading, FbUiComponentLoadingError } from '@fastybird/web-ui-theme'

import SharedButtonThing from '~/components/things/Shared/ThingButton'

import ButtonThing from '~/components/things/Detail/Button'
import Thing from '~/models/things/Thing'

const SelectThing = () => ({
  component: import('~/components/routines/Edit/SelectThing'),
  loading: FbUiComponentLoading,
  error: FbUiComponentLoadingError,
  timeout: 10000,
})
const EditAction = () => ({
  component: import('~/components/routines/Edit/EditAction'),
  loading: FbUiComponentLoading,
  error: FbUiComponentLoadingError,
  timeout: 10000,
})

const viewSettings = {
  opened: null,
  items: {
    type: {
      name: 'type',
    },
    selectThing: {
      name: 'selectThing',
      items: [],
      item: null,
    },
    actionThing: {
      name: 'actionThing',
      thing: null,
      item: null,
    },
  },
}

export default {

  name: 'ThingsDesktopDetailButton',

  components: {
    ButtonThing,

    SelectThing,
    EditAction,
  },

  extends: SharedButtonThing,

  data() {
    return {
      view: Object.assign({}, viewSettings),
      submitSelect: false,
    }
  },

  methods: {

    /**
     * Call remote submit for action
     *
     * @param {Object} event
     */
    submit(event) {
      event && event.preventDefault()

      this.submitSelect = true
    },

    /**
     * Action thing is selected, opening properties select
     *
     * @param {Thing} thing
     */
    thingSelected(thing) {
      if (this.view.opened === this.view.items.selectThing.name) {
        this.view.items.actionThing.thing = thing

        this.openView(this.view.items.actionThing.name)
      } else {
        this.closeView()
      }
    },

    /**
     * Add action thing to button trigger
     *
     * @param {Object} data
     */
    addThingAction(data) {
      this.closeView()

      this.addAction(data)
    },

    /**
     * Remove thing from button trigger
     *
     * @param {Thing} thing
     */
    removeThingAction(thing) {
      this.closeView()

      this.removeAction(thing)
    },

    /**
     * Open selected view
     *
     * @param {String} view
     * @param {String} [type]
     */
    openView(view, type) {
      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        this.view.opened = view

        // Open thing detail window
        if (view === this.view.items.actionThing.name) {
          this.view.items[view].item = null

          // Try to find existing action via thing identifier
          const storedAction = this.mapActions()
            .find(action => (action.device === this.view.items.actionThing.thing.device.identifier && action.channel === this.view.items.actionThing.thing.channel.channel))

          if (typeof storedAction !== 'undefined') {
            this.view.items[view].item = storedAction
          }
        }

        // Open things select window
        if (view === this.view.items.selectThing.name) {
          this.actionType = type

          const things = []

          this.mapActions()
            .forEach((action) => {
              things.push(
                Thing
                  .query()
                  .with('device')
                  .whereHas('device', (query) => {
                    query.where('identifier', action.device)
                  })
                  .with('channel')
                  .whereHas('channel', (query) => {
                    query.where('channel', action.channel)
                  })
                  .first(),
              )
            })

          this.view.items[view].items = things
        }
      }
    },

    /**
     * Close opened view
     */
    closeView() {
      // Reset to default values
      Object.assign(this.view, viewSettings)
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
