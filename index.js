require('rootpath')()

const fs = require('fs')
const util = require('util')

const PATH = './lib/sources'
const INTERVAL = 5 * 60 * 1000

const sources = fs.readdirSync(PATH).map((src) => require(`${PATH}/${src}`))

function main() {
  Promise.all(
    sources.map((s) =>
      s.run().catch((e) => {
        console.error('Caught Error: ' + util.inspect(e, true, 2, true))
      })
    )
  )
}

setInterval(main, INTERVAL)

main()
