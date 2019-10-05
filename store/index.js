import VuexORM from '@vuex-orm/core'

import database from '@/node_modules/@fastybird-com/io-logic/store'

export const plugins = [
  VuexORM.install(database),
]
