import {
    Bone, BufferGeometry,
    CylinderGeometry,
    DoubleSide,
    Float32BufferAttribute,
    Material,
    MeshPhongMaterial, Object3D, Skeleton, SkeletonHelper, SkinnedMesh,
    Uint16BufferAttribute,
    Vector3
} from "three";
import {Asset} from "../assets/Asset";
import {WorldObject} from "./WorldObject";

enum BarrierState {
    idleUngrabbed,
    grabbing,
    ungrabbing,
    idleGrabbed
}

export class Barrier extends WorldObject {
    public readonly segmentCount: number;
    public readonly segmentHeight: number;
    private readonly mesh: SkinnedMesh;
    private readonly material: Material;
    private readonly geometry: BufferGeometry;
    private readonly bones: Bone[];
    private state: BarrierState;
    private idleTimer: number;

    public constructor(segmentCount: number, segmentHeight: number, parent?: Object3D) {
        super();

        this.state = BarrierState.idleUngrabbed;
        this.idleTimer = 0.0;

        this.segmentCount = segmentCount;
        this.segmentHeight = segmentHeight;
        this.material = Barrier.createMaterial();
        this.geometry = Barrier.createGeometry(segmentCount, segmentHeight);
        this.bones = Barrier.createBones(segmentCount, segmentHeight);
        this.mesh = Barrier.createMesh(this.geometry, this.bones, this.material);
        const skeletonHelper = new SkeletonHelper(this.mesh);
        skeletonHelper.visible = false;
        parent?.add(skeletonHelper);
        this.add(this.mesh);
    }

    private static createMaterial(): Material {
        return new MeshPhongMaterial({
            color: 0x0f0f0f,
            emissive: 0x0f0f0f,
            side: DoubleSide,
            flatShading: true
        });
    }

    private static createGeometry(segmentCount: number, segmentHeight: number): BufferGeometry {
        const geometry = new CylinderGeometry(
            0.25,
            0.25,
            segmentHeight * segmentCount,
            8,
            segmentCount,
            false
        );

        const height = segmentHeight * segmentCount;

        const position = geometry.attributes.position;

        const vertex = new Vector3();

        const skinIndices = [];
        const skinWeights = [];

        for (let i = 0; i < position.count; i++) {
            vertex.fromBufferAttribute(position, i);

            const y = (vertex.y + height * 0.5);

            const skinIndex = Math.floor(y / segmentHeight);
            const skinWeight = (y % segmentHeight) / segmentHeight;

            skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
            skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
        }

        geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndices, 4));
        geometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));

        return geometry;
    }

    private static createBones(segmentCount: number, segmentHeight: number): Bone[] {
        const bones = [];

        const height = segmentHeight * segmentCount;

        let prevBone = new Bone();
        bones.push(prevBone);
        prevBone.position.y = -height * 0.5;

        for (let i = 0; i < segmentCount; i++) {
            const bone = new Bone();
            bone.position.y = segmentHeight;
            bones.push(bone);
            prevBone.add(bone);
            prevBone = bone;
        }

        return bones;
    }

    private static createMesh(geometry: BufferGeometry, bones: Bone[], material: Material): SkinnedMesh {
        const mesh = new SkinnedMesh(geometry, material);
        mesh.position.copy(new Vector3(0.0, 4.0, 0.0));
        const skeleton = new Skeleton(bones);

        mesh.add(bones[0]);
        mesh.bind(skeleton);
        return mesh;
    }

    public update(deltaTime: number): void {
        const base = 2, count = 3;

        switch (this.state) {
            case BarrierState.idleUngrabbed:
                this.idleTimer += deltaTime;
                if (this.idleTimer > 1.0) {
                    this.idleTimer = 0.0;
                    this.state = BarrierState.grabbing;
                }
                break;
            case BarrierState.grabbing:
                for (let i = 0; i < count; i++) {
                    this.mesh.skeleton.bones[base + i].rotation.z += deltaTime * 0.1;
                    if (this.mesh.skeleton.bones[base + i].rotation.z > Math.PI * 0.5 / count) {
                        this.mesh.skeleton.bones[base + i].rotation.z = Math.PI * 0.5 / count;
                        this.state = BarrierState.idleGrabbed;
                    }
                }
                break;
            case BarrierState.ungrabbing:
                for (let i = 0; i < count; i++) {
                    this.mesh.skeleton.bones[base + i].rotation.z -= deltaTime * 0.1;
                    if (this.mesh.skeleton.bones[base + i].rotation.z < 0.0) {
                        this.mesh.skeleton.bones[base + i].rotation.z = 0.0;
                        this.state = BarrierState.idleUngrabbed;
                    }
                }
                break;
            case BarrierState.idleGrabbed:
                this.idleTimer += deltaTime;
                if (this.idleTimer > 1.0) {
                    this.idleTimer = 0.0;
                    this.state = BarrierState.ungrabbing;
                }
                break;
        }
    }
}

export class BarrierAsset extends Asset<Barrier> {
    public readonly segmentCount: number;
    public readonly segmentHeight: number;

    constructor(segmentCount: number, segmentHeight: number) {
        super();

        this.segmentCount = segmentCount;
        this.segmentHeight = segmentHeight;
    }

    protected createInstance(): Barrier {
        return new Barrier(this.segmentCount, this.segmentHeight, this);
    }
}
