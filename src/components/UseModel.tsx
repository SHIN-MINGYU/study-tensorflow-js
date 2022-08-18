import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

export default function UseModel() {
  const [model, setModel] = useState<tf.LayersModel>();
  const [number, setNumber] = useState<number>(0);
  const [predictNum, setPredictNum] = useState<number>();

  const onChange = async (e: any) => {
    //  loadLayersModel은 모델의 저장소의 위치만 안다면 모델을 불러와서 쓰기 가능.
    const model = await tf.loadLayersModel(`${e.target.value}://lemon`);
    setModel(() => model);
  };

  useEffect(() => {
    tf.loadLayersModel(`localstorage://lemon`).then((model) => setModel(model));
  }, []);
  useEffect(() => {
    // 모델이 있다면 숫자를 예측해서 던져줌.
    const tensor = tf.tensor([number]);
    setPredictNum(() => {
      return model && (model?.predict(tensor) as any).arraySync()[0][0];
    });
  }, [number]);

  return (
    <>
      <input
        value={number}
        onChange={(e) => {
          if (typeof Number(e.target.value) === "number")
            setNumber(Number(e.target.value));
        }}></input>
      <p>result : {predictNum ? predictNum : "예측중 ..."}</p>
      <button>saveModel</button>
      <div>
        <input
          onChange={onChange}
          id="1"
          type="radio"
          name="mode"
          value="localstorage"
          checked
        />
        <label htmlFor="1">localstorage</label>
        <input
          onChange={onChange}
          id="2"
          type="radio"
          name="mode"
          value="indexeddb"
        />
        <label htmlFor="#2">indexeddb</label>
      </div>
    </>
  );
}
