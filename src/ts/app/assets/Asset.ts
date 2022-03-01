import {IUpdatable} from "../interface/updatable";
import {Loader, Object3D} from "three";
import {WorldObject} from "../worldobject/WorldObject";

export class NoLoader extends Loader {
}

export abstract class Asset<TObject extends WorldObject, TLoader extends Loader = NoLoader> extends Object3D implements IUpdatable {
    public loaded: boolean;
    protected loader?: TLoader;
    protected instances: Map<number, TObject>;

    protected constructor(loader?: TLoader) {
        super();
        this.loader = loader;
        this.loaded = false;
        this.instances = new Map<number, TObject>();
    }

    public load(onLoad?: (asset: Asset<TObject, TLoader>) => void): this {
        this.loaded = true;
        onLoad?.call(this, this);
        return this;
    }

    protected abstract createInstance(): TObject;

    public instantiate(): TObject {
        const newInstance = this.createInstance();
        this.instances.set(newInstance.id, newInstance);
        this.add(newInstance);
        return newInstance;
    }

    public remove(...object: Object3D[]): this {
        for (let i = 0; i < object.length; i++)
            this.instances.delete(object[i].id);
        return super.remove(...object);
    }

    public update(deltaTime: number): void {
        this.instances.forEach((instance: TObject) => {
            if (instance.enabled)
                instance.update(deltaTime);
        })
    }
}