import { create } from 'zustand';
import { collection, query, where, orderBy, getDocs, addDoc, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import debounce from 'lodash.debounce';

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

interface EdamamFood {
  food: {
    foodId: string;
    label: string;
    nutrients: {
      ENERC_KCAL: number;
      PROCNT: number;
      FAT: number;
      CHOCDF: number;
    };
    image?: string;
  };
}

interface FoodStore {
  entries: FoodEntry[];
  suggestions: (FoodEntry | EdamamFood)[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  fetchEntries: (userId: string, date?: Date) => Promise<void>;
  addEntry: (entry: Omit<FoodEntry, 'id'>) => Promise<void>;
  searchFood: (query: string, userId: string) => Promise<void>;
  getTotalCalories: (date: Date) => number;
  getMacroTotals: (date: Date) => {
    protein: number;
    carbs: number;
    fat: number;
  };
}

const EDAMAM_APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;

export const useFoodStore = create<FoodStore>((set, get) => ({
  entries: [],
  suggestions: [],
  isLoading: false,
  isSearching: false,
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

  searchFood: debounce(async (query: string, userId: string) => {
    if (!query.trim()) {
      set({ suggestions: [], isSearching: false });
      return;
    }

    try {
      set({ isSearching: true, error: null });

      // Search in Firestore first
      const foodRef = collection(db, 'food_entries');
      const q = query(
        foodRef,
        where('userId', '==', userId),
        where('name', '>=', query.toLowerCase()),
        where('name', '<=', query.toLowerCase() + '\uf8ff'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const localSuggestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as FoodEntry[];

      // Search Edamam API
      const edamamResponse = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(query)}&nutrition-type=logging`
      );

      if (!edamamResponse.ok) {
        throw new Error('Failed to fetch from Edamam API');
      }

      const edamamData = await edamamResponse.json();
      const edamamSuggestions = edamamData.hints.slice(0, 5) as EdamamFood[];

      // Combine and deduplicate suggestions
      const combinedSuggestions = [
        ...localSuggestions,
        ...edamamSuggestions
      ].slice(0, 10);

      set({ suggestions: combinedSuggestions, isSearching: false });
    } catch (error) {
      set({ error: (error as Error).message, isSearching: false });
    }
  }, 300),

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