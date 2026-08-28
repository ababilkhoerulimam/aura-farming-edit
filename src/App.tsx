import { useCallback, useEffect, useRef, useState } from 'react'

type CameraStatus = 'idle' | 'starting' | 'ready' | 'denied' | 'unavailable' | 'error'
type RenderStatus = 'empty' | 'capturing' | 'ready' | 'error'

const statusCopy: Record<CameraStatus, string> = {
  idle: 'Camera is off',
  starting: 'Requesting camera access…',
  ready: 'Camera ready',
  denied: 'Camera permission denied',
  unavailable: 'No camera found',
  error: 'Camera could not be started',
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const resultUrlRef = useRef<string | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [renderStatus, setRenderStatus] = useState<RenderStatus>('empty')
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus('idle')
  }, [])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    if (!video || status !== 'ready' || video.videoWidth === 0) return

    setRenderStatus('capturing')
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1080
    const context = canvas.getContext('2d')

    if (!context) {
      setRenderStatus('error')
      return
    }

    const sourceRatio = video.videoWidth / video.videoHeight
    const targetRatio = canvas.width / canvas.height
    let sourceWidth = video.videoWidth
    let sourceHeight = video.videoHeight
    let sourceX = 0
    let sourceY = 0

    if (sourceRatio > targetRatio) {
      sourceWidth = video.videoHeight * targetRatio
      sourceX = (video.videoWidth - sourceWidth) / 2
    } else {
      sourceHeight = video.videoWidth / targetRatio
      sourceY = (video.videoHeight - sourceHeight) / 2
    }

    context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
    context.fillStyle = 'rgba(11, 11, 15, 0.08)'
    context.fillRect(0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) {
        setRenderStatus('error')
        return
      }
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
      const nextUrl = URL.createObjectURL(blob)
      resultUrlRef.current = nextUrl
      setResultUrl(nextUrl)
      setRenderStatus('ready')
    }, 'image/png')
  }, [status])

  const clearResult = useCallback(() => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
    resultUrlRef.current = null
    setResultUrl(null)
    setRenderStatus('empty')
  }, [])

  const downloadResult = useCallback(() => {
    if (!resultUrl) return
    const link = document.createElement('a')
    link.href = resultUrl
    link.download = 'aura-meme-capture.png'
    link.click()
  }, [resultUrl])

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable')
      return
    }

    setStatus('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatus('ready')
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'error')
    }
  }, [])

  useEffect(() => () => {
    stopCamera()
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
  }, [stopCamera])

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">REAL-TIME PHOTO LAB</p>
          <h1>Aura Meme Generator</h1>
        </div>
        <div className="template-pill">
          <span className="pill-dot" />
          Sigma Split <span className="chevron">⌄</span>
        </div>
      </header>

      <section className="workspace" aria-label="Camera and result workspace">
        <article className="preview-card camera-card">
          <div className="card-heading">
            <div>
              <span className="card-kicker">01 / INPUT</span>
              <h2>Live camera</h2>
            </div>
            <span className={`status-badge status-${status}`}>
              <span className="status-light" /> {statusCopy[status]}
            </span>
          </div>

          <div className="camera-stage">
            <video ref={videoRef} className="camera-video" playsInline muted aria-label="Live camera preview" />
            {status !== 'ready' && (
              <div className="camera-empty">
                <div className="camera-icon">◉</div>
                <strong>{status === 'starting' ? 'Starting camera' : 'Camera preview'}</strong>
                <span>{status === 'denied' ? 'Allow camera access in your browser settings.' : 'Start the camera to begin.'}</span>
              </div>
            )}
            <div className="face-guide" aria-hidden="true" />
            <span className="stage-label">FACE GUIDE / PREVIEW</span>
          </div>

          <div className="card-footer">
            <p className="helper-text">Position one face inside the guide.</p>
            <div className="button-group">
              {status === 'ready' && (
                <button className="button button-primary" onClick={capturePhoto}>Capture photo</button>
              )}
              {status === 'ready' ? (
                <button className="button button-quiet" onClick={stopCamera}>Turn camera off</button>
              ) : (
              <button className="button button-primary" onClick={startCamera} disabled={status === 'starting'}>
                {status === 'starting' ? 'Starting…' : 'Start camera'}
              </button>
              )}
            </div>
          </div>
        </article>

        <article className="preview-card result-card">
          <div className="card-heading">
            <div>
              <span className="card-kicker">02 / OUTPUT</span>
              <h2>Edited result</h2>
            </div>
            <span className="output-chip">PNG · 1080 × 1080</span>
          </div>
          <div className="result-stage">
            {resultUrl ? (
              <img className="result-image" src={resultUrl} alt="Captured photo preview" />
            ) : (
              <div className="result-placeholder">
                <div className="placeholder-mark">{renderStatus === 'capturing' ? '…' : '✦'}</div>
                <strong>{renderStatus === 'capturing' ? 'Generating preview' : 'Your edit will appear here'}</strong>
                <span>{renderStatus === 'capturing' ? 'Rendering the captured frame.' : 'Capture a photo to generate the meme composite.'}</span>
              </div>
            )}
          </div>
          <div className="card-footer result-footer">
            <p className="helper-text">{resultUrl ? 'Capture ready for the next effect.' : 'No photo captured yet.'}</p>
            <div className="button-group">
              {resultUrl && <button className="button button-quiet" onClick={clearResult}>Retake</button>}
              <button className={`button ${resultUrl ? 'button-primary' : 'button-disabled'}`} onClick={downloadResult} disabled={!resultUrl}>Download image</button>
            </div>
          </div>
        </article>
      </section>

      <footer className="app-footer">
        <span><span className="footer-dot" /> Local browser processing</span>
        <span>Camera stays on this device</span>
      </footer>
    </main>
  )
}

export default App
