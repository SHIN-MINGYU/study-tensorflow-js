import * as faceDetection from "@tensorflow-models/face-detection";
import { BoundingBox } from "@tensorflow-models/face-detection/dist/shared/calculators/interfaces/shape_interfaces";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { WebGLRenderer, Camera, Scene, Group } from "three";
import modelLoader from "./modelLoader";

const renderEffectThree = async (
  effectCanvas: HTMLCanvasElement,
  detector:
    | faceLandmarksDetection.FaceLandmarksDetector
    | faceDetection.FaceDetector,
  videoCanvas: HTMLCanvasElement,
  renderOption: {
    renderer: WebGLRenderer;
    scene: Scene;
    camera: Camera;
  }
) => {
  const glasses: Group = await modelLoader(
    "../../src/assets/3D_Glasses/scene.gltf"
  );
  const { renderer, scene, camera } = renderOption;
  scene.add(glasses);

  const render = async () => {
    try {
      renderer.render(scene, camera);

      const [{ box, keypoints }] = await detector.estimateFaces(videoCanvas, {
        flipHorizontal: false,
      });

      glasses.position.x = (keypoints[6].x + keypoints[168].x) / 2;
      glasses.position.y = -(keypoints[6].y + keypoints[168].y) / 2;
      glasses.position.z =
        -camera.position.z + (keypoints[6].z! + keypoints[168].z!) / 2;

      glasses.up.x = (keypoints[6].x + keypoints[168].x) / 2 - keypoints[94].x;
      glasses.up.y = -(
        (keypoints[6].y + keypoints[168].y) / 2 -
        keypoints[94].y
      );
      glasses.up.z =
        (keypoints[6].z! + keypoints[168].z!) / 2 - keypoints[94].z!;

      const length = Math.sqrt(
        glasses.up.x ** 2 + glasses.up.y ** 2 + glasses.up.z ** 2
      );

      glasses.up.x /= length;
      glasses.up.y /= length;
      glasses.up.z /= length;

      const eyeDist = Math.sqrt(
        (keypoints[133].x - keypoints[362].x) ** 2 +
          (keypoints[133].y - keypoints[362].y) ** 2 +
          (keypoints[133].z! - keypoints[362].z!) ** 2
      );
      glasses.scale.x = eyeDist / 6;
      glasses.scale.y = eyeDist / 6;
      glasses.scale.z = eyeDist / 6;

      glasses.rotation.y = Math.PI;
      glasses.rotation.z = Math.PI / 2 - Math.acos(glasses.up.x);
    } catch (err) {
    } finally {
      requestAnimationFrame(render);
    }
  };
  render();
};

export default renderEffectThree;
