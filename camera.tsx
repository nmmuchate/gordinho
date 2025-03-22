import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Plus, X, CircleAlert as AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, addDoc, collection } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useAuthStore } from './stores/auth';
// import { useAIStore } from '../../stores/ai';
import LoadingScreen from './components/LoadingScreen';

interface FoodEntry {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
}

export default function TrackFoodScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [foodData, setFoodData] = useState<FoodEntry>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  const { user } = useAuthStore();
  // const { analyzeFoodImage, isAnalyzing, error: aiError } = useAIStore();

  const takePicture = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    // if (!result.canceled && result.assets[0].base64) {
    //   setImage(result.assets[0].uri);
    //   analyzeFoodImage(result.assets[0].base64).then(setFoodData);
    // }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    // if (!result.canceled && result.assets[0].base64) {
    //   setImage(result.assets[0].uri);
    //   analyzeFoodImage(result.assets[0].base64).then(setFoodData);
    // }
  };

  const saveFoodEntry = async () => {
    if (!user) return;

    try {
      const foodEntry = {
        ...foodData,
        image,
        userId: user.uid,
        timestamp: new Date(),
      };

      await addDoc(collection(db, 'food_entries'), foodEntry);
      
      // Reset form
      setImage(null);
      setFoodData({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
    } catch (error) {
      console.error('Error saving food entry:', error);
    }
  };

  // if (isAnalyzing) {
  //   return <LoadingScreen message="Analyzing your food..." />;
  // }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Track Your Food</Text>
          <Text style={styles.subtitle}>Take a photo or select from gallery</Text>
        </View>

        <View style={styles.imageSection}>
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.foodImage} />
              <TouchableOpacity
                style={styles.removeImage}
                onPress={() => setImage(null)}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={takePicture}
              >
                <Camera size={32} color="#0891b2" />
                <Text style={styles.uploadText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickImage}
              >
                <Plus size={32} color="#0891b2" />
                <Text style={styles.uploadText}>Upload from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
{/* 
        {aiError && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={styles.errorText}>{aiError}</Text>
          </View>
        )} */}

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Food Name"
            value={foodData.name}
            onChangeText={(text) => setFoodData({ ...foodData, name: text })}
          />

          <View style={styles.nutrientGrid}>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Calories</Text>
              <TextInput
                style={styles.nutrientInput}
                keyboardType="numeric"
                value={foodData.calories.toString()}
                onChangeText={(text) => 
                  setFoodData({ ...foodData, calories: parseInt(text) || 0 })
                }
              />
            </View>

            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Protein (g)</Text>
              <TextInput
                style={styles.nutrientInput}
                keyboardType="numeric"
                value={foodData.protein.toString()}
                onChangeText={(text) =>
                  setFoodData({ ...foodData, protein: parseInt(text) || 0 })
                }
              />
            </View>

            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Carbs (g)</Text>
              <TextInput
                style={styles.nutrientInput}
                keyboardType="numeric"
                value={foodData.carbs.toString()}
                onChangeText={(text) =>
                  setFoodData({ ...foodData, carbs: parseInt(text) || 0 })
                }
              />
            </View>

            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Fat (g)</Text>
              <TextInput
                style={styles.nutrientInput}
                keyboardType="numeric"
                value={foodData.fat.toString()}
                onChangeText={(text) =>
                  setFoodData({ ...foodData, fat: parseInt(text) || 0 })
                }
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveFoodEntry}
          >
            <Text style={styles.saveButtonText}>Save Food Entry</Text>
          </TouchableOpacity>
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
  imageSection: {
    padding: 20,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  removeImage: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 20,
    width: '45%',
  },
  uploadText: {
    color: '#0891b2',
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  analyzing: {
    padding: 20,
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 18,
    color: '#0891b2',
    marginTop: 12,
  },
  form: {
    padding: 20,
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
    marginTop: 20,
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
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 8,
  },
});