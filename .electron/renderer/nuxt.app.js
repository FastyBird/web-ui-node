const path = require('path')
const { fork } = require('child_process')
const psTree = require('ps-tree')

const NUXT_PROCESS_PATH = path.join(__dirname, 'nuxt.process.js')

/**
 * @implements {IStep}
 */
class NuxtApp {
  constructor(logger) {
    this.logger = logger
  }

  async build(isDev) {
    this.nuxtProcess = fork(NUXT_PROCESS_PATH, { silent: true })

    this.nuxtProcess.stdout.pipe(this.logger.stdout)
    this.nuxtProcess.stderr.pipe(this.logger.stderr)

    return new Promise((resolve, reject) => {
      this.nuxtProcess.send({
        action: 'build',
        target: isDev ? 'development' : 'production',
      })

      this.nuxtProcess.once('message', ({ status, err }) => {
        if (status === 'ok') {
          resolve()
        } else {
          reject(err)
        }
      })
    })
  }

  async terminate() {
    this.nuxtProcess.kill()

    if (this.nuxtProcess && !this.nuxtProcess.killed) {
      return new Promise((resolve, reject) => {
        psTree(this.nuxtProcess.pid, (err, children) => {
          if (err) {
            reject(err)
          }

          children.forEach(p => {
            this.killProcess(parseInt(p.PID, 10))
          })

          this.killProcess(this.nuxtProcess.pid)

          resolve()
        })
      })
    }

    this.nuxtProcess = null
  }

  killProcess(pid) {
    try {
      process.kill(pid);
    } catch (e) {
      if (e.code !== 'ESRCH') {
        console.warn(e);
      }
    }
  }

}

module.exports = NuxtApp
