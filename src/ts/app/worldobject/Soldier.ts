import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import {Asset} from "../assets/Asset";
import {MathUtils, Object3D, Vector3} from "three";
import {WorldObject} from "./WorldObject";
import {clone} from "../utils/SkeletonUtils";

export class Soldier extends WorldObject {
    private readonly model: THREE.Object3D;
    private readonly mixer: THREE.AnimationMixer;
    public readonly idleAction: THREE.AnimationAction;
    public readonly walkAction: THREE.AnimationAction;
    public readonly runAction: THREE.AnimationAction;
    private targetIdleWeight: number;
    private targetWalkWeight: number;
    private targetRunWeight: number;
    private readonly interpConstant: number;

    public constructor(gltf: GLTF, parent?: Object3D) {
        super();

        this.interpConstant = 2.5;

        this.model = clone(gltf.scene);
        this.model.position.copy(new Vector3(-25.0, 1.0, -64.0));
        this.model.scale.copy(new Vector3(2.0, 2.0, 2.0));
        this.model.traverse(object => object.castShadow = true);

        const skeletonHelper = new THREE.SkeletonHelper(this.model);
        skeletonHelper.visible = true;
        parent?.add(skeletonHelper);

        this.add(this.model);

        const animations = gltf.animations;
        this.mixer = new THREE.AnimationMixer(this.model);
        this.idleAction = this.mixer.clipAction(animations[0]);
        this.runAction = this.mixer.clipAction(animations[1]);
        this.walkAction = this.mixer.clipAction(animations[3]);

        this.targetIdleWeight = 1.0;
        this.targetWalkWeight = 0.0;
        this.targetRunWeight = 0.0;

        this.idleAction.weight = 1.0;
        this.walkAction.weight = 0.0;
        this.runAction.weight = 0.0;

        this.idleAction.play();
        this.walkAction.play();
        this.runAction.play();

        this.idle();
    }

    public idle(): void {
        this.targetIdleWeight = 1.0;
        this.targetWalkWeight = 0.0;
        this.targetRunWeight = 0.0;
    }

    public walk(): void {
        this.targetIdleWeight = 0.0;
        this.targetWalkWeight = 1.0;
        this.targetRunWeight = 0.0;
    }

    public run(): void {
        this.targetIdleWeight = 0.0;
        this.targetWalkWeight = 0.0;
        this.targetRunWeight = 1.0;
    }

    public update(deltaTime: number): void {
        const interp = MathUtils.clamp(this.interpConstant * deltaTime, 0.0, 1.0);
        this.idleAction.weight = MathUtils.lerp(this.idleAction.weight, this.targetIdleWeight, interp);
        this.walkAction.weight = MathUtils.lerp(this.walkAction.weight, this.targetWalkWeight, interp);
        this.runAction.weight = MathUtils.lerp(this.runAction.weight, this.targetRunWeight, interp);
        this.position.z -= deltaTime * (1.0 - this.idleAction.weight) * (4.5 * this.walkAction.weight + 8.0 * this.runAction.weight);
        this.mixer?.update(deltaTime);
    }
}

export class SoldierAsset extends Asset<Soldier, GLTFLoader> {
    private gltf?: GLTF;

    public constructor(loader: GLTFLoader) {
        super(loader);
    }

    public load(onLoad?: (asset: Asset<Soldier, GLTFLoader>) => void): this {
        this.loader?.setPath("assets/realistic-soldier-1/")
            .load("soldier.glb", (gltf) => {
                this.gltf = gltf;
                super.load(onLoad);
            });

        return this;
    }

    public createInstance(): Soldier {
        if (this.gltf)
            return new Soldier(this.gltf, this);
        else throw new Error("Soldier asset is not loaded.");
    }
}
