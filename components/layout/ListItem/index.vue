<template functional>
  <div
    :class="[data.class, data.staticClass, 'fb-list-item__container', `fb-list-item__container-${props.variant}`]"
    @click="() => { parent._.get(listeners, 'click', null) !== null ? listeners['click']() : () => {} }"
  >
    <div class="fb-list-item__inner">
      <div
        v-if="parent._.get(scopedSlots, 'icon', null) !== null"
        class="fb-list-item__icon"
      >
        <slot name="icon" />
      </div>

      <div
        :class="['fb-list-item__heading', { 'fb-list-item__heading-with-subheading': parent._.get(scopedSlots, 'sub-heading', null) !== null }]"
      >
        <h2>
          <slot name="heading" />
        </h2>
        <small v-if="parent._.get(scopedSlots, 'sub-heading', null) !== null">
          <slot name="sub-heading" />
        </small>
      </div>

      <div
        v-if="parent._.get(scopedSlots, 'detail-large', null) !== null"
        class="fb-list-item__content-large"
      >
        <slot name="detail-large" />
      </div>

      <div
        v-else-if="parent._.get(scopedSlots, 'detail', null) !== null"
        class="fb-list-item__content"
      >
        <slot name="detail" />
      </div>

      <div
        v-else
        class="fb-list-item__detail"
      >
        <font-awesome-icon
          icon="chevron-right"
          role="button"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, PropType,
} from '@vue/composition-api'

export enum ListItemSizeTypes {
  DEFAULT = 'default',
  LIST = 'list',
}

export default defineComponent({

  name: 'ListItem',

  props: {

    variant: {
      type: String as PropType<ListItemSizeTypes>,
      default: ListItemSizeTypes.DEFAULT,
      validator: (value): boolean => {
        // The value must match one of these strings
        return [
          ListItemSizeTypes.DEFAULT,
          ListItemSizeTypes.LIST,
        ].includes(value)
      },
    },

  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
