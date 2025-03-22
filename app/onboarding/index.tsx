import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth';

type Step = {
  id: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    id: 'height',
    title: 'How tall are you?',
    description: 'Enter your height in centimeters',
  },
  {
    id: 'weight',
    title: 'Whats your current weight?',
    description: 'Enter your weight in kilograms',
  },
  {
    id: 'age',
    title: 'How old are you?',
    description: 'Enter your age in years',
  },
  {
    id: 'gender',
    title: 'Whats your gender?',
    description: 'Select your gender for more accurate calculations',
  },
  {
    id: 'activity',
    title: 'How active are you?',
    description: 'Select your typical activity level',
  },
  {
    id: 'goal',
    title: 'Whats your goal?',
    description: 'Select your primary fitness goal',
  },
];

const activityLevels = [
  { id: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { id: 'light', label: 'Lightly Active (1-3 days/week)' },
  { id: 'moderate', label: 'Moderately Active (3-5 days/week)' },
  { id: 'active', label: 'Very Active (6-7 days/week)' },
  { id: 'very_active', label: 'Extra Active (very active & physical job)' },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: '',
    activityLevel: '',
    goalType: '',
    targetWeight: '',
  });
  
  const { updateProfile } = useAuthStore();
  const router = useRouter();

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await updateProfile({
        height: Number(formData.height),
        weight: Number(formData.weight),
        age: Number(formData.age),
        gender: formData.gender as 'male' | 'female' | 'other',
        activityLevel: formData.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
        goalType: formData.goalType as 'weight_loss' | 'weight_gain' | 'maintenance',
        targetWeight: Number(formData.targetWeight),
      });
      router.replace('/(tabs)');
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'height':
        return (
          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            value={formData.height}
            onChangeText={(value) => setFormData({ ...formData, height: value })}
            keyboardType="numeric"
          />
        );
      case 'weight':
        return (
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            value={formData.weight}
            onChangeText={(value) => setFormData({ ...formData, weight: value })}
            keyboardType="numeric"
          />
        );
      case 'age':
        return (
          <TextInput
            style={styles.input}
            placeholder="Age"
            value={formData.age}
            onChangeText={(value) => setFormData({ ...formData, age: value })}
            keyboardType="numeric"
          />
        );
      case 'gender':
        return (
          <View style={styles.options}>
            {['male', 'female', 'other'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.option,
                  formData.gender === gender && styles.optionSelected,
                ]}
                onPress={() => setFormData({ ...formData, gender })}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.gender === gender && styles.optionTextSelected,
                  ]}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'activity':
        return (
          <View style={styles.options}>
            {activityLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.option,
                  formData.activityLevel === level.id && styles.optionSelected,
                ]}
                onPress={() => setFormData({ ...formData, activityLevel: level.id })}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.activityLevel === level.id && styles.optionTextSelected,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'goal':
        return (
          <View style={styles.options}>
            {[
              { id: 'weight_loss', label: 'Lose Weight' },
              { id: 'maintenance', label: 'Maintain Weight' },
              { id: 'weight_gain', label: 'Gain Weight' },
            ].map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.option,
                  formData.goalType === goal.id && styles.optionSelected,
                ]}
                onPress={() => setFormData({ ...formData, goalType: goal.id })}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.goalType === goal.id && styles.optionTextSelected,
                  ]}
                >
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.progress}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      <Text style={styles.title}>{steps[currentStep].title}</Text>
      <Text style={styles.description}>{steps[currentStep].description}</Text>

      {renderStep()}

      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#0891b2',
    transform: [{ scale: 1.5 }],
  },
  progressDotCompleted: {
    backgroundColor: '#0891b2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  options: {
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionSelected: {
    backgroundColor: '#0891b2',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#0891b2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});