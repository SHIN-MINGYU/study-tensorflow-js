import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { bostonCause, bostonResult } from "../data/BostonHousingPrice";

export default function BustonHousingPrice() {
  const [model, setModel] = useState<tf.LayersModel>();
  // 중앙값 ?
  // 10000, 20000 ,30000, 40000, 60000 이 있을떄
  // 3만이 중앙 값이다. => 평균은 아니지만 가장 중간에 있는 값임.

  // table row

  // CRIM : 범죄율
  // CHAS : 강변(TRUE FALSE)
  // MEDV : 집값
  // RIM : 평균 방의 갯수
  // LSTAT : 하위계층 비율
  // TAX : 제산세 비율
  // PTRATIO : 학생 교사의 비율

  useEffect(() => {
    const cause = tf.tensor(bostonCause);
    const result = tf.tensor(bostonResult);

    const x = tf.input({ shape: [13] });
    const y = tf.layers.dense({ units: 1 }).apply(x);

    const model = tf.model({ inputs: x, outputs: y } as any);
    const compileParam = {
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
    };
    model.compile(compileParam);

    const fitParam = {
      epochs: 100,
      callbacks: {
        onEpochEnd: function (epoch: any, logs: any) {
          console.log("epoch", epoch, logs, "RMSE =>", Math.sqrt(logs.loss));
        },
      },
    };
    model.fit(cause, result, fitParam).then((result) => {
      const predictResult: any = model.predict(cause);

      predictResult.print();

      console.log(model.getWeights()[0].arraySync());
      // 모델의 가중치가 나오게 되는데 여기서
      // 6번쨰 인덱스인 RM 이라는 값이 제일 크게 나오게 되는데 이 값이
      // 현재 모델을 학습하는데 굉장히 크게 작용한 다는 것을 알수 있음.

      console.log(model.getWeights()[1].arraySync());
      // 모델의 편향
      // 모든 곱 계산이 끝나고 편향이라는 값을 더한다는 뜻임.

      setModel(() => model);
    });
  }, []);
  return (
    <div>
      <img src="/src/assets/BostonHousingPrice.png"></img>
    </div>
  );
}
