import { View, TouchableOpacity, StyleSheet, Text, Modal, Image } from 'react-native';
import { Plus, Camera, X, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../stores/auth';
import { useFoodStore } from '../stores/food';
import { useAIStore } from '../stores/ai';
import LoadingScreen from './LoadingScreen';

interface FoodEntry {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
}

export default function AddFoodButton() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [foodData, setFoodData] = useState<FoodEntry>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  const { user } = useAuthStore();
  const { addEntry } = useFoodStore();
  const { analyzeFoodImage, isAnalyzing, error: aiError } = useAIStore();

  const takePicture = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      analyzeFoodImage(result.assets[0].base64).then(setFoodData);
    }
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

      await addEntry(foodEntry);
      setIsModalVisible(false);
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

  if (isAnalyzing) {
    return <LoadingScreen message="Analyzing your food..." />;
  }

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
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Food</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

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
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={takePicture}
              >
                <Camera size={32} color="#0891b2" />
                <Text style={styles.cameraText}>Take a Photo</Text>
              </TouchableOpacity>
            )}

            {aiError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color="#ef4444" />
                <Text style={styles.errorText}>{aiError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveFoodEntry}
            >
              <Text style={styles.saveButtonText}>Save Food Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 2,
    backgroundColor: '#0891b2',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
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
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
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
  cameraButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 40,
    marginBottom: 20,
  },
  cameraText: {
    color: '#0891b2',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
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
  saveButton: {
    backgroundColor: '#0891b2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});