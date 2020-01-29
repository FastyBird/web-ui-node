<template>
  <div class="fb-routines-desktop-detail__container">
    <routine-detail :routine="routine" />

    <fb-button
      variant="outline-primary"
      uppercase
      pill
      class="fb-routines-desktop-detail__add-button"
      @click.prevent="openView('type')"
    >
      <font-awesome-icon icon="plus" />
    </fb-button>

    <fb-modal-window
      v-if="view.opened !== null"
      :transparent-bg="true"
      @close="closeView"
    >
      <div
        slot="modal-content"
        class="fb-modal-window__content fb-routines-desktop-detail__create"
      >
        <div class="fb-modal-window__header">
          <button
            type="button"
            class="fb-modal-window__close"
            @click.prevent="closeView"
          >
            <span aria-hidden="true">×</span>
            <span class="sr-only">{{ $t('application.buttons.close.title') }}</span>
          </button>

          <div>
            <template v-if="view.opened === view.items.type.name">
              <font-awesome-icon icon="project-diagram" />

              <h4>
                {{ $t('routines.headings.addNew') }}
              </h4>

              <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
            </template>

            <template v-else-if="view.opened === view.items.conditionThing.name || view.opened === view.items.conditionSensor.name || view.opened === view.items.actionThing.name">
              <font-awesome-icon icon="plug" />

              <h4>
                {{ $t('routines.headings.selectThing') }}
              </h4>

              <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
            </template>

            <template v-else-if="view.opened === view.items.condition.name">
              <font-awesome-icon :icon="$thingIcon(view.items.condition.thing)" />

              <h4>
                {{ $tThing(view.items.condition.thing) }}
              </h4>

              <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
            </template>

            <template v-else-if="view.opened === view.items.action.name">
              <font-awesome-icon :icon="$thingIcon(view.items.action.thing)" />

              <h4>
                {{ $tThing(view.items.action.thing) }}
              </h4>

              <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
            </template>
          </div>
        </div>

        <div class="fb-modal-window__body">
          <div
            v-if="view.opened === view.items.type.name"
            class="fb-routines-desktop-detail__type"
          >
            <template v-if="routine.isAutomatic && schedule === null">
              <div>
                <fb-button
                  block
                  variant="outline-primary"
                  size="lg"
                  name="condition"
                  @click.prevent="openView(view.items.conditionThing.name)"
                >
                  {{ $t('routines.buttons.thingToCondition.title') }}
                </fb-button>
              </div>
              <div>
                <fb-button
                  block
                  variant="outline-primary"
                  size="lg"
                  name="condition"
                  @click.prevent="openView(view.items.conditionSensor.name)"
                >
                  {{ $t('routines.buttons.sensorToCondition.title') }}
                </fb-button>
              </div>
            </template>

            <div>
              <fb-button
                block
                variant="outline-primary"
                size="lg"
                name="action"
                @click.prevent="openView(view.items.actionThing.name)"
              >
                {{ $t('routines.buttons.thingToAction.title') }}
              </fb-button>
            </div>
          </div>

          <select-thing
            v-if="view.opened === view.items.conditionThing.name || view.opened === view.items.conditionSensor.name || view.opened === view.items.actionThing.name"
            :items="view.items[view.opened].items"
            :only-settable="view.opened === view.items.actionThing.name"
            :type-thing="view.opened === view.items.conditionThing.name"
            :type-sensor="view.opened === view.items.conditionSensor.name"
            @select="thingSelected"
          />

          <edit-condition
            v-if="view.opened === view.items.condition.name"
            :thing="view.items.condition.thing"
            :condition="view.items.condition.item"
            :type-thing="view.items.condition.type === 'thing'"
            :type-sensor="view.items.condition.type === 'sensor'"
            :remote-submit.sync="submitSelect"
            @add="addCondition"
          />

          <edit-action
            v-if="view.opened === view.items.action.name"
            :thing="view.items.action.thing"
            :action="view.items.action.item"
            :remote-submit.sync="submitSelect"
            @add="addAction"
          />
        </div>

        <div class="fb-modal-window__footer">
          <template v-if="view.opened === view.items.type.name || view.opened === view.items.conditionThing.name || view.opened === view.items.conditionSensor.name || view.opened === view.items.actionThing.name">
            <fb-button
              uppercase
              variant="link"
              size="lg"
              name="close"
              @click.prevent="closeView"
            >
              {{ $t('application.buttons.close.title') }}
            </fb-button>
          </template>

          <template v-else-if="view.opened === view.items.condition.name">
            <fb-button
              uppercase
              variant="link"
              size="lg"
              name="close"
              @click.prevent="openView(view.items.condition.type === 'thing' ? view.items.conditionThing.name : view.items.conditionSensor.name)"
            >
              {{ $t('application.buttons.back.title') }}
            </fb-button>

            <fb-button
              uppercase
              variant="outline-primary"
              size="lg"
              name="save"
              @click.prevent="submitSelection"
            >
              <template v-if="view.items.condition.item">
                {{ $t('routines.buttons.updateThing.title') }}
              </template>
              <template v-else>
                {{ $t('routines.buttons.addThing.title') }}
              </template>
            </fb-button>
          </template>

          <template v-else-if="view.opened === view.items.action.name">
            <fb-button
              uppercase
              variant="link"
              size="lg"
              name="close"
              @click.prevent="openView(view.items.actionThing.name)"
            >
              {{ $t('application.buttons.back.title') }}
            </fb-button>

            <fb-button
              uppercase
              variant="outline-primary"
              size="lg"
              name="save"
              @click.prevent="submitSelection"
            >
              <template v-if="view.items.action.item">
                {{ $t('routines.buttons.updateThing.title') }}
              </template>
              <template v-else>
                {{ $t('routines.buttons.addThing.title') }}
              </template>
            </fb-button>
          </template>
        </div>
      </div>
    </fb-modal-window>
  </div>
