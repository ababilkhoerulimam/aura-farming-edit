import { useCallback, useEffect, useRef, useState } from 'react'
import { renderSigmaSplit } from './features/compositing/sigmaSplit'
import { detectFace, type FaceBounds } from './features/face-detection/faceDetector'
import { TemplateSelector } from './components/TemplateSelector'
import { memeTemplates } from './features/templates/templates'

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
  const [faceBounds, setFaceBounds] = useState<FaceBounds | null>(null)
  const [detectionReady, setDetectionReady] = useState(false)
  const [templateId, setTemplateId] = useState(memeTemplates[0].id)
  const [captureFlash, setCaptureFlash] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

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
    setCaptureFlash(true)
    window.setTimeout(() => setCaptureFlash(false), 180)
    renderSigmaSplit(video, faceBounds, templateId).then((blob) => {
      if (!blob) {
        setRenderStatus('error')
        return
      }
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
      const nextUrl = URL.createObjectURL(blob)
      resultUrlRef.current = nextUrl
      setResultUrl(nextUrl)
      setRenderStatus('ready')
    }).catch(() => setRenderStatus('error'))
  }, [faceBounds, status, templateId])

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
    setCameraError(null)
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
      setFaceBounds(null)
      setDetectionReady(false)
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setStatus('denied')
        setCameraError('Camera access was blocked. Allow permission in browser settings, then try again.')
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setStatus('unavailable')
        setCameraError('No camera device was found. Connect a webcam and try again.')
      } else {
        setStatus('error')
        setCameraError('The camera could not start. Check that another app is not using it.')
      }
    }
  }, [])

  useEffect(() => {
    if (status !== 'ready' || !videoRef.current) return
    let cancelled = false
    let timeoutId: number | undefined

    const refreshDetection = async () => {
      const video = videoRef.current
      if (!video || cancelled) return
      try {
        const face = await detectFace(video, performance.now())
        if (!cancelled) {
          setFaceBounds(face)
          setDetectionReady(true)
        }
      } catch {
        if (!cancelled) setDetectionReady(false)
      }
      if (!cancelled) timeoutId = window.setTimeout(refreshDetection, 250)
    }

    void refreshDetection()
    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [status])

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
        <TemplateSelector templates={memeTemplates} value={templateId} onChange={setTemplateId} />
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

          <div className={`camera-stage ${captureFlash ? 'capture-flash' : ''}`}>
            <video ref={videoRef} className="camera-video" playsInline muted aria-label="Live camera preview" />
            {status !== 'ready' && (
              <div className="camera-empty">
                <div className="camera-icon">◉</div>
                <strong>{status === 'starting' ? 'Starting camera' : 'Camera preview'}</strong>
                <span>{cameraError ?? (status === 'denied' ? 'Allow camera access in your browser settings.' : 'Start the camera to begin.')}</span>
              </div>
            )}
            {faceBounds && status === 'ready' && videoRef.current && (
              <div
                className="face-box"
                style={{
                  left: `${100 - ((faceBounds.x + faceBounds.width) / videoRef.current.videoWidth) * 100}%`,
                  top: `${(faceBounds.y / videoRef.current.videoHeight) * 100}%`,
                  width: `${(faceBounds.width / videoRef.current.videoWidth) * 100}%`,
                  height: `${(faceBounds.height / videoRef.current.videoHeight) * 100}%`,
                }}
                aria-label="Detected face"
              />
            )}
            <div className={`face-guide ${faceBounds ? 'face-guide-detected' : ''}`} aria-hidden="true" />
            <span className="stage-label">FACE GUIDE / PREVIEW</span>
          </div>

          <div className="card-footer">
            <p className="helper-text">{detectionReady ? 'Face detected · ready to capture.' : 'Position one face inside the guide.'}</p>
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
                <strong>{renderStatus === 'capturing' ? 'Generating preview' : renderStatus === 'error' ? 'Could not generate preview' : 'Your edit will appear here'}</strong>
                <span>{renderStatus === 'capturing' ? 'Rendering the captured frame.' : renderStatus === 'error' ? 'Try capturing again.' : 'Capture a photo to generate the meme composite.'}</span>
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
