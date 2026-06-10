import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type ActivityType = 
  | 'SCHEME_CLICK' 
  | 'CROP_SCAN' 
  | 'HEALTH_CHECK' 
  | 'COMMUNITY_POST' 
  | 'COMMUNITY_LIKE' 
  | 'AI_CHAT'
  | 'NEWS_REFRESH'
  | 'VILLAGE_COMPLAINT'
  | 'VILLAGE_LEGAL'
  | 'SOIL_SCAN';

export async function logActivity(type: ActivityType, details: any) {
  if (!auth.currentUser) return;

  try {
    await addDoc(collection(db, 'activities'), {
      uid: auth.currentUser.uid,
      userName: auth.currentUser.displayName,
      type,
      details,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error("Error logging activity:", err);
    handleFirestoreError(err, OperationType.WRITE, 'activities');
  }
}
