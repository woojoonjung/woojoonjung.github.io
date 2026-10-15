# Dr.Snap portfolio content plan

2026-09-13 · 최종 발표자료를 바탕으로 한 페이지 구성안

## 페이지가 전달할 이야기

**피부 증상의 사진과 설명을 함께 받아 후보 질환을 찾고, 추가 질문으로 후보를 좁히는 문진 경험을 웹 프로토타입으로 구현했다.**

현재 자료에서 가장 구체적으로 보여줄 수 있는 역량은 사용자 경험을 단계로 설계하고, 이미지 분석·질환 정보 검색·질문 생성을 연결한 것이다. 문진 화면에서 왜 질문하는지, 답변이 어떻게 다음 단계로 연결되는지 보여주고 구현 설명으로 이를 뒷받침한다.

이 문서는 당시 PPT 24쪽과 기존 Bianca·Silverlining 페이지, Dr.Snap 페이지 초안 및 미디어 파일을 대조한 편집 계획이다. PPT에 포함된 프롬프트와 작성 문구는 당시 구현을 설명하는 자료로 취급했다. 영문 제목·문장은 제안 초안이며, 개인 역할과 평가 조건은 확인 후 반영한다. 이번 단계는 구성 계획이며 웹페이지 구현은 포함하지 않는다.

## 기존 사이트와 맞출 형식

- 본문은 기존 사례와 같은 영어를 사용한다. 이 계획의 설명과 근거 메모는 한국어로 작성한다.
- Hero는 프로젝트명, 질문형 한 문장, 짧은 요약, 상태·기간·기여도, 대표 이미지의 기존 구성을 따른다.
- 본문은 작은 번호 라벨, 좌측 큰 제목과 우측 설명, 그 아래 넓은 시각 자료로 이어지는 공통 형식을 유지한다.
- 현재 Dr.Snap의 7개 임시 섹션을 아래 6개로 재구성한다. Bianca와 Silverlining도 프로젝트 내용에 따라 섹션 수가 다르다.
- 기여도는 Hero에 명확하게 적고, 실제 담당한 구현 설명에서 개인 작업을 구체화한다. 별도 Contribution 섹션은 중복을 줄이기 위해 생략한다.
- PPT의 목차·구분 페이지는 옮기지 않는다. 원본 UI와 단계별 영상, 웹에서 읽기 쉬운 도식과 결과 표를 사용한다.

## 전체 구성

| 순서 | 분류 / 영문 제목 제안 | 독자가 이해할 내용 | 주 자료 |
| --- | --- | --- | --- |
| Hero | How can photos and follow-up questions guide a conversation about skin concerns? | 무엇을 만들었으며 어떤 경험을 탐색했는가 | 기존 대표 이미지, PPT 7쪽 |
| 01 | Motivation / Seeking answers before a clinic visit | 어떤 사용 상황과 기존 서비스 관찰에서 출발했는가 | PPT 4–6쪽 |
| 02 | Design approach / A questionnaire shaped by the answers | 왜 사진·증상 설명·반복 문진을 하나의 흐름으로 묶었는가 | PPT 7·9·19쪽 |
| 03 | In use / A consultation in four stages | 실제 사용자는 무엇을 입력하고 어떤 응답을 받는가 | PPT 10–13쪽, 단계별 영상 4개 |
| 04 | Implementation / Connecting image analysis, retrieval, and dialogue | 어떤 기술이 각 사용자 경험을 가능하게 했는가 | PPT 15–19쪽 |
| 05 | Evaluation / What the initial tests showed | 당시 무엇을 시험했고, 어떤 성공과 실패를 확인했는가 | PPT 20쪽 |
| 06 | Reflection / The limits of the prototype | 구현 범위와 남은 질문, 다음 평가에서 확인할 점은 무엇인가 | PPT 22–23쪽, 사용자 회고 |

가장 큰 비중은 In use와 Implementation에 둔다. Motivation은 짧게 맥락을 제공하고, Design approach에서 문진의 원리를 설명한다. 독자는 실제 사용 흐름을 본 뒤 구현과 평가를 읽는다.

## Hero

**질문형 문장 제안**

How can photos and follow-up questions guide a conversation about skin concerns?

현재 초안의 “without rushing to a diagnosis”는 당시 안전성 설계가 프로젝트의 중심이었다는 인상을 줄 수 있다. PPT에서 분명하게 확인되는 사진 입력과 반복 문진을 질문의 중심에 둔다.

