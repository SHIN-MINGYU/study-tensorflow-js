import * as faceDetection from "@tensorflow-models/face-detection";
import { BoundingBox } from "@tensorflow-models/face-detection/dist/shared/calculators/interfaces/shape_interfaces";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { RefObject } from "react";
import { TRIANGULATION } from "../../data/TRIANGULATATION";
import * as THREE from "three";
import renderEffectThree from "./threeEffectRenderer";

// ======================================================================================================
let renderID: number | undefined = undefined;

export const renderEffect = async (
  ctx: CanvasRenderingContext2D,
  videoCanvas: HTMLCanvasElement,
  effectCanvas: HTMLCanvasElement,
  detector:
    | faceLandmarksDetection.FaceLandmarksDetector
    | faceDetection.FaceDetector,
  renderType?: any
) => {
  if (!ctx) {
    alert("ctx is undefined");
    return;
  }

  const effectContext = effectCanvas.getContext("2d")!;

  const render = async () => {
    // closure function for requestAnimationFrame
    if (renderID) {
      cancelAnimationFrame(renderID);
    }

    console.time("render");
    try {
      const [{ box, keypoints }] = await detector.estimateFaces(videoCanvas, {
        flipHorizontal: false,
      });
      effectContext.clearRect(0, 0, 600, 400);
      if (renderType) {
        renderType.box && drawBox(effectContext, box);
        // renderType.rect && drawRect(effectContext, keypoints);
        renderType.mesh && drawMesh(effectContext, keypoints);
        renderType.eye && drawEyeEffect(effectContext, keypoints);
        // drawFaceCover(effectContext, keypoints);
      } else {
        drawBox(effectContext, box);
        drawRect(effectContext, keypoints);
        drawMesh(effectContext, keypoints);
      }
    } catch (err) {
      effectContext.clearRect(0, 0, 600, 400);
      console.log("face is not appeared");
    } finally {
      console.timeEnd("render");
      renderID = requestAnimationFrame(render);
    }
  };
  requestAnimationFrame(render);
};

// ======================================================================================================

const drawRect = (
  ctx: CanvasRenderingContext2D,
  keypoints: Array<faceLandmarksDetection.Keypoint>
) => {
  console.log(ctx);
  keypoints.forEach((el) => {
    ctx.fillRect(el.x, el.y, 4, 4);
  });
};

// ======================================================================================================

const drawBox = (ctx: CanvasRenderingContext2D, box: BoundingBox) => {
  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "blue";
  ctx.rect(box.xMin, box.yMin, box.width, box.height);
  ctx.stroke();
};

// ======================================================================================================

const drawMesh = (
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
/* 
const drawBigEye = (
  ctx: CanvasRenderingContext2D,
  keypoints: Array<faceLandmarksDetection.Keypoint>,
  videoCanvas: HTMLCanvasElement
) => {
  let mesh = keypoints;

  // Left eye bounds (top, left, bottom, right) are the points (27, 130, 23, 243)
  let lTop = mesh[27].y;
  let lLeft = mesh[130].x;
  let lBot = mesh[23].y;
  let lRig = mesh[243].x;
  let lWid = lRig - lLeft;
  let lHei = lBot - lTop;

  // Right eye bounds (top, left, bottom, right) are the points (257, 463, 253, 359)
  let rTop = mesh[257].y;
  let rLeft = mesh[463].x;
  let rBot = mesh[253].y;
  let rRig = mesh[359].x;
  let rWid = rRig - rLeft;
  let rHei = rBot - rTop;

  // Draw each eye from the video onto each eye in the canvas, but twice as big
  ctx.drawImage(
    videoCanvas,
    rLeft,
    rTop,
    rWid,
    rHei,
    rLeft - rWid * 0.5,
    rTop - rHei * 0.5,
    2 * rWid,
    2 * rHei
  );
  ctx.drawImage(
    videoCanvas,
    lLeft,
    lTop,
    lWid,
    lHei,
    lLeft - lWid * 0.5,
    lTop - lHei * 0.5,
    2 * lWid,
    2 * lHei
  );
}; */

// ======================================================================================================

const drawEyeEffect = (
  ctx: CanvasRenderingContext2D,
  keypoints: Array<faceLandmarksDetection.Keypoint>
) => {
  const top = keypoints[223].y;
  const left = keypoints[143].x;
  const bot = keypoints[230].y;
  const rig = keypoints[372].x;
  const width = calculateDistance(keypoints[143], keypoints[372]);
  const height = calculateDistance(keypoints[223], keypoints[230]);
  const img = new Image();
  img.onload = () => {
    console.log(calculateAngle(keypoints[143], keypoints[372]));
    ctx.save();
    ctx.translate(left + 60, top);
    ctx.rotate(calculateAngle(keypoints[143], keypoints[372]));
    ctx.translate(-left - 60, -top);
    ctx.drawImage(img, left, top, width, height);
    ctx.restore();
  };
  img.src = "../../src/assets/sunglasses.png";
};

// ======================================================================================================

const calculateDistance = (
  benchMark: faceLandmarksDetection.Keypoint,
  relative: faceLandmarksDetection.Keypoint
): number => {
  const distance = Math.sqrt(
    Math.pow(relative.x - benchMark.x, 2) +
      Math.pow(relative.y - benchMark.y, 2)
  );
  return distance;
};

// ======================================================================================================
const calculateAngle = (
  benchMark: faceLandmarksDetection.Keypoint,
  relative: faceLandmarksDetection.Keypoint
): number => {
  const radian = Math.atan2(relative.y - benchMark.y, relative.x - benchMark.x);
  return radian;
};

// ======================================================================================================

const renderVideo = (
  videoContext: CanvasRenderingContext2D,
  video: HTMLVideoElement
) => {
  const render = () => {
    //closure function for requestAnimationFrame
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
    renderType?: any;
  }
) => {
  if (!ref.current) return;
  const video = ref.current;

  const { videoCanvas, effectCanvas, detector, renderType } = config;

  const renderer = new THREE.WebGLRenderer({
    canvas: effectCanvas,
    alpha: true,
  });
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
  camera.position.x = 600 / 2;
  camera.position.y = -400 / 2;
  camera.position.z = -200 / Math.tan(45 / 2);

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xcccccc, 0.4));
  camera.add(new THREE.PointLight(0xffffff, 0.8));
  scene.add(camera);

  camera.lookAt(300, -200, 0);

  const videoContext = videoCanvas.getContext("2d");

  video.muted = true;
  video.srcObject = stream;

  video.onloadedmetadata = () => {
    video.play();
    renderVideo(videoContext!, video);
    renderer.render(scene, camera);
  };

  video.oncanplaythrough = () => {
    const renderOption = {
      renderer,
      scene,
      camera,
    };
    renderEffectThree(effectCanvas, detector, videoCanvas, renderOption);
    /*  renderID && cancelAnimationFrame(renderID);
    renderEffect(
      videoContext!,
      videoCanvas,
      effectCanvas,
      detector,
      renderType
    ); */
  };
};
