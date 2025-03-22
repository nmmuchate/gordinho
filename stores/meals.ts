import { create } from 'zustand';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from './auth';
import * as firebase from 'firebase/app';

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Meal {
  id: string;
  userId: string;
  name: string;
  time: string;
  date: Date | firebase.firestore.Timestamp;
  items: MealItem[];
  totalCalories: number;
}

interface MealsState {
  meals: Meal[];
  isLoading: boolean;
  error: string | null;
  
  fetchMealsForToday: () => Promise<void>;
  fetchMealsForDate: (date: Date) => Promise<void>;
  addMeal: (meal: Omit<Meal, 'id' | 'userId'>) => Promise<string>;
  addFoodToMeal: (mealId: string, food: Omit<MealItem, 'id'>) => Promise<void>;
  removeFoodFromMeal: (mealId: string, foodId: string) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
}

export const useMealsStore = create<MealsState>((set, get) => ({
  meals: [],
  isLoading: false,
  error: null,
  
  fetchMealsForToday: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await get().fetchMealsForDate(today);
  },
  
  fetchMealsForDate: async (date: Date) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    try {
      set({ isLoading: true, error: null });
      
      // Início e fim do dia para a query
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const mealsQuery = query(
        collection(db, 'meals'),
        where('userId', '==', user.uid),
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay)
      );
      
      const snapshot = await getDocs(mealsQuery);
      const meals = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate() // Converter Timestamp para Date
        } as Meal;
      });
      
      set({ meals, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  addMeal: async (meal) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');
    
    try {
      set({ isLoading: true, error: null });
      
      const newMeal = {
        ...meal,
        userId: user.uid,
        date: Timestamp.fromDate(meal.date || new Date()),
        totalCalories: meal.items.reduce((sum, item) => sum + item.calories, 0)
      };
      
      const docRef = await addDoc(collection(db, 'meals'), newMeal);
      
      // Converter o Timestamp para Date ao atualizar o estado
      const updatedMeal = { 
        ...newMeal, 
        id: docRef.id,
        date: newMeal.date instanceof Timestamp ? newMeal.date.toDate() : newMeal.date 
      } as Meal;
      set(state => ({ 
        meals: [...state.meals, updatedMeal],
        isLoading: false 
      }));
      
      return docRef.id;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  addFoodToMeal: async (mealId, food) => {
    try {
      set({ isLoading: true, error: null });
      
      // Encontrar a refeição atual
      const state = get();
      const meal = state.meals.find(m => m.id === mealId);
      if (!meal) throw new Error('Meal not found');
      
      // Criar novo item de comida
      const newFoodItem: MealItem = {
        id: Date.now().toString(), // ID temporário
        ...food
      };
      
      // Atualizar banco de dados
      const mealRef = doc(db, 'meals', mealId);
      const updatedItems = [...meal.items, newFoodItem];
      const newTotalCalories = updatedItems.reduce((sum, item) => sum + item.calories, 0);
      
      await updateDoc(mealRef, {
        items: updatedItems,
        totalCalories: newTotalCalories
      });
      
      // Atualizar store
      set(state => ({
        meals: state.meals.map(m => 
          m.id === mealId 
            ? { ...m, items: updatedItems, totalCalories: newTotalCalories }
            : m
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  removeFoodFromMeal: async (mealId, foodId) => {
    try {
      set({ isLoading: true, error: null });
      
      // Encontrar a refeição atual
      const state = get();
      const meal = state.meals.find(m => m.id === mealId);
      if (!meal) throw new Error('Meal not found');
      
      // Remover item de comida
      const updatedItems = meal.items.filter(item => item.id !== foodId);
      const newTotalCalories = updatedItems.reduce((sum, item) => sum + item.calories, 0);
      
      // Atualizar banco de dados
      const mealRef = doc(db, 'meals', mealId);
      await updateDoc(mealRef, {
        items: updatedItems,
        totalCalories: newTotalCalories
      });
      
      // Atualizar store
      set(state => ({
        meals: state.meals.map(m => 
          m.id === mealId 
            ? { ...m, items: updatedItems, totalCalories: newTotalCalories }
            : m
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  deleteMeal: async (mealId) => {
    try {
      set({ isLoading: true, error: null });
      
      // Excluir do banco de dados
      await deleteDoc(doc(db, 'meals', mealId));
      
      // Atualizar store
      set(state => ({
        meals: state.meals.filter(m => m.id !== mealId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  }
})); 