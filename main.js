const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// Helper to send logs to renderer
function logToRenderer(message) {
  console.log(message);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(`console.log('${message.replace(/'/g, "\\'")}');`);
  }
}

logToRenderer('=== MAIN.JS LOADED ===');
logToRenderer('autoUpdater imported: ' + !!autoUpdater);

// Auto-updater configuration
// Using GitHub Releases as update server
// electron-updater automatically reads from package.json repository field

logToRenderer('Setting up autoUpdater event listeners...');

// Auto-update event handlers
autoUpdater.on('checking-for-update', () => {
  logToRenderer('[autoUpdater] Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  logToRenderer('[autoUpdater] Update available: ' + info.version);
});

autoUpdater.on('update-not-available', (info) => {
  logToRenderer('[autoUpdater] Update not available: ' + info.version);
});

autoUpdater.on('error', (err) => {
  logToRenderer('[autoUpdater] Error: ' + err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
  logToRenderer('[autoUpdater] Downloaded: ' + Math.round(progressObj.percent) + '%');
});

autoUpdater.on('update-downloaded', (info) => {
  logToRenderer('[autoUpdater] Update downloaded: ' + info.version);

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
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  // Send version to renderer process after page loads
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('app-version', app.getVersion());
  });

  return mainWindow;
}

app.whenReady().then(() => {
  logToRenderer('=== APP READY EVENT ===');
  createWindow();

  // Check for updates when app is ready
  logToRenderer('About to call autoUpdater.checkForUpdatesAndNotify()...');
  try {
    autoUpdater.checkForUpdatesAndNotify();
    logToRenderer('autoUpdater.checkForUpdatesAndNotify() called successfully');
  } catch (err) {
    logToRenderer('Error calling autoUpdater: ' + err.message);
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
