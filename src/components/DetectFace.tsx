import {
  CanvasHTMLAttributes,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import "@mediapipe/face_detection";
import "@tensorflow/tfjs-core";
/* // Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl"; */
import * as faceDetection from "@tensorflow-models/face-detection";

export default function DetectFace() {
  const myVideo = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<faceDetection.SupportedModels>();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const connect = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    connectToVideo(myVideo, stream);
  };

  const connectToVideo = (
    ref: RefObject<HTMLVideoElement>,
    stream: MediaStream
  ) => {
    if (!ref.current) return;
    const video = ref.current;
    video.oncanplaythrough = () => {
      setInterval(() => render(), 100);
    };
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      //   setInterval(() => faceDetecting(video), 500);
    };
  };

  const faceDetecting = async (
    canvas: HTMLCanvasElement | HTMLVideoElement
  ) => {
    const detector = await faceDetection.createDetector(model!, {
      runtime: "tfjs",
      // solutionPath: "/node_modules/@mediapipe/face_detection",
    });

    const faces = await detector.estimateFaces(canvas, {
      flipHorizontal: false,
    });
    return faces;
  };

  const init = async () => {
    setModel(faceDetection.SupportedModels.MediaPipeFaceDetector);
    const video = myVideo.current;
    if (!video) {
      alert("vidoe components is not called");
      return;
    }
    setCtx(canvas.current!.getContext("2d"));
  };

  const render = async () => {
    if (!ctx) {
      alert("ctx is undefined");
      return;
    }
    ctx.drawImage(myVideo.current!, 0, 0, 600, 400);
    try {
      const [face] = await faceDetecting(canvas.current!);

      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "blue";
      ctx.rect(face.box.xMin, face.box.yMin, face.box.width, face.box.height);
      ctx.stroke();

      ctx.fillStyle = "Red";
      face.keypoints.forEach((el) => {
        ctx.fillRect(el.x, el.y, 5, 5);
      });
    } catch (err) {
      console.log("face is not appeared");
    }
  };

  useEffect(() => {
    init();

    /*     const cancleToken = setInterval(
      () => myVideo.current && faceDetecting(myVideo.current),
      100
    );
    return () => clearInterval(cancleToken); */
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