</template>

<script>
import routineUpdateMixin from '@/mixins/routineUpdate'

import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

import RoutineDetail from '@/components/routines/Detail'

const SelectThing = () => ({
  component: import('@/components/routines/Edit/SelectThing'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})
const EditCondition = () => ({
  component: import('@/components/routines/Edit/EditCondition'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})
const EditAction = () => ({
  component: import('@/components/routines/Edit/EditAction'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})

const viewSettings = {
  opened: null,
  items: {
    type: {
      name: 'type',
    },
    conditionThing: {
      name: 'conditionThing',
      items: [],
    },
    conditionSensor: {
      name: 'conditionSensor',
      items: [],
    },
    condition: {
      name: 'condition',
      thing: null,
      item: null,
      type: null,
    },
    actionThing: {
      name: 'actionThing',
      items: [],
    },
    action: {
      name: 'action',
      thing: null,
      item: null,
    },
  },
}

export default {

  name: 'RoutinesDesktopDetailRoutine',

  components: {
    RoutineDetail,

    SelectThing,
    EditCondition,
    EditAction,
  },

  mixins: [routineUpdateMixin],

  props: {

    routine: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      view: Object.assign({}, viewSettings),
      submitSelect: false,
    }
  },

  computed: {

    /**
     * Routine schedule condition
     *
     * @returns {(Condition|null)}
     */
    schedule() {
      const condition = this._.get(this.routine, 'conditions', []).find(item => item.isTime)

      if (typeof condition === 'undefined') {
        return null
      }

      return condition
    },

  },

  methods: {

    /**
     * Pass submit call to child component
     */
    submitSelection() {
      this.submitSelect = true
    },

    /**
     * Open selected view
     *
     * @param {String} view
     */
    openView(view) {
      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        switch (view) {
          // Select add item type
          case this.view.items.type.name:
            if (this.schedule !== null || this.routine.isManual) {
              this.openView(this.view.items.actionThing.name)

              return
            }
            break

          // Show things list for condition select
          case this.view.items.conditionThing.name:
          case this.view.items.conditionSensor.name:
            const conditionThings = []

            this._.get(this.routine, 'conditions', [])
              .forEach((condition) => {
                if (typeof conditionThings.find(({ thing }) => thing === condition.channel_id) === 'undefined') {
                  conditionThings.push({
                    thing: condition.channel_id,
                  })
                }
              })

            this.view.items[view].items = conditionThings
            break

          // Show condition configuration
          case this.view.items.condition.name:
            const storedCondition = this._.get(this.routine, 'conditions', [])
              .find(({ channel_id }) => channel_id === this.view.items.condition.thing.id)

            if (typeof storedCondition !== 'undefined') {
              const condition = {
                thing: storedCondition.channel_id,
                enabled: storedCondition.enabled,
                rows: [],
              }

              this._.filter(this._.get(this.routine, 'conditions', []), { channel_id: storedCondition.channel_id })
                .forEach((item) => {
                  condition.rows.push({
                    property_id: item.property_id,
                    operand: item.operand,
                    operator: item.operator,
                  })
                })

              this.view.items[view].item = condition
            } else {
              this.view.items[view].item = null
            }
            break

          // Show things list for action select
          case this.view.items.actionThing.name:
            const actionThings = []

            this._.get(this.routine, 'actions', [])
              .forEach((action) => {
                if (typeof actionThings.find(({ thing }) => thing === action.channel_id) === 'undefined') {
                  actionThings.push({
                    thing: action.channel_id,
                  })
                }
              })

            this.view.items[view].items = actionThings
            break

          // Show action configuration
          case this.view.items.action.name:
            const storedAction = this._.get(this.routine, 'actions', [])
              .find(({ channel_id }) => channel_id === this.view.items.action.thing.id)

            if (typeof storedAction !== 'undefined') {
              const action = {
                thing: storedAction.channel_id,
                enabled: storedAction.enabled,
                rows: [],
              }

              this._.filter(this._.get(this.routine, 'actions', []), { channel_id: storedAction.channel_id })
                .forEach((item) => {
                  action.rows.push({
                    property_id: item.property_id,
                    operation: item.value,
                  })
                })

              this.view.items[view].item = action
            } else {
              this.view.items[view].item = null
            }
            break
        }

        this.view.opened = view
      }
    },

    /**
     * Close opened view
     */
    closeView() {
      // Reset to default values
      Object.assign(this.view, viewSettings)
    },

    /**
     * Condition or action thing is selected, opening properties select
     *
     * @param {Thing} thing
     */
    thingSelected(thing) {
      if (this.view.opened === this.view.items.actionThing.name) {
        this.view.items.action.thing = thing

        this.openView(this.view.items.action.name)
      } else if (
        this.view.opened === this.view.items.conditionThing.name ||
        this.view.opened === this.view.items.conditionSensor.name
      ) {
        this.view.items.condition.thing = thing
        this.view.items.condition.type = this.view.opened === this.view.items.conditionThing.name ? 'thing' : (this.view.opened === this.view.items.conditionSensor.name ? 'sensor' : null)

        this.openView(this.view.items.condition.name)
      } else {
        this.closeView()
      }
    },

    /**
     * Condition was selected
     *
     * @param {Object} data
     */
    addCondition(data) {
      this.closeView()

      this.addRoutineCondition(this.routine, data)
    },

    /**
     * Action was selected
     *
     * @param {Object} data
     */
    addAction(data) {
      this.closeView()

      this.addRoutineAction(this.routine, data)
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
