import { create } from 'zustand';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Exercise {
  id: string;
  name: string;
  duration: number;
  caloriesBurned: number;
  timestamp: Date;
  userId: string;
}

interface ExerciseStore {
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  fetchExercises: (userId: string, date?: Date) => Promise<void>;
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<void>;
  getTotalCaloriesBurned: (date: Date) => number;
  getTotalDuration: (date: Date) => number;
}

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  exercises: [],
  isLoading: false,
  error: null,

  fetchExercises: async (userId: string, date?: Date) => {
    try {
      set({ isLoading: true, error: null });
      
      const exerciseRef = collection(db, 'exercises');
      let q = query(
        exerciseRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        q = query(
          exerciseRef,
          where('userId', '==', userId),
          where('timestamp', '>=', startOfDay),
          where('timestamp', '<=', endOfDay),
          orderBy('timestamp', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const exercises = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Exercise[];
      
      set({ exercises, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addExercise: async (exercise: Omit<Exercise, 'id'>) => {
    try {
      set({ isLoading: true, error: null });
      await addDoc(collection(db, 'exercises'), exercise);
      await get().fetchExercises(exercise.userId, new Date(exercise.timestamp));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getTotalCaloriesBurned: (date: Date) => {
    const { exercises } = get();
    return exercises
      .filter(exercise => {
        const exerciseDate = new Date(exercise.timestamp);
        return (
          exerciseDate.getDate() === date.getDate() &&
          exerciseDate.getMonth() === date.getMonth() &&
          exerciseDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((total, exercise) => total + exercise.caloriesBurned, 0);
  },

  getTotalDuration: (date: Date) => {
    const { exercises } = get();
    return exercises
      .filter(exercise => {
        const exerciseDate = new Date(exercise.timestamp);
        return (
          exerciseDate.getDate() === date.getDate() &&
          exerciseDate.getMonth() === date.getMonth() &&
          exerciseDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((total, exercise) => total + exercise.duration, 0);
  },
}));