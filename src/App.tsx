import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import BustonHousingPrice from "./components/BostonHousingPrice";
import DetectFace from "./components/DetectFace";
import HiddenLayer from "./components/HiddenLayer";
import SaveModel from "./components/SaveModel";
import UseModel from "./components/UseModel";
import DetectFaceMesh from "./components/DetectFaceMesh";

function App() {
  const [page, setPage] = useState(<></>);

  const init = async () => {
    await tf.setBackend("webgl");
  };

  useEffect(() => {
    init();
  }, []);

  // 실제 현실에서는 모델을 만드는 페이지와 사용하는 페이지가 다름
  // 모델은 nodejs 와 같은 기술을 통해서 웹브라우저에서 만들어지고 그것을 웹브라우저에서 사용함
  // 따라서 모델을 어딘가에 보관하면 다른 웹페이지에 해당 모달을 읽을 수 있음

  return (
    <div
      style={{
        display: "flex",
        flex: "1 1 auto",
        flexDirection: "row",
        height: "100vh",
        width: "100vw",
        flexWrap: "wrap",
        overflow: "hidden",
      }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          flexBasis: "14%",
          border: "1px solid black",
        }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: "10%",
          }}>
          <h3 style={{ margin: "auto" }}>TensorFlow 練習</h3>
        </div>
        <span style={{ width: "100%", border: "1px solid grey" }}></span>
        <a
          href="#"
          onClick={() =>
            setPage(() => {
              return <SaveModel></SaveModel>;
            })
          }>
          save Model
        </a>
        <a
          href="#"
          onClick={() =>
            setPage(() => {
              return <UseModel></UseModel>;
            })
          }>
          use Model
        </a>
        <a
          href="#"
          onClick={() =>
            setPage(() => {
              return <BustonHousingPrice></BustonHousingPrice>;
            })
          }>
          BostonHousingPrice
        </a>
        <a
          href="#"
          onClick={() =>
            setPage(() => {
              return <HiddenLayer></HiddenLayer>;
            })
          }>
          HiddenLayer
        </a>
        <a
          href="#"
          onClick={() =>
            setPage(() => {
              return <HiddenLayer></HiddenLayer>;
            })
          }>
          HiddenLayer
        </a>
        <a
          href="#"
          onClick={() =>
            setPage(() => {
              return <DetectFace></DetectFace>;
            })
          }>
          DetectFace
        </a>
        <a
          href="#"
          onClick={() =>
            setPage(() => {
              return <DetectFaceMesh></DetectFaceMesh>;
            })
          }>
          DetectFaceMesh
        </a>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          minHeight: "100vh",
          flexBasis: "85%",
          justifyContent: "center",
          alignItems: "center",
        }}
        children={page}></div>
    </div>
  );
}

export default App;
