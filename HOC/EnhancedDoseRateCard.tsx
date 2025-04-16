import { withObservables } from '@nozbe/watermelondb/react';
import DoseRateCard from '../components/Dashboard/DoseRateCard'; // your original component
import { Q } from '@nozbe/watermelondb';
import database from '@/index.native';

const enhance = withObservables([], () => ({
  latestDoserate: database.get('doserate').query(Q.sortBy('createdAt', Q.desc), Q.take(1)).observeWithColumns(['doserate', 'cps']),
}));

export default enhance(DoseRateCard);   