**요약 초안**

Dr.Snap is a web prototype that combines symptom photos and descriptions to identify candidate skin conditions. It asks follow-up questions to narrow the candidates, explains the remaining possibility, and supports further questions.

**메타 정보**

| 항목 | 제안 / 현재 근거 |
| --- | --- |
| 분야 | Interaction Design · 2024. 기존 분류를 유지하는 제안 |
| 상태 | Functional prototype. 발표의 작동 흐름과 시연 자료가 근거 |
| 기간 | 기존 페이지의 Sep.–Dec. 2024는 임시 유지 대상. PPT 본문에서 날짜를 별도로 확인하지 못함 |
| 팀 | PPT 표지와 목록 페이지에는 Woojun Jung, Youngseo Kim. 상세 페이지에는 Youngsook Hwang도 있어 확인 필요 |
| 개인 역할 | PPT에 역할별 귀속이 없어 사용자 확인 후 기재 |

**자료 배치:** 기존 DrSnap.png를 먼저 사용한다. 새 대표 화면을 선택한다면 문진과 결과의 관계가 드러나는 화면을 우선한다. 상세한 시연은 03 / In use에 배치한다.

## 01 / Motivation

**제목:** Seeking answers before a clinic visit

**내용:** PPT는 병원을 방문하기 전에 증상을 알아보고 싶은 사람들을 대상으로 제시한다. 업무시간 중 방문이 어려운 직장인, 의료 접근이 어려운 지역의 거주자, 육아를 시작한 부모라는 가정된 사용 상황을 짧게 정리한다. 이들을 인터뷰로 검증한 페르소나라고 쓰지 않는다.

5쪽의 기존 서비스 이용후기와 6쪽의 해석을 연결하되, 당시 팀이 검토한 자료라는 범위를 드러낸다. 후기 원문 출처·수집 시점·표본이 PPT에 없으므로 긴 인용이나 기존 서비스 전반에 대한 일반화는 피한다.

**본문 초안**

We focused on people who wanted to explore a skin concern before visiting a clinic. The scenarios considered in the project included difficulty finding time for an appointment, limited access to nearby care, and questions arising while caring for a child. Our review of existing services led us to explore a web experience that could accept both a photograph and a description of symptoms.

**시각 자료:** 세 인물 사진을 크게 반복하기보다, 사용 상황과 설계 방향을 잇는 짧은 비교를 배치한다. 당시 후기 출처를 확보하면 일부를 보조 근거로 추가할 수 있다.

**범위:** 접근성 향상, 서비스 품질의 일관성, 신뢰도 개선은 당시 목표다. 이 프로젝트가 실제로 그 효과를 달성했다고 쓰지 않는다.

## 02 / Design approach

**제목:** A questionnaire shaped by the answers

**핵심:** 사진과 최초 설명으로 후보 3개를 정하고, 후보 간 차이를 묻는 질문을 생성해 예/아니오 응답으로 좁혀가는 구조를 설명한다. 이후 결과의 근거를 정리하고 추가 질의로 이어진다.

**본문 초안**

The prototype begins with a photo and a short description. It identifies three candidate conditions, then asks questions about differences between them. Each answer helps narrow the candidates before the system presents an explanation. Users can continue the conversation with follow-up questions.

**시각 자료:** PPT 9쪽을 바탕으로 사용자 경험 중심의 간단한 흐름도를 새로 정리한다. 이 단계에는 코드의 함수명이나 서버 구조를 넣지 않는다.

| 단계 | 사용자의 행동 | 시스템의 반응 |
| --- | --- | --- |
| 사진과 증상 설명 | 사진 첨부, 자유로운 설명 입력 | 후보 질환 3개 생성 |
| 추가 문진 | 예/아니오 응답 | 후보 차이를 확인하며 후보 축소 |
| 결과 확인 | 설명과 문진 요약 읽기 | 남은 후보와 설명 제시 |
| 후속 질문 | 궁금한 내용 입력 | 대화 기록과 질환 정보를 활용한 답변 |

**설계 판단으로 강조할 내용:** 최초 입력 이후에도 정보를 더 수집하는 점, 답할 수 있는 질문 형식을 제한한 점, 결과에 문진에서 얻은 내용을 다시 제시하는 점이다. 중복 질문 회피와 후보 간 차이에 대한 질문은 PPT 19쪽 프롬프트에서도 확인된다. 문진이 실제 정확도나 사용자 신뢰를 높였다는 비교 결과는 별도로 확인되지 않았다.

