/*
Adapted to TypeScript from the three.js PointerLockControls.js example
https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js
*/

import {
    Camera,
    Euler,
    EventDispatcher,
    Vector3
} from "three";

const _euler = new Euler(0, 0, 0, "YXZ");
const _vector = new Vector3();

const _changeEvent = {type: "change"};
const _lockEvent = {type: "lock"};
const _unlockEvent = {type: "unlock"};

const _PI_2 = Math.PI / 2;

export class PointerLockControls extends EventDispatcher {
    private readonly domElement: HTMLElement;
    public isLocked: boolean;
    public minPolarAngle: number;
    public maxPolarAngle: number;
    public sensitivity: number;
    private camera: Camera;

    constructor(camera: Camera, domElement: HTMLElement) {
        super();

        if (domElement === undefined) {
            console.warn('THREE.PointerLockControls: The second parameter "domElement" is now mandatory.');
            domElement = document.body;
        }

        this.camera = camera;
        this.domElement = domElement;
        this.isLocked = false;

        // Set to constrain the pitch of the camera
        // Range is 0 to Math.PI radians
        this.minPolarAngle = 0.0; // radians
        this.maxPolarAngle = Math.PI; // radians
        this.sensitivity = 1.0;

        this.connect();
    }

    public moveForward(distance: number): void {
        // move forward parallel to the xz-plane
        // assumes camera.up is y-up
        _vector.setFromMatrixColumn(this.camera.matrix, 0);
        _vector.crossVectors(this.camera.up, _vector);
        this.camera.position.addScaledVector(_vector, distance);
    }

    public moveRight(distance: number): void {
        _vector.setFromMatrixColumn(this.camera.matrix, 0);
        this.camera.position.addScaledVector(_vector, distance);
    }

    public lock() {
        this.domElement.requestPointerLock();
    }

    public unlock() {
        this.domElement.ownerDocument.exitPointerLock();
    }

    public getDirection(v: Vector3): Vector3 {
        return v.copy(new Vector3(0, 0, -1)).applyQuaternion(this.camera.quaternion);
    }

    public dispose() {
        this.disconnect();
    }

    private disconnect() {
        this.domElement.ownerDocument.removeEventListener("mousemove", this.onMouseMove.bind(this));
        this.domElement.ownerDocument.removeEventListener("pointerlockchange", this.onPointerLockChange.bind(this));
        this.domElement.ownerDocument.removeEventListener("pointerlockerror", PointerLockControls.onPointerLockError.bind(this));
    }

    private connect() {
        this.domElement.ownerDocument.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.domElement.ownerDocument.addEventListener("pointerlockchange", this.onPointerLockChange.bind(this));
        this.domElement.ownerDocument.addEventListener("pointerlockerror", PointerLockControls.onPointerLockError.bind(this));
    }

    private static onPointerLockError() {
        console.error("THREE.PointerLockControls: Unable to use Pointer Lock API");
    }

    private onPointerLockChange() {
        if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
            this.dispatchEvent(_lockEvent);
            this.isLocked = true;
        } else {
            this.dispatchEvent(_unlockEvent);
            this.isLocked = false;
        }
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isLocked) return;

        const movementX = event.movementX || 0; //event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || 0; //event.mozMovementY || event.webkitMovementY || 0;

        _euler.setFromQuaternion(this.camera.quaternion);

        _euler.y -= movementX * 0.002 * this.sensitivity;
        _euler.x -= movementY * 0.002 * this.sensitivity;

        _euler.x = Math.max(_PI_2 - this.maxPolarAngle, Math.min(_PI_2 - this.minPolarAngle, _euler.x));

        this.camera.quaternion.setFromEuler(_euler);

        this.dispatchEvent(_changeEvent);
    }
}
