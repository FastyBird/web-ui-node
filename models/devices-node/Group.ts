import { Model, Fields } from '@vuex-orm/core'

// ENTITY INTERFACE
// ================
export interface GroupInterface {
  id: string,
  type: string,

  parent_id: string | null,

  title: string,
  comment: string | null,
  icon: string,
  params: any,

  relationshipNames: Array<string>,

  device_ids: Array<string>,

  children: Array<GroupInterface>,
}

// ENTITY MODEL
// ============
export default class Group extends Model implements GroupInterface {
  static get entity(): string {
    return 'group'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      parent_id: this.string(null).nullable(),

      title: this.string(null).nullable(),
      comment: this.string(null).nullable(),
      icon: this.string('folder'),
      params: this.attr(null),

      relationshipNames: this.attr([]).nullable(),

      device_ids: this.attr(null),

      children: this.hasMany(Group, 'parent_id'),
    }
  }

  id!: string;
  type!: string;

  parent_id!: string | null;

  title!: string;
  comment!: string | null;
  icon!: string;
  params!: any;

  relationshipNames!: Array<string>;

  device_ids!: Array<string>;

  children!: Array<GroupInterface>;

  get hasComment(): boolean {
    return this.comment !== null && this.comment !== ''
  }
}
