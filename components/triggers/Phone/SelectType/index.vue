<template>
  <div>
    <fb-ui-button
      block
      variant="link"
      name="condition"
      @click.prevent="navigateTo(triggerTypes.TIME_SCHEDULED)"
    >
      {{ $t('trigger.buttons.addTypeTimeOfDay.title') }}
    </fb-ui-button>

    <fb-ui-divider type="horizontal">
      {{ $t('application.misc.or') }}
    </fb-ui-divider>

    <fb-ui-button
      block
      variant="link"
      name="action"
      @click.prevent="navigateTo(triggerTypes.DEVICE)"
    >
      {{ $t('trigger.buttons.addTypeThingControlled.title') }}
    </fb-ui-button>

    <fb-ui-divider type="horizontal">
      {{ $t('application.misc.or') }}
    </fb-ui-divider>

    <fb-ui-button
      block
      variant="link"
      name="action"
      @click.prevent="navigateTo(triggerTypes.SENSOR)"
    >
      {{ $t('trigger.buttons.addTypeSensorDetect.title') }}
    </fb-ui-button>

    <fb-ui-divider type="horizontal">
      {{ $t('application.misc.or') }}
    </fb-ui-divider>

    <fb-ui-button
      block
      variant="link"
      name="action"
      @click.prevent="navigateTo(triggerTypes.MANUAL)"
    >
      {{ $t('trigger.buttons.addTypeManual.title') }}
    </fb-ui-button>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
} from '@vue/composition-api'

import {
  TRIGGERS_QUERY_TYPE_TIME_SCHEDULED,
  TRIGGERS_QUERY_TYPE_DEVICE,
  TRIGGERS_QUERY_TYPE_SENSOR,
  TRIGGERS_QUERY_TYPE_MANUAL,
} from '~/configuration/routes'

enum TriggerType {
  TIME_SCHEDULED = TRIGGERS_QUERY_TYPE_TIME_SCHEDULED,
  DEVICE = TRIGGERS_QUERY_TYPE_DEVICE,
  SENSOR = TRIGGERS_QUERY_TYPE_SENSOR,
  MANUAL = TRIGGERS_QUERY_TYPE_MANUAL,
}

interface TriggersPhoneSelectTypePropsInterface {

}

export default defineComponent({

  name: 'TriggersPhoneSelectType',

  setup(props: TriggersPhoneSelectTypePropsInterface, context: SetupContext) {
    function navigateTo(to: TriggerType): void {
      context.root.$router.push(context.root.localePath({
        name: context.root.$routes.triggers.create,
        query: {
          to,
        },
      }))
    }

    return {
      navigateTo,
      triggerTypes: TriggerType,
    }
  },

})
</script>
