export const AUTHOR_NAME = 'FastyBird s.r.o.'
export const AUTHOR_WEBSITE = 'https://www.fastybird.com'

export const MQTT_SERVER_ADDRESS = process.env.NUXT_ENV_MQTT_SERVER_ADDRESS
export const MQTT_SERVER_PORT = process.env.NUXT_ENV_MQTT_SERVER_PORT
export const MQTT_SERVER_SECURED_PORT = process.env.NUXT_ENV_MQTT_SERVER_SECURED_PORT

// WS topics
export const IO_SOCKET_TOPIC_EXCHANGE = '/io/exchange'

export const groupIcons = [
  'blender',
  'baby',
  'bath',
  'shower',
  'toilet',
  'chair',
  'couch',
  'tv',
  'gamepad',
  'hot-tub',
  'swimming-pool',
  'bed',
]

export const API_DEFAULT_THING_ROOT = 'http://192.168.4.1'
export const DEVICE_DEFAULT_DEFAULT_AUTHORIZATION = 'Basic YWRtaW46Zmlib25hY2Np'
export const TOKEN_SECRET_STRING = 'e2d012b2ab4feb24f251c7388b3c7f311d14d92d871d81932cf7442b92d52746'
