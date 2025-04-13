import { View, TouchableOpacity, StyleSheet, Text, Modal, Image, TextInput, ActivityIndicator } from 'react-native';
import { Plus, X, Search, Camera, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../stores/auth';
import { useFoodStore } from '../stores/food';
import { useAIStore } from '../stores/ai';

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

interface FoodForm {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
}

export default function AddFoodButton() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FoodForm>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  const { user } = useAuthStore();
  const { searchFood, suggestions, addEntry, isSearching, error: foodError } = useFoodStore();
  const { analyzeFoodImage, isAnalyzing, error: aiError } = useAIStore();

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (user) {
      searchFood(text, user.uid);
    }
  }, [user, searchFood]);

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const imageUri = result.assets[0].uri;
        const nutritionInfo = await analyzeFoodImage(result.assets[0].base64);
        
        setFormData({
          name: nutritionInfo.name,
          calories: nutritionInfo.calories,
          protein: nutritionInfo.protein,
          carbs: nutritionInfo.carbs,
          fat: nutritionInfo.fat,
          image: imageUri
        });
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleSelectFood = async (item: EdamamFood | any) => {
    if (!user) return;

    try {
      let foodData;
      
      if ('food' in item) {
        // Edamam food item
        foodData = {
          name: item.food.label,
          calories: Math.round(item.food.nutrients.ENERC_KCAL),
          protein: Math.round(item.food.nutrients.PROCNT),
          carbs: Math.round(item.food.nutrients.CHOCDF),
          fat: Math.round(item.food.nutrients.FAT),
          image: item.food.image,
        };
      } else {
        // Local food entry
        foodData = {
          name: item.name,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          image: item.image,
        };
      }

      setFormData(foodData);
      setShowForm(true);
    } catch (error) {
      console.error('Error selecting food:', error);
    }
  };

  const handleSaveFood = async () => {
    if (!user) return;

    try {
      const foodEntry = {
        ...formData,
        userId: user.uid,
        timestamp: new Date(),
      };

      await addEntry(foodEntry);
      setIsModalVisible(false);
      setSearchQuery('');
      setShowForm(false);
      setFormData({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
    } catch (error) {
      console.error('Error saving food:', error);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSearchQuery('');
    setShowForm(false);
    setFormData({
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
  };

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Food</Text>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.closeButton}
              >
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {!showForm ? (
              <>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={handleTakePhoto}
                  >
                    <Camera size={24} color="#0891b2" />
                    <Text style={styles.optionText}>Take Photo</Text>
                  </TouchableOpacity>

                  <View style={styles.searchContainer}>
                    <Search size={20} color="#64748b" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search for food..."
                      value={searchQuery}
                      onChangeText={handleSearch}
                    />
                  </View>
                </View>

                {(foodError || aiError) && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={20} color="#ef4444" />
                    <Text style={styles.errorText}>{foodError || aiError}</Text>
                  </View>
                )}

                {(isSearching || isAnalyzing) ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0891b2" />
                    <Text style={styles.loadingText}>
                      {isSearching ? 'Searching...' : 'Analyzing photo...'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.suggestionsContainer}>
                    {suggestions.map((item, index) => {
                      const isEdamamFood = 'food' in item;
                      const name = isEdamamFood ? item.food.label : item.name;
                      const calories = isEdamamFood ? Math.round(item.food.nutrients.ENERC_KCAL) : item.calories;
                      const image = isEdamamFood ? item.food.image : item.image;

                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => handleSelectFood(item)}
                        >
                          {image && (
                            <Image
                              source={{ uri: image }}
                              style={styles.foodImage}
                            />
                          )}
                          <View style={styles.foodInfo}>
                            <Text style={styles.foodName}>{name}</Text>
                            <Text style={styles.foodCalories}>{calories} calories</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.form}>
                {formData.image && (
                  <Image
                    source={{ uri: formData.image }}
                    style={styles.previewImage}
                  />
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Food Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />

                <View style={styles.nutrientGrid}>
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientLabel}>Calories</Text>
                    <TextInput
                      style={styles.nutrientInput}
                      keyboardType="numeric"
                      value={formData.calories.toString()}
                      onChangeText={(text) => 
                        setFormData({ ...formData, calories: parseInt(text) || 0 })
                      }
                    />
                  </View>

                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientLabel}>Protein (g)</Text>
                    <TextInput
                      style={styles.nutrientInput}
                      keyboardType="numeric"
                      value={formData.protein.toString()}
                      onChangeText={(text) =>
                        setFormData({ ...formData, protein: parseInt(text) || 0 })
                      }
                    />
                  </View>

                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientLabel}>Carbs (g)</Text>
                    <TextInput
                      style={styles.nutrientInput}
                      keyboardType="numeric"
                      value={formData.carbs.toString()}
                      onChangeText={(text) =>
                        setFormData({ ...formData, carbs: parseInt(text) || 0 })
                      }
                    />
                  </View>

                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientLabel}>Fat (g)</Text>
                    <TextInput
                      style={styles.nutrientInput}
                      keyboardType="numeric"
                      value={formData.fat.toString()}
                      onChangeText={(text) =>
                        setFormData({ ...formData, fat: parseInt(text) || 0 })
                      }
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveFood}
                >
                  <Text style={styles.saveButtonText}>Save Food</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 10,
    bottom: 2,
    backgroundColor: '#0891b2',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: '70%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  closeButton: {
    padding: 8,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0891b2',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  suggestionsContainer: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
  },
  foodImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 4,
  },
  foodCalories: {
    fontSize: 14,
    color: '#64748b',
  },
  form: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  nutrientItem: {
    width: '48%',
    marginBottom: 16,
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  nutrientInput: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#0891b2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
});