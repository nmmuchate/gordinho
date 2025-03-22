import { create } from 'zustand';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
  timestamp: Date;
  userId: string;
}

interface FoodStore {
  entries: FoodEntry[];
  isLoading: boolean;
  error: string | null;
  fetchEntries: (userId: string, date?: Date) => Promise<void>;
  addEntry: (entry: Omit<FoodEntry, 'id'>) => Promise<void>;
  getTotalCalories: (date: Date) => number;
  getMacroTotals: (date: Date) => {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const useFoodStore = create<FoodStore>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchEntries: async (userId: string, date?: Date) => {
    try {
      set({ isLoading: true, error: null });
      
      const foodRef = collection(db, 'food_entries');
      let q = query(
        foodRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        q = query(
          foodRef,
          where('userId', '==', userId),
          where('timestamp', '>=', startOfDay),
          where('timestamp', '<=', endOfDay),
          orderBy('timestamp', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as FoodEntry[];
      
      set({ entries, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addEntry: async (entry: Omit<FoodEntry, 'id'>) => {
    try {
      set({ isLoading: true, error: null });
      await addDoc(collection(db, 'food_entries'), entry);
      await get().fetchEntries(entry.userId, new Date(entry.timestamp));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getTotalCalories: (date: Date) => {
    const { entries } = get();
    return entries
      .filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return (
          entryDate.getDate() === date.getDate() &&
          entryDate.getMonth() === date.getMonth() &&
          entryDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((total, entry) => total + entry.calories, 0);
  },

  getMacroTotals: (date: Date) => {
    const { entries } = get();
    return entries
      .filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return (
          entryDate.getDate() === date.getDate() &&
          entryDate.getMonth() === date.getMonth() &&
          entryDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce(
        (totals, entry) => ({
          protein: totals.protein + entry.protein,
          carbs: totals.carbs + entry.carbs,
          fat: totals.fat + entry.fat,
        }),
        { protein: 0, carbs: 0, fat: 0 }
      );
  },
}));