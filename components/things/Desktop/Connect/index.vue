<template>
  <div class="fb-modal-window__content fb-things-connect__container">
    <div class="fb-modal-window__header">
      <button
        type="button"
        class="fb-modal-window__close"
        @click.prevent="$emit('close')"
      >
        <span aria-hidden="true">×</span>
        <span class="sr-only">{{ $t('application.buttons.close.title') }}</span>
      </button>

      <div v-if="step === 1">
        <font-awesome-icon icon="plug" />

        <h4>Preparing device</h4>

        <small>Prepare your new device to be discoverable and ready for pairing</small>
      </div>

      <div v-if="step === 2">
        <font-awesome-icon icon="wifi" />

        <h4>Configuring wifi</h4>

        <small>Please fill in your wifi network name and password if is required.<br>(Only support 2.4Ghz Wifi)</small>
      </div>

      <div v-if="step === 3">
        <icon-with-child
          primary-icon="globe"
          child-icon="search"
        />

        <h4>Connecting & pairing</h4>

        <small>Search for your new device and connect it with the server.</small>
      </div>

      <div v-if="step === 4">
        <font-awesome-icon icon="check" />

        <h4>Finished</h4>

        <small>Your new device is successfully connected and paired with server.</small>
      </div>
    </div>

    <div class="fb-modal-window__body">
      <div
        v-if="step === 1"
        class="fb-things-connect__step-1"
      >
        <div class="fb-things-connect__step-1-row">
          <div class="fb-things-connect__step-1-icon">
            <font-awesome-icon icon="plug" />
          </div>
          <div class="fb-things-connect__step-1-info">
            <p>
              If you have switch device, press and hold the pairing/control button on the device for 5s to let device
              switch to pairing mode. This mode is signalized by fast blink led control.
            </p>
          </div>
        </div>

        <fb-divider
          text="OR"
          type="horizontal"
        />

        <div class="fb-things-connect__step-1-row">
          <div class="fb-things-connect__step-1-icon">
            <font-awesome-icon icon="lightbulb" />
          </div>
          <div class="fb-things-connect__step-1-info">
            <p>
              If you have smart bulb, turn wall switch 3 times on and of: <br>on - 1s - off - 1s - on - 1s - off - 1s -
              on
            </p>
          </div>
        </div>
      </div>

      <form
        v-if="step === 2"
        class="fb-things-connect__step-2"
        @submit.prevent="submitWifiForm"
      >
        <div class="fb-things-connect__step-2-row">
          <div>
            <fb-form-input
              v-model="form.model.name"
              v-validate="'required'"
              :data-vv-scope="form.scope"
              :error="errors.first(form.scope + '.name')"
              :has-error="errors.has(form.scope + '.name')"
              :name="'name'"
              :label="$t('things.fields.wifi.name.title')"
              :required="true"
              :tab-index="2"
            />

            <fb-form-input
              v-model="form.model.password"
              :data-vv-scope="form.scope"
              :name="'password'"
              :label="$t('things.fields.wifi.password.title')"
              :placeholder="$t('things.fields.wifi.password.placeholder')"
              :tab-index="3"
              type="password"
            />
          </div>
        </div>
      </form>

      <div
        v-if="step === 3"
        class="fb-things-connect__step-3"
      >
        <template v-if="search.status === null">
          <font-awesome-icon icon="wifi" />

          <p>
            Open wifi network setting on this device and<br>connect to network with SSID like
            <strong>FB_xxxxxxxx</strong>
          </p>
        </template>

        <template v-if="search.status === 'started'">
          <fb-spinner size="lg" />

          <p>
            Searching...
          </p>
        </template>

        <template v-if="search.status === 'error'">
          <font-awesome-icon icon="exclamation-triangle" />

          <p>
            Couldn't connect to device
          </p>
        </template>

        <template v-if="search.status === 'canceled'">
          <font-awesome-icon icon="minus-circle" />

          <p>
            Canceled on your request
          </p>
        </template>

        <template v-if="search.status === 'configuring'">
          <fb-spinner size="lg" />

          <p>
            Configuring device...
          </p>
        </template>

        <template v-if="search.status === 'finished'">
          <font-awesome-icon icon="wifi" />

          <p>
            Open wifi network setting on this device and<br>connect back to your internet network
          </p>
        </template>

        <template v-if="search.status === 'synchronizing'">
          <fb-spinner size="lg" />

          <p>
            Synchronizing device with server
          </p>
        </template>
      </div>

      <div
        v-if="step === 4"
        class="fb-things-connect__step-4"
      >
        done....
      </div>
    </div>

    <div class="fb-modal-window__footer">
      <template v-if="step === 1">
        <fb-button
          uppercase
          variant="link"
          size="lg"
          name="close"
          @click.prevent="$emit('close')"
        >
          {{ $t('application.buttons.close.title') }}
        </fb-button>

        <fb-button
          uppercase
          variant="outline-primary"
          size="lg"
          name="save"
          @click.prevent="nextStep"
        >
          {{ $t('application.buttons.next.title') }}
        </fb-button>
      </template>

      <template v-if="step === 2">
        <fb-button
          uppercase
          variant="link"
          size="lg"
          name="back"
          @click.prevent="previousStep"
        >
          {{ $t('application.buttons.back.title') }}
        </fb-button>

        <fb-button
          uppercase
          variant="outline-primary"
          size="lg"
          name="save"
          @click.prevent="submitWifiForm"
        >
          {{ $t('application.buttons.next.title') }}
        </fb-button>
      </template>

      <template v-if="step === 3">
        <fb-button
          v-if="search.status === null || search.status === 'canceled' || search.status === 'error'"
          uppercase
          variant="link"
          size="lg"
          name="back"
          @click.prevent="previousStep"
        >
          {{ $t('application.buttons.back.title') }}
        </fb-button>

        <fb-button
          v-if="search.status === null || search.status === 'canceled' || search.status === 'error'"
          uppercase
          variant="outline-primary"
          size="lg"
          name="search"
          @click.prevent="startSearching"
        >
          {{ $t('things.buttons.search.title') }}
        </fb-button>

        <fb-button
          v-if="search.status === 'started'"
          uppercase
          variant="outline-primary"
          size="lg"
          name="cancel"
          @click.prevent="cancelSearching"
        >
          {{ $t('application.buttons.cancel.title') }}
        </fb-button>

        <fb-button
          v-if="search.status === 'configuring' || search.status === 'finished' || search.status === 'synchronizing'"
          uppercase
          disabled
          variant="outline-primary"
          size="lg"
          name="save"
          @click.prevent="$emit('close')"
        >
          {{ $t('application.buttons.next.title') }}
        </fb-button>
      </template>

      <template v-if="step === 4">
        <fb-button
          uppercase
          variant="link"
          size="lg"
          name="close"
          @click.prevent="$emit('close')"
        >
          {{ $t('application.buttons.close.title') }}
        </fb-button>
      </template>
    </div>
  </div>
</template>

<script>
import connectMixin from '@/mixins/connectDevice'

export default {

  name: 'ThingsDesktopConnect',

  mixins: [connectMixin],

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
