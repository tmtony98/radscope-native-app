import { Model } from '@nozbe/watermelondb'
import { field, date } from '@nozbe/watermelondb/decorators'

class Doserate extends Model { //The Doserate class extends the Model class, which is a base class provided by WaterMelonDB
  static table = 'doserate'

  @field('doserate') doserate!: number //The ! after each property name is TypeScript's non-null assertion operator, indicating these properties will always be defined
  @field('cps') cps!: number
  @date('createdAt') createdAt!: number //The string defines the actual column name   and  createdAt definesJavaScript property
}

export default Doserate
