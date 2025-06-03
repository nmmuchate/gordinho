import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastNotificationProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const { width: screenWidth } = Dimensions.get('window');

export default function ToastNotification({
  visible,
  type,
  title,
  message,
  duration = 4000,
  onDismiss,
  action
}: ToastNotificationProps) {
  const [translateY] = useState(new Animated.Value(-100));
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <Check size={20} color="#ffffff" />,
          backgroundColor: '#059669',
          borderColor: '#047857',
        };
      case 'error':
        return {
          icon: <AlertCircle size={20} color="#ffffff" />,
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={20} color="#ffffff" />,
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
        };
      case 'info':
        return {
          icon: <Info size={20} color="#ffffff" />,
          backgroundColor: '#0891b2',
          borderColor: '#0e7490',
        };
    }
  };

  if (!visible) return null;

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {config.icon}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}
        </View>

        <View style={styles.actionsContainer}>
          {action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={action.onPress}
            >
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={hideToast}
          >
            <X size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// Toast Manager Hook
interface ToastState {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    type: 'info',
    title: '',
  });

  const showToast = (
    type: ToastType,
    title: string,
    message?: string,
    action?: { label: string; onPress: () => void }
  ) => {
    setToast({
      visible: true,
      type,
      title,
      message,
      action,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const showSuccess = (title: string, message?: string) => {
    showToast('success', title, message);
  };

  const showError = (title: string, message?: string, action?: { label: string; onPress: () => void }) => {
    showToast('error', title, message, action);
  };

  const showWarning = (title: string, message?: string) => {
    showToast('warning', title, message);
  };

  const showInfo = (title: string, message?: string) => {
    showToast('info', title, message);
  };

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastComponent: () => (
      <ToastNotification
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        action={toast.action}
        onDismiss={hideToast}
      />
    ),
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  dismissButton: {
    padding: 4,
  },
});