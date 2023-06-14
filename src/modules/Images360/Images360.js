import * as THREE from "../../../libs/three.js/build/three.module.js";
import { EventDispatcher } from "../../EventDispatcher.js";

class Image360 {
  constructor(
    file,
    thumbnail,
    longitude,
    latitude,
    altitude,
    course,
    pitch,
    roll
  ) {
    this.file = file;
    this.thumbnail = thumbnail;
    this.longitude = longitude;
    this.latitude = latitude;
    this.altitude = altitude;
    this.course = course;
    this.pitch = pitch;
    this.roll = roll;
  }
}

export class Images360 extends EventDispatcher {
  constructor(viewer) {
    super();

    this.viewer = viewer;

    this.selectingEnabled = true;

    this.images = [];
    this.node = new THREE.Object3D();

    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 128, 128),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide })
    );
    this.sphere.visible = false;
    this.sphere.scale.set(-1000, 1000, 1000);

    this.focus = this.focus.bind(this);
    this.unfocus = this.unfocus.bind(this);
    this.node.add(this.sphere);
    this._visible = true;

    this.focusedImage = null;
    this.currentlyHovered = null;
    this.previousView = {
      controls: null,
      position: null,
      target: null,
    };
    this.raycaster = new THREE.Raycaster();
    this.hoverMaterial = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: 0xff0000,
    });
    this.sm = new THREE.MeshBasicMaterial({ side: THREE.BackSide });

    // viewer.addEventListener("update", () => {
    //   this.update(viewer);
    // });
    viewer.inputHandler.addInputListener(this);

    this.addEventListener("mousedown", () => {
      if (this.currentlyHovered && this.currentlyHovered.image360) {
        this.focus(this.currentlyHovered.image360);
      }
    });
  }

  set visible(visible) {
    if (this._visible === visible) {
      return;
    }
    this.sphere.visible = visible && this.focusedImage != null;
    this._visible = visible;
    this.dispatchEvent({
      type: "visibility_changed",
      images: this,
    });
  }

  get visible() {
    return this._visible;
  }

  focus(image360, sendEvent = true, inTarget = null) {
    if (this.focusedImage !== null) {
      this.unfocus();
    }
    this.viewer.setEDLOpacity(0);
    if (sendEvent) {
      const event = new CustomEvent("panoLoad", {
        detail: {
          viewer: this.viewer.canvasId,
          image: image360,
        },
      });
      document.dispatchEvent(event);
    }

    this.previousView = {
      controls: this.viewer.controls,
      position: this.viewer.scene.view.position.clone(),
      target: this.viewer.scene.view.getPivot(),
    };

    this.viewer.setControls(this.viewer.orbitControls);
    this.viewer.orbitControls.doubleClockZoomEnabled = false;

    this.selectingEnabled = false;

    this.sphere.visible = false;

    this.load(image360).then(() => {
      this.sphere.visible = true;
      this.sphere.material.map = image360.texture;
      this.sphere.material.needsUpdate = true;
    });

    // orientation
    let { course, pitch, roll } = image360;

    this.sphere.rotation.set(
      THREE.Math.degToRad(course),
      THREE.Math.degToRad(pitch),
      THREE.Math.degToRad(roll),
      "XYZ"
    );

    this.sphere.position.set(...image360.position);

    let target = new THREE.Vector3(...image360.position);
    let dir = target.clone().sub(this.viewer.scene.view.position).normalize();
    let move = dir.multiplyScalar(0.000001);
    let newCamPos = target.clone().sub(move);

    this.viewer.scene.view.setView(newCamPos, target, 500, () => {
      if (inTarget && inTarget.pitch) {
        this.viewer.scene.view.pitch = inTarget.pitch;
        this.viewer.scene.view.yaw = inTarget.yaw;
      }
    });

    this.focusedImage = image360;
  }

  unfocus(sendEvent = true) {
    this.selectingEnabled = true;
    this.viewer.setEDLOpacity(1);

    let image = this.focusedImage;

    if (image === null) {
      return;
    }
    delete image.texture;
    this.sphere.material.map = null;
    this.sphere.material.needsUpdate = true;
    this.sphere.visible = false;
    this.viewer.orbitControls.doubleClockZoomEnabled = true;
    this.viewer.setControls(this.previousView.controls);

    this.focusedImage = null;

    if (sendEvent) {
      const event = new CustomEvent("panoUnload", {
        detail: {
          viewer: this.viewer.canvasId,
        },
      });
      document.dispatchEvent(event);
    }
  }

  load(image360) {
    let resolved = false;
    return new Promise((resolve) => {
      if (image360.texture) {
        resolve(null);
      } else {
        new THREE.TextureLoader().load(
          image360.thumbnail,
          (texture) => {
            image360.texture = texture;
            resolved = true;
            resolve(null);
            loadOrgImage.bind(this)();
          },
          undefined,
          (err) => {
            loadOrgImage.bind(this)();
          }
        );
        let loadOrgImage = function () {
          new THREE.TextureLoader().load(image360.file, (texture) => {
            image360.texture = texture;
            this.sphere.visible = true;
            this.sphere.material.map = image360.texture;
            this.sphere.material.needsUpdate = true;
            if (!resolved) {
              resolve(null);
            }
            // }
          });
        };
      }
    });
  }

  //   handleHovering() {
  //     let mouse = this.viewer.inputHandler.mouse;
  //     let camera = this.viewer.scene.getActiveCamera();
  //     let domElement = this.viewer.renderer.domElement;

  //     let ray = Potree.Utils.mouseToRay(
  //       mouse,
  //       camera,
  //       domElement.clientWidth,
  //       domElement.clientHeight
  //     );

  //     this.raycaster.ray.copy(ray);
  //     let intersections = this.raycaster.intersectObjects(this.node.children);

  //     if (intersections.length === 0) {
  //       return;
  //     }

  //     let intersection = intersections[0];
  //     this.currentlyHovered = intersection.object;
  //     this.currentlyHovered.material = this.hoverMaterial;
  //   }

  //   update() {
  //     let { viewer } = this;

  //     if (this.currentlyHovered) {
  //       this.currentlyHovered.material = this.sm;
  //       this.currentlyHovered = null;
  //     }

  //     if (this.selectingEnabled) {
  //       // this.handleHovering();
  //     }
  //   }
}

export class Images360Loader {
  static async load(url, imgsUrl, viewer, tm_data) {
    let tmatrix, toffset;

    tmatrix = tm_data.tm;
    toffset = tm_data.offset;

    let response = await fetch(url);
    let text = await response.text();
    let imgData = JSON.parse(text);

    let images360 = new Images360(viewer);
    Object.keys(imgData).forEach((imgName) => {
      let raw_position = imgData[imgName].position;
      let rotation = imgData[imgName].rotation;

      const pos = new THREE.Vector4(
        raw_position[0],
        raw_position[1],
        raw_position[2],
        1
      );
      pos.applyMatrix4(tmatrix);

      const long = parseFloat(pos.x - toffset[0]);
      const lat = parseFloat(pos.y - toffset[1]);
      const alt = parseFloat(pos.z - toffset[2]);
      const course = parseFloat(rotation[0]);
      const pitch = parseFloat(rotation[1]);
      const roll = parseFloat(rotation[2]);

      let file = `${imgsUrl}/${imgName}`;
      let thumbnail = `${imgsUrl}/thumbnails/${imgName}`;
      let image360 = new Image360(
        file,
        thumbnail,
        long,
        lat,
        alt,
        course,
        pitch,
        roll
      );

      let position = [long, lat, alt];
      image360.position = position;

      images360.images.push(image360);
    });

    return images360;
  }
}
