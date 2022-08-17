import * as tf from "@tensorflow/tfjs";
import { useEffect } from "react";

function App() {
  const temperature = [20, 21, 22, 23];
  const sell = [40, 42, 44, 46];
  // tensorflow js 는 모든 분석를 텐서로 변환해서 실행해야함
  const cause = tf.tensor(temperature);
  const result = tf.tensor(sell);

  const x = tf.input({ shape: [1] }); // 모델에 입력된 값의 갯수 columns
  const y = tf.layers.dense({ units: 1 }).apply(x); // output 값의 갯수 여기서는 sell로 표현됨
  // apply method를 통해서 입력값과 연결이 될 것임
  const model = tf.model({ inputs: x, outputs: y } as any); // 학습이나 예측작업을 실행 시키기 위해 변수에 입력
  const compileParam = {
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
  };
  model.compile(compileParam); // 모델을 만들기 확정 할떄 쓰는 메서드
  /* 입력값 {
      optimizer => 효율적으로 모델을 학습시키는 방법
      loss => 모델의 정밀도 측정 방법
    }*/

  // 모델의 모양은 만듬. 허나
  // 아직 모델에 데이터 입력해서 계산 방법을 만든 것은 아님
  const fitParam = { epochs: 20000 }; // 학습을 몇번 실행 할지에 대한 options

  // 데이터로 모델을 학습시킨다.
  // model.fit => 실질적으로 학습이 일어나는 장소
  // args : 원인, 결과, 학습 옵션

  model.fit(cause, result, fitParam).then((result) => {
    // fitParam에서 지정해준 epochs 횟수가 끝나면 result가 출력이 됨.
    const predictResult: any = model.predict(cause); // cause => 온도 데이터를 tensor로 만든값

    // predicResult 타입 => tensor
    predictResult.print();
    // tensor를 우리눈에 보기 좋은 형태로 표시해 줘야함.
  });
  const nextTem = [15, 16, 17, 18, 19];
  const nextCause = tf.tensor(nextTem);
  const nextResult: any = model.predict(nextCause);
  nextResult.print();

  return <div>hi</div>;
}

export default App;
