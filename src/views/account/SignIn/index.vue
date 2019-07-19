<template web>
  <layout name="LayoutSign">
    <sign-in />
  </layout>
</template>

<template native>
  <page actionBarHidden="true">
    <flexbox-layout class="page">
      <stack-layout class="form">
        <image
          class="logo"
          src="~/images/logo.png" />
        <label
          class="header"
          text="APP NAME" />

        <grid-layout rows="auto, auto, auto">
          <stack-layout
            row="0"
            class="input-field">
            <text-field
              class="input"
              hint="Email"
              :isEnabled="!processing"
              keyboardType="email"
              autocorrect="false"
              autocapitalizationType="none"
              v-model="user.email"
              returnKeyType="next"
              @returnPress="focusPassword" />
            <stack-layout class="hr-light" />
          </stack-layout>

          <stack-layout
            row="1"
            class="input-field">
            <text-field
              class="input"
              ref="password"
              :isEnabled="!processing"
              hint="Password"
              secure="true"
              v-model="user.password"
              :returnKeyType="isLoggingIn ? 'done' : 'next'"
              @returnPress="focusConfirmPassword" />
            <stack-layout class="hr-light" />
          </stack-layout>

          <stack-layout
            row="2"
            v-show="!isLoggingIn"
            class="input-field">
            <text-field
              class="input"
              ref="confirmPassword"
              :isEnabled="!processing"
              hint="Confirm password"
              secure="true"
              v-model="user.confirmPassword"
              returnKeyType="done" />
            <stack-layout class="hr-light" />
          </stack-layout>

          <activity-indicator
            rowSpan="3"
            :busy="processing" />
        </grid-layout>

        <fb-button
          block
          variant="primary"
          @tap="submit()"
        >Sign In</fb-button>

        <label
          *v-show="isLoggingIn"
          text="Forgot your password?"
          class="login-label"
          @tap="forgotPassword()" />
      </stack-layout>

      <label
        class="login-label sign-up-label"
        @tap="toggleForm">
        <formatted-string>
          <span :text="isLoggingIn ? 'Don’t have an account? ' : 'Back to Login'" />
          <span
            :text="isLoggingIn ? 'Sign up' : ''"
            class="bold" />
        </formatted-string>
      </label>
    </flexbox-layout>
  </page>
</template>

<script>
  import SignIn from '@/components/account/SignIn'

  import {
    HOME_LINK,
  } from '@/router'

  export default {

    name: 'SignInView',

    components: {
      SignIn,
    },

    data() {
      return {
        layout: 'LayoutSign',
        isLoggingIn: true,
        processing: false,
        user: {
          email: 'vue@nativescript.org',
          password: 'vue',
          confirmPassword: 'vue',
        },
      }
    },

    created() {
      if (this.isSignedIn()) {
        this.$router.push(HOME_LINK)
      }
    },

    methods: {

      toggleForm() {
        this.isLoggingIn = !this.isLoggingIn
      },

      submit() {
        if (!this.user.email || !this.user.password) {
          this.alert(
            'Please provide both an email address and password.',
          )
          return
        }

        this.processing = true

        if (this.isLoggingIn) {
          this.login()
        } else {
          this.register()
        }
      },

      login() {
        this.processing = false
      },

      register() {
        if (this.user.password !== this.user.confirmPassword) {
          this.alert('Your passwords do not match.')
          this.processing = false
          return
        }

        this.processing = false
        this.alert(
          'Your account was successfully created.')
        this.isLoggingIn = true
      },

      forgotPassword() {
        prompt({
          title: 'Forgot Password',
          message: 'Enter the email address you used to register for APP NAME to reset your password.',
          inputType: 'email',
          defaultText: '',
          okButtonText: 'Ok',
          cancelButtonText: 'Cancel',
        })
          .then(data => {
            if (data.result) {
              this.alert(
                'Your password was successfully reset. Please check your email for instructions on choosing a new password.',
              )
            }
          })
      },

      focusPassword() {
        this.$refs.password.nativeView.focus()
      },

      focusConfirmPassword() {
        if (!this.isLoggingIn) {
          this.$refs.confirmPassword.nativeView.focus()
        }
      },

      alert(message) {
        return alert({
          title: 'APP NAME',
          okButtonText: 'OK',
          message,
        })
      },

    },

  }
</script>
