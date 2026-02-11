#!/usr/bin/env python3
import json
from datetime import datetime

# 이벤트 파일 읽기
with open('public/events.json', 'r', encoding='utf-8') as f:
    events = json.load(f)

# 2월 11-17일 이벤트에 대한 AI 코멘트
comments = {
    "toss_20260211_비농업부문고용지수(NFP)발표_ECONOMIC": "고용시장 강세 여부가 연준 금리 인하 타이밍을 결정합니다. 시장 변동성 주의",
    "toss_20260211_실업률발표_ECONOMIC": "노동시장 건강도 핵심 지표. 실업률 상승시 연준 비둘기파 전환 가능성 높아져요",
    "toss_20260211_평균임금상승률발표_ECONOMIC": "임금 인플레이션이 핵심. 상승폭 클수록 금리 인하 지연 우려 커집니다",
    "toss_earnings_034020_2026-02-11": "원전 수주 모멘텀 지속 여부가 관건. SMR과 폴란드 수주 실적 반영될 가능성",
    "cpi_2026_02_12": "이번 주 최대 이벤트. CPI 수치에 따라 연준의 금리 정책 방향이 결정되며, 증시 전반에 큰 영향을 줍니다.",
    "toss_earnings_NAS000DS6-E0_2026-02-12": "기업 IT 투자 사이클 확인 가능. AI 인프라 수요와 네트워크 장비 매출 주목",
    "toss_20260212_주간신규실업수당청구건수발표_ECONOMIC": "고용시장 단기 트렌드 체크. NFP 발표 전 선행지표로 활용됩니다",
    "toss_20260213_근원소비자물가지수발표(전년대비)_ECONOMIC": "변동성 큰 식품·에너지 제외한 기조 인플레이션. 연준이 가장 주목하는 지표",
    "toss_20260213_소비자물가지수(CPI)발표(전년대비)_ECONOMIC": "전년 대비 물가 상승률 추세 확인. 2%대 안착 여부가 금리 인하 속도 결정",
    "toss_20260213_기존주택매매건수발표_ECONOMIC": "금리 민감 부동산 섹터 건강도 체크. 매매 증가시 소비 확대 기대감 상승"
}

# 코멘트 추가
updated = False
for event in events:
    event_id = event.get('id', '')
    if event_id in comments and 'ai_comment' not in event:
        event['ai_comment'] = comments[event_id]
        updated = True
        print(f"✅ {event['title']} - 코멘트 추가")

# cpi_2026_02_12는 이미 ai_comment가 있으므로 패스
if updated or True:  # 항상 저장
    with open('public/events.json', 'w', encoding='utf-8') as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
    print(f"\n✅ events.json 업데이트 완료")
else:
    print("변경사항 없음")
