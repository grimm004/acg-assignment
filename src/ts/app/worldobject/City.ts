import {Asset} from "../assets/Asset";
import {Group, Loader, LoadingManager, LOD, Mesh, Object3D, Vector3} from "three";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {WorldObject} from "./WorldObject";
import * as THREE from "three";
import {SimplifyModifier} from "../utils/SimplifyModifier";
import {Geometry} from "three/examples/jsm/deprecated/Geometry";
import {VertexNormalsHelper} from "three/examples/jsm/helpers/VertexNormalsHelper";

interface NullableCityObjects {
    skyscraper: Group | null;
    miami: Group | null;
    bridge: Group | null;
}

interface CityObjects {
    skyscraper: Group;
    miami: Group;
    bridge: Group;
}

export class CityLoader extends Loader {
    public constructor(manager?: LoadingManager) {
        super(manager);
    }

    public load(onLoad?: (objects: CityObjects) => void): void {
        const objects: NullableCityObjects = {
            skyscraper: null,
            miami: null,
            bridge: null
        };

        new MTLLoader(this.manager)
            .setPath("assets/miami-2525/")
            .load("miami_2525.mtl", (materials) => {
                materials.preload();

                new OBJLoader(this.manager)
                    .setMaterials(materials)
                    .setPath("assets/miami-2525/")
                    .load("miami_2525.obj", (object) => {
                        objects.miami = object;
                        loadComplete(this);
                    });
            });

        new MTLLoader(this.manager)
            .setPath("assets/custom/scene/")
            .load("scene.mtl", (materials) => {
                materials.preload();

                new OBJLoader(this.manager)
                    .setMaterials(materials)
                    .setPath("assets/custom/scene/")
                    .load("scene.obj", (object) => {
                        objects.bridge = object;
                        loadComplete(this);
                    });
            });

        new FBXLoader(this.manager)
            .setPath("assets/futuristic-skyscraper/")
            .load("building_geo_030.fbx", (object) => {
                objects.skyscraper = object;
                loadComplete(this);
            });

        function loadComplete(outer: CityLoader) {
            if (Object.values(objects).every(x => x !== null))
                onLoad?.call(outer, objects as CityObjects);
        }
    }
}

export class City extends WorldObject {
    private readonly miami: Object3D;
    private readonly bridge: Object3D;
    public readonly skyscraperLod: LOD;
    public readonly lodCount: number;

    public constructor(objects: CityObjects, parent: Object3D) {
        super();

        this.lodCount = 3;

        this.miami = objects.miami.clone(true);
        this.bridge = objects.bridge.clone(true);
        this.bridge.position.copy(new Vector3(-65.0, 7.0, -153.0));
        this.bridge.rotation.y = -1.6;
        const helper = new VertexNormalsHelper(this.bridge);
        parent.add(helper);
        const skyscraper = objects.skyscraper.clone(true);
        skyscraper.scale.copy(new Vector3(0.015, 0.015, 0.015));

        this.skyscraperLod = new THREE.LOD();

        const modifier = new SimplifyModifier();
        let simplified = skyscraper.clone();
        this.skyscraperLod.addLevel(simplified.clone(true), 75.0);
        this.skyscraperLod.position.copy(new Vector3(-197.0, 10.0, 24.0));
        this.skyscraperLod.rotation.y = 1.25;

        console.log("Generating Skyscraper LODs...");
        for (let i = 0; i < this.lodCount; i++) {
            console.log("Iteration " + i);
            let vertexStartCount = 0, vertexEndCount = 0;
            simplified.traverse(object => {
                if (object instanceof Mesh) {
                    const before = object.geometry.attributes.position.count
                    vertexStartCount += before;
                    object.geometry = modifier.modify(
                        new Geometry().fromBufferGeometry(object.geometry),
                        0.5
                    ).toBufferGeometry();
                    const after = object.geometry.attributes.position.count;
                    vertexEndCount += after;
                    console.log(`Sub-mesh reduction: ${before} -> ${after}`);
                }
            });
            console.log(`Reduced from ${vertexStartCount} to ${vertexEndCount} vertices (${((vertexStartCount - vertexEndCount) / vertexStartCount * 100.0).toFixed(1)}% reduction).`);

            this.skyscraperLod.addLevel(simplified.clone(true), (i + 2) * 75.0);
            simplified = simplified.clone(true);
        }
        console.log("Finished generating LODs for Skyscraper.");

        this.miami.add(this.skyscraperLod, this.bridge);

        this.add(this.miami);
    }


    public update(deltaTime: number): void {
        return;
    }
}

export class CityAsset extends Asset<City, CityLoader> {
    private objects?: CityObjects;

    public constructor(loader: CityLoader) {
        super(loader);
    }

    public load(onLoad?: (asset: Asset<City, CityLoader>) => void): this {
        this.loader?.load((objects: CityObjects) => {
            this.objects = objects;
            super.load(onLoad);
        });
        return this;
    }

    protected createInstance(): City {
        if (this.objects)
            return new City(this.objects, this);
        else throw new Error("City asset is not loaded.");
    }

    public update(deltaTime: number): void {
        return;
    }
}