## 03 / In use

**제목:** A consultation in four stages

**역할:** 앞에서 설명한 원리를 실제 작동 화면으로 보여준다. 네 단계를 세로로 연결하고 각 영상에 설명을 붙인다. 한국어 원본 UI는 유지하고, 영문 제목과 캡션으로 무엇을 보는지 안내한다.

| 구간 | 미디어 / 원본 길이 | 보여줄 장면 / 캡션 초안 |
| --- | --- | --- |
| 1. Describe the concern | 1_landingpage.mov / 약 17.84초 | 사진과 증상 설명 입력. “A photo and a short description start the consultation.” |
| 2. Answer follow-up questions | 2_questionaire.mov / 약 8.14초 | 추가 문진과 예/아니오 응답. “Follow-up questions help distinguish between the candidate conditions.” |
| 3. Review the explanation | 3_diagnosis.mov / 약 8.08초 | 문진 근거 요약과 결과 설명. “The result brings the reported symptoms and answers into an explanation.” |
| 4. Continue the conversation | 4_furtherqa.mov / 약 14.40초 | 결과 이후 이어지는 대화. “Users can ask further questions in the context of the consultation.” |

**확인 범위:** 위 배치와 캡션은 PPT 9–13쪽의 기능 설명·영상 포스터 화면 및 파일명에 근거한 제안이다. 기존 MOV 네 개의 메타데이터는 확인했으나 현재 환경의 디코더가 프레임 추출에 실패해 연속 재생 내용은 아직 확인하지 못했다. PPT의 내장 MP4 네 개도 추출해 두었으며, 실제 미디어 준비 시 원본을 비교해 사용할 버전을 결정한다. 기존 MOV는 모두 2342×1774로 합계 약 48.45초이며, UI가 잘리지 않도록 원래 화면 비율을 유지한다.

**배치 제안:** 문진과 결과를 핵심 장면으로 크게 보여준다. 처음과 마지막 단계도 이어지는 흐름이 보이도록 같은 섹션 안에 둔다. 데스크톱에서는 화면 옆에 짧은 설명을 두고 모바일에서는 설명과 영상을 세로로 쌓는다.

**미디어 준비 시 할 일:** 실제 프레임과 재생 길이를 기준으로 포스터·캡션을 결정하고, 브라우저에서 원활히 재생되는 형식으로 준비한다. 재생·일시정지·탐색 기능을 제공한다. 원본에 있는 결과 저장 버튼만으로 계정별 기록 저장이 구현됐다고 설명하지 않는다. PPT 23쪽에는 사용자 DB 구축이 향후 과제로 제시되어 있다.

## 04 / Implementation

**제목:** Connecting image analysis, retrieval, and dialogue

**역할:** 사용 흐름의 각 단계가 무엇으로 구현됐는지 설명한다. 기술 로고의 나열보다 데이터가 어떻게 다음 단계로 전달되는지 보여준다. 아래 내용은 PPT에 기록된 구현이며, 실제 담당자의 역할은 확인 후 연결한다.

### A. Finding relevant condition information

질환 정보의 ‘증상’ 필드를 검색 문서로 구성했다. 한국어 S-BERT 모델 ko-sroberta-multitask로 임베딩하고 FAISS를 이용해 검색하는 구조가 제시되어 있다. 그림에는 질환 정보, 증상 텍스트, 검색된 후보의 관계를 표시한다.

PPT 15쪽에 서울아산병원이 벡터 DB와 함께 표시되어 있으므로 질환 정보 출처로 제시한 것으로 보인다. 정확한 수집 페이지와 데이터 규모는 확인 대상이다. 병원과의 제휴나 의료진의 검수로 표현하지 않는다.

### B. Combining image information with symptoms

Google Cloud Vision API의 이미지 라벨 결과와 증상 텍스트 검색 결과를 후보 생성에 함께 사용한 구조를 보여준다. PPT 20쪽의 사마귀 예시는 이미지 출력에 유용하지 않은 라벨이 있어도 텍스트 검색 및 최종 후보에 사마귀가 포함된 사례로 활용할 수 있다.

