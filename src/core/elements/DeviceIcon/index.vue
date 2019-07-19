<template web>
  <component
    :is="name"
    class="device-icon"
  />
</template>

<script>
  import Value from './icons/value.svg'
  import Humidity from './icons/humidity.svg'
  import SimpleButton from './icons/button.svg'
  import Led from './icons/led.svg'
  import Motion from './icons/motion.svg'
  import Valve from './icons/valve.svg'
  import Motor from './icons/motor.svg'
  import Digital2State from './icons/digital-2state.svg'
  import Extension from './icons/extension.svg'
  import Proximity from './icons/proximity.svg'
  import Slider from './icons/slider.svg'
  import Add from './icons/add.svg'
  import Thermometer from './icons/thermometer.svg'
  import Load from './icons/load.svg'
  import Pi from './icons/pi.svg'
  import GenericDigital from './icons/generic-digital.svg'
  import GenericAnalog from './icons/generic-analog.svg'
  import Toggle from './icons/toggle.svg'
  import Alerts from './icons/alerts.svg'
  import LineChart from './icons/line-chart.svg'
  import DonutChart from './icons/donut-chart.svg'
  import Dashboard from './icons/dashboard.svg'
  import Gauge from './icons/gauge.svg'
  import Gpio from './icons/gpio.svg'
  import Lighting from './icons/lighting.svg'
  import Lock from './icons/lock.svg'
  import Luminosity from './icons/luminosity.svg'
  import Map from './icons/map.svg'
  import Notify from './icons/notify.svg'
  import Scheduling from './icons/scheduling.svg'
  import Settings from './icons/settings.svg'
  import Battery from './icons/battery.svg'
  import Chartlet from './icons/chartlet.svg'
  import Cog from './icons/cog.svg'
  import Android from './icons/android.svg'
  import List from './icons/list.svg'
  import Mobile from './icons/mobile.svg'
  import Time from './icons/time.svg'
  import Sigfox from './icons/sigfox.svg'
  import Arduino from './icons/arduino.svg'
  import Lora from './icons/lora.svg'
  import Fan from './icons/fan.svg'
  import Odometer from './icons/odometer.svg'
  import Share from './icons/share.svg'
  import Bolt from './icons/bolt.svg'
  import Signal from './icons/signal.svg'
  import Pending from './icons/pending.svg'
  import RemoteAccess from './icons/remote-access.svg'
  import Community from './icons/community.svg'
  import Padlock from './icons/padlock.svg'
  import Wifi from './icons/wifi.svg'
  import Refresh from './icons/refresh.svg'
  import Tools from './icons/tools.svg'
  import Joystick from './icons/joystick.svg'
  import Folder from './icons/folder.svg'
  import Knob from './icons/knob.svg'
  import Lcd from './icons/lcd.svg'
  import RotaryKnob from './icons/rotary-knob.svg'
  import LightingSpecial from './icons/lighting-special.svg'
  import Gallery from './icons/gallery.svg'
  import Tabs from './icons/tabs.svg'
  import Burn from './icons/burn.svg'
  import Eat from './icons/eat.svg'
  import Heart from './icons/heart.svg'
  import Run from './icons/run.svg'
  import Sleep from './icons/sleep.svg'
  import Steps from './icons/steps.svg'
  import Scale from './icons/scale.svg'
  import Accelerometer from './icons/accelerometer.svg'
  import Bug from './icons/bug.svg'
  import Car from './icons/car.svg'
  import Distance from './icons/distance.svg'
  import Door from './icons/door.svg'
  import Parking from './icons/parking.svg'
  import Smoke from './icons/smoke.svg'
  import Avnet from './icons/avnet.svg'
  import WaveTop from './icons/wave-top.svg'
  import WaveBottom from './icons/wave-bottom.svg'
  import Video from './icons/video.svg'
  import Wave from './icons/wave.svg'
  import Adjustments from './icons/adjustments.svg'
  import Camera from './icons/camera.svg'
  import Person from './icons/person.svg'
  import Frequency from './icons/frequency.svg'
  import Pin from './icons/pin.svg'
  import Plug from './icons/plug.svg'
  import Gyroscope from './icons/gyroscope.svg'
  import Magnetometer from './icons/magnetometer.svg'
  import Dashboards from './icons/dashboards.svg'
  import Hand from './icons/hand.svg'
  import BaseStation from './icons/base-station.svg'
  import Bluetooth from './icons/bluetooth.svg'
  import Usb from './icons/usb.svg'
  import Co2 from './icons/co2.svg'
  import DataStream from './icons/data-stream.svg'
  import Gateway from './icons/gateway.svg'
  import Swap from './icons/swap.svg'
  import Loriot from './icons/loriot.svg'
  import SmokeDetectorBase from './icons/smoke-detector-base.svg'
  import Acceleration from './icons/acceleration.svg'
  import Gravity from './icons/gravity.svg'
  import Rotation from './icons/rotation.svg'
  import Box from './icons/box.svg'
  import Mic from './icons/mic.svg'
  import Tank from './icons/tank.svg'
  import TankAlt from './icons/tank-alt.svg'
  import GaugeArc from './icons/gauge-arc.svg'
  import GaugeNeedle from './icons/gauge-needle.svg'
  import Emoji from './icons/emoji.svg'

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
