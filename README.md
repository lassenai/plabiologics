# PLAbiologics · Cell Workspace

연구원이 이미지를 선택하고, 영역을 측정·비교하고, 검토 기록을 남기는 모바일 대응 MVP입니다.

배포 주소: https://lassenai.github.io/plabiologics/

## 주요 기능

- 공식 사이트의 PLAbiologics 로고와 작업 중심 화면
- 공개 이미지 11장 선택, PNG/JPG/WebP 로컬 업로드
- 회전 가능한 2.5D 밝기 표면, 2D 이미지, 수동 정답 비교
- 영역 판정 기준·표시 조절, 면적·Dice 계산
- 브라우저에 검토 메모와 완료 상태 저장
- 현재 이미지 분석 결과·검토 메모 CSV 내보내기

## 실행과 빌드

의존성 설치나 API 키 없이 동작하는 정적 HTML/CSS/JavaScript 앱입니다.

```powershell
python -m http.server 8792 --bind 127.0.0.1
```

http://127.0.0.1:8792 에서 실행합니다. GitHub Pages는 main 브랜치 루트에서 제공합니다.

```powershell
python scripts/build.py
```

빌드하면 `outputs/plab-ai-proposal.html`에 단일 파일 버전이 생성됩니다. 해당 파일은 오프라인 브라우저에서도 열 수 있습니다. `work/demo_data.json`이 존재하면 패키지 데이터도 갱신하고, 없으면 저장소의 `assets/data.js`를 사용합니다.

## 소스

- `index.html`: 작업 화면
- `assets/app.css`: 반응형 디자인
- `assets/app.js`: 분석·시각화·검토·내보내기
- `assets/data.js`: 공개 샘플·정답·저장된 모델 예측
- `assets/validation-manifest.json`: 데이터 분할과 모델 검증 기록
- `scripts/build.py`: 오프라인 파일 생성
- `THIRD_PARTY_NOTICES.md`: 데이터·로고 출처와 권리

이전 기획안·중간 자료·원본 ZIP은 로컬 `work/`에 보존하며 공개 저장소에 포함하지 않습니다.

## 분석 범위

공개 샘플은 BBBC019v2 SN15 DA3 세포 영상으로 학습된 경량 모델의 저장된 예측입니다. 태반유래 MSC 데이터가 아닙니다. 평가 11장의 고정 기준 0.20에서 평균 Dice 0.804, 평균 면적 절대 오차 1.38%p입니다.

새 이미지에는 로컬 밝기 변동 기반 텍스처 기준선을 적용합니다. 샘플 모델 추론과 다르며 정답 성능 지표를 표시하지 않습니다. 업로드와 메모는 외부 서버로 전송되지 않습니다. 메모는 기기·브라우저별로 저장됩니다.

3D 화면은 밝기를 높이로 변환한 2.5D 시각화입니다. 세포 두께나 조직 깊이를 복원하지 않습니다. 제품 효능·임상·생산 적용 검증을 의미하지 않습니다. Jev·LLM API는 연결하지 않았습니다.

데이터는 CC BY 3.0이며 상세 출처는 THIRD_PARTY_NOTICES.md를 참조하세요. 회사 로고의 권리는 해당 소유자에게 있습니다. 이 프로젝트는 독립 개발한 연구용 프로토타입입니다.