이 한 사례를 이미지·텍스트 결합의 우월성을 입증한 비교 실험으로 해석하지 않는다. 이미지 결과와 텍스트 유사도의 결합 가중치 등 PPT에 없는 세부 구현도 추가하지 않는다.

### C. Structuring the conversation

PPT에 ChatGPT-4o 프롬프팅으로 표기된 부분은 후보 생성, 추가 질문, 결과 설명, 후속 질문의 기능으로 나눠 설명한다. 특히 후보 3개만 출력하도록 한 형식 제약, 대화 기록 참조, 중복 질문 회피, 후보 차이에 기반한 예/아니오 질문, 1-shot 예시를 주요 구현 판단으로 정리한다.

당시 프롬프트가 지시한 행동과 실제 항상 보장된 동작은 구별한다. 원본 코드의 ‘피부과 전문의’ 역할 문구는 당시 프롬프트의 일부이며 자격이나 임상 검증의 근거가 아니다.

**주 시각 자료:** 사용자 입력, 이미지 라벨, 질환 검색, 후보 생성, 문진과 결과를 연결하는 하나의 도식. 지식 정보가 공급되는 경로를 함께 표시한다.

**보조 정보:** React/Vite·TailwindCSS, FastAPI, Docker는 그 아래 한 줄의 구현 환경 또는 접기 영역에 둔다. 768차원 임베딩과 프롬프트 원문 등은 기술 상세에 배치할 수 있다.

**자료의 한계:** PPT에는 이전 버전과 수정 버전을 비교한 개발 기록이 없다. 현재 임시 페이지의 Making and iteration을 채우려고 시행착오나 대안 비교를 만들어 넣지 않는다. 실제 개발 경험을 사용자가 제공하면 해당 구현 판단에 덧붙인다.

## 05 / Evaluation

**제목:** What the initial tests showed

**핵심:** PPT 20쪽에서 확인되는 후보 생성 테스트와 실패 사례를 정확한 범위로 보여준다.

| 자료에서 확인한 내용 | 페이지에서 다룰 방식 |
| --- | --- |
| 10개 질환 항목과 8/10 표기 | 발표에서 보고한 소규모 테스트 결과로 설명 |
| 아토피·사마귀·수부 습진 예시 | 사진·설명, 검색 결과, 최종 후보 3개의 관계를 읽기 쉽게 요약 |
| 두드러기와 발진 실패 표시 | 성공 사례 옆에서 함께 제시 |
| 설명이 자세하지 않은 경우 실패했다는 해석 | 당시 팀의 해석으로 명시. 사용자 입력과 지식 문서 중 무엇의 부족인지 확인 필요 |

**현재 사용할 수 있는 문구 초안**

The final presentation reported successful results for 8 of 10 condition tests. The examples show the expected condition appearing within a list of three candidates. The slides do not document the full scoring criteria or the number of cases per condition, so this result describes an initial prototype test rather than a measure of clinical performance.

**시각 자료:** 숫자를 Hero의 대표 성과로 강조하기보다 테스트 범위·관찰·실패를 담은 간단한 표를 사용한다. 긴 출력 로그는 대표 사례 하나만 상세 자료로 두고 본문에서는 이해할 수 있는 결과로 정리한다.

**확인 전 사용하지 않을 표현:** 진단 정확도 80%, Top-3 accuracy 80%, 문진으로 정확도 향상, 기존 챗봇 대비 신뢰도 향상. 이미지 라벨 점수와 텍스트 유사도를 환자의 질환 확률로 표시하지 않는다.

**보강에 필요한 기록:** 성공 판정 기준, 질환별 사례 수와 전체 이미지 수, 정답 및 입력 출처, 반복 실행 여부, 실패 사례 원문, 문진 전후 비교 유무. 추가 기록이 없더라도 현재 범위를 명시한 Evaluation 섹션은 작성할 수 있다.

## 06 / Reflection

**제목:** The limits of the prototype

**작성 방향:** 실제 작동한 흐름과 그 과정에서 드러난 한계를 연결한다. 당시 자료에서 확인되는 회고 소재와 지금 새로 제안하는 질문을 구별한다. 다음 내용은 사용자 회고를 받아 다듬을 후보이다.

