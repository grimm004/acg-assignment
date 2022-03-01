import {MathUtils, Vector3} from "three";
import {IBezierCurve} from "./IBezierCurve";

export class CubicBezierCurve3 implements IBezierCurve<Vector3> {
    private readonly v0: Vector3;
    private readonly v1: Vector3;
    private readonly v2: Vector3;
    private readonly v3: Vector3;

    public constructor(
        vStart: Vector3,
        v1: Vector3,
        v2: Vector3,
        vEnd: Vector3
    ) {
        this.v0 = vStart;
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = vEnd;
    }

    public sampleLerp(t: number): Vector3 {
        const
            a = this.v0.clone().lerp(this.v1, t),
            b = this.v1.clone().lerp(this.v2, t),
            c = this.v2.clone().lerp(this.v3, t);
        const d = a.clone().lerp(b, t), e = b.clone().lerp(c, t);
        return d.clone().lerp(e, t);
    }

    public sample(t: number): Vector3 {
        const t2 = t * t, t3 = t2 * t, t1 = (1.0 - t), t12 = t1 * t1, t13 = t12 * t1;
        return this.v0.clone().multiplyScalar(t13)
            .add(this.v1.clone().multiplyScalar(3.0 * t12 * t))
            .add(this.v2.clone().multiplyScalar(3.0 * t1 * t2))
            .add(this.v3.clone().multiplyScalar(t3));
    }

    public sampleDerivative(t: number): Vector3 {
        const t2 = t * t, t1 = (1.0 - t), t12 = t1 * t1;
        const
            v0 = this.v1.clone().sub(this.v0).multiplyScalar(3.0),
            v1 = this.v2.clone().sub(this.v1).multiplyScalar(3.0),
            v2 = this.v3.clone().sub(this.v2).multiplyScalar(3.0);
        return v0.multiplyScalar(t12)
            .add(v1.multiplyScalar(2.0 * t1 * t))
            .add(v2.multiplyScalar(t2));
    }

    public clampedSample(t: number): Vector3 {
        return this.sample(MathUtils.clamp(t, 0.0, 1.0));
    }
}
