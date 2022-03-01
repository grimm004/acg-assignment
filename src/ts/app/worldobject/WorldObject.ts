import {IUpdatable} from "../interface/updatable";
import {Object3D} from "three";

export abstract class WorldObject extends Object3D implements IUpdatable {
    public enabled: boolean;

    protected constructor() {
        super();
        this.enabled = true;
    }

    public abstract update(deltaTime: number): void;
}
