import { Model } from '@nozbe/watermelondb'
import { field, date } from '@nozbe/watermelondb/decorators'

class Doserate extends Model {
  static table = 'doserate'

  @field('doserate') doserate!: number
  @field('cps') cps!: number
  @date('createdAt') createdAt!: number
}

export default Doserate
