/* eslint-disable */

/*
SkeletonUtils.d.ts implementation for SkeletonUtils.js
Adapted from https://github.com/three-types/three-ts-types/blob/master/types/three/examples/jsm/utils/SkeletonUtils.d.ts
The original has a type mismatch which prevents compilation
*/

import { AnimationClip, Bone, Matrix4, Object3D, Skeleton, SkeletonHelper } from "three";

function retarget(target: Object3D | Skeleton, source: Object3D | Skeleton, options: {}): void;

function retargetClip(
    target: Skeleton | Object3D,
    source: Skeleton | Object3D,
    clip: AnimationClip,
    options: {},
): AnimationClip;

function getHelperFromSkeleton(skeleton: Skeleton): SkeletonHelper;

function getSkeletonOffsets(target: Object3D | Skeleton, source: Object3D | Skeleton, options: {}): Matrix4[];

function renameBones(skeleton: Skeleton, names: {}): any;

function getBones(skeleton: Skeleton | Bone[]): Bone[];

function getBoneByName(name: string, skeleton: Skeleton): Bone;

function getNearestBone(bone: Bone, names: {}): Bone;

function findBoneTrackData(name: string, tracks: any[]): {};

function getEqualsBonesNames(skeleton: Skeleton, targetSkeleton: Skeleton): string[];

function clone(source: Object3D): Object3D;

export {
    retarget,
    retargetClip,
    getHelperFromSkeleton,
    getSkeletonOffsets,
    renameBones,
    getBones,
    getBoneByName,
    getNearestBone,
    findBoneTrackData,
    getEqualsBonesNames,
    clone
};
