import { Platform } from 'react-native'
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import schema from './model/schema'
import migrations from './model/migrations'
import Doserate from './model/Doserate'

// import Post from './model/Post' // ⬅️ You'll import your Models here

// index.js

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
   schema,
  // (You might want to comment it out for development purposes -- see Migrations documentation)
  migrations,
 
  // dbName: 'myapp',
  // (recommended option, should work flawlessly out of the box on iOS. On Android,
  // additional installation steps have to be taken - disable if you run into issues...)
  jsi: true, /* Platform.OS === 'ios' */
  // (optional, but you should implement this method)
  onSetUpError: error => {
    console.log("Database failed to load -- offer the user to reload the app or log out");
    
    // Database failed to load -- offer the user to reload the app or log out
  }
})

// Then, make a Watermelon database from it!
const database = new Database({
  adapter,
  modelClasses: [
    Doserate,
    // Post, // ⬅️ You'll add Models to Watermelon here
  ],
})

export default database