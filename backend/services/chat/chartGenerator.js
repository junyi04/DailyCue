// 차트 템플릿 정의
export const chartTemplates = {
	weekly_emotion_trend: {
		type: 'line',
		options: { 
			responsive: true, 
			maintainAspectRatio: false,
			plugins: {
				title: {
					display: true,
					text: '주간 감정 변화 추이'
				}
			}
		}
	},
	monthly_emotion_distribution: {
		type: 'bar',
		options: { 
			responsive: true, 
			maintainAspectRatio: false,
			plugins: {
				title: {
					display: true,
					text: '월간 감정 분포'
				}
			}
		}
	},
	daily_emotion_ratio: {
		type: 'pie',
		options: { 
			responsive: true, 
			maintainAspectRatio: false,
			plugins: {
				title: {
					display: true,
					text: '일일 감정 비율'
				}
			}
		}
	},
	emotion_comparison: {
		type: 'radar',
		options: { 
			responsive: true, 
			maintainAspectRatio: false,
			plugins: {
				title: {
					display: true,
					text: '감정 비교 분석'
				}
			}
		}
	}
};

// 규칙 기반 차트 타입 선택
export function selectChartTypeByRule(question) {
	const q = question.toLowerCase();
	
	// 변화/추이 관련
	if (q.includes('변화') || q.includes('추이') || q.includes('흐름') || q.includes('패턴')) {
		return 'line';
	}
	
	// 분포/빈도 관련
	if (q.includes('분포') || q.includes('빈도') || q.includes('얼마나') || q.includes('몇번')) {
		return 'bar';
	}
	
	// 비율/구성 관련
	if (q.includes('비율') || q.includes('구성') || q.includes('퍼센트') || q.includes('비중')) {
		return 'pie';
	}
	
	// 비교/대조 관련
	if (q.includes('비교') || q.includes('대조') || q.includes('vs') || q.includes('대비')) {
		return 'radar';
	}
	
	// 기본값
	return 'line';
}

// 차트 데이터 생성 함수
export function generateChartData(emotionData, chartType, isSingleDay = null) {
	if (!emotionData || emotionData.length === 0) {
		return {
			type: 'message',
			message: '해당 기간에 차트를 생성할 수 있는 데이터가 없습니다.',
			noData: true
		};
	}

	switch (chartType) {
		case 'line':
			return generateLineChart(emotionData, isSingleDay);
		case 'bar':
			return generateBarChart(emotionData);
		case 'pie':
			return generatePieChart(emotionData);
		case 'radar':
			return generateRadarChart(emotionData);
		default:
			return generateLineChart(emotionData, isSingleDay);
	}
}

