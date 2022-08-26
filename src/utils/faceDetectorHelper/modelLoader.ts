import { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
const modelLoader = (file: string): Promise<Group> => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      file,
      (gltf) => {
        console.log("successfully loaded");
        resolve(gltf.scene);
      },
      undefined,
      (err) => {
        reject(err);
      }
    );
  });
};

export default modelLoader;
