import { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, 
  Alert, Modal, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { Search, Plus, ArrowLeft, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { FoodItem } from '@/components/FoodItem';
import { useMealsStore, MealItem } from '@/stores/meals';
import LoadingScreen from '@/components/LoadingScreen';

// API simulada para busca de alimentos
const searchFoodAPI = async (query: string): Promise<MealItem[]> => {
  // Simular uma chamada de API com delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Dados de alimentos simulados baseados na consulta
  const allFoods = [
    { id: 'f1', name: 'Arroz branco cozido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    { id: 'f2', name: 'Feijão preto cozido', calories: 77, protein: 5, carbs: 14, fat: 0.5 },
    { id: 'f3', name: 'Frango grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { id: 'f4', name: 'Ovo frito', calories: 90, protein: 6.3, carbs: 0.6, fat: 7 },
    { id: 'f5', name: 'Maçã', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    { id: 'f6', name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
    { id: 'f7', name: 'Aveia', calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
    { id: 'f8', name: 'Leite integral', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
    { id: 'f9', name: 'Pão integral', calories: 81, protein: 4, carbs: 13.8, fat: 1.2 },
    { id: 'f10', name: 'Salada verde', calories: 15, protein: 1.5, carbs: 2.3, fat: 0.2 },
  ];
  
  if (!query) return [];
  
  return allFoods.filter(food => 
    food.name.toLowerCase().includes(query.toLowerCase())
  );
};

export default function AddMealScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MealItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('Café da manhã');
  const [selectedFoods, setSelectedFoods] = useState<MealItem[]>([]);
  const [mealTime, setMealTime] = useState(formatCurrentTime());
  const [customFoodModal, setCustomFoodModal] = useState(false);
  const [recentFoods, setRecentFoods] = useState<MealItem[]>([]);
  
  // Custom food state
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  
  // References
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();
  const { addMeal, isLoading } = useMealsStore();
  
  const meals = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia'];

  useEffect(() => {
    // Carregar alimentos recentes do localStorage ou do AsyncStorage
    loadRecentFoods();
    
    // Limpar timeout quando o componente for desmontado
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);
  
  useEffect(() => {
    // Implementar debounce na busca
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (searchQuery.length >= 2) {
      setSearchLoading(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await searchFoodAPI(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Erro na busca:', error);
        } finally {
          setSearchLoading(false);
        }
      }, 500);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);
  
  // Função simulada para carregar alimentos recentes
  const loadRecentFoods = async () => {
    // Em uma implementação real, isso viria do AsyncStorage
    const recents: MealItem[] = [
      { id: '1', name: 'Ovos mexidos', calories: 150, protein: 12, carbs: 1, fat: 10 },
      { id: '2', name: 'Pão integral', calories: 80, protein: 4, carbs: 15, fat: 1 },
      { id: '3', name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
    ];
    setRecentFoods(recents);
  };

  function formatCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  const handleAddFood = (food: MealItem) => {
    // Verificar se o alimento já está na lista
    if (selectedFoods.some(f => f.id === food.id)) {
      Alert.alert('Alimento já adicionado', 'Este alimento já está na sua refeição.');
      return;
    }
    
    setSelectedFoods(prev => [...prev, food]);
    
    // Em uma implementação real, salvaríamos em um histórico recente
    if (!recentFoods.some(f => f.id === food.id)) {
      const updatedRecents = [food, ...recentFoods].slice(0, 5);
      setRecentFoods(updatedRecents);
      // Salvar no AsyncStorage
    }
  };

  const handleRemoveFood = (foodId: string) => {
    setSelectedFoods(prev => prev.filter(food => food.id !== foodId));
  };

  const handleSaveMeal = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um alimento à refeição');
      return;
    }

    try {
      await addMeal({
        name: selectedMeal,
        time: mealTime,
        date: new Date(),
        items: selectedFoods,
        totalCalories: selectedFoods.reduce((sum, food) => sum + food.calories, 0)
      });
      
      Alert.alert('Sucesso', 'Refeição adicionada com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Erro', `Falha ao adicionar refeição: ${error}`);
    }
  };
  
  const handleAddCustomFood = () => {
    // Validar campos
    if (!customName.trim()) {
      Alert.alert('Erro', 'Nome do alimento é obrigatório');
      return;
    }
    
    const calories = Number(customCalories);
    if (isNaN(calories) || calories <= 0) {
      Alert.alert('Erro', 'Calorias deve ser um número positivo');
      return;
    }
    
    // Criar alimento personalizado
    const newFood: MealItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      calories,
      protein: customProtein ? Number(customProtein) : undefined,
      carbs: customCarbs ? Number(customCarbs) : undefined,
      fat: customFat ? Number(customFat) : undefined
    };
    
    // Adicionar à lista de selecionados
    handleAddFood(newFood);
    
    // Resetar formulário e fechar modal
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setCustomFoodModal(false);
  };

  // Renderiza o modal de alimento personalizado
  const renderCustomFoodModal = () => (
    <Modal
      visible={customFoodModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setCustomFoodModal(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Alimento Personalizado</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setCustomFoodModal(false)}
            >
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalForm}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={customName}
                onChangeText={setCustomName}
                placeholder="Ex: Frango grelhado"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Calorias (kcal) *</Text>
              <TextInput
                style={styles.input}
                value={customCalories}
                onChangeText={setCustomCalories}
                placeholder="Ex: 165"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Proteínas (g)</Text>
              <TextInput
                style={styles.input}
                value={customProtein}
                onChangeText={setCustomProtein}
                placeholder="Ex: 31"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Carboidratos (g)</Text>
              <TextInput
                style={styles.input}
                value={customCarbs}
                onChangeText={setCustomCarbs}
                placeholder="Ex: 0"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Gorduras (g)</Text>
              <TextInput
                style={styles.input}
                value={customFat}
                onChangeText={setCustomFat}
                placeholder="Ex: 3.6"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddCustomFood}
          >
            <Text style={styles.addButtonText}>Adicionar Alimento</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {isLoading && <LoadingScreen message="Salvando refeição..." />}
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar Refeição</Text>
        <TouchableOpacity 
          style={[styles.saveButton, selectedFoods.length === 0 && styles.disabledButton]}
          onPress={handleSaveMeal}
          disabled={isLoading || selectedFoods.length === 0}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        <View style={styles.mealInfoContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tipo de Refeição</Text>
            <View style={styles.mealTypesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {meals.map((meal) => (
                  <TouchableOpacity
                    key={meal}
                    style={[
                      styles.mealTypeButton,
                      selectedMeal === meal && styles.selectedMealType,
                    ]}
                    onPress={() => setSelectedMeal(meal)}
                  >
                    <Text
                      style={[
                        styles.mealTypeText,
                        selectedMeal === meal && styles.selectedMealTypeText,
                      ]}
                    >
                      {meal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Horário</Text>
            <TextInput
              style={styles.timeInput}
              value={mealTime}
              onChangeText={setMealTime}
              placeholder="HH:MM"
            />
          </View>
        </View>
        
        {selectedFoods.length > 0 && (
          <View style={styles.selectedFoodsContainer}>
            <Text style={styles.sectionTitle}>Alimentos Selecionados</Text>
            {selectedFoods.map(food => (
              <View key={food.id} style={styles.selectedFoodItem}>
                <View>
                  <Text style={styles.selectedFoodName}>{food.name}</Text>
                  <Text style={styles.selectedFoodNutrition}>
                    {food.calories} kcal 
                    {food.protein !== undefined && ` • ${food.protein}g P`} 
                    {food.carbs !== undefined && ` • ${food.carbs}g C`} 
                    {food.fat !== undefined && ` • ${food.fat}g G`}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveFood(food.id)}
                >
                  <Text style={styles.removeButtonText}>Remover</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            <View style={styles.totalCaloriesContainer}>
              <Text style={styles.totalCaloriesLabel}>Total de Calorias:</Text>
              <Text style={styles.totalCaloriesValue}>
                {selectedFoods.reduce((sum, food) => sum + food.calories, 0)} kcal
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar alimentos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        
        {searchLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Buscando alimentos...</Text>
          </View>
        ) : !searchQuery ? (
          <View style={styles.recentFoodsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Alimentos Recentes</Text>
            </View>
            
            {recentFoods.length > 0 ? (
              recentFoods.map((food) => (
                <FoodItem 
                  key={food.id} 
                  food={food} 
                  onPress={() => handleAddFood(food)}
                  selected={selectedFoods.some(f => f.id === food.id)}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                Nenhum alimento recente. Busque ou adicione um alimento personalizado.
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.searchResultsContainer}>
            {searchResults.length > 0 ? (
              searchResults.map((food) => (
                <FoodItem 
                  key={food.id} 
                  food={food}
                  onPress={() => handleAddFood(food)}
                  selected={selectedFoods.some(f => f.id === food.id)}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                Nenhum resultado encontrado para "{searchQuery}".
                Tente outra busca ou adicione um alimento personalizado.
              </Text>
            )}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.addCustomButton}
          onPress={() => setCustomFoodModal(true)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addCustomButtonText}>Adicionar alimento personalizado</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {renderCustomFoodModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mealInfoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  timeInput: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  mealTypesContainer: {
    marginBottom: 10,
  },
  mealTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
  },
  selectedMealType: {
    backgroundColor: '#2196F3',
  },
  mealTypeText: {
    fontSize: 14,
    color: '#666',
  },
  selectedMealTypeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedFoodsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedFoodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedFoodName: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedFoodNutrition: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#ffebee',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#f44336',
    fontSize: 12,
  },
  totalCaloriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalCaloriesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalCaloriesValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  recentFoodsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  searchResultsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  sectionHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  addCustomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalForm: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 