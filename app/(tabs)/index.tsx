import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '../../stores/auth';
import { useFoodStore } from '../../stores/food';
import { useCache, useUIState } from '../../hooks/useUIState';
import { useExerciseStore } from '../../stores/exercise';
import LoadingScreen from '../../components/LoadingScreen';
import { HomeScreenSkeleton } from '@/components/SkeletonScreen';
import AddFoodButton from '@/components/AddFoodButton';
import { useToast } from '@/components/ToastNotification';
import { colors } from '@/constants/Colors';

export default function HomeScreen() {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40; // Subtrai as margens horizontais (20px de cada lado)
  const [selectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  //Enhanced UI state management
  const uiState = useUIState({
    debounceMs: 300,
    autoResetMs: 3000,
    enableOptimisticUpdates: true
  });

  //Toast Notification
  const toast = useToast();
  const cache = useCache<any>('home-data', 2 * 60 * 1000);

 const {
    user,
    profile,
    isLoading: authLoading
  } = useAuthStore();
  const { 
    entries, 
    isLoading: foodLoading, 
    fetchEntries, 
    getTotalCalories, 
    getMacroTotals 
  } = useFoodStore();
  // const { exercises, isLoading: exerciseLoading, fetchExercises, getTotalCaloriesBurned } = useExerciseStore();

  // Memoize stable values to prevent unnecessary re-renders
  const selectedDateString = useMemo(() => selectedDate.toDateString(), [selectedDate]);

  const userId = useMemo(() => user?.uid, [user?.uid]);

  // Enhanced data fetching with caching and feedback
  const fetchData = useCallback(async () => {
    if(!userId) return;

    const cacheKey = `${userId} -${selectedDateString}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      console.log('Using cached data');
      return cachedData;
    }

    try {
      uiState.setCalculating('Carregando o seu painel...', 0);

      // Fetch entries
      uiState.updateProgress(50, 'Carregando suas refeições...');
      await fetchEntries(userId, selectedDate);

      // Fetch exercises
      // uiState.updateProgress(75, 'Carregando seus exercícios...');
      // await fetchExercises(userId, selectedDate);

      uiState.updateProgress(100, 'Pronto!');
      uiState.setSuccess('Sucesso ao carregar os dados!');

      //cache the result
    const data = { entries };
    cache.set(cacheKey, data);
    return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      uiState.setError('Erro ao carregar os dados!');
      throw error;
    } 
  }, [userId, selectedDate, cache, uiState, fetchEntries]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // clear cache for fresh data
      cache.clear();
      await fetchData();
      toast.showSuccess('Sucesso ao carregar os dados!', 'Os seus dados foram atualizados.');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.showError('Erro ao carregar os dados!', 'Por favor, tente novamente.');
    } finally {
      setRefreshing(false);
    }
  }, [fetchData, cache, toast]);

  // Effect to fetch data when user or date changes
  useEffect(() =>{
    if (userId){
      fetchData();
    }
  }, [userId, selectedDateString]); // use memoized values

  // Memoized calculations to prevent recalculations
  const calculatedValues = useMemo(() => {
    const dailyGoal = profile?.dailyCalories || 2000;
    const consumedCalories = getTotalCalories(selectedDate);
    // const burnedCalories = getTotalCaloriesBurned?.(selectedDate) || 0;
    // const netCalories = consumedCalories - burnedCalories;
    const remainingCalories = dailyGoal - consumedCalories;
    const macros = getMacroTotals(selectedDate);

    return {
      dailyGoal,
      consumedCalories,
      // burnedCalories,
      // netCalories,
      remainingCalories,
      macros,
    };
  },[profile?.dailyCalories, getTotalCalories,  selectedDate, getMacroTotals]);
  // if (foodLoading) {
  //   return <LoadingScreen message="Carregando seu painel..." />;
  // }


  
  // Calculate the last 7 days of calorie data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const caloriesData = {
    labels: last7Days.map(date => date.toLocaleDateString('pt-BR', { weekday: 'short' })),
    datasets: [
      {
        data: last7Days.map(date => getTotalCalories(date)),
        color: (opacity = 1) => colors.primary.orange,
        strokeWidth: 2,
      },
    ],
  };

  // Get latest food entries
  const todayEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return (
        entryDate.getDate() === selectedDate.getDate() &&
        entryDate.getMonth() === selectedDate.getMonth() &&
        entryDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [entries, selectedDate]);

  if(authLoading || foodLoading || uiState.isLoading){
    return <HomeScreenSkeleton />
  }

  const {
    dailyGoal,
    consumedCalories,
    macros
  } = calculatedValues;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {profile?.name || 'Usuário'}!</Text>
          <Text style={styles.date}>{selectedDate.toLocaleDateString('pt-PT')}</Text>
        </View>

        <View style={styles.caloriesSummary}>
          <Text style={styles.sectionTitle}>Calorias de Hoje</Text>
          <View style={styles.caloriesInfo}>
            <View style={styles.calorieItem}>
              <Text style={styles.calorieValue}>{consumedCalories}</Text>
              <Text style={styles.calorieLabel}>Consumidas</Text>
            </View>
            <View style={styles.calorieItem}>
              <Text style={styles.calorieValue}>{dailyGoal}</Text>
              <Text style={styles.calorieLabel}>Meta</Text>
            </View>
            <View style={styles.calorieItem}>
              {/* <Text style={[styles.calorieValue, remainingCalories < 0 && styles.calorieOverage]}>{remainingCalories}</Text> */}
              <Text style={styles.calorieLabel}>Restantes</Text>
            </View>
          </View>
        </View>

        <View style={styles.macrosContainer}>
          <Text style={styles.sectionTitle}>Macros de Hoje</Text>
          <View style={styles.macrosList}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{macros.carbs}g</Text>
              <Text style={styles.macroLabel}>Carboidratos</Text>
              <View style={[styles.progressBar, { backgroundColor: colors.status.info }]} />
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{macros.protein}g</Text>
              <Text style={styles.macroLabel}>Proteína</Text>
              <View style={[styles.progressBar, { backgroundColor: colors.status.success }]} />
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{macros.fat}g</Text>
              <Text style={styles.macroLabel}>Gordura</Text>
              <View style={[styles.progressBar, { backgroundColor: colors.status.warning }]} />
            </View>
          </View>
        </View>
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Alimentos de Hoje</Text>
          {todayEntries.length > 0 ? (
            todayEntries.map((entry, index) => (
              <View key={index} style={styles.foodItem}>
                {entry.image ? (
                  <Image source={{ uri: entry.image }} style={styles.foodImage} />
                ) : (
                  <View style={styles.foodImagePlaceholder} />
                )}
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{entry.name}</Text>
                  <Text style={styles.foodMacros}>
                    P: {entry.protein}g • C: {entry.carbs}g • G: {entry.fat}g
                  </Text>
                </View>
                <Text style={styles.foodCalories}>{entry.calories} cal</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhum alimento registrado hoje</Text>
          )}
        </View>
      </ScrollView>
      <AddFoodButton/>

      <toast.ToastComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  recentContainer: {
    backgroundColor: colors.background.primary,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  date: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  caloriesSummary: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  caloriesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calorieItem: {
    alignItems: 'center',
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  macrosContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calorieOverage: {
    color: colors.status.error,
  },
  foodImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  foodImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.secondary.gray[100],
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  foodMacros: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  foodCalories: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
    marginLeft: 16,
  },
  macrosList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  macroLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    width: '80%',
    borderRadius: 2,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});