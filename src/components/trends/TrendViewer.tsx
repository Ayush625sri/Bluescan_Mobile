import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { getPollutionTrends } from '../../services/dataService';

interface TrendData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

const TrendViewer: React.FC = () => {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchTrendData();
  }, [timeframe]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const data = await getPollutionTrends(timeframe);
      setTrendData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load trend data. Please try again later.');
      console.error('Error fetching trend data:', err);
    } finally {
      setLoading(false);
    }
  };

  const screenWidth = Dimensions.get('window').width - 40;

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 102, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#0066FF',
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  if (error || !trendData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'No data available'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pollution Trends</Text>
      <LineChart
        data={{
          labels: trendData.labels,
          datasets: [
            {
              data: trendData.datasets[0].data,
              color: (opacity = 1) => `rgba(0, 102, 255, ${opacity})`,
              strokeWidth: 2
            }
          ],
          legend: ['Pollution Level']
        }}
        width={screenWidth}
        height={220}
        yAxisLabel=""
        yAxisSuffix="%"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.max(...trendData.datasets[0].data)}%
          </Text>
          <Text style={styles.statLabel}>Highest</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.min(...trendData.datasets[0].data)}%
          </Text>
          <Text style={styles.statLabel}>Lowest</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {(trendData.datasets[0].data.reduce((a, b) => a + b, 0) / trendData.datasets[0].data.length).toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
});

export default TrendViewer;