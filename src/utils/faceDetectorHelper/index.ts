import * as faceDetection from "@tensorflow-models/face-detection";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { RefObject } from "react";

export const render = async (
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  detector:
    | faceLandmarksDetection.FaceLandmarksDetector
    | faceDetection.FaceDetector
) => {
  if (!ctx) {
    alert("ctx is undefined");
    return;
  }
  console.time("render");
  ctx.drawImage(video, 0, 0, 600, 400);
  try {
    const [{ box, keypoints }] = await detector.estimateFaces(canvas, {
      flipHorizontal: false,
    });
    console.log(box, keypoints);
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "blue";
    ctx.rect(box.xMin, box.yMin, box.width, box.height);
    ctx.stroke();

    ctx.fillStyle = "Red";
    keypoints.forEach((el) => {
      ctx.fillRect(el.x, el.y, 5, 5);
    });
    console.timeEnd("render");
  } catch (err) {
    console.log("face is not appeared");
  }
};

export const connectToVideo = (
  ref: RefObject<HTMLVideoElement>,
  stream: MediaStream,
  config: {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    detector:
      | faceLandmarksDetection.FaceLandmarksDetector
      | faceDetection.FaceDetector;
  }
) => {
  if (!ref.current) return;
  const video = ref.current;
  const { ctx, canvas, detector } = config;
  video.muted = true;
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();
  };
  video.oncanplaythrough = () => {
    setInterval(() => render(ctx!, video, canvas, detector!), 40);
  };
};
