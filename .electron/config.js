const path = require('path')

const PROJECT_ROOT = path.join(__dirname, '..')
const SRC_DIR = PROJECT_ROOT

const config = {
  ELECTRON_RELAUNCH_CODE: 250, // valid range in unix system: <1,255>
  ELECTRON_INSPECTION_PORT: 5858,
  SERVER_PORT: 9080,
  SERVER_HOST: 'http://localhost',

  PROJECT_ROOT,
  SRC_DIR,
  MAIN_PROCESS_DIR: path.join(SRC_DIR, 'electron-app'),
  RENDERER_PROCESS_DIR: SRC_DIR,
  DIST_DIR: path.join(PROJECT_ROOT, 'dist'),
  BUILD_DIR: path.join(PROJECT_ROOT, 'build')
}

module.exports = Object.freeze(config)
