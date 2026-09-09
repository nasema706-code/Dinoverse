import * as THREE from "three";

export function fitAndSit(root: THREE.Object3D, axis: "x" | "y" | "z", target: number) {
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (!isFinite(box.min.x) || !isFinite(box.min.y) || !isFinite(box.min.z)) return;
  const size = box.getSize(new THREE.Vector3());
  const dim = axis === "y" ? size.y : axis === "z" ? size.z : size.x;
  if (dim < 1e-5) return;
  root.scale.multiplyScalar(target / dim);
  root.updateMatrixWorld(true);
  box.setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
}
