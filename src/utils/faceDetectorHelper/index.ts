import * as faceDetection from "@tensorflow-models/face-detection";
import { BoundingBox } from "@tensorflow-models/face-detection/dist/shared/calculators/interfaces/shape_interfaces";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { RefObject } from "react";
import { TRIANGULATION } from "../../data/TRIANGULATATION";

// ======================================================================================================
let renderID: number | undefined = undefined;

export const renderEffect = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  effectCanvas: HTMLCanvasElement,
  detector:
    | faceLandmarksDetection.FaceLandmarksDetector
    | faceDetection.FaceDetector
) => {
  if (!ctx) {
    alert("ctx is undefined");
    return;
  }

  const effectContext = effectCanvas.getContext("2d")!;

  const render = async () => {
    if (renderID) {
      cancelAnimationFrame(renderID);
    }

    console.time("render");
    try {
      const [{ box, keypoints }] = await detector.estimateFaces(canvas, {
        flipHorizontal: false,
      });
      effectContext.clearRect(0, 0, 600, 400);
      console.log(box, keypoints);
      await drawBox(effectContext, box);
      await drawRect(effectContext, keypoints);
      await drawMesh(effectContext, keypoints);
    } catch (err) {
      console.log("face is not appeared");
    } finally {
      console.timeEnd("render");
      renderID = requestAnimationFrame(render);
    }
  };
  requestAnimationFrame(render);
};

// ======================================================================================================

const drawRect = async (
  ctx: CanvasRenderingContext2D,
  keypoints: Array<faceLandmarksDetection.Keypoint>
) => {
  console.log(ctx);
  keypoints.forEach((el) => {
    ctx.fillRect(el.x, el.y, 4, 4);
  });
};

// ======================================================================================================

const drawBox = async (ctx: CanvasRenderingContext2D, box: BoundingBox) => {
  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "blue";
  ctx.rect(box.xMin, box.yMin, box.width, box.height);
  ctx.stroke();
};

// ======================================================================================================

const drawMesh = async (
  ctx: CanvasRenderingContext2D,
  keypoints: Array<faceLandmarksDetection.Keypoint>
) => {
  ctx.lineWidth = 1;
  ctx.fillStyle = "aqua";

  for (let i = 0; i < TRIANGULATION.length / 3; i++) {
    const points = [
      TRIANGULATION[i * 3],
      TRIANGULATION[i * 3 + 1],
      TRIANGULATION[i * 3 + 2],
    ].map((index) => keypoints[index]);
    drawPath(ctx, points, true);
  }
};

// ======================================================================================================

const drawPath = (
  ctx: CanvasRenderingContext2D,
  points: Array<faceLandmarksDetection.Keypoint>,
  closePath: boolean
) => {
  const region = new Path2D();
  region.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point.x, point.y);
  }
  if (closePath) {
    region.closePath();
  }
  ctx.fill(region);
};

// ======================================================================================================

const renderVideo = (
  videoContext: CanvasRenderingContext2D,
  video: HTMLVideoElement
) => {
  const render = () => {
    videoContext.drawImage(video, 0, 0, 600, 400);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
};

// ======================================================================================================

export const connectToVideo = (
  ref: RefObject<HTMLVideoElement>,
  stream: MediaStream,
  config: {
    videoCanvas: HTMLCanvasElement;
    effectCanvas: HTMLCanvasElement;
    detector:
      | faceLandmarksDetection.FaceLandmarksDetector
      | faceDetection.FaceDetector;
  }
) => {
  if (!ref.current) return;
  const video = ref.current;

  const { videoCanvas, effectCanvas, detector } = config;
  const videoContext = videoCanvas.getContext("2d");
  video.muted = true;
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();
    renderVideo(videoContext!, video);
  };
  video.oncanplaythrough = () => {
    renderEffect(videoContext!, videoCanvas, effectCanvas, detector);
  };
};
