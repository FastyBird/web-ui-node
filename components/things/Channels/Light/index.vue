<template>
  <fb-modal-window
    class="fb-iot-things-channels-light__container"
    @closed="close"
  >
    <div
      slot="modal-header"
      class="modal-header bg-primary"
    >
      <button
        type="button"
        class="close"
        @click.prevent="close"
      >
        <span aria-hidden="true">×</span>
        <span class="sr-only">{{ $t('application.buttons.close.title') }}</span>
      </button>
      <h4 class="modal-title">
        <font-awesome-icon icon="adjust" />
        Configure light
      </h4>
    </div>

    <div
      slot="modal-body"
      class="modal-body p-x-0 p-t-0"
    >
      <ul class="nav nav-tabs">
        <li
          v-if="channel.params.settings.white"
          :class="[{'active': activeTab === 'white'}]"
        >
          <a
            href="#"
            data-toggle="tab"
            @click.prevent="showTab('white')"
          >White</a>
        </li>
        <li
          v-if="channel.params.settings.rgb"
          :class="[{'active': activeTab === 'color'}]"
        >
          <a
            href="#"
            data-toggle="tab"
            @click.prevent="showTab('color')"
          >Color</a>
        </li>
      </ul>

      <div
        v-if="activeTab === 'white'"
        class="fb-iot-things-channels-light__channel p-x-md p-y m-a-0 row"
      >
        <div class="col-2 p-l-sm">
          <device-icon
            name="lighting-special"
            class="fb-iot-things-channels-light__channel-icon m-t-md"
          />
        </div>
        <div class="col p-l-sm">
          <span class="d-ib p-l-md">Temperature</span>
          <vue-slider
            ref="whiteTemperature"
            v-model="slider.model.white"
            :tooltip="false"
            :height="15"
            :dot-size="25"
            :min="2500"
            :max="6500"
            :disabled="!thing.state"
            :bg-style="slider.style.temperature"
          />
        </div>
      </div>

      <div
        v-if="activeTab === 'color'"
        class="fb-iot-things-channels-light__channel p-x-md p-y m-a-0 row"
      >
        <div class="col-2 p-l-sm">
          <device-icon
            name="lighting-special"
            class="fb-iot-things-channels-light__channel-icon m-t-md"
          />
        </div>
        <div class="col p-l-sm">
          <span class="d-ib p-l-md">Color</span>
          <vue-slider
            ref="colorHue"
            v-model="slider.model.color.h"
            :tooltip="false"
            :height="15"
            :dot-size="25"
            :min="0"
            :max="360"
            :disabled="!thing.state"
            :bg-style="slider.style.hue"
            @callback="colorChanged"
          />
        </div>
      </div>

      <div
        v-if="activeTab === 'color'"
        class="fb-iot-things-channels-light__channel p-x-md p-y m-a-0 row"
      >
        <div class="col-2 p-l-sm">
          <device-icon
            name="knob"
            class="fb-iot-things-channels-light__channel-icon m-t-md"
          />
        </div>
        <div class="col p-l-sm">
          <span class="d-ib p-l-md">Saturation</span>
          <vue-slider
            ref="colorSaturation"
            v-model="slider.model.color.s"
            :tooltip="false"
            :height="15"
            :dot-size="25"
            :min="0.1"
            :max="1"
            :interval="0.1"
            :disabled="!thing.state"
            :bg-style="slider.style.saturation"
          />
        </div>
      </div>

      <div class="fb-iot-things-channels-light__channel p-x-md p-y m-a-0 row">
        <div class="col-2 p-l-sm">
          <device-icon
            name="luminosity"
            class="fb-iot-things-channels-light__channel-icon m-t-md"
          />
        </div>
        <div class="col p-l-sm">
          <span class="d-ib">Brightness</span>
          <vue-slider
            ref="brightness"
            v-model="slider.model.brightness"
            :tooltip="false"
            :height="15"
            :dot-size="25"
            :min="0"
            :max="255"
            :disabled="!thing.state"
            :bg-style="slider.style.brightness"
          />
        </div>
      </div>
    </div>

    <div
      slot="modal-footer"
      class="modal-footer p-t-0 p-b-md m-r-md p-l-md"
    >
      <div class="row">
        <div class="col-4 offset-4 col-md-2 offset-md-8">
          <fb-button
            block
            uppercase
            variant="link"
            size="lg"
            name="close"
            class="text-muted"
            @click="close"
          >
            {{ $t('application.buttons.close.title') }}
          </fb-button>
        </div>
        <div class="col-4 col-md-2">
          <fb-button
            block
            uppercase
            variant="link"
            size="lg"
            name="save"
            class="text-primary"
            @click.prevent="sendColor()"
          >
            {{ $t('application.buttons.save.title') }}
          </fb-button>
        </div>
      </div>
    </div>
  </fb-modal-window>
</template>

