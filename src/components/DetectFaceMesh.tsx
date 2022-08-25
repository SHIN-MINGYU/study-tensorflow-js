import {
  ChangeEvent,
  MouseEvent,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

import "@mediapipe/face_mesh";
import { connectToVideo } from "../utils/faceDetectorHelper";

export default function DetectFaceMesh() {
  const myVideo = useRef<HTMLVideoElement>(null);
  const videoCanvas = useRef<HTMLCanvasElement>(null);
  const effectCanvas = useRef<HTMLCanvasElement>(null);
  const model = useRef<faceLandmarksDetection.SupportedModels>(
    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
  );

  const [renderType, setRenderType] = useState<{ [key: string]: boolean }>({
    box: true,
    rect: true,
    mesh: true,
    eye: true,
  });

  const [detector, setDetector] =
    useState<faceLandmarksDetection.FaceLandmarksDetector>();

  const init = async () => {
    if (!videoCanvas.current) return;
    const detectorConfig = {
      runtime: "tfjs",
    } as faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig;

    setDetector(
      await faceLandmarksDetection.createDetector(model.current, detectorConfig)
    );
  };

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
      renderType,
    });
  };

  const onClick = (e: MouseEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    setRenderType((prevState) => {
      const newState: { [key: string]: boolean } = {};
      for (let key of Object.keys(prevState)) {
        if (key === target.value) {
          newState[key] = !prevState[key];
        } else {
          newState[key] = prevState[key];
        }
      }
      return newState;
    });
  };

  const renderRadioButton = (items: Array<string>) => {
    return items.map((key, index) => {
      return (
        <span key={key}>
          <input
            onChange={() => {}}
            onClick={onClick}
            id={`${index}`}
            type="radio"
            value={key}
            checked={renderType[key]}
          />
          <label htmlFor={`#${index}`}>{key}</label>
        </span>
      );
    });
  };
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    detector && connect();
  }, [detector, renderType]);

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
      <div>{renderRadioButton(Object.keys(renderType))}</div>
    </div>
  );
}
