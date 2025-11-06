import {app, BrowserWindow, dialog, ipcMain, shell} from 'electron'
import {join} from 'path'
import {existsSync} from 'fs'

function createWindow(): void {
    // Resolve app icon by platform with fallbacks
    const publicDir = join(__dirname, '../../public')
    const candidates = process.platform === 'win32'
        ? ['icon-white.ico', 'image.png', 'favicon-white.ico', 'favicon.ico', 'icon-white.png', 'icon.png', 'favicon-white.png', 'favicon.png', 'favicon-white.svg', 'favicon.svg']
        : process.platform === 'darwin'
            ? ['icon-white.icns', 'icon.icns', 'favicon-white.icns', 'favicon.icns', 'icon-white.png', 'icon.png', 'favicon-white.png', 'favicon.png', 'favicon-white.svg', 'favicon.svg']
            : ['icon-white.png', 'icon.png', 'favicon-white.png', 'favicon.png', 'favicon-white.svg', 'favicon.svg']
    const iconPath = candidates
        .map(name => join(publicDir, name))
        .find(p => existsSync(p))

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1300,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        titleBarStyle: 'hidden',
        titleBarOverlay: true,
        show: false,
        autoHideMenuBar: true,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    // Extra logging to diagnose blank screens in production
    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return {action: 'deny'}
    })
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Main window finished loading')
    })
    mainWindow.webContents.on('dom-ready', () => {
        console.log('DOM is ready')
    })

    // Load the app
    if (process.env.NODE_ENV === 'development') {
        const devPort = process.env.VITE_DEV_SERVER_PORT || process.env.PORT || '5173'
        const devUrl = process.env.VITE_DEV_SERVER_URL || `http://localhost:${devPort}`
        console.log('Loading development URL:', devUrl)
        mainWindow.loadURL(devUrl).catch(err => {
            console.error('Failed to load development URL:', err)
        })
        // Open DevTools in development
        mainWindow.webContents.openDevTools()
    } else {
        // Robustly resolve production index.html across packaging layouts
        const candidates = [
            join(__dirname, '../dist/index.html'), // resources/app/dist-electron -> app/dist/index.html
            join(__dirname, '../../dist/index.html'), // fallback: resources/app/dist-electron -> resources/dist/index.html
            join(process.resourcesPath, 'app/dist/index.html'),
            join(process.resourcesPath, 'dist/index.html'),
            join(app.getAppPath(), 'dist/index.html')
        ]
        const indexPath = candidates.find(p => existsSync(p)) || candidates[0]
        console.log('Loading production file:', indexPath)
        mainWindow.loadFile(indexPath).catch(err => {
            console.error('Failed to load production file:', err)
        })
    }

    // Handle navigation errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('Failed to load URL:', validatedURL, 'Error:', errorDescription)
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
    // Set app user model id for windows
    app.setAppUserModelId('com.webexcel.app')

    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Handle file operations for Excel files
ipcMain.handle('show-save-dialog', async () => {
    return await dialog.showSaveDialog({
        filters: [
            {name: 'Excel Files', extensions: ['xlsx', 'xls']},
            {name: 'All Files', extensions: ['*']}
        ]
    })
})

ipcMain.handle('show-open-dialog', async () => {
    return await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {name: 'Excel Files', extensions: ['xlsx', 'xls']},
            {name: 'All Files', extensions: ['*']}
        ]
    })
})