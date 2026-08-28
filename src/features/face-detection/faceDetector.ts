import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

export type FaceBounds = {
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

let detectorPromise: Promise<FaceDetector> | null = null

export function getFaceDetector() {
  if (!detectorPromise) {
    detectorPromise = FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm',
    ).then((vision) => FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
      },
      runningMode: 'VIDEO',
      minDetectionConfidence: 0.55,
      minSuppressionThreshold: 0.3,
    }))
  }
  return detectorPromise
}

export async function detectFace(video: HTMLVideoElement, timestamp: number): Promise<FaceBounds | null> {
  const detector = await getFaceDetector()
  const result = detector.detectForVideo(video, timestamp)
  const detection = result.detections[0]
  const box = detection?.boundingBox
  if (!box) return null

  return {
    x: box.originX,
    y: box.originY,
    width: box.width,
    height: box.height,
    confidence: detection.categories[0]?.score ?? 0,
  }
}
