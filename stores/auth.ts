import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Platform } from 'react-native';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  goalType?: 'weight_loss' | 'weight_gain' | 'maintenance';
  targetWeight?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dailyCalories?: number;
  bmr?: number;
  tdee?: number;
  onboardingCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  calculateBMR: (profile: UserProfile) => number;
  getActivityMultiplier: (activityLevel: string) => number;
  calculateTDEE: (bmr: number, activityLevel: string) => number;
  calculateDailyCalories: (profile: UserProfile) => number;
  needsOnboarding: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  error: null,

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      const profile: UserProfile = {
        id: user.uid,
        email,
        name,
        onboardingCompleted: false
      };
      
      await setDoc(doc(db, 'users', user.uid), profile);
      set({ user, profile, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      const profile = profileDoc.data() as UserProfile;
      
      set({ user, profile, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });

      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const { user } = result;

        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!profileDoc.exists()) {
          const profile: UserProfile = {
            id: user.uid,
            email: user.email!,
            name: user.displayName || 'User',
            photoURL: user.photoURL || undefined,
            onboardingCompleted: false
          };
          
          await setDoc(doc(db, 'users', user.uid), profile);
          set({ user, profile, isLoading: false });
        } else {
          const profile = profileDoc.data() as UserProfile;
          set({ user, profile, isLoading: false });
        }
      } else {
        throw new Error('Google Sign In is only available on web platform');
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, profile: null });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  calculateBMR: (profile: UserProfile): number => {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender) {
      return 0;
    }

    // Mifflin-St Jeor Equation
    let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    bmr = profile.gender === 'male' ? bmr + 5 : bmr - 161;

    return Math.round(bmr);
  },

  getActivityMultiplier: (activityLevel: string): number => {
    const multipliers = {
      sedentary: 1.2, // Little or no exercise
      light: 1.375, // Light exercise/sports 1-3 days/week
      moderate: 1.55, // Moderate exercise/sports 3-5 days/week
      active: 1.725, // Hard exercise/sports 6-7 days/week
      very_active: 1.9 // Very hard exercise/sports & physical job or training twice per day
    };
    return multipliers[activityLevel as keyof typeof multipliers] || 1.2;
  },

  calculateTDEE: (bmr: number, activityLevel: string): number => {
    const multiplier = get().getActivityMultiplier(activityLevel);
    return Math.round(bmr * multiplier);
  },

  calculateDailyCalories: (profile: UserProfile): number => {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender || !profile.activityLevel) {
      return 2000; // Default value
    }

    const bmr = get().calculateBMR(profile);
    const tdee = get().calculateTDEE(bmr, profile.activityLevel);

    // Adjust based on goal
    switch (profile.goalType) {
      case 'weight_loss':
        return Math.round(tdee - 500); // 500 calorie deficit
      case 'weight_gain':
        return Math.round(tdee + 500); // 500 calorie surplus
      default:
        return tdee; // maintenance
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    try {
      const updatedProfile = { ...profile, ...data };
      
      // Calculate BMR, TDEE, and daily calories
      if (updatedProfile.weight && updatedProfile.height && updatedProfile.age && 
          updatedProfile.gender && updatedProfile.activityLevel) {
        updatedProfile.bmr = get().calculateBMR(updatedProfile);
        updatedProfile.tdee = get().calculateTDEE(updatedProfile.bmr, updatedProfile.activityLevel);
        updatedProfile.dailyCalories = get().calculateDailyCalories(updatedProfile);
        updatedProfile.onboardingCompleted = true;
      }

      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      set({ profile: updatedProfile });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  needsOnboarding: () => {
    const { profile } = get();
    return !profile?.onboardingCompleted;
  },
}));

// Set up auth state listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    const profile = profileDoc.data() as UserProfile;
    useAuthStore.setState({ user, profile, isLoading: false });
  } else {
    useAuthStore.setState({ user: null, profile: null, isLoading: false });
  }
});