import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Clock, Flame, Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useExerciseStore } from './stores/exercise';
import { useAuthStore } from './stores/auth';
import LoadingScreen from './components/LoadingScreen';

const QUICK_ADD_EXERCISES = [
  { name: 'Running', icon: '🏃‍♂️', calories: 400, duration: 30 },
  { name: 'Cycling', icon: '🚴‍♂️', calories: 300, duration: 30 },
  { name: 'Swimming', icon: '🏊‍♂️', calories: 450, duration: 30 },
  { name: 'Yoga', icon: '🧘‍♂️', calories: 150, duration: 30 },
  { name: 'HIIT', icon: '⚡️', calories: 400, duration: 30 },
];

export default function ExerciseScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    duration: '',
    caloriesBurned: '',
  });

  const { user } = useAuthStore();
  const {
    exercises,
    isLoading,
    error,
    fetchExercises,
    addExercise,
    getTotalCaloriesBurned,
    getTotalDuration,
  } = useExerciseStore();

  useEffect(() => {
    if (user) {
      fetchExercises(user.uid, selectedDate);
    }
  }, [user, selectedDate]);

  const handleAddExercise = async () => {
    if (!user) return;

    const exercise = {
      name: newExercise.name,
      duration: parseInt(newExercise.duration),
      caloriesBurned: parseInt(newExercise.caloriesBurned),
      timestamp: new Date(),
      userId: user.uid,
    };

    await addExercise(exercise);
    setShowAddExercise(false);
    setNewExercise({ name: '', duration: '', caloriesBurned: '' });
  };

  const handleQuickAdd = async (quickExercise: typeof QUICK_ADD_EXERCISES[0]) => {
    if (!user) return;

    const exercise = {
      name: quickExercise.name,
      duration: quickExercise.duration,
      caloriesBurned: quickExercise.calories,
      timestamp: new Date(),
      userId: user.uid,
    };

    await addExercise(exercise);
  };

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

  if (isLoading) {
    return <LoadingScreen message="Loading exercises..." />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.message}>Please sign in to track exercises</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Exercise Tracking</Text>
          <Text style={styles.subtitle}>Log your workouts and burn calories</Text>
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

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Flame size={24} color="#ef4444" />
            <Text style={styles.statValue}>{getTotalCaloriesBurned(selectedDate)}</Text>
            <Text style={styles.statLabel}>Calories Burned</Text>
          </View>

          <View style={styles.statCard}>
            <Clock size={24} color="#0891b2" />
            <Text style={styles.statValue}>{getTotalDuration(selectedDate)} min</Text>
            <Text style={styles.statLabel}>Total Duration</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Exercises</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddExercise(true)}
            >
              <Plus size={20} color="#0891b2" />
              <Text style={styles.addButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {showAddExercise && (
            <View style={styles.addExerciseForm}>
              <TextInput
                style={styles.input}
                placeholder="Exercise Name"
                value={newExercise.name}
                onChangeText={(text) =>
                  setNewExercise({ ...newExercise, name: text })
                }
              />
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Duration (mins)"
                  keyboardType="numeric"
                  value={newExercise.duration}
                  onChangeText={(text) =>
                    setNewExercise({ ...newExercise, duration: text })
                  }
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Calories Burned"
                  keyboardType="numeric"
                  value={newExercise.caloriesBurned}
                  onChangeText={(text) =>
                    setNewExercise({ ...newExercise, caloriesBurned: text })
                  }
                />
              </View>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddExercise}
              >
                <Text style={styles.saveButtonText}>Save Exercise</Text>
              </TouchableOpacity>
            </View>
          )}

          {exercises.length === 0 ? (
            <Text style={styles.emptyText}>No exercises logged for today</Text>
          ) : (
            exercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseIcon}>
                  <Dumbbell size={24} color="#0891b2" />
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <View style={styles.exerciseStats}>
                    <Text style={styles.exerciseStat}>
                      {exercise.duration} mins
                    </Text>
                    <Text style={styles.exerciseStat}>
                      {exercise.caloriesBurned} cal
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Add Exercises</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAddContainer}>
            {QUICK_ADD_EXERCISES.map((activity, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickAddCard}
                onPress={() => handleQuickAdd(activity)}
              >
                <Text style={styles.quickAddIcon}>{activity.icon}</Text>
                <Text style={styles.quickAddName}>{activity.name}</Text>
                <Text style={styles.quickAddCalories}>{activity.calories} cal/{activity.duration}min</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#0891b2',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseIcon: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 4,
  },
  exerciseStats: {
    flexDirection: 'row',
    gap: 12,
  },
  exerciseStat: {
    fontSize: 14,
    color: '#64748b',
  },
  addExerciseForm: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#0891b2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  quickAddContainer: {
    marginTop: 12,
  },
  quickAddCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 120,
  },
  quickAddIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickAddName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 4,
  },
  quickAddCalories: {
    fontSize: 12,
    color: '#64748b',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    marginVertical: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#64748b',
  },
});