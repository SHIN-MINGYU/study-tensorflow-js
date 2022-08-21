import { useEffect, useRef, useState } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

import "@mediapipe/face_mesh";
import { connectToVideo, render } from "../utils/faceDetectorHelper";

export default function DetectFaceMesh() {
  const myVideo = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const model = useRef<faceLandmarksDetection.SupportedModels>(
    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
  );
  const [detector, setDetector] =
    useState<faceLandmarksDetection.FaceLandmarksDetector>();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const init = async () => {
    if (!canvas.current) return;

    const detectorConfig = {
      runtime: "tfjs",
    } as faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig;

    setDetector(
      await faceLandmarksDetection.createDetector(model.current, detectorConfig)
    );
    setCtx(canvas.current.getContext("2d"));
  };

  const connect = async () => {
    if (!ctx || !canvas.current || !detector) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    connectToVideo(myVideo, stream, { ctx, canvas: canvas.current, detector });
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    ctx && connect();
  }, [ctx]);
  return (
    <div style={{ position: "relative" }}>
      <video
        ref={myVideo}
        playsInline
        style={{
          display: "none",
          transform: "scaleX(-1)",
          visibility: "hidden",
          width: "auto",
          height: "auto",
        }}></video>
      <canvas ref={canvas} width="600" height={400}></canvas>
    </div>
  );
}