| 근거 | 회고 후보 |
| --- | --- |
| 증상 문서 검색과 설명 부족 사례, 지식 베이스 보강 과제 | 질문 생성뿐 아니라 참조하는 질환 정보의 범위와 구체성이 결과에 영향을 줄 수 있다는 점 |
| 초기 후보 3개를 문진으로 축소하는 구조 | 최초 후보에 적절한 질환이 없을 때 어떻게 처리할지라는 다음 설계 질문 |
| 8/10 결과와 제한적인 평가 기록 | 후보 생성 평가, 최종 결과 평가, 사용성 평가를 구분해 다음 검증을 설계할 필요 |

**다음 질문 제안**

How should the conversation change when the initial candidates do not explain the user's symptoms?

이는 현재 구조를 바탕으로 제안하는 후속 질문이며, 당시 이미 구현한 재탐색 기능을 의미하지 않는다.

PPT 23쪽의 사용자 DB, 자체 언어 모델 학습, 지식 베이스 확장, 기능·정보구조 구체화, 진료 종목 확장은 당시 향후 과제로 정리한다. 이 목록 전체를 오늘의 우선순위로 그대로 옮기기보다, 우준님이 실제로 배운 점과 지금 다시 한다면 바꿀 점을 받아 결말을 정한다.

## 자료 우선순위와 표현 관리

| 우선순위 | 자료 | 사용할 위치 / 처리 |
| --- | --- | --- |
| 최상 | 기존 DrSnap.png | Hero 대표 이미지 |
| 최상 | 단계별 영상 4개 | In use. 실제 문진·결과·후속 대화의 주 근거 |
| 높음 | PPT 9쪽 서비스 흐름 | Design approach의 사용자 흐름과 Implementation 도식의 근거 |
| 높음 | PPT 17·19쪽 검색·프롬프트 | 기술 구현의 구체적인 선택 설명 |
| 높음 | PPT 20쪽 테스트 | Evaluation의 성공·실패·평가 범위 |
| 보조 | PPT 4–6쪽 대상 사용자와 후기 | Motivation. 가정된 사용 상황과 당시 검토 자료로 표기 |
| 보조 | PPT 15–16쪽 구성 요소 | 기술 환경과 상세 구조 |
| 보조 | PPT 22–23쪽 기대효과와 향후 과제 | 구현 기능·의도한 효과·미완료 작업을 구별하는 근거 |
| 본문 제외 | 목차·구분·감사 페이지, 범용 API 골목 사진 예시 | 웹 사례의 이야기에 직접 필요한 내용만 남김 |

## 다음 작성 단계에서 확정할 사항

1. 우준님의 개인 기여와 팀원별 역할. PPT·목록 페이지의 두 명과 상세 페이지의 세 명 표기가 불일치한다.
2. 8/10의 성공 기준과 사례 수. 기록을 찾지 못하면 위에 적은 제한된 표현을 사용한다.
3. 개발 중 바뀐 결정이나 가장 어려웠던 문제, 개인적인 배움. 자료에 없는 시행착오는 추가 설명이 있어야 쓸 수 있다.
4. 프로젝트 기간과 실제 질환 데이터 출처·규모. 현재 페이지 및 PPT에서 확인되는 수준을 넘는 세부 정보는 보류한다.

구성이 정해지면 영문 본문과 캡션을 작성하고, 원본 시연의 사용할 장면 및 도식을 준비한 뒤 기존 프로젝트 페이지의 공통 형식으로 구현한다.

## 원본 자료

- [최종 발표자료 PPT](</Users/jeong-ujun/Library/CloudStorage/Dropbox/학부_컴퓨터/CSE2024/Capston/최종발표/닥터스냅 최종발표자료.pptx>)
- [Dr.Snap 현재 페이지 초안](</Users/jeong-ujun/Library/CloudStorage/Dropbox/유학 준비/personal_website/project-drsnap.html>)
- [입력 단계 영상](</Users/jeong-ujun/Library/CloudStorage/Dropbox/유학 준비/personal_website/assets/projects/drsnap/1_landingpage.mov>)
- [문진 영상](</Users/jeong-ujun/Library/CloudStorage/Dropbox/유학 준비/personal_website/assets/projects/drsnap/2_questionaire.mov>)
- [결과 영상](</Users/jeong-ujun/Library/CloudStorage/Dropbox/유학 준비/personal_website/assets/projects/drsnap/3_diagnosis.mov>)
- [후속 질문 영상](</Users/jeong-ujun/Library/CloudStorage/Dropbox/유학 준비/personal_website/assets/projects/drsnap/4_furtherqa.mov>)
