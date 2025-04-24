import { Model } from '@nozbe/watermelondb'
import { field, date } from '@nozbe/watermelondb/decorators'

class Sessions extends Model {
  static table = 'sessions'

  @field('sessionName') sessionName!: any
  @date('createdAt') createdAt!: number
}

export default Sessions
