import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

const ChartDetailScreen = () => {
  const { chartData, chartTitle } = useLocalSearchParams();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // 차트 데이터 파싱
  const parsedChartData = chartData ? JSON.parse(chartData as string) : null;

  if (!parsedChartData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>차트 상세</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>차트 데이터를 불러올 수 없습니다.</Text>
        </View>
      </View>
    );
  }

  // 차트 설정
  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`, // 더 선명한 파란색
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "3",
      stroke: COLORS.primary,
    },
    propsForLabels: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    propsForVerticalLabels: {
      fontSize: 12,
      fontWeight: '600',
      color: '#2c3e50',
    },
    propsForHorizontalLabels: {
      fontSize: 12,
      fontWeight: '600',
      color: '#2c3e50',
    },
  };

  // 차트 렌더링
  const renderChart = () => {
    const chartWidth = screenWidth - 60; // 좌우 여백 증가
    const chartHeight = screenHeight * 0.45; // 높이를 줄여서 더 적절하게

    switch (parsedChartData.type) {
      case 'line':
        return (
          <LineChart
            data={parsedChartData.data}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
      
      case 'bar':
        return (
          <BarChart
            data={parsedChartData.data}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            yAxisLabel=""
            yAxisSuffix=""
            style={styles.chart}
          />
        );
      
      case 'pie':
        return (
          <PieChart
            data={parsedChartData.data}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        );
      
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>지원하지 않는 차트 타입입니다.</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{chartTitle || '차트 상세'}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 차트 컨테이너 */}
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    paddingTop: 50, // 상태바 고려
    backgroundColor: '#3498db', // 명시적 파란색
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 80, // 최소 높이 보장
  },
  backButton: {
    padding: SIZES.small,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    marginRight: SIZES.small,
    minWidth: 50,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 40,
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large,
    backgroundColor: '#f8f9fa',
    marginHorizontal: SIZES.medium,
    marginVertical: SIZES.small,
    borderRadius: SIZES.large,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  chart: {
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large,
    backgroundColor: COLORS.lightGray,
    margin: SIZES.medium,
    borderRadius: SIZES.large,
  },
  errorText: {
    ...FONTS.h4,
    color: COLORS.gray,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ChartDetailScreen;
