import {MathUtils, Vector3} from "three";
import {IBezierCurve} from "./IBezierCurve";
import {CubicBezierCurve3} from "./CubicBezierCurve3";

export class ChainedCubicBezierCurve3 implements IBezierCurve<Vector3> {
    private readonly curves: CubicBezierCurve3[];
    public readonly length: number;

    public constructor(curves: CubicBezierCurve3[]) {
        this.curves = curves;
        this.length = this.curves.length;
    }

    public sample(t: number): Vector3 {
        const tFloor = MathUtils.clamp(Math.floor(t), 0, this.curves.length - 1);
        return this.curves[tFloor].sample(t - tFloor);
    }

    public sampleDerivative(t: number): Vector3 {
        const tFloor = MathUtils.clamp(Math.floor(t), 0, this.curves.length - 1);
        return this.curves[tFloor].sampleDerivative(t - tFloor);
    }

    public clampedSample(t: number): Vector3 {
        return this.sample(MathUtils.clamp(t, 0.0, this.curves.length));
    }
}