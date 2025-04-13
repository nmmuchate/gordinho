import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useFoodStore } from '../../stores/food';
import { useAuthStore } from '../../stores/auth';
import LoadingScreen from '../../components/LoadingScreen';
import AddFoodButton from '../../components/AddFoodButton';

const screenWidth = Dimensions.get('window').width;

export default function NutritionScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { profile } = useAuthStore();
  const { entries, getTotalCalories, getMacroTotals, isLoading } = useFoodStore();

  if (isLoading) {
    return <LoadingScreen message="Loading nutrition data..." />;
  }

  const dailyGoal = profile?.dailyCalories || 2000;
  const totalCalories = getTotalCalories(selectedDate);
  const macros = getMacroTotals(selectedDate);

  const caloriesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [1800, 2200, 1950, totalCalories, 0, 0, 0],
    }],
  };

  const macroData = [
    {
      name: 'Protein',
      calories: macros.protein * 4,
      color: '#0891b2',
      legendFontColor: '#64748b',
    },
    {
      name: 'Carbs',
      calories: macros.carbs * 4,
      color: '#059669',
      legendFontColor: '#64748b',
    },
    {
      name: 'Fat',
      calories: macros.fat * 9,
      color: '#d97706',
      legendFontColor: '#64748b',
    },
  ];

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateProgress = () => {
    return (totalCalories / dailyGoal) * 100;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition Tracking</Text>
          <Text style={styles.subtitle}>Monitor your daily intake</Text>
        </View>

        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={() => changeDate(-1)}>
            <ChevronLeft size={24} color="#0891b2" />
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <TouchableOpacity onPress={() => changeDate(1)}>
            <ChevronRight size={24} color="#0891b2" />
          </TouchableOpacity>
        </View>

        <View style={styles.calorieCard}>
          <View style={styles.calorieHeader}>
            <Text style={styles.calorieTitle}>Calories</Text>
            <Text style={styles.calorieSubtitle}>Daily Goal: {dailyGoal}</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${Math.min(calculateProgress(), 100)}%` },
                  calculateProgress() > 100 && styles.progressOverage
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>{totalCalories}</Text>
              <Text style={styles.progressText}>{dailyGoal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Progress</Text>
          <LineChart
            data={caloriesData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(8, 145, 178, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#0891b2',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.macrosCard}>
          <Text style={styles.chartTitle}>Macronutrient Distribution</Text>
          <View style={styles.macrosContent}>
            <PieChart
              data={macroData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="calories"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          <View style={styles.macrosList}>
            <View style={styles.macroItem}>
              <View style={[styles.macroIndicator, { backgroundColor: '#0891b2' }]} />
              <View style={styles.macroInfo}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{macros.protein}g</Text>
              </View>
            </View>

            <View style={styles.macroItem}>
              <View style={[styles.macroIndicator, { backgroundColor: '#059669' }]} />
              <View style={styles.macroInfo}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>{macros.carbs}g</Text>
              </View>
            </View>

            <View style={styles.macroItem}>
              <View style={[styles.macroIndicator, { backgroundColor: '#d97706' }]} />
              <View style={styles.macroInfo}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValue}>{macros.fat}g</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <AddFoodButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  calorieCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  calorieHeader: {
    marginBottom: 16,
  },
  calorieTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  calorieSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0891b2',
    borderRadius: 6,
  },
  progressOverage: {
    backgroundColor: '#ef4444',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  macrosCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  macrosContent: {
    alignItems: 'center',
  },
  macrosList: {
    marginTop: 20,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  macroIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  macroInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 16,
    color: '#0f172a',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
});