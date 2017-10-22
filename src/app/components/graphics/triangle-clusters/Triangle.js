import {getPosNeg} from 'components/_util/math';
import {
  MeshBasicMaterial,
  DoubleSide,
  Geometry,
  Vector3,
  Face3,
  Mesh,
  Euler,
  BoxHelper
} from 'three';

const TWO_PI = 2 * Math.PI;
const DISTANCE_THRESH = 0.005;

function buildTriangle(size) {
  const buffer = size / 2;
  const color = Math.random() * 0xFFFFFF;
  const material = new MeshBasicMaterial({color, side: DoubleSide});
  const geometry = new Geometry();
  const v1 = new Vector3(-buffer, -buffer, 0);
  const v2 = new Vector3(-buffer,  buffer, 0);
  const v3 = new Vector3( buffer,  buffer, 0);
  geometry.vertices.push(v1);
  geometry.vertices.push(v2);
  geometry.vertices.push(v3);
  geometry.faces.push(new Face3(0, 1, 2));
  material.transparent = true;
  material.opacity = 0.5;
  return new Mesh(geometry, material);
}

function getRandomNumber(multiplier, canBeNegative) {
  return canBeNegative ? getPosNeg() : 1 * multiplier * Math.random();
}

function getRandomVector(multiplier, canBeNegative) {
  return new Vector3(
    getRandomNumber(multiplier, canBeNegative),
    getRandomNumber(multiplier, canBeNegative),
    getRandomNumber(multiplier, canBeNegative)
  );
}

export default class Triangle {

  constructor(size) {

    this.mesh = buildTriangle(size);

    this.positionGoal = getRandomVector(30, true);
    this.positionVelocity = getRandomVector(0, false);
    this.scaleGoal = getRandomVector(10, false);
    this.scaleVelocity = getRandomVector(0, false);
    this.rotateGoal = getRandomVector(Math.PI, false);
    this.rotateVelocity = getRandomVector(0, false);

    this.reset();
  }

  reset() {
    this.shouldRender = true;
    this.positionGoal = getRandomVector(30);
    this.scaleGoal = getRandomVector(10);
    this.rotateGoal = getRandomVector(Math.PI);
  }

  getMesh() {
    return this.mesh;
  }

  update(elapsedTime) {
    if (!this.shouldRender) {
      return;
    }

    const positionDistance = this.positionGoal.clone()
      .sub(this.mesh.position.clone())
      .multiplyScalar(50 * Math.random() * elapsedTime);
    this.positionVelocity.add(positionDistance);
    const velocity = this.positionVelocity.clone()
      .multiplyScalar(0.5)
      .add(positionDistance.multiplyScalar(0.5));
    this.mesh.position.add(velocity);

    const scaleDistance = this.scaleGoal.clone()
      .sub(this.mesh.scale.clone())
      .multiplyScalar(50 * Math.random() * elapsedTime);
    this.scaleVelocity.add(scaleDistance);
    const scaleVelocity = this.scaleVelocity.clone()
      .multiplyScalar(0.5)
      .add(scaleDistance.multiplyScalar(0.5));
    this.mesh.scale.add(scaleVelocity);

    const rotateDistance = this.rotateGoal.clone()
      .sub(this.mesh.rotation.clone().toVector3())
      .multiplyScalar(50 * Math.random() * elapsedTime);
    this.rotateVelocity.add(rotateDistance);
    const rotateVelocity = this.rotateVelocity.clone()
      .multiplyScalar(0.5)
      .add(rotateDistance.multiplyScalar(0.5));
    const rotation = this.mesh.rotation.clone().toVector3().add(rotateVelocity);
    this.mesh.rotation.setFromVector3(rotation);

    const meanDistance = positionDistance
      .add(scaleDistance)
      .add(rotateDistance)
      .multiplyScalar(0.33)
      .length();

    if (meanDistance <= DISTANCE_THRESH) {
      this.shouldRender = false;
    }
  }

}
