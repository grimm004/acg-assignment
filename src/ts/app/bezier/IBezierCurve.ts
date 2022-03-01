export interface IBezierCurve<T> {
    sample(t: number): T;
    sampleDerivative(t: number): T;
    clampedSample(t: number): T;
}
