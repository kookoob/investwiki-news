/**
 * 주요 경제지표 상세 설명
 * 토스증권 참고하여 작성
 */

interface IndicatorInfo {
  name: string;
  fullName: string;
  description: string;
  importance: string;
  impact: string;
  interpretation: string;
}

export const ECONOMIC_INDICATORS: { [key: string]: IndicatorInfo } = {
  'CPI': {
    name: 'CPI',
    fullName: '소비자물가지수(CPI, Consumer Price Index)',
    description: '소비자들이 구매하는 상품과 서비스의 가격이 1년전과 비교해 얼마나 변했는지 보여주는 지표예요.',
    importance: '중앙은행은 물가를 잡기 위해 금리를 올리거나 내리는데, 만약 CPI가 그 감상의 핵심 근거가 돼요. CPI가 높게 나오면 중앙은행이 금리를 올릴 것이다는 예상이 강해지면서 채권이나 주식 시장에 악재로 작용할 수 있어요.',
    impact: '중앙은행 금리 정책의 핵심 지표',
    interpretation: '시장 예상치보다 높게 나오면 인플레이션 압력 강화를 의미하며, 중앙은행의 긴축 가능성 증가. 주식 시장엔 부정적 요인으로 작용할 수 있어요. 반대로 낮게 나오면 긍정적 시그널로 해석돼요.'
  },
  
  'PPI': {
    name: 'PPI',
    fullName: '생산자물가지수(PPI, Producer Price Index)',
    description: '생산자들이 판매하는 상품의 가격 변화를 측정하는 지표예요. CPI보다 앞서 발표되어 소비자물가 전망에 참고돼요.',
    importance: 'PPI 상승은 향후 CPI 상승으로 이어질 가능성이 높아 선행지표로 활용돼요.',
    impact: '소비자물가(CPI)의 선행지표',
    interpretation: '예상보다 높으면 향후 인플레이션 압력 증가 신호. 낮으면 물가 안정 기대감 상승.'
  },
  
  'NFP': {
    name: 'NFP',
    fullName: '비농업부문 고용지수(NFP, Non-Farm Payrolls)',
    description: '미국에서 농업 부문을 제외한 모든 산업의 고용 변화를 보여주는 지표예요. 매달 첫 번째 금요일에 발표되며, 미국 고용시장의 건강도를 가장 직접적으로 보여줘요.',
    importance: '미국 노동통계국(BLS)에서 매월 발표하는 가장 중요한 경제지표 중 하나. 금리 정책과 주식 시장에 큰 영향을 미쳐요.',
    impact: '금리 정책 및 주식시장의 핵심 변수',
    interpretation: '예상보다 고용이 많이 늘면 경제가 강하다는 신호지만, 인플레이션 우려로 금리 인상 압력 증가. 반대로 고용이 적게 늘면 경기 둔화 우려가 커져요.'
  },
  
  'PCE': {
    name: 'PCE',
    fullName: '개인소비지출(PCE, Personal Consumption Expenditures)',
    description: '개인들의 소비 지출 변화를 측정하는 지표예요. 연준(Fed)이 가장 중시하는 인플레이션 지표예요.',
    importance: '연준이 CPI보다 PCE를 더 중요하게 봐요. 특히 Core PCE(근원 PCE)는 식품과 에너지를 제외해서 더 안정적인 물가 흐름을 보여줘요.',
    impact: '연준의 금리 결정에 가장 큰 영향',
    interpretation: '목표치(2%)보다 높으면 금리 인상 압력, 낮으면 금리 인하 기대감 상승.'
  },
  
  'RETAIL_SALES': {
    name: '소매판매',
    fullName: '소매판매(Retail Sales)',
    description: '소매점에서 판매된 상품의 총액을 측정하는 지표예요. 소비자 지출 동향을 보여주며, GDP의 약 70%를 차지하는 소비 부문의 건강도를 나타내요.',
    importance: '미국 경제의 가장 큰 부분인 소비 동향을 직접 보여주는 지표.',
    impact: '경기 회복/둔화 판단의 주요 지표',
    interpretation: '예상보다 높으면 소비 강세 → 경기 호조. 낮으면 소비 약세 → 경기 둔화 우려.'
  },
  
  'GDP': {
    name: 'GDP',
    fullName: '국내총생산(GDP, Gross Domestic Product)',
    description: '한 나라에서 일정 기간 생산된 모든 재화와 서비스의 가치를 합한 지표예요. 경제 성장률을 가장 포괄적으로 보여줘요.',
    importance: '경제 전반의 건강도를 보여주는 최종 지표. 분기마다 발표돼요.',
    impact: '경제 성장률의 종합 판단',
    interpretation: '예상보다 높으면 경기 호조, 낮으면 경기 둔화. 단, 후행성이 강해 시장 반응은 제한적일 수 있어요.'
  },
  
  'ISM': {
    name: 'ISM',
    fullName: 'ISM 제조업/서비스업 구매관리자지수(ISM PMI)',
    description: '미국 제조업과 서비스업 구매 담당자들을 대상으로 한 설문조사 결과예요. 50 이상이면 확장, 50 이하면 위축을 의미해요.',
    importance: '빠르게 발표되어 경기 흐름을 선행적으로 보여줘요. 특히 서비스업 ISM은 미국 경제의 80%를 차지해 중요해요.',
    impact: '경기 선행지표',
    interpretation: '50 이상이면 경기 확장, 이하면 위축. 예상보다 높으면 긍정적, 낮으면 부정적.'
  },
  
  'UNEMPLOYMENT': {
    name: '실업률',
    fullName: '실업률(Unemployment Rate)',
    description: '경제활동인구 중 실업자가 차지하는 비율이예요. 노동시장의 건강도를 보여주는 핵심 지표예요.',
    importance: 'NFP와 함께 발표되며, 고용시장의 또 다른 측면을 보여줘요.',
    impact: '노동시장 건강도 측정',
    interpretation: '실업률이 낮으면 노동시장 강세, 높으면 약세. 단, 너무 낮으면 인플레이션 우려로 금리 인상 압력이 될 수도 있어요.'
  },
  
  'FOMC': {
    name: 'FOMC',
    fullName: '연방공개시장위원회(FOMC, Federal Open Market Committee)',
    description: '미국 연방준비제도(Fed)의 금리 결정 회의예요. 기준금리 변경 여부와 향후 통화정책 방향을 결정해요.',
    importance: '전 세계 금융시장에 가장 큰 영향을 미치는 이벤트 중 하나.',
    impact: '글로벌 금리 및 환율, 주식시장 변동의 핵심',
    interpretation: '금리 인상이면 달러 강세/주식 약세, 금리 인하면 달러 약세/주식 강세 경향. 단, 시장 예상과 비교해서 해석해야 해요.'
  },
  
  'JOLTS': {
    name: 'JOLTs',
    fullName: '노동시장 신규 구인건수(JOLTs, Job Openings and Labor Turnover Survey)',
    description: '기업들이 새로 채용하려는 일자리 수를 측정해요. 노동시장의 수요를 보여주는 선행지표예요.',
    importance: '실제 고용(NFP)보다 앞서 노동시장 수요를 보여줘요.',
    impact: '노동시장 수요 측정',
    interpretation: '구인건수가 많으면 노동시장 강세 → 임금 상승 압력 → 인플레이션 우려 증가.'
  },
  
  'HOUSING': {
    name: '주택',
    fullName: '주택 관련 지표(Housing Starts, Existing Home Sales)',
    description: '신규 주택 착공 건수와 기존 주택 판매량을 측정해요. 부동산 시장과 소비자 신뢰도를 보여줘요.',
    importance: '금리에 민감한 부동산 시장 동향을 보여줘요. 경기 선행성이 강해요.',
    impact: '부동산 시장 및 경기 선행지표',
    interpretation: '주택 판매/착공 증가는 경기 회복 신호, 감소는 경기 둔화 신호.'
  },
  
  'MICHIGAN': {
    name: '미시간대 소비자심리지수',
    fullName: '미시간대 소비자심리지수(University of Michigan Consumer Sentiment Index)',
    description: '미시간대학에서 소비자들을 대상으로 조사한 경제 전망 지수예요. 소비자들의 심리를 측정해요.',
    importance: '소비자 신뢰도와 향후 소비 전망을 보여줘요.',
    impact: '소비 심리 및 경기 전망',
    interpretation: '지수 상승은 소비 심리 개선 → 경기 회복 기대, 하락은 소비 위축 우려.'
  }
};

