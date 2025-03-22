import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddFoodButton from '@/components/AddFoodButton';

export default function StatsScreen() {
  const [activeTab, setActiveTab] = useState('week');
  const [currentPeriod, setCurrentPeriod] = useState('Esta semana');
  
  // Dados de exemplo para os gráficos
  const weekData = {
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    datasets: [
      {
        data: [1850, 1750, 2100, 1950, 2200, 2300, 1800],
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      }
    ],
  };
  
  const monthData = {
    labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
    datasets: [
      {
        data: [1950, 2050, 1900, 2100],
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      }
    ],
  };
  
  const macroData = {
    labels: ["Proteínas", "Carboidratos", "Gorduras"],
    data: [0.8, 0.6, 0.7]
  };
  
  const nutritionData = {
    labels: ["Proteínas", "Carboidratos", "Gorduras"],
    datasets: [
      {
        data: [80, 120, 45],
        colors: [
          (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
          (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
          (opacity = 1) => `rgba(255, 209, 102, ${opacity})`,
        ]
      }
    ]
  };
  
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#2196F3"
    }
  };
  
  const width = Dimensions.get("window").width - 40;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Minhas Estatísticas</Text>
        </View>
        
        <View style={styles.periodSelector}>
          <TouchableOpacity>
            <ChevronLeft size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.periodDisplay}>
            <CalendarDays size={18} color="#666" style={styles.calendarIcon} />
            <Text style={styles.periodText}>{currentPeriod}</Text>
          </View>
          <TouchableOpacity>
            <ChevronRight size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'week' && styles.activeTab]}
            onPress={() => setActiveTab('week')}
          >
            <Text style={[styles.tabText, activeTab === 'week' && styles.activeTabText]}>Semana</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'month' && styles.activeTab]}
            onPress={() => setActiveTab('month')}
          >
            <Text style={[styles.tabText, activeTab === 'month' && styles.activeTabText]}>Mês</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Consumo de Calorias</Text>
          <LineChart
            data={activeTab === 'week' ? weekData : monthData}
            width={width}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
        
        <View style={styles.statsCards}>
          <View style={styles.statsCard}>
            <Text style={styles.statsCardTitle}>Média de Calorias</Text>
            <Text style={styles.statsCardValue}>1.950</Text>
            <Text style={styles.statsCardSubtitle}>calorias/dia</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsCardTitle}>Meta Atingida</Text>
            <Text style={styles.statsCardValue}>85%</Text>
            <Text style={styles.statsCardSubtitle}>dos dias</Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Consumo de Macronutrientes</Text>
          <BarChart
            data={nutritionData}
            width={width}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero={true}
            yAxisLabel=""
            yAxisSuffix="g"
          />
        </View>
        
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumo Nutricional</Text>
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemHeader}>
              <View style={[styles.macroIndicator, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.summaryItemTitle}>Proteínas</Text>
            </View>
            <Text style={styles.summaryItemValue}>80g / 120g</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemHeader}>
              <View style={[styles.macroIndicator, { backgroundColor: '#4ECDC4' }]} />
              <Text style={styles.summaryItemTitle}>Carboidratos</Text>
            </View>
            <Text style={styles.summaryItemValue}>120g / 200g</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemHeader}>
              <View style={[styles.macroIndicator, { backgroundColor: '#FFD166' }]} />
              <Text style={styles.summaryItemTitle}>Gorduras</Text>
            </View>
            <Text style={styles.summaryItemValue}>45g / 65g</Text>
          </View>
        </View>
      </ScrollView>
      <AddFoodButton/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  periodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 5,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsCards: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  statsCardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statsCardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statsCardSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  summaryItemTitle: {
    fontSize: 16,
  },
  summaryItemValue: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 