<template>
  <component
    :is="name"
    class="device-icon"
  />
</template>

<script>
  import Value from './icons/value.svg?inline'
  import Humidity from './icons/humidity.svg?inline'
  import SimpleButton from './icons/button.svg?inline'
  import Led from './icons/led.svg?inline'
  import Motion from './icons/motion.svg?inline'
  import Valve from './icons/valve.svg?inline'
  import Motor from './icons/motor.svg?inline'
  import Digital2State from './icons/digital-2state.svg?inline'
  import Extension from './icons/extension.svg?inline'
  import Proximity from './icons/proximity.svg?inline'
  import Slider from './icons/slider.svg?inline'
  import Add from './icons/add.svg?inline'
  import Thermometer from './icons/thermometer.svg?inline'
  import Load from './icons/load.svg?inline'
  import Pi from './icons/pi.svg?inline'
  import GenericDigital from './icons/generic-digital.svg?inline'
  import GenericAnalog from './icons/generic-analog.svg?inline'
  import Toggle from './icons/toggle.svg?inline'
  import Alerts from './icons/alerts.svg?inline'
  import LineChart from './icons/line-chart.svg?inline'
  import DonutChart from './icons/donut-chart.svg?inline'
  import Dashboard from './icons/dashboard.svg?inline'
  import Gauge from './icons/gauge.svg?inline'
  import Gpio from './icons/gpio.svg?inline'
  import Lighting from './icons/lighting.svg?inline'
  import Lock from './icons/lock.svg?inline'
  import Luminosity from './icons/luminosity.svg?inline'
  import Map from './icons/map.svg?inline'
  import Notify from './icons/notify.svg?inline'
  import Scheduling from './icons/scheduling.svg?inline'
  import Settings from './icons/settings.svg?inline'
  import Battery from './icons/battery.svg?inline'
  import Chartlet from './icons/chartlet.svg?inline'
  import Cog from './icons/cog.svg?inline'
  import Android from './icons/android.svg?inline'
  import List from './icons/list.svg?inline'
  import Mobile from './icons/mobile.svg?inline'
  import Time from './icons/time.svg?inline'
  import Sigfox from './icons/sigfox.svg?inline'
  import Arduino from './icons/arduino.svg?inline'
  import Lora from './icons/lora.svg?inline'
  import Fan from './icons/fan.svg?inline'
  import Odometer from './icons/odometer.svg?inline'
  import Share from './icons/share.svg?inline'
  import Bolt from './icons/bolt.svg?inline'
  import Signal from './icons/signal.svg?inline'
  import Pending from './icons/pending.svg?inline'
  import RemoteAccess from './icons/remote-access.svg?inline'
  import Community from './icons/community.svg?inline'
  import Padlock from './icons/padlock.svg?inline'
  import Wifi from './icons/wifi.svg?inline'
  import Refresh from './icons/refresh.svg?inline'
  import Tools from './icons/tools.svg?inline'
  import Joystick from './icons/joystick.svg?inline'
  import Folder from './icons/folder.svg?inline'
  import Knob from './icons/knob.svg?inline'
  import Lcd from './icons/lcd.svg?inline'
  import RotaryKnob from './icons/rotary-knob.svg?inline'
  import LightingSpecial from './icons/lighting-special.svg?inline'
  import Gallery from './icons/gallery.svg?inline'
  import Tabs from './icons/tabs.svg?inline'
  import Burn from './icons/burn.svg?inline'
  import Eat from './icons/eat.svg?inline'
  import Heart from './icons/heart.svg?inline'
  import Run from './icons/run.svg?inline'
  import Sleep from './icons/sleep.svg?inline'
  import Steps from './icons/steps.svg?inline'
  import Scale from './icons/scale.svg?inline'
  import Accelerometer from './icons/accelerometer.svg?inline'
  import Bug from './icons/bug.svg?inline'
  import Car from './icons/car.svg?inline'
  import Distance from './icons/distance.svg?inline'
  import Door from './icons/door.svg?inline'
  import Parking from './icons/parking.svg?inline'
  import Smoke from './icons/smoke.svg?inline'
  import Avnet from './icons/avnet.svg?inline'
  import WaveTop from './icons/wave-top.svg?inline'
  import WaveBottom from './icons/wave-bottom.svg?inline'
  import Video from './icons/video.svg?inline'
  import Wave from './icons/wave.svg?inline'
  import Adjustments from './icons/adjustments.svg?inline'
  import Camera from './icons/camera.svg?inline'
  import Person from './icons/person.svg?inline'
  import Frequency from './icons/frequency.svg?inline'
  import Pin from './icons/pin.svg?inline'
  import Plug from './icons/plug.svg?inline'
  import Gyroscope from './icons/gyroscope.svg?inline'
  import Magnetometer from './icons/magnetometer.svg?inline'
  import Dashboards from './icons/dashboards.svg?inline'
  import Hand from './icons/hand.svg?inline'
  import BaseStation from './icons/base-station.svg?inline'
  import Bluetooth from './icons/bluetooth.svg?inline'
  import Usb from './icons/usb.svg?inline'
  import Co2 from './icons/co2.svg?inline'
  import DataStream from './icons/data-stream.svg?inline'
  import Gateway from './icons/gateway.svg?inline'
  import Swap from './icons/swap.svg?inline'
  import Loriot from './icons/loriot.svg?inline'
  import SmokeDetectorBase from './icons/smoke-detector-base.svg?inline'
  import Acceleration from './icons/acceleration.svg?inline'
  import Gravity from './icons/gravity.svg?inline'
  import Rotation from './icons/rotation.svg?inline'
  import Box from './icons/box.svg?inline'
  import Mic from './icons/mic.svg?inline'
  import Tank from './icons/tank.svg?inline'
  import TankAlt from './icons/tank-alt.svg?inline'
  import GaugeArc from './icons/gauge-arc.svg?inline'
  import GaugeNeedle from './icons/gauge-needle.svg?inline'
  import Emoji from './icons/emoji.svg?inline'

  export default {

    name: 'DeviceIcon',

    components: {
      Value,
      Humidity,
      SimpleButton,
      Led,
      Motion,
      Valve,
      Motor,
      Digital2State,
      Extension,
      Proximity,
      Slider,
      Add,
      Thermometer,
      Load,
      Pi,
      GenericDigital,
      GenericAnalog,
      Toggle,
      Alerts,
      LineChart,
      DonutChart,
      Dashboard,
      Gauge,
      Gpio,
      Lighting,
      Lock,
      Luminosity,
      Map,
      Notify,
      Scheduling,
      Settings,
      Battery,
      Chartlet,
      Cog,
      Android,
      List,
      Mobile,
      Time,
      Sigfox,
      Arduino,
      Lora,
      Fan,
      Odometer,
      Share,
      Bolt,
      Signal,
      Pending,
      RemoteAccess,
      Community,
      Padlock,
      Wifi,
      Refresh,
      Tools,
      Joystick,
      Folder,
      Knob,
      Lcd,
      RotaryKnob,
      LightingSpecial,
      Gallery,
      Tabs,
      Burn,
      Eat,
      Heart,
      Run,
      Sleep,
      Steps,
      Scale,
      Accelerometer,
      Bug,
      Car,
      Distance,
      Door,
      Parking,
      Smoke,
      Avnet,
      WaveTop,
      WaveBottom,
      Video,
      Wave,
      Adjustments,
      Camera,
      Person,
      Frequency,
      Pin,
      Plug,
      Gyroscope,
      Magnetometer,
      Dashboards,
      Hand,
      BaseStation,
      Bluetooth,
      Usb,
      Co2,
      DataStream,
      Gateway,
      Swap,
      Loriot,
      SmokeDetectorBase,
      Acceleration,
      Gravity,
      Rotation,
      Box,
      Mic,
      Tank,
      TankAlt,
      GaugeArc,
      GaugeNeedle,
      Emoji,
    },

    props: {

      name: {
        type: String,
        required: true,
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
