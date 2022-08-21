import { RefObject, useEffect, useRef, useState } from "react";
import "@mediapipe/face_detection";

// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import * as faceDetection from "@tensorflow-models/face-detection";
import { connectToVideo, render } from "../utils/faceDetectorHelper";

export default function DetectFace() {
  const myVideo = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<faceDetection.SupportedModels>(
    faceDetection.SupportedModels.MediaPipeFaceDetector
  );
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [detector, setDetector] = useState<faceDetection.FaceDetector>();

  const connect = async () => {
    if (!ctx || !canvas.current || !detector) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    connectToVideo(myVideo, stream, { ctx, canvas: canvas.current, detector });
  };

  const init = async () => {
    const video = myVideo.current;
    if (!video) {
      alert("vidoe components is not called");
      return;
    }
    setDetector(
      await faceDetection.createDetector(model!, {
        runtime: "tfjs",
      })
    );
    setCtx(canvas.current!.getContext("2d"));
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
