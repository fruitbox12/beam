const Hyperbeam = require('hyperbeam')
const prompt = require('prompt-sync')()

async function createChannel(channelID, code) {
  const beam = new Hyperbeam('hyperchannel ' + channelID)

  beam.on('remote-address', function ({ host, port }) {
    if (!host) console.error('[hyperbeam] Could not detect remote address')
    else
      console.error(
        '[hyperbeam] Joined the DHT - remote address is ' + host + ':' + port,
      )
    if (port) console.error('[hyperbeam] Network is holepunchable \\o/')
  })

  beam.on('connected', function () {
    console.error(
      '[hyperbeam] Success! Encrypted tunnel established to remote peer',
    )
    // const name = prompt('What is your name?')
    //console.log(`Enter some  ${name}`)
    process.stdin.pipe(beam).pipe(code.toString())
  })

  beam.on('end', () => {
    beam.end()
    process.stdin.pipe(beam).pipe('NO ONE IS FUCKING HERE')
  })

  beam.resume()
  beam.pause()

  process.once('SIGINT', () => {
    if (!beam.connected) closeASAP()
    else beam.end()
  })

  function closeASAP() {
    console.error('[hyperbeam] Shutting down beam...')

    const timeout = setTimeout(() => process.exit(1), 2000)
    beam.destroy()
    beam.on('close', function () {
      clearTimeout(timeout)
    })
  }
}

exports.createChannel = createChannel
