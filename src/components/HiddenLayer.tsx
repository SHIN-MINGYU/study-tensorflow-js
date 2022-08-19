import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import { bostonCause, bostonResult } from "../data/BostonHousingPrice";

export default function HiddenLayer() {
  const [model, setModel] = useState<tf.LayersModel>();

  useEffect(() => {
    const cause = tf.tensor(bostonCause);
    const result = tf.tensor(bostonResult);

    const x = tf.input({ shape: [13] }); // 입력층
    const h1 = tf.layers.dense({ units: 13, activation: "relu" }).apply(x); // 은닉층
    // node또는 weight는 몇개인가를 dense안에 있는 object에 입력
    // 보통은 입력층과 출력층 사이의 값을 입력
    // activation function을 지정해야함 뭘쓸진 모르겠을 떄는 relu쓰자
    const h2 = tf.layers.dense({ units: 13, activation: "relu" }).apply(h1); // 은닉층

    // 아주많은 문제들은 은닉층 하나 로도 충분하지만
    // 하나로도 해결되지 않는 문제들이 있을 경우에는 하나씩 추가해나가면 좋을듯

    const y = tf.layers.dense({ units: 1 }).apply(h2); // 출력층

    const model = tf.model({ inputs: x, outputs: y } as any);
    const compileParam = {
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
    };
    model.compile(compileParam);

    model && tfvis.show.modelSummary({ name: "요약", tab: "모델" }, model);
    // 우리 모델의 input  과 output 그리고 전반적인 정보를 보여줌
    //visualization code

    const _history: any[] = [];
    const fitParam = {
      epochs: 100,
      callbacks: {
        onEpochEnd: function (epoch: any, logs: any) {
          console.log("epoch", epoch, logs, "RMSE =>", Math.sqrt(logs.loss));
          // logs 에 담긴정보 : {loss : number}
          // visualization
          _history.push(logs);
          tfvis.show.history({ name: "summary", tab: "역사" }, _history, [
            "loss",
          ]);
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
  return <div></div>;
}
