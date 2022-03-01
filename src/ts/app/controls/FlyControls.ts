/*
Adapted to TypeScript from the three.js FlyControls example
https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/FlyControls.js
*/

import {
    Camera,
    EventDispatcher,
    Quaternion,
    Vector3
} from "three";

const _changeEvent = {type: "change"};

type MoveState = {
    rollRight: number;
    left: number;
    forward: number;
    back: number;
    pitchDown: number;
    up: number;
    right: number;
    pitchUp: number;
    down: number;
    yawRight: number;
    yawLeft: number;
    rollLeft: number
};

export class FlyControls extends EventDispatcher {
    public camera: Camera;
    public domElement: HTMLElement | Document;
    public movementSpeed: number;
    public shiftMultiplier: number;
    public unshiftMultiplier: number;
    public rollSpeed: number;
    public dragToLook: boolean;
    public autoForward: boolean;
    private readonly tmpQuaternion: Quaternion;
    private mouseStatus: number;
    private moveState: MoveState;
    private moveVector: Vector3;
    private rotationVector: Vector3;
    private lastQuaternion: Quaternion;
    private lastPosition: Vector3;
    private readonly eps: number;
    private movementSpeedMultiplier: number;

    constructor(camera: Camera, domElement: HTMLElement | Document) {
        super();

        if (domElement === undefined) {
            console.warn('THREE.FlyControls: The second parameter "domElement" is now mandatory.');
            domElement = document;
        }

        this.camera = camera;
        this.domElement = domElement;

        // API
        this.movementSpeed = 1.0;
        this.unshiftMultiplier = 1.0;
        this.shiftMultiplier = 2.0;
        this.rollSpeed = 0.1;

        this.dragToLook = false;
        this.autoForward = false;

        // internals
        this.eps = 0.000001;
        this.movementSpeedMultiplier = 1.0;

        this.lastQuaternion = new Quaternion();
        this.lastPosition = new Vector3();

        this.tmpQuaternion = new Quaternion();

        this.mouseStatus = 0;

        this.moveState = {
            up: 0,
            down: 0,
            left: 0,
            right: 0,
            forward: 0,
            back: 0,
            pitchUp: 0,
            pitchDown: 0,
            yawLeft: 0,
            yawRight: 0,
            rollLeft: 0,
            rollRight: 0
        };
        this.moveVector = new Vector3(0, 0, 0);
        this.rotationVector = new Vector3(0, 0, 0);

        this.domElement.addEventListener("contextmenu", FlyControls.preventDefault);

        this.domElement.addEventListener("mousemove", this.mousemove.bind(this) as EventListenerOrEventListenerObject);
        this.domElement.addEventListener("mousedown", this.mousedown.bind(this) as EventListenerOrEventListenerObject);
        this.domElement.addEventListener("mouseup", this.mouseup.bind(this) as EventListenerOrEventListenerObject);

        window.addEventListener("keydown", this.keydown.bind(this));
        window.addEventListener("keyup", this.keyup.bind(this));

        this.updateMovementVector();
        this.updateRotationVector();
    }

    private updateRotationVector() {
        this.rotationVector.x = (-this.moveState.pitchDown + this.moveState.pitchUp);
        this.rotationVector.y = (-this.moveState.yawRight + this.moveState.yawLeft);
        this.rotationVector.z = (-this.moveState.rollRight + this.moveState.rollLeft);

        //console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );
    }

    private updateMovementVector() {
        const forward = (this.moveState.forward || (this.autoForward && !this.moveState.back)) ? 1 : 0;

        this.moveVector.x = (-this.moveState.left + this.moveState.right);
        this.moveVector.y = (-this.moveState.down + this.moveState.up);
        this.moveVector.z = (-forward + this.moveState.back);

        //console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );
    }

    public update(deltaTime: number) {
        const moveMult = deltaTime * this.movementSpeed * this.movementSpeedMultiplier;
        const rotMult = deltaTime * this.rollSpeed;

        this.camera.translateX(this.moveVector.x * moveMult);
        this.camera.translateY(this.moveVector.y * moveMult);
        this.camera.translateZ(this.moveVector.z * moveMult);

        this.tmpQuaternion.set(this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1).normalize();
        this.camera.quaternion.multiply(this.tmpQuaternion);

        if (
            this.lastPosition.distanceToSquared(this.camera.position) > this.eps ||
            8 * (1 - this.lastQuaternion.dot(this.camera.quaternion)) > this.eps
        ) {
            this.dispatchEvent(_changeEvent);
            this.lastQuaternion.copy(this.camera.quaternion);
            this.lastPosition.copy(this.camera.position);
        }
    }

    private static preventDefault(event: Event) {
        event.preventDefault();
    }

