import { EventEmitter } from 'events'
import { BrowserWindow, app } from 'electron'

const isProduction = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

export default class BrowserWinHandler {
  /**
   * @param [options] {object} - browser window options
   * @param [allowRecreate] {boolean}
   */
  constructor(options, allowRecreate = true) {
    this._eventEmitter = new EventEmitter()

    this.allowRecreate = allowRecreate
    this.options = options

    this.browserWindow = null

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
      this._create()
    })

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (this.allowRecreate) {
      app.on('activate', () => {
        if (this.browserWindow === null) {
          this._create()
        }
      })
    }
  }

  _create() {
    this.browserWindow = new BrowserWindow(
      {
        ...this.options,
        webPreferences: {
          ...this.options.webPreferences,
          webSecurity: isProduction, // disable on dev to allow loading local resources
          nodeIntegration: true, // allow loading modules via the require () function
          devTools: !process.env.SPECTRON, // disable on e2e test environment
        },
      },
    )

    this.browserWindow.on('closed', () => {
      // Dereference the window object
      this.browserWindow = null
    })

    if (isDev) {
      // Open the DevTools.
      this.browserWindow.webContents.openDevTools()
    }

    this._eventEmitter.emit('created')
  }

  onCreated(callback) {
    this._eventEmitter.once('created', () => {
      callback(this.browserWindow)
    })
  }

  created() {
    return new Promise(resolve => {
      this._eventEmitter.once('created', () => {
        resolve(this.browserWindow)
      })
    })
  }
}
