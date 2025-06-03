import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonItem({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#e2e8f0',
          opacity,
        },
        style,
      ]}
    />
  );
}

// Skeleton for Home Screen
export function HomeScreenSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonItem width="60%" height={28} borderRadius={6} />
        <SkeletonItem width="40%" height={20} borderRadius={4} style={{ marginTop: 8 }} />
      </View>

      {/* Calories Summary Skeleton */}
      <View style={styles.card}>
        <SkeletonItem width="50%" height={22} borderRadius={4} style={{ marginBottom: 16 }} />
        <View style={styles.caloriesRow}>
          <View style={styles.calorieItem}>
            <SkeletonItem width={60} height={28} borderRadius={6} />
            <SkeletonItem width={80} height={16} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
          <View style={styles.calorieItem}>
            <SkeletonItem width={60} height={28} borderRadius={6} />
            <SkeletonItem width={80} height={16} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
          <View style={styles.calorieItem}>
            <SkeletonItem width={60} height={28} borderRadius={6} />
            <SkeletonItem width={80} height={16} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
        </View>
      </View>

      {/* Macros Skeleton */}
      <View style={styles.card}>
        <SkeletonItem width="40%" height={22} borderRadius={4} style={{ marginBottom: 16 }} />
        <View style={styles.macrosRow}>
          <View style={styles.macroItem}>
            <SkeletonItem width={40} height={24} borderRadius={6} />
            <SkeletonItem width={80} height={16} borderRadius={4} style={{ marginTop: 8 }} />
            <SkeletonItem width="80%" height={4} borderRadius={2} style={{ marginTop: 8 }} />
          </View>
          <View style={styles.macroItem}>
            <SkeletonItem width={40} height={24} borderRadius={6} />
            <SkeletonItem width={80} height={16} borderRadius={4} style={{ marginTop: 8 }} />
            <SkeletonItem width="80%" height={4} borderRadius={2} style={{ marginTop: 8 }} />
          </View>
          <View style={styles.macroItem}>
            <SkeletonItem width={40} height={24} borderRadius={6} />
            <SkeletonItem width={80} height={16} borderRadius={4} style={{ marginTop: 8 }} />
            <SkeletonItem width="80%" height={4} borderRadius={2} style={{ marginTop: 8 }} />
          </View>
        </View>
      </View>

      {/* Food Items Skeleton */}
      <View style={styles.card}>
        <SkeletonItem width="50%" height={22} borderRadius={4} style={{ marginBottom: 16 }} />
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.foodItem}>
            <SkeletonItem width={48} height={48} borderRadius={8} />
            <View style={styles.foodInfo}>
              <SkeletonItem width="70%" height={18} borderRadius={4} />
              <SkeletonItem width="90%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
            </View>
            <SkeletonItem width={60} height={18} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

// Skeleton for Stats Screen
export function StatsScreenSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonItem width="60%" height={32} borderRadius={6} />
        <SkeletonItem width="50%" height={18} borderRadius={4} style={{ marginTop: 8 }} />
      </View>

      {/* Date Selector Skeleton */}
      <View style={styles.dateSelector}>
        <SkeletonItem width={24} height={24} borderRadius={12} />
        <SkeletonItem width="60%" height={20} borderRadius={4} />
        <SkeletonItem width={24} height={24} borderRadius={12} />
      </View>

      {/* Calorie Card Skeleton */}
      <View style={styles.card}>
        <SkeletonItem width="40%" height={22} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonItem width="60%" height={16} borderRadius={4} style={{ marginBottom: 16 }} />
        
        {/* Progress Bar */}
        <SkeletonItem width="100%" height={12} borderRadius={6} style={{ marginBottom: 8 }} />
        <View style={styles.progressLabels}>
          <SkeletonItem width={60} height={16} borderRadius={4} />
          <SkeletonItem width={60} height={16} borderRadius={4} />
        </View>
      </View>

      {/* Chart Skeleton */}
      <View style={styles.card}>
        <SkeletonItem width="50%" height={22} borderRadius={4} style={{ marginBottom: 16 }} />
        <SkeletonItem width="100%" height={220} borderRadius={12} />
      </View>

      {/* Macros Chart Skeleton */}
      <View style={styles.card}>
        <SkeletonItem width="60%" height={22} borderRadius={4} style={{ marginBottom: 16 }} />
        <SkeletonItem width="100%" height={220} borderRadius={12} style={{ marginBottom: 20 }} />
        
        {/* Macro Items */}
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.macroListItem}>
            <SkeletonItem width={12} height={12} borderRadius={6} />
            <SkeletonItem width="30%" height={18} borderRadius={4} />
            <SkeletonItem width={40} height={18} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

// Generic Skeleton Components
export function CardSkeleton({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function ListItemSkeleton() {
  return (
    <View style={styles.foodItem}>
      <SkeletonItem width={48} height={48} borderRadius={8} />
      <View style={styles.foodInfo}>
        <SkeletonItem width="70%" height={18} borderRadius={4} />
        <SkeletonItem width="90%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
      <SkeletonItem width={60} height={18} borderRadius={4} />
    </View>
  );
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return <SkeletonItem width="100%" height={height} borderRadius={12} />;
}

export { SkeletonItem };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calorieItem: {
    alignItems: 'center',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  foodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
});