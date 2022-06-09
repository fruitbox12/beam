const Hyperbeam = require('hyperbeam')
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(function () {
      console.log('Blah blah blah blah extra-blah')
    }, 3000)
  })
}
async function createChannel(channelID, code) {
  console.log('connecting to channID ' + channelID)
  console.log(`using code ${code}`)

  const beam = new Hyperbeam('hyperchannel ' + channelID)

  beam.on('remote-address', async function ({ host, port }) {
    if (!host) console.error('[hyperbeam] Could not detect remote address')
    else
      console.error(
        '[hyperbeam] Joined the DHT - remote address is ' + host + ':' + port,
      )
    if (port) {
      console.error('[hyperbeam] Network is holepunchable \\o/')
      console.log(`Executing  ${code}`)
      console.log(Object.keys(beam))
      //await sleep(1000)
      console.log(await beam.write(code))
    }
  })

  beam.on('connected', function () {
    console.error(
      '[hyperbeam] Success! Encrypted tunnel established to remote peer',
    )
    console.log(Object.keys(beam))
    // const name = prompt('What is your name?')
    console.log(`Executing  ${code}`)
    //process.stdin.pipe(beam).pipe(code)
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
  return beam
}

exports.createChannel = createChannel
