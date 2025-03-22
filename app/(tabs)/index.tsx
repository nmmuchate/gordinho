import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '../../stores/auth';
import { useFoodStore } from '../../stores/food';
import { useExerciseStore } from '../../stores/exercise';
import LoadingScreen from '../../components/LoadingScreen';
import AddFoodButton from '@/components/AddFoodButton';

export default function HomeScreen() {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40; // Subtrai as margens horizontais (20px de cada lado)
  const [selectedDate] = useState(new Date());
  const { user, profile } = useAuthStore();
  const { entries, isLoading: foodLoading, fetchEntries, getTotalCalories, getMacroTotals } = useFoodStore();
  const { exercises, isLoading: exerciseLoading, fetchExercises, getTotalCaloriesBurned } = useExerciseStore();

  useEffect(() => {
    if (user) {
      fetchEntries(user.uid, selectedDate);
      fetchExercises(user.uid, selectedDate);
    }
  }, [user, selectedDate]);

  if (foodLoading || exerciseLoading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  const dailyGoal = profile?.dailyCalories || 2000;
  const consumedCalories = getTotalCalories(selectedDate);
  const burnedCalories = getTotalCaloriesBurned(selectedDate);
  const remainingCalories = dailyGoal - consumedCalories + burnedCalories;
  const macros = getMacroTotals(selectedDate);

  // Calculate the last 7 days of calorie data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const caloriesData = {
    labels: last7Days.map(date => date.toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        data: last7Days.map(date => getTotalCalories(date)),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {profile?.name || 'User'}!</Text>
          <Text style={styles.date}>{selectedDate.toLocaleDateString()}</Text>
        </View>

        <View style={styles.caloriesSummary}>
          <Text style={styles.sectionTitle}>Today's Calories</Text>
          <View style={styles.caloriesInfo}>
            <View style={styles.calorieItem}>
              <Text style={styles.calorieValue}>{consumedCalories}</Text>
              <Text style={styles.calorieLabel}>Consumed</Text>
            </View>
            <View style={styles.calorieItem}>
              <Text style={styles.calorieValue}>{dailyGoal}</Text>
              <Text style={styles.calorieLabel}>Goal</Text>
            </View>
            <View style={styles.calorieItem}>
              <Text style={styles.calorieValue}>{remainingCalories}</Text>
              <Text style={styles.calorieLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        <View style={styles.macrosContainer}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <View style={styles.macrosList}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{macros.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
              <View style={[styles.progressBar, { backgroundColor: '#0891b2' }]} />
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{macros.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
              <View style={[styles.progressBar, { backgroundColor: '#059669' }]} />
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{macros.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
              <View style={[styles.progressBar, { backgroundColor: '#d97706' }]} />
            </View>
          </View>
        </View>
      </ScrollView>
      <AddFoodButton/>
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
});