/**
 * 이벤트 제목에서 지표 키워드 추출
 */
export function getIndicatorInfo(title: string): IndicatorInfo | null {
  const titleUpper = title.toUpperCase();
  
  // CPI 관련
  if (titleUpper.includes('CPI') || titleUpper.includes('소비자물가')) {
    return ECONOMIC_INDICATORS['CPI'];
  }
  
  // PPI 관련
  if (titleUpper.includes('PPI') || titleUpper.includes('생산자물가')) {
    return ECONOMIC_INDICATORS['PPI'];
  }
  
  // NFP 관련
  if (titleUpper.includes('NFP') || titleUpper.includes('비농업') || titleUpper.includes('고용지수')) {
    return ECONOMIC_INDICATORS['NFP'];
  }
  
  // PCE 관련
  if (titleUpper.includes('PCE') || titleUpper.includes('개인소비지출')) {
    return ECONOMIC_INDICATORS['PCE'];
  }
  
  // 소매판매
  if (titleUpper.includes('RETAIL') || titleUpper.includes('소매판매')) {
    return ECONOMIC_INDICATORS['RETAIL_SALES'];
  }
  
  // GDP
  if (titleUpper.includes('GDP') || titleUpper.includes('국내총생산')) {
    return ECONOMIC_INDICATORS['GDP'];
  }
  
  // ISM
  if (titleUpper.includes('ISM') || titleUpper.includes('구매관리자')) {
    return ECONOMIC_INDICATORS['ISM'];
  }
  
  // 실업률
  if (titleUpper.includes('실업') && !titleUpper.includes('신규')) {
    return ECONOMIC_INDICATORS['UNEMPLOYMENT'];
  }
  
  // FOMC
  if (titleUpper.includes('FOMC') || titleUpper.includes('연방공개시장') || titleUpper.includes('금리 결정')) {
    return ECONOMIC_INDICATORS['FOMC'];
  }
  
  // JOLTs
  if (titleUpper.includes('JOLT') || titleUpper.includes('구인건수')) {
    return ECONOMIC_INDICATORS['JOLTS'];
  }
  
  // 주택
  if (titleUpper.includes('주택') || titleUpper.includes('HOUSING')) {
    return ECONOMIC_INDICATORS['HOUSING'];
  }
  
  // 미시간대
  if (titleUpper.includes('미시간') || titleUpper.includes('MICHIGAN')) {
    return ECONOMIC_INDICATORS['MICHIGAN'];
  }
  
  return null;
}
