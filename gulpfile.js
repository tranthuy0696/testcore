const gulp = require('gulp')
const targz = require('targz')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs-extra')
const distDir = 'dist'

let meta = JSON.parse(fs.readFileSync('meta.json'), 'utf-8')
let name = meta.ref

gulp.task('build', function() {
  console.log('Building............')

  const collect = (to) => {
    return new Promise((resolve) => {
      try {
        let dest = path.join(to, 'temp')
        let src = [
          path.join('meta.json')
        ]
        gulp
          .src(src)
          .pipe(gulp.dest(dest))
          .on('finish', () => {
            console.log(`Collected: ${name}`)
            resolve()
          })
          .on('error', (err) => {
            console.log(`Ignored collecting ${name}`, err)
            resolve()
          })
      } catch (err) {
        console.log(`Ignored collecting ${name}`, err)
        resolve()
      }
    })
  }
  const updateMetadata = (to) => {
    return new Promise((resolve) => {
      const modulePath = path.join(to, name)
      const metaData = JSON.parse(fs.readFileSync(path.join(to, 'temp', 'meta.json'), 'utf-8'))
      const {exec} = require('child_process')
      exec('git rev-parse HEAD', null, (err, stdout, stderr) => {
        if (!err && stdout) {
          metaData.commit = stdout.trim()
        }
        fs.writeJSONSync(path.join(modulePath, 'meta.json'), metaData, {encoding: 'utf-8'})
        resolve()
      })
    })
  }

  const compress = (to) => {
    return new Promise((resolve) => {
      const src = path.join(to, 'temp')
      const dest = path.join(to, `${name}.tar.gz`)
      targz.compress({src: src, dest: dest}, err => {
        if (err) {
          console.log(`Ignored compressing ${name}`, err)
          resolve()
        } else {
          console.log(`Compressed: ${name}.tar.gz`)
          resolve()
        }
      })
    })
  }
  const encrypt = (to) => {
    return new Promise((resolve) => {
      try {
        const src = path.join(to, `${name}.tar.gz`)
        const dest = path.join(to, `${name}.mdl`)
        const buffer = fs.readFileSync(src)
        const cipher = crypto.createCipher('aes192', 'This1s4Rand0m')
        const data = Buffer.concat([cipher.update(buffer), cipher.final()])
        fs.writeFileSync(dest, data)
        console.log(`Encrypted: ${name}.mdl`)
        resolve()
      } catch (err) {
        console.log(`Ignored encrypting ${name}`, err)
        resolve()
      }
    })
  }

  const to = path.join(distDir)

  if (fs.existsSync(to)) {
    fs.removeSync(to)
  }
  fs.mkdirSync(to)
  fs.mkdirSync(path.join(to, 'temp'))
  fs.mkdirSync(path.join(to, name))

  return collect(to)
    .then(() => updateMetadata(to))
    .then(() => compress(to))
    .then(() => encrypt(to))
    .then(() => {
      fs.removeSync(path.join(to, 'temp'))
      fs.removeSync(path.join(to, name))
      console.log('Build success')
      return Promise.resolve()
    })
    .catch((err) => {
      console.log(`Error: ${err}`)
    })
})
