const {
  app,
  BrowserWindow,
  globalShortcut,
} = require('electron')

app.commandLine.appendSwitch('ignore-gpu-blacklist'); // enable webgl on my chromebook ( crouton )

let win;
const path = require('path')
const url = require('url')

const createWindow = () => {

  globalShortcut.register('esc', () => {
     app.quit();
  });

  // Create the browser window.
  win = new BrowserWindow({
    experimentalCanvasFeatures: true,
    experimentalFeatures: true,
    webgl: true,
    offscreen: true
  }); // prolly dont need all of this flags :-)
  

  win.setFullScreen(true);
  win.setAutoHideMenuBar(true);

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  win.on('closed', () => {
    win = null
  })
}




app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})