const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

console.log('=== MAIN.JS LOADED ===');
console.log('autoUpdater imported:', !!autoUpdater);

// Auto-updater configuration
// Using GitHub Releases as update server
// electron-updater automatically reads from package.json repository field

console.log('Setting up autoUpdater event listeners...');

// Auto-update event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('[autoUpdater] Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log('[autoUpdater] Update available:', info);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('[autoUpdater] Update not available:', info);
});

autoUpdater.on('error', (err) => {
  console.log('[autoUpdater] Error:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info);

  // Ask user if they want to install update
  const dialogOpts = {
    type: 'info',
    buttons: ['예', '아니오'],
    title: '업데이트 설치',
    message: '새 버전이 다운로드되었습니다.',
    detail: `버전 ${info.version}이(가) 다운로드되었습니다.\n지금 업데이트를 설치하고 앱을 재시작하시겠습니까?`
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      // User clicked '예' - install and restart
      autoUpdater.quitAndInstall();
    } else {
      // User clicked '아니오' - do nothing, continue using current version
      console.log('Update installation postponed by user');
    }
  });
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  // Send version to renderer process after page loads
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('app-version', app.getVersion());
  });
}

app.whenReady().then(() => {
  console.log('=== APP READY EVENT ===');
  createWindow();

  // Check for updates when app is ready
  console.log('About to call autoUpdater.checkForUpdatesAndNotify()...');
  try {
    autoUpdater.checkForUpdatesAndNotify();
    console.log('autoUpdater.checkForUpdatesAndNotify() called successfully');
  } catch (err) {
    console.log('Error calling autoUpdater:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
