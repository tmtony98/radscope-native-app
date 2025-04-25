import { Model } from '@nozbe/watermelondb'
import { field, date, json } from '@nozbe/watermelondb/decorators'

interface SessionDataObject {
  [key: string]: any; // Allow any string keys with any value type
}

const sanitizeSessionData = (rawData: unknown): SessionDataObject => {
  if (typeof rawData === 'object' && rawData !== null) {
    return rawData as SessionDataObject;
  }
  return {};
};
class SessionData extends Model {
  static table = 'sessionData'
  @field('sessionId') sessionId!: string
  // Use @json with the updated sanitizer and interface type
  
  @json('data', sanitizeSessionData) data!: SessionDataObject
  @date('timestamp') timestamp!: number
  
}

export default SessionData
