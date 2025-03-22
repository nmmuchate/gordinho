import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';

interface Food {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface FoodItemProps {
  food: Food;
  onPress?: () => void;
  selected?: boolean;
}

export function FoodItem({ food, onPress, selected = false }: FoodItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, selected && styles.selectedContainer]} 
      onPress={onPress}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{food.name}</Text>
        <Text style={styles.nutritionText}>
          {food.calories} kcal 
          {food.protein !== undefined && ` • ${food.protein}g P`} 
          {food.carbs !== undefined && ` • ${food.carbs}g C`} 
          {food.fat !== undefined && ` • ${food.fat}g G`}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.addButton, selected && styles.selectedButton]}
        onPress={onPress}
      >
        <Plus size={20} color={selected ? "#fff" : "#2196F3"} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  selectedContainer: {
    backgroundColor: '#e3f2fd',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  nutritionText: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#2196F3',
  },
}); 