// 선 그래프 생성 (감정 변화 추이)
function generateLineChart(emotionData, isSingleDay = null) {
	const sortedData = emotionData.sort((a, b) => new Date(a.created_at || a.date) - new Date(b.created_at || b.date));
	
	// 라벨과 데이터 생성 함수 - 기간에 따라 다르게 처리
	const generateChartData = (data, isSingleDayParam = null) => {
		if (data.length === 0) return { labels: [], values: [] };
		
		// AI가 조회한 실제 데이터의 날짜 범위를 기준으로 판단
		// created_at을 기준으로 한국 시간으로 변환하여 실제 기록된 날짜 확인
		const actualDates = new Set();
		data.forEach(item => {
			if (item.created_at) {
				try {
					// UTC 문자열을 정확히 파싱하여 한국 시간으로 변환
					let utcDate;
					if (item.created_at.includes('+')) {
						// 이미 타임존 정보가 있는 경우 그대로 사용
						utcDate = new Date(item.created_at);
					} else {
						// 타임존 정보가 없는 경우 Z 추가
						utcDate = new Date(item.created_at + 'Z');
					}
					
					// 유효한 날짜인지 확인
					if (isNaN(utcDate.getTime())) {
						console.warn('📊 잘못된 날짜 형식:', item.created_at);
						return;
					}
					
					// UTC를 한국 시간(KST, UTC+9)으로 변환
					const kstTime = utcDate.getTime() + (9 * 60 * 60 * 1000);
					const kstDate = new Date(kstTime);
					const dateKey = kstDate.toISOString().split('T')[0];
					actualDates.add(dateKey);
				} catch (error) {
					console.warn('📊 날짜 변환 오류:', error, item.created_at);
				}
			}
		});
		
		const uniqueActualDates = Array.from(actualDates).sort();
		console.log('📊 차트 생성 디버그:', {
			uniqueActualDates,
			actualDatesCount: uniqueActualDates.length,
			dataLength: data.length,
			rawData: data.map(item => ({
				created_at: item.created_at,
				date: item.date,
				fatigue: item.fatigue
			}))
		});
		
		// dateRange 정보가 있으면 우선 사용, 없으면 실제 기록된 날짜로 판단
		const isSameDay = isSingleDayParam !== null ? isSingleDayParam : uniqueActualDates.length === 1;
		
		if (isSameDay) {
			// 하루 데이터: 시간으로 표시, 개별 값 사용 (한국 시간으로 변환)
			return {
				labels: data.map(item => {
					if (item.created_at) {
						try {
							// created_at이 있는 경우 시간 추출
							// UTC 문자열을 정확히 파싱하여 한국 시간으로 변환
							let utcDate;
							if (item.created_at.includes('+')) {
								// 이미 타임존 정보가 있는 경우 그대로 사용
								utcDate = new Date(item.created_at);
							} else {
								// 타임존 정보가 없는 경우 Z 추가
								utcDate = new Date(item.created_at + 'Z');
							}
							
							// 유효한 날짜인지 확인
							if (isNaN(utcDate.getTime())) {
								console.warn('📊 잘못된 날짜 형식:', item.created_at);
								return `기록 ${data.indexOf(item) + 1}`;
							}
							
							// UTC를 한국 시간(KST, UTC+9)으로 변환
							const kstTime = utcDate.getTime() + (9 * 60 * 60 * 1000);
							const kstDate = new Date(kstTime);
							const hours = kstDate.getUTCHours().toString().padStart(2, '0');
							const minutes = kstDate.getUTCMinutes().toString().padStart(2, '0');
							
							
							return `${hours}:${minutes}`;
						} catch (error) {
							console.warn('📊 시간 변환 오류:', error, item.created_at);
							return `기록 ${data.indexOf(item) + 1}`;
						}
					} else {
						// date만 있는 경우 시간 정보가 없으므로 순서로 표시
						return `기록 ${data.indexOf(item) + 1}`;
					}
				}),
				values: data.map(item => item.fatigue || 0)
			};
		} else if (uniqueActualDates.length >= 5 && uniqueActualDates.length <= 7) {
			// 일주일 데이터: 요일별 평균값 사용
			const dayOfWeekGroups = {};
			const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
			
			data.forEach(item => {
				if (item.created_at) {
					// UTC 문자열을 정확히 파싱하여 한국 시간으로 변환
					const utcDate = new Date(item.created_at + 'Z');
					// UTC를 한국 시간(KST, UTC+9)으로 변환
					const kstTime = utcDate.getTime() + (9 * 60 * 60 * 1000);
					const kstDate = new Date(kstTime);
					const dayOfWeek = kstDate.getDay(); // 0=일요일, 1=월요일, ...
					const dayName = dayNames[dayOfWeek];
					
					if (!dayOfWeekGroups[dayName]) {
						dayOfWeekGroups[dayName] = [];
					}
					dayOfWeekGroups[dayName].push(item);
				}
			});
			
			// 월요일부터 금요일까지 순서대로 정렬
			const weekOrder = ['월', '화', '수', '목', '금'];
			const labels = [];
			const values = [];
			
			weekOrder.forEach(dayName => {
				if (dayOfWeekGroups[dayName]) {
					const dayData = dayOfWeekGroups[dayName];
					const avgFatigue = dayData.reduce((sum, item) => sum + (item.fatigue || 0), 0) / dayData.length;
					
					labels.push(dayName);
					values.push(Math.round(avgFatigue * 10) / 10);
				}
			});
			
			return { labels, values };
		} else if (uniqueActualDates.length >= 20) {
			// 월 데이터: 주차별, 월별 또는 년도별 평균값 사용
			// 먼저 년도별로 그룹화해서 몇 개 년도인지 확인
			const yearGroups = {};
			data.forEach(item => {
				const date = new Date(item.created_at || item.date);
				// UTC를 한국 시간(KST, UTC+9)으로 변환
				const kstTime = date.getTime() + (9 * 60 * 60 * 1000);
				const kstDate = new Date(kstTime);
				const year = kstDate.getFullYear();
				const yearKey = `${year}년`;
				
				if (!yearGroups[yearKey]) {
					yearGroups[yearKey] = [];
				}
				yearGroups[yearKey].push(item);
			});
			
			const uniqueYears = Object.keys(yearGroups).sort();
			
			if (uniqueYears.length >= 2) {
				// 여러 년도 데이터: 년도별 평균값 사용
				const labels = [];
				const values = [];
				
				uniqueYears.forEach(yearKey => {
					const yearData = yearGroups[yearKey];
					const avgFatigue = yearData.reduce((sum, item) => sum + (item.fatigue || 0), 0) / yearData.length;
					
					// "2024년" -> "2024"로 표시
					const yearName = yearKey.split('년')[0];
					labels.push(yearName);
					values.push(Math.round(avgFatigue * 10) / 10);
				});
				
				return { labels, values };
			} else {
				// 단일 년도 데이터: 월별 또는 주차별 평균값 사용
				// 먼저 월별로 그룹화해서 몇 개월인지 확인
				const monthGroups = {};
				data.forEach(item => {
					const date = new Date(item.created_at || item.date);
					// UTC를 한국 시간(KST, UTC+9)으로 변환
					const kstTime = date.getTime() + (9 * 60 * 60 * 1000);
					const kstDate = new Date(kstTime);
					const year = kstDate.getFullYear();
					const month = kstDate.getMonth() + 1;
					const monthKey = `${year}년 ${month}월`;
					
					if (!monthGroups[monthKey]) {
						monthGroups[monthKey] = [];
					}
					monthGroups[monthKey].push(item);
				});
				
				const uniqueMonths = Object.keys(monthGroups).sort();
				
				if (uniqueMonths.length >= 2) {
					// 여러 월 데이터: 월별 평균값 사용
					const labels = [];
					const values = [];
					
					uniqueMonths.forEach(monthKey => {
						const monthData = monthGroups[monthKey];
						const avgFatigue = monthData.reduce((sum, item) => sum + (item.fatigue || 0), 0) / monthData.length;
						
						// "2024년 10월" -> "10월"로 표시
						const monthName = monthKey.split('년 ')[1];
						labels.push(monthName);
						values.push(Math.round(avgFatigue * 10) / 10);
					});
					
					return { labels, values };
				} else {
				// 단일 월 데이터: 주차별 평균값 사용
				const weekGroups = {};
				
				data.forEach(item => {
					const date = new Date(item.created_at || item.date);
					// UTC를 한국 시간(KST, UTC+9)으로 변환
					const kstTime = date.getTime() + (9 * 60 * 60 * 1000);
					const kstDate = new Date(kstTime);
					const year = kstDate.getFullYear();
					const month = kstDate.getMonth();
					const day = kstDate.getDate();
					
					// 해당 월의 첫 번째 날을 기준으로 주차 계산
					const firstDayOfMonth = new Date(year, month, 1);
					const firstMonday = new Date(firstDayOfMonth);
					const dayOfWeek = firstDayOfMonth.getDay();
					const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
					firstMonday.setDate(firstDayOfMonth.getDate() - daysToMonday);
					
					// 현재 날짜가 몇 주차인지 계산
					const daysDiff = Math.floor((kstDate - firstMonday) / (1000 * 60 * 60 * 24));
					const weekNumber = Math.floor(daysDiff / 7) + 1;
					
					const weekKey = `${weekNumber}주차`;
					if (!weekGroups[weekKey]) {
						weekGroups[weekKey] = [];
					}
					weekGroups[weekKey].push(item);
				});
				
				// 1주차부터 4주차까지 순서대로 정렬
				const labels = [];
				const values = [];
				
				for (let week = 1; week <= 4; week++) {
					const weekKey = `${week}주차`;
					if (weekGroups[weekKey]) {
						const weekData = weekGroups[weekKey];
						const avgFatigue = weekData.reduce((sum, item) => sum + (item.fatigue || 0), 0) / weekData.length;
						
						labels.push(weekKey);
						values.push(Math.round(avgFatigue * 10) / 10);
					}
				}
				
				return { labels, values };
				}
			}
		} else {
			// 여러 일 데이터: 날짜로 표시, 일별 평균값 사용
			// 실제 기록된 날짜별로 그룹화
			const dateGroups = {};
			data.forEach(item => {
				if (item.created_at) {
					const date = new Date(item.created_at);
					// UTC를 한국 시간(KST, UTC+9)으로 변환
					const kstTime = date.getTime() + (9 * 60 * 60 * 1000);
					const kstDate = new Date(kstTime);
					const dateKey = kstDate.toISOString().split('T')[0];
					
					if (!dateGroups[dateKey]) {
						dateGroups[dateKey] = [];
					}
					dateGroups[dateKey].push(item);
				}
			});
			
			const labels = [];
			const values = [];
			
			uniqueActualDates.forEach(dateKey => {
				const dayData = dateGroups[dateKey] || [];
				const date = new Date(dateKey);
				const month = date.getMonth() + 1;
				const day = date.getDate();
				
				// 일별 평균 피로도 계산
				const avgFatigue = dayData.reduce((sum, item) => sum + (item.fatigue || 0), 0) / dayData.length;
				
				labels.push(`${month}월 ${day}일`);
				values.push(Math.round(avgFatigue * 10) / 10); // 소수점 첫째자리까지
			});
			
			return { labels, values };
		}
	};
	
	const chartData = generateChartData(sortedData, isSingleDay);
	
	// Y축 범위 설정 (1~5)
	const yAxisOptions = {
		scales: {
			y: {
				min: 1,
				max: 5,
				ticks: {
					stepSize: 1
				}
			}
		}
	};
	
	return {
		type: 'line',
		data: {
			labels: chartData.labels,
			datasets: [{
				label: '피로도',
				data: chartData.values,
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(255, 99, 132, 0.2)',
				tension: 0.1
			}]
		},
		options: {
			...chartTemplates.weekly_emotion_trend.options,
			...yAxisOptions
		}
	};
}

