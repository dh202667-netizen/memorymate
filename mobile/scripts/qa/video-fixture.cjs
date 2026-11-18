async (page) => {
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 180
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#e9efdf'
    ctx.fillRect(0, 0, 320, 180)
    const stream = canvas.captureStream(0)
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' })
    const chunks = []
    const done = new Promise((resolve) => {
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }))
    })
    recorder.start(100)
    stream.getVideoTracks()[0].requestFrame()
    let frame = 0
    const timer = setInterval(() => {
      ctx.fillStyle = '#e9efdf'
      ctx.fillRect(0, 0, 320, 180)
      ctx.fillStyle = '#315b48'
      ctx.font = '24px sans-serif'
      ctx.fillText('MemoryMate ' + frame++, 40, 95)
      stream.getVideoTracks()[0].requestFrame()
    }, 100)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    clearInterval(timer)
    recorder.stop()
    stream.getTracks().forEach((t) => t.stop())
    const blob = await done
    return [...new Uint8Array(await blob.arrayBuffer())]
  })
  return { base64: Buffer.from(bytes).toString('base64') }
}
