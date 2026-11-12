import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { AcademicResource, RatingRecord } from '../types/repository';
import { SAMPLE_RESOURCES } from './sampleData';

const COLLECTION_RESOURCES = 'resources';
const COLLECTION_RATINGS = 'ratings';

/**
 * Fetch all academic resources from Firestore, merging with sample resources if needed.
 */
export async function fetchAllResources(): Promise<AcademicResource[]> {
  try {
    const fetchPromise = (async () => {
      const q = query(collection(db, COLLECTION_RESOURCES));
      const snapshot = await getDocs(q);
      const firestoreItems: AcademicResource[] = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        firestoreItems.push({
          id: docSnap.id,
          title: data.title || 'Untitled Document',
          description: data.description || '',
          college: data.college || 'Unspecified College',
          department: data.department || 'Unspecified Department',
          semester: data.semester || 'Unspecified Semester',
          subject: data.subject || 'General',
          fileKey: data.fileKey || '',
          fileUrl: data.fileUrl || `/api/download/${data.fileKey}`,
          fileName: data.fileName || `${data.title || 'document'}.pdf`,
          fileSize: data.fileSize || 0,
          uploadedBy: data.uploadedBy || 'anonymous',
          uploadedByEmail: data.uploadedByEmail || '',
          uploadedByName: data.uploadedByName || 'University Member',
          uploadedAt: data.uploadedAt || new Date().toISOString(),
          averageRating: typeof data.averageRating === 'number' ? data.averageRating : 0,
          ratingCount: typeof data.ratingCount === 'number' ? data.ratingCount : 0,
          isSample: false
        });
      });

      return firestoreItems;
    })();

    const timeoutPromise = new Promise<AcademicResource[]>((resolve) => {
      setTimeout(() => resolve([]), 1800);
    });

    const firestoreItems = await Promise.race([fetchPromise, timeoutPromise]);
    return [...firestoreItems, ...SAMPLE_RESOURCES];
  } catch (error) {
    console.warn('Firestore fetch failed or initial setup. Falling back to sample resources:', error);
    return SAMPLE_RESOURCES;
  }
}

/**
 * Fetch a single academic resource by ID
 */
export async function fetchResourceById(id: string): Promise<AcademicResource | null> {
  // Check sample items first
  const sampleMatch = SAMPLE_RESOURCES.find(r => r.id === id);
  if (sampleMatch) {
    return sampleMatch;
  }

  try {
    const docRef = doc(db, COLLECTION_RESOURCES, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title || 'Untitled Document',
      description: data.description || '',
      college: data.college || 'Unspecified College',
      department: data.department || 'Unspecified Department',
      semester: data.semester || 'Unspecified Semester',
      subject: data.subject || 'General',
      fileKey: data.fileKey || '',
      fileUrl: data.fileUrl || `/api/download/${data.fileKey}`,
      fileName: data.fileName || `${data.title || 'document'}.pdf`,
      fileSize: data.fileSize || 0,
      uploadedBy: data.uploadedBy || 'anonymous',
      uploadedByEmail: data.uploadedByEmail || '',
      uploadedByName: data.uploadedByName || 'University Member',
      uploadedAt: data.uploadedAt || new Date().toISOString(),
      averageRating: typeof data.averageRating === 'number' ? data.averageRating : 0,
      ratingCount: typeof data.ratingCount === 'number' ? data.ratingCount : 0,
      isSample: false
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_RESOURCES}/${id}`);
    return null;
  }
}

/**
 * Save new document metadata into Firestore
 */
export async function createResource(resourceData: Omit<AcademicResource, 'id'>): Promise<string> {
  const path = COLLECTION_RESOURCES;
  try {
    const docRef = await addDoc(collection(db, path), {
      title: resourceData.title,
      description: resourceData.description || '',
      college: resourceData.college,
      department: resourceData.department,
      semester: resourceData.semester,
      subject: resourceData.subject,
      fileKey: resourceData.fileKey,
      fileUrl: resourceData.fileUrl || `/api/download/${resourceData.fileKey}`,
      fileName: resourceData.fileName || `${resourceData.title}.pdf`,
      fileSize: resourceData.fileSize || 0,
      uploadedBy: resourceData.uploadedBy,
      uploadedByEmail: resourceData.uploadedByEmail || '',
      uploadedByName: resourceData.uploadedByName || 'University Member',
      uploadedAt: new Date().toISOString(),
      averageRating: 0,
      ratingCount: 0
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Submit rating for a resource and recalculate average rating
 */
export async function submitRating(
  resourceId: string,
  anonymousIdentifier: string,
  score: number,
  isSample: boolean = false
): Promise<{ newAverage: number; newCount: number }> {
  if (score < 1 || score > 5) {
    throw new Error('Rating score must be between 1 and 5');
  }

  // Handle sample documents rating in local memory/storage
  if (isSample) {
    const sample = SAMPLE_RESOURCES.find(r => r.id === resourceId);
    if (sample) {
      const currentTotal = sample.averageRating * sample.ratingCount;
      sample.ratingCount += 1;
      sample.averageRating = Number(((currentTotal + score) / sample.ratingCount).toFixed(1));
      return { newAverage: sample.averageRating, newCount: sample.ratingCount };
    }
  }

  const ratingPath = COLLECTION_RATINGS;
  const resourcePath = `${COLLECTION_RESOURCES}/${resourceId}`;

  try {
    // 1. Create rating record
    await addDoc(collection(db, ratingPath), {
      resourceId,
      anonymousIdentifier,
      rating: score,
      createdAt: new Date().toISOString()
    });

    // 2. Fetch existing ratings for this resource to calculate average
    const ratingsQuery = query(
      collection(db, COLLECTION_RATINGS),
      where('resourceId', '==', resourceId)
    );
    const ratingsSnap = await getDocs(ratingsQuery);

    let totalScore = 0;
    let count = 0;

    ratingsSnap.forEach(rDoc => {
      const rData = rDoc.data();
      if (typeof rData.rating === 'number') {
        totalScore += rData.rating;
        count += 1;
      }
    });

    const averageRating = count > 0 ? Number((totalScore / count).toFixed(1)) : score;

    // 3. Update resource doc
    const resRef = doc(db, COLLECTION_RESOURCES, resourceId);
    await updateDoc(resRef, {
      averageRating,
      ratingCount: count
    });

    return { newAverage: averageRating, newCount: count };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, resourcePath);
  }
}
