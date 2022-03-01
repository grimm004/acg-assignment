import {Group, Line, Loader, LoadingManager, Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Soldier, SoldierAsset} from "../worldobject/Soldier";
import {Asset} from "./Asset";
import {IUpdatable} from "../interface/updatable";
import {Barrier, BarrierAsset} from "../worldobject/Barrier";
import {City, CityAsset, CityLoader} from "../worldobject/City";
import {WorldObject} from "../worldobject/WorldObject";
import {GUI} from "dat.gui";

export class AssetManager extends Group implements IUpdatable {
    private onLoad?: (manager: AssetManager) => void;
    public loaded: boolean;
    private readonly assets: Asset<WorldObject, Loader>[];
    public soldierAsset?: SoldierAsset;
    private barrierAsset?: BarrierAsset;
    private cityAsset?: CityAsset;
    private barrier1?: Barrier;
    private barrier2?: Barrier;
    private soldier1?: Soldier;
    private soldier2?: Soldier;
    private timer: number;
    private soldier1Walk: boolean;
    private city?: City;
    // private readonly line: Line;

    constructor(onLoad?: (manager: AssetManager) => void) {
        super();
        this.onLoad = onLoad;
        this.assets = [];
        this.loaded = false;

        this.soldier1Walk = true;
        this.timer = 0.0;

        // const matLine = new THREE.LineBasicMaterial({color: 0xff0000});
        // const points = [];
        // points.push(new THREE.Vector3(-1, 0, 0));
        // points.push(new THREE.Vector3(0, 1, 0));
        // points.push(new THREE.Vector3(1, 0, 0));
        // points.push(new THREE.Vector3(1, 0, 1));
        // const geometry = new THREE.BufferGeometry().setFromPoints(points);
        // this.line = new THREE.Line(geometry, matLine);
        // this.line.position.copy(new Vector3(20.0, 20.0, 0.0));
        // this.add(this.line);
    }

    public load(): this {
        const loadingManager = new LoadingManager();
        loadingManager.onProgress = AssetManager.onProgress;

        const gltfLoader = new GLTFLoader(loadingManager);
        const cityLoader = new CityLoader(loadingManager);

        this.soldierAsset = new SoldierAsset(gltfLoader);
        this.add(this.soldierAsset);
        this.assets.push(this.soldierAsset);

        this.barrierAsset = new BarrierAsset(8, 1.0);
        this.add(this.barrierAsset);
        this.assets.push(this.barrierAsset);

        this.cityAsset = new CityAsset(cityLoader);
        this.add(this.cityAsset);
        this.assets.push(this.cityAsset);

        for (let i = 0; i < this.assets.length; i++)
            this.assets[i].load(this.onAssetLoad.bind(this));

        return this;
    }

    private onAssetLoad(): void {
        if (this.loaded) return;

        for (let i = 0; i < this.assets.length; i++)
            if (!this.assets[i].loaded)
                return;

        console.log("All assets loaded.");

        this.init();

        this.loaded = true;
        this.onLoad?.call(this, this);
    }

    public initGui(gui: GUI): void {
        const folder = gui.addFolder("AssetManager");

        if (this.barrierAsset && this.barrier1) {
            folder.add(this.barrier1.position, "x", -10.0, 10.0, 0.1);
            folder.add(this.barrier1.position, "y", -10.0, 10.0, 0.1);
            folder.add(this.barrier1.position, "z", -10.0, 10.0, 0.1);
        }

        if (this.cityAsset && this.city) {
            folder.add(this.city.skyscraperLod.position, "x", -1000.0, 1000.0, 1.0);
            folder.add(this.city.skyscraperLod.position, "y", -100.0, 100.0, 1.0);
            folder.add(this.city.skyscraperLod.position, "z", -1000.0, 1000.0, 1.0);
            folder.add(this.city.skyscraperLod.rotation, "y", -Math.PI, Math.PI, 0.05);
        }

        if (this.soldierAsset && this.soldier1) {
            folder.add(this.soldier1.idleAction, "weight", 0.0, 1.0, 0.01);
            folder.add(this.soldier1.walkAction, "weight", 0.0, 1.0, 0.01);
            folder.add(this.soldier1.runAction, "weight", 0.0, 1.0, 0.01);
        }
    }

    private init(): void {
        if (this.cityAsset) {
            this.city = this.cityAsset.instantiate();
            this.city.position.copy(new Vector3(0.0, 0.0, -50.0));
        }

        if (this.soldierAsset) {
            this.soldier1 = this.soldierAsset.instantiate();
            this.soldier2 = this.soldierAsset.instantiate();

            this.soldier1.position.copy(new Vector3(-2.5, 0.0, 0.0));
            this.soldier2.position.copy(new Vector3(2.5, 0.0, 0.0));
        }

        if (this.barrierAsset) {
            this.barrier1 = this.barrierAsset.instantiate();
            this.barrier1.position.copy(new Vector3(-5.5 - 25.0, 0.0, -80.0));
            this.barrier1.rotateY(Math.PI);
            this.barrier2 = this.barrierAsset.instantiate();
            this.barrier2.position.copy(new Vector3(5.5 - 25.0, 0.0, -80.0));
        }
    }

    private static onProgress(url: string, itemsLoaded: number, itemsTotal: number) {
        console.log(`${url}: ${(itemsLoaded / itemsTotal * 100.0).toFixed(0)}%`);
    }

    private s: boolean = false;
    public update(deltaTime: number): void {
        if (!this.city || !this.soldier1 || !this.soldier2 || !this.barrier1 || !this.barrier2) {
            return;
        }

        this.timer += deltaTime;
        if (this.timer > 7.50) {
            if (this.soldier1Walk) {
                this.soldier1.walk();
                this.soldier2.run();
            } else {
                this.soldier1.run();
                this.soldier2.walk();
            }
            this.soldier1Walk = !this.soldier1Walk;
            this.timer = 0.0;
        }
        for (let i = 0; i < this.assets.length; i++)
            if (this.assets[i].loaded)
                this.assets[i].update(deltaTime);
    }
}