    private getContainerDimensions() {
        if (this.domElement instanceof HTMLElement) {
            return {
                size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
                offset: [this.domElement.offsetLeft, this.domElement.offsetTop]
            };
        } else {
            return {
                size: [window.innerWidth, window.innerHeight],
                offset: [0, 0]
            };
        }
    }

    private mouseup(event: MouseEvent) {
        if (this.dragToLook) {
            this.mouseStatus--;
            this.moveState.yawLeft = this.moveState.pitchDown = 0;
        } else {
            switch (event.button) {
                case 0:
                    this.moveState.forward = 0;
                    break;
                case 2:
                    this.moveState.back = 0;
                    break;
            }

            this.updateMovementVector();
        }

        this.updateRotationVector();
    }

    private mousemove(event: MouseEvent) {
        // if (!this.dragToLook || this.mouseStatus > 0) {
        //     const container = this.getContainerDimensions();
        //     const halfWidth = container.size[0] / 2;
        //     const halfHeight = container.size[1] / 2;
        //
        //     this.moveState.yawLeft = -((event.pageX - container.offset[0]) - halfWidth) / halfWidth;
        //     this.moveState.pitchDown = ((event.pageY - container.offset[1]) - halfHeight) / halfHeight;
        //
        //     this.updateRotationVector();
        // }
    }

    private mousedown(event: MouseEvent) {
        if (this.dragToLook) {
            this.mouseStatus++;
        }
        // else {
        //     switch (event.button) {
        //         case 0:
        //             this.moveState.forward = 1;
        //             break;
        //         case 2:
        //             this.moveState.back = 1;
        //             break;
        //     }
        //
        //     this.updateMovementVector();
        // }
    }

    private keyup(event: KeyboardEvent) {
        switch (event.code) {
            case "ShiftLeft":
            case "ShiftRight":
                this.movementSpeedMultiplier = this.unshiftMultiplier;
                break;

            case "KeyW":
                this.moveState.forward = 0;
                break;
            case "KeyS":
                this.moveState.back = 0;
                break;

            case "KeyA":
                this.moveState.left = 0;
                break;
            case "KeyD":
                this.moveState.right = 0;
                break;

            case "KeyR":
                this.moveState.up = 0;
                break;
            case "KeyF":
                this.moveState.down = 0;
                break;

            case "ArrowUp":
                this.moveState.pitchUp = 0;
                break;
            case "ArrowDown":
                this.moveState.pitchDown = 0;
                break;

            case "ArrowLeft":
                this.moveState.yawLeft = 0;
                break;
            case "ArrowRight":
                this.moveState.yawRight = 0;
                break;

            case "KeyQ":
                this.moveState.rollLeft = 0;
                break;
            case "KeyE":
                this.moveState.rollRight = 0;
                break;
        }

        this.updateMovementVector();
        this.updateRotationVector();
    }

    private keydown(event: KeyboardEvent) {
        if (event.altKey) {
            return;
        }

        switch (event.code) {
            case "ShiftLeft":
            case "ShiftRight":
                this.movementSpeedMultiplier = this.shiftMultiplier;
                break;

            case "KeyW":
                this.moveState.forward = 1;
                break;
            case "KeyS":
                this.moveState.back = 1;
                break;

            case "KeyA":
                this.moveState.left = 1;
                break;
            case "KeyD":
                this.moveState.right = 1;
                break;

            case "KeyR":
                this.moveState.up = 1;
                break;
            case "KeyF":
                this.moveState.down = 1;
                break;

            case "ArrowUp":
                this.moveState.pitchUp = 1;
                break;
            case "ArrowDown":
                this.moveState.pitchDown = 1;
                break;

            case "ArrowLeft":
                this.moveState.yawLeft = 1;
                break;
            case "ArrowRight":
                this.moveState.yawRight = 1;
                break;

            case "KeyQ":
                this.moveState.rollLeft = 1;
                break;
            case "KeyE":
                this.moveState.rollRight = 1;
                break;
        }

        this.updateMovementVector();
        this.updateRotationVector();
    }

    public dispose() {
        this.domElement.removeEventListener("contextmenu", FlyControls.preventDefault);
        this.domElement.removeEventListener("mousedown", this.mousedown.bind(this) as EventListenerOrEventListenerObject);
        this.domElement.removeEventListener("mousemove", this.mousemove.bind(this) as EventListenerOrEventListenerObject);
        this.domElement.removeEventListener("mouseup", this.mouseup.bind(this) as EventListenerOrEventListenerObject);

        window.removeEventListener("keydown", this.keydown.bind(this));
        window.removeEventListener("keyup", this.keyup.bind(this));
    }
}
