/*
SimplifyModifier.d.ts implementation for SimplifyModifier.js
Adapted from https://github.com/three-types/three-ts-types/blob/master/types/three/examples/jsm/modifiers/SimplifyModifier.d.ts
*/

import {Geometry} from "three/examples/jsm/deprecated/Geometry";

export class SimplifyModifier {
    constructor();
    modify(geometry: Geometry, percentage: number, preserveTexture: boolean = true): Geometry;
}