// 막대 그래프 생성 (감정 분포)
function generateBarChart(emotionData) {
	const emotionCounts = emotionData.reduce((acc, item) => {
		const emotion = item.emotion || '정보없음';
		acc[emotion] = (acc[emotion] || 0) + 1;
		return acc;
	}, {});

	const emotions = Object.keys(emotionCounts);
	const counts = Object.values(emotionCounts);

	return {
		type: 'bar',
		data: {
			labels: emotions,
			datasets: [{
				label: '빈도',
				data: counts,
				backgroundColor: [
					'rgba(255, 99, 132, 0.8)',
					'rgba(54, 162, 235, 0.8)',
					'rgba(255, 205, 86, 0.8)',
					'rgba(75, 192, 192, 0.8)',
					'rgba(153, 102, 255, 0.8)'
				]
			}]
		},
		options: chartTemplates.monthly_emotion_distribution.options
	};
}

// 원형 그래프 생성 (감정 비율)
function generatePieChart(emotionData) {
	const emotionCounts = emotionData.reduce((acc, item) => {
		const emotion = item.emotion || '정보없음';
		acc[emotion] = (acc[emotion] || 0) + 1;
		return acc;
	}, {});

	const emotions = Object.keys(emotionCounts);
	const counts = Object.values(emotionCounts);

	return {
		type: 'pie',
		data: {
			labels: emotions,
			datasets: [{
				data: counts,
				backgroundColor: [
					'rgba(255, 99, 132, 0.8)',
					'rgba(54, 162, 235, 0.8)',
					'rgba(255, 205, 86, 0.8)',
					'rgba(75, 192, 192, 0.8)',
					'rgba(153, 102, 255, 0.8)'
				]
			}]
		},
		options: chartTemplates.daily_emotion_ratio.options
	};
}