<script>
  import tinyColor from 'tinycolor2'

  import VueSlider from 'vue-slider-component'

  export default {

    name: 'ThingsChannelsLight',

    components: {
      VueSlider,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channel: {
        type: Object,
        required: true,
      },

    },

    data() {
      return {
        activeTab: 'white',
        slider: {
          style: {
            hue: {
              background: '-webkit-gradient(linear, left top, right top, from(#f00), color-stop(17%, #ff0), color-stop(33%, #0f0), color-stop(50%, #0ff), color-stop(67%, #00f), color-stop(83%, #f0f), to(#f00))',
              border: '1px solid #dcdcdc',
            },
            saturation: {
              background: 'linear-gradient(to right, #232526, #f00)',
              border: '1px solid #dcdcdc',
            },
            temperature: {
              background: 'linear-gradient(to right, rgb(255, 168, 90), #fff)',
              border: '1px solid #dcdcdc',
            },
            brightness: {
              background: 'linear-gradient(to right, #232526, #fff)',
              border: '1px solid #dcdcdc',
            },
          },
          model: {
            brightness: 0,
            color: {
              h: 0,
              s: 1,
              l: 0.5,
            },
            white: 5500,
          },
        },
        previewStyle: {
          white: {
            background: 'rgb(255, 221, 153)',
          },
          color: {
            background: 'hsl(0, 100%, 50%)',
          },
        },
        color: null,
        disableUpdate: false,
      }
    },

    computed: {

      /**
       * Light channel switch state
       *
       * @returns {Boolean}
       */
      switchState() {
        if (this.channel.stateProperty !== undefined) {
          const propertyValue = this.$store.getters['entities/channel_property_value/query']()
            .where('channel_id', this.channel.id)
            .where('property_id', this.channel.stateProperty.id)
            .first()

          return propertyValue !== null ? !!propertyValue.value : false
        }

        return false
      },

      /**
       * Thing light channel object
       *
       * @returns {Object}
       */
      channelData() {
        return this.channel !== null ? this._getChannelValue() : null
      },

    },

    created() {
      if (this.channel.params.settings.rgb) {
        this._setColorSelect()

        this._colorizeSaturation()
      }

      if (this.channel.params.settings.white) {
        this._setWhiteSelect()
      } else {
        this.activeTab = 'color'
      }
    },

    methods: {

      /**
       * Close light update window
       */
      close() {
        this.$emit('close')
      },

      /**
       * Switch light settings tab
       */
      showTab(type) {
        const that = this

        switch (type) {
          case 'white':
            this.activeTab = type

            this._setWhiteSelect()

            setTimeout(() => {
              that.$refs['whiteTemperature'].refresh()
            }, 50)
            break

          case 'color':
            this.activeTab = type

            this._setColorSelect()

            setTimeout(() => {
              that.$refs['colorHue'].refresh()
              that.$refs['colorSaturation'].refresh()
            }, 50)
            break
        }
      },

      /**
       * Update all values when one of color sliders is changed
       */
      colorChanged() {
        this._colorizeSaturation()
      },

      /**
       * Send values to thing
       */
      sendColor() {
        this.disableUpdate = true

        let setColor = tinyColor(this.slider.model.color)

        // Remap color brightness
        setColor.r = this._map(setColor.r, 0, 255, 0, this.slider.model.brightness)
        setColor.g = this._map(setColor.g, 0, 255, 0, this.slider.model.brightness)
        setColor.b = this._map(setColor.b, 0, 255, 0, this.slider.model.brightness)

        setColor = tinyColor(setColor)

        const payload = Object.assign({}, this.channelData)
        payload.rgb = setColor.toRgb()

        this.$store.dispatch('entities/channel_property_value/setPayload', {
          value: payload,
          thing_id: this.thing.id,
          channel_id: this.channel.id,
          property_id: this.clearTotal.property.id,
        }, {
          root: true,
        })
          .then(() => {
            this.disableUpdate = false
          })
          .catch(() => {
            this.disableUpdate = false

            this.$toasted.error(this.$t('things.messages.commandNotAccepted', {
              thing: this.thing.label,
            }), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })
          })
      },

      /**
       * Get channel socket value
       *
       * @param {(String|null)} [parameter]
       *
       * @returns {(String|Object|null)}
       *
       * @private
       */
      _getChannelValue(parameter) {
        const channel = this.findSocketChannelById(this.channel.id)

        if (channel !== null) {
          if (typeof parameter === 'undefined') {
            return channel.value.actual
          }

          let value = channel.value.actual[parameter]

          if (parameter === 'state') {
            if (typeof value !== 'boolean') {
              switch (value) {
                case '1':
                case 'on':
                case 1:
                  value = true
                  break

                case '0':
                case 'off':
                case 0:
                  value = false
                  break
              }
            }
          }

          return value
        }

        return null
      },

      /**
       * Update color saturation preview
       *
       * @private
       */
      _colorizeSaturation() {
        const saturationColor = tinyColor({
          h: this.slider.model.color.h,
          s: 1,
          l: 0.5,
          a: 1,
        })

        this.slider.style.saturation.background = `linear-gradient(to right, #232526, ${saturationColor.toHexString()})`
      },

      /**
       * Update color sliders model for sliders
       *
       * @private
       */
      _setColorSelect() {
        const setColor = tinyColor(this._getChannelValue('rgb'))

        this.slider.model.color.h = setColor.toHsl().h
        this.slider.model.color.s = setColor.toHsl().s
        this.slider.model.color.l = setColor.toHsl().l
      },

      /**
       * Update white sliders model for sliders
       *
       * @private
       */
      _setWhiteSelect() {
        this.slider.model.white = this._getChannelValue('white')
      },

      /**
       * Remap color value with brightness
       *
       * @param {Number} x
       * @param {Number} inMin
       * @param {Number} inMax
       * @param {Number} outMin
       * @param {Number} outMax
       *
       * @returns {Number}
       *
       * @private
       */
      _map(x, inMin, inMax, outMin, outMax) {
        return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
      },

    },

  }
</script>

<style>

  .vue-slider-component .vue-slider-process {
    background: none;
  }

</style>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
