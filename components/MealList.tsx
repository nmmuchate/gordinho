import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMealsStore } from '@/stores/meals';

export function MealList() {
  const { meals, isLoading, error, fetchMealsForToday } = useMealsStore();
  const router = useRouter();

  useEffect(() => {
    fetchMealsForToday();
  }, []);

  const handleAddMeal = () => {
    router.push('/add-meal');
  };

  const handleViewMealDetails = (mealId: string) => {
    router.push(`/meal/${mealId}`);
  };

  if (isLoading && meals.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>Carregando refeições...</Text>
      </View>
    );
  }

  // if (error) {
  //   return (
  //     <View style={styles.errorContainer}>
  //       <Text style={styles.errorText}>Erro ao carregar refeições</Text>
  //       <Text style={styles.errorMessage}>{error}</Text>
  //       <TouchableOpacity 
  //         style={styles.retryButton} 
  //         onPress={fetchMealsForToday}
  //       >
  //         <Text style={styles.retryText}>Tentar novamente</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      {meals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma refeição registrada hoje</Text>
          <Text style={styles.emptySubText}>
            Adicione sua primeira refeição para começar a acompanhar sua alimentação
          </Text>
        </View>
      ) : (
        meals.map(meal => (
          <TouchableOpacity 
            key={meal.id} 
            style={styles.mealCard}
            onPress={() => handleViewMealDetails(meal.id)}
          >
            <View style={styles.mealHeader}>
              <View>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
              <Text style={styles.mealCalories}>{meal.totalCalories} kcal</Text>
            </View>
            
            <View style={styles.mealItems}>
              {meal.items.slice(0, 3).map(item => (
                <View key={item.id} style={styles.foodItem}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                </View>
              ))}
              
              {meal.items.length > 3 && (
                <Text style={styles.moreItems}>
                  +{meal.items.length - 3} mais itens
                </Text>
              )}
            </View>
            
            <View style={styles.mealFooter}>
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => handleViewMealDetails(meal.id)}
              >
                <Text style={styles.viewDetailsText}>Ver detalhes</Text>
                <ChevronRight size={16} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
      
      <TouchableOpacity 
        style={styles.addMealButton}
        onPress={handleAddMeal}
      >
        <Plus size={18} color="#2196F3" style={styles.plusIcon} />
        <Text style={styles.addMealText}>Adicionar Refeição</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos atualizados
const styles = StyleSheet.create({
  container: {
    gap: 15,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  mealItems: {
    padding: 10,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 5,
  },
  foodName: {
    fontSize: 14,
  },
  foodCalories: {
    fontSize: 14,
    color: '#666',
  },
  moreItems: {
    fontSize: 14,
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 6,
  },
  mealFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#2196F3',
    marginRight: 5,
  },
  addMealButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 10,
    borderStyle: 'dashed',
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  plusIcon: {
    marginRight: 8,
  },
  addMealText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
}); 