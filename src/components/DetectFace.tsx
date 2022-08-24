import { RefObject, useEffect, useRef, useState } from "react";
import "@mediapipe/face_detection";

// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import * as faceDetection from "@tensorflow-models/face-detection";
import { connectToVideo } from "../utils/faceDetectorHelper";

export default function DetectFace() {
  const myVideo = useRef<HTMLVideoElement>(null);
  const videoCanvas = useRef<HTMLCanvasElement>(null);
  const effectCanvas = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<faceDetection.SupportedModels>(
    faceDetection.SupportedModels.MediaPipeFaceDetector
  );

  const [detector, setDetector] = useState<faceDetection.FaceDetector>();

  const connect = async () => {
    if (!videoCanvas.current || !detector || !effectCanvas.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    connectToVideo(myVideo, stream, {
      videoCanvas: videoCanvas.current,
      effectCanvas: effectCanvas.current,
      detector,
    });
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
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    detector && connect();
  }, [detector]);

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
      <canvas ref={videoCanvas} width="600" height="400"></canvas>
      <canvas
        ref={effectCanvas}
        width="600"
        height="400"
        style={{
          position: "absolute",
          transform: "translateX(-100%)",
        }}></canvas>
    </div>
  );
}
