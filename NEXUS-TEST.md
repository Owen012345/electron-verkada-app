# Nexus 업데이트 테스트 가이드

## 준비물
1. Private Nexus 서버 접근 권한
2. Nexus Repository 생성 (raw 타입)
3. Nexus 계정 (username/password)

## 테스트 순서

### 1. Nexus Repository 생성
```
Repository Type: raw (hosted)
Repository Name: electron-releases
```

### 2. v1.0.3 빌드 및 파일 준비
```bash
# package.json version을 1.0.3으로 설정
npm run build
```

생성된 파일:
- `dist/latest.yml`
- `dist/Varcada-Electron-App-Setup-1.0.3.exe`
- `dist/Varcada-Electron-App-Setup-1.0.3.exe.blockmap`

### 3. Nexus에 파일 수동 업로드

**방법 A: Nexus 웹 UI**
1. Nexus 웹 접속
2. Browse → electron-releases
3. Upload 버튼으로 3개 파일 업로드

**방법 B: curl 명령어**
```bash
NEXUS_URL="https://your-nexus.com/repository/electron-releases"
NEXUS_USER="admin"
NEXUS_PASS="password"

# latest.yml 업로드
curl -u $NEXUS_USER:$NEXUS_PASS \
  --upload-file dist/latest.yml \
  $NEXUS_URL/latest.yml

# .exe 업로드
curl -u $NEXUS_USER:$NEXUS_PASS \
  --upload-file dist/Varcada-Electron-App-Setup-1.0.3.exe \
  $NEXUS_URL/Varcada-Electron-App-Setup-1.0.3.exe

# .blockmap 업로드
curl -u $NEXUS_USER:$NEXUS_PASS \
  --upload-file dist/Varcada-Electron-App-Setup-1.0.3.exe.blockmap \
  $NEXUS_URL/Varcada-Electron-App-Setup-1.0.3.exe.blockmap
```

### 4. v1.0.2 앱 빌드 및 설치
```bash
# package.json version을 1.0.2로 변경
npm run build

# 생성된 설치 파일 실행
dist/Varcada-Electron-App-Setup-1.0.2.exe
```

### 5. 환경 변수 설정 (앱 실행 전)

**Windows PowerShell:**
```powershell
$env:UPDATE_SERVER_URL="https://your-nexus.com/repository/electron-releases/"
$env:UPDATE_AUTH="username:password"
& "C:\Users\...\AppData\Local\Programs\varcada-electron-app\Varcada Electron App.exe"
```

**Windows CMD:**
```cmd
set UPDATE_SERVER_URL=https://your-nexus.com/repository/electron-releases/
set UPDATE_AUTH=username:password
"C:\Users\...\AppData\Local\Programs\varcada-electron-app\Varcada Electron App.exe"
```

### 6. 테스트 확인

v1.0.2 앱 실행 후 F12 콘솔에서 확인:
```
[Main Process] === MAIN.JS LOADED ===
[Main Process] autoUpdater imported: true
[Main Process] Using Basic Auth for updates
[Main Process] Update server: https://your-nexus.com/repository/electron-releases/
[Main Process] Setting up autoUpdater event listeners...
[Main Process] === APP READY EVENT ===
[Main Process] Calling autoUpdater.checkForUpdates()...
[Main Process] autoUpdater.checkForUpdates() called successfully
[Main Process] [autoUpdater] Checking for updates...
[Main Process] [autoUpdater] Update available: 1.0.3
[Main Process] [autoUpdater] Downloaded: 100%
[Main Process] [autoUpdater] Update downloaded: 1.0.3
```

업데이트 다이얼로그 표시 → "예" 클릭 → 앱 재시작 → v1.0.3으로 업데이트됨

## 환경 변수 옵션

### UPDATE_SERVER_URL
Nexus 서버 URL (기본값: package.json의 publish.url)

### UPDATE_AUTH
인증 정보:
- Basic Auth: `"username:password"`
- Bearer Token: `"your-token-here"`

## 프로덕션 배포 시

환경 변수를 앱 실행 시 자동으로 설정하거나, 빌드 시 포함:
```javascript
// package.json 또는 설정 파일에 저장
"nexusConfig": {
  "url": "https://your-nexus.com/repository/electron-releases/",
  "auth": "encrypted-credentials"
}
```

## 트러블슈팅

### 401 Unauthorized
- UPDATE_AUTH 환경 변수 확인
- Nexus 계정 권한 확인

### 404 Not Found
- Nexus URL 확인
- latest.yml 파일 업로드 확인

### Connection Error
- 네트워크 연결 확인
- Nexus 서버 접근 가능 여부 확인
