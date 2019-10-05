import VuexORM from '@vuex-orm/core'

import database from '@/plugins/io-server/store'

export const plugins = [
  VuexORM.install(database),
]
