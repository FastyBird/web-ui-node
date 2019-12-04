import VuexORM from '@vuex-orm/core'

import database from '@/node_modules/@fastybird-com/io-logic/store'

import Thing from '@/models/Thing'
import things from '@/models/things'

database.register(Thing, things)

export const plugins = [
  VuexORM.install(database),
]
