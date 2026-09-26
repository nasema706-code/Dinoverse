import * as THREE from "three";

const toParent = new THREE.Matrix4();

/** Measures in the parent's space so the result is the same whether or not the parent has rendered yet. */
function localBox(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(root);
  if (root.parent) box.applyMatrix4(toParent.copy(root.parent.matrixWorld).invert());
  return box;
}

export function fitAndSit(root: THREE.Object3D, axis: "x" | "y" | "z", target: number) {
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0);
  let box = localBox(root);
  if (!isFinite(box.min.x) || !isFinite(box.min.y) || !isFinite(box.min.z)) return;
  const size = box.getSize(new THREE.Vector3());
  const dim = axis === "y" ? size.y : axis === "z" ? size.z : size.x;
  if (dim < 1e-5) return;
  root.scale.multiplyScalar(target / dim);
  box = localBox(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
}