// 레이더 차트 생성 (감정 비교)
function generateRadarChart(emotionData) {
	const emotionCounts = emotionData.reduce((acc, item) => {
		const emotion = item.emotion || '정보없음';
		acc[emotion] = (acc[emotion] || 0) + 1;
		return acc;
	}, {});

	const emotions = Object.keys(emotionCounts);
	const counts = Object.values(emotionCounts);

	return {
		type: 'radar',
		data: {
			labels: emotions,
			datasets: [{
				label: '감정 빈도',
				data: counts,
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(255, 99, 132, 0.2)'
			}]
		},
		options: chartTemplates.emotion_comparison.options
	};
}

// 통합 차트 생성 함수 (하이브리드 방식)
export function generateEmotionChart(emotionData, question, dateRange = null) {
	// 🚨 데이터 검증: 가짜 데이터 생성 방지
	if (!emotionData || emotionData.length === 0) {
		console.log('📊 차트 생성: 데이터가 없어서 메시지 반환');
		return {
			type: 'message',
			message: '해당 기간에 차트를 생성할 수 있는 데이터가 없습니다.',
			noData: true
		};
	}

	// 🚨 데이터 무결성 검증
	const validData = emotionData.filter(item => {
		// 필수 필드가 있는지 확인
		if (!item.date || !item.fatigue) {
			console.warn('📊 차트 생성: 유효하지 않은 데이터 필터링됨', item);
			return false;
		}
		// 날짜 형식 검증
		if (isNaN(new Date(item.date).getTime())) {
			console.warn('📊 차트 생성: 잘못된 날짜 형식 필터링됨', item.date);
			return false;
		}
		return true;
	});

	if (validData.length === 0) {
		console.log('📊 차트 생성: 유효한 데이터가 없어서 메시지 반환');
		return {
			type: 'message',
			message: '해당 기간에 유효한 데이터가 없어서 차트를 생성할 수 없습니다.',
			noData: true
		};
	}

	// dateRange를 활용해서 하루 데이터인지 판단
	let isSingleDay = false;
	if (dateRange) {
		const [startDate, endDate] = dateRange.split(' ~ ');
		isSingleDay = startDate === endDate;
		console.log('📊 dateRange 분석:', { dateRange, startDate, endDate, isSingleDay });
	}
	
	// 규칙 기반으로 차트 타입 선택
	const chartType = selectChartTypeByRule(question);
	
	// 차트 데이터 생성 (유효한 데이터만 사용, dateRange 정보 전달)
	const chartData = generateChartData(validData, chartType, isSingleDay);
	
	return chartData;
}
