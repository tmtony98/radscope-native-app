import { Model } from '@nozbe/watermelondb'
import { field, date } from '@nozbe/watermelondb/decorators'

class Sessions extends Model {
  static table = 'sessions'

  @field('sessionName') sessionName!: string
  @field('timeLimit') timeLimit?: number // Optional time limit in milliseconds
  @field('timeInterval') timeInterval?: number // Optional save interval in milliseconds
  @date('createdAt') createdAt!: number
  @date('stoppedAt') stoppedAt!: number
}

export default Sessions
