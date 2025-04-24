import { Model } from '@nozbe/watermelondb'
import { field, date } from '@nozbe/watermelondb/decorators'

class SessionData extends Model {
  static table = 'sessionData'
  @field('sessionId') sessionId!: string
  @field('data') data!: any 
  @date('timestamp') timestamp!: number
}

export default SessionData
