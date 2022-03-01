import * as THREE from "three";
import {SimplifyModifier} from "three/examples/jsm/modifiers/SimplifyModifier";

const modifier = new SimplifyModifier();

export function generateLod(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    distanceFactor: number,
    n: number = 3,
    ratio: number = 0.875
): THREE.LOD {
    const lod = new THREE.LOD();
    for (let i = 0; i < n; i++)
        lod.addLevel(new THREE.Mesh(simplifyGeometry(geometry, ratio), material), i * distanceFactor);
    return lod;
}

export function simplifyGeometry(geometry: THREE.BufferGeometry, ratio: number = 0.875): THREE.BufferGeometry {
    return modifier.modify(geometry, Math.floor(geometry.attributes.position.count * ratio));
}
