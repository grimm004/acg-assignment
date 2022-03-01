import * as THREE from "three";
import {Fog, MathUtils, PerspectiveCamera, Vector3} from "three";
import {IUpdatable} from "./interface/updatable";
import {IDrawable} from "./interface/drawable";
import {FlyControls} from "./controls/FlyControls";
import {PointerLockControls} from "./controls/PointerLockControls";
import {CubicBezierCurve3} from "./bezier/CubicBezierCurve3";
import {GUI} from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module";
import {AssetManager} from "./assets/AssetManager";
import {ChainedCubicBezierCurve3} from "./bezier/ChainedCubicBezierCurve3";
import {NURBSSurface} from "three/examples/jsm/curves/NURBSSurface";
import {ParametricGeometry} from "three/examples/jsm/geometries/ParametricGeometry";

export class App implements IUpdatable, IDrawable {
    private readonly clock: THREE.Clock;
    private readonly renderer: THREE.Renderer;
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly flyControls: FlyControls;
    private readonly controls: PointerLockControls;
    private gui: GUI;
    private readonly stats: Stats;
    private readonly updatables: IUpdatable[];
    private useSplineCamera: boolean;
    private readonly bezierCamera: PerspectiveCamera;
    private readonly chainedBezierCurve: ChainedCubicBezierCurve3;
    private t: number;
    private bezierCameraSpeed: number;

    constructor() {
        const skyColour = 0x87ceeb;

        this.scene = new THREE.Scene();
        this.scene.fog = new Fog(skyColour, 900.0, 1000.0);
        this.scene.background = new THREE.Color(skyColour);

        this.updatables = [];

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000.0);
        this.camera.position.copy(new Vector3(-25.0, 4.0, -61.0));

        this.t = 0.0;
        this.bezierCameraSpeed = 1.0;
        const prev0 = new Vector3(-25.0, 4.0, -71.0);
        const join0 = new Vector3(-35.0, 4.0, -68.0);
        const prev1 = new Vector3(-140.0, 20.0, -35.0);
        const join1 = new Vector3(-160.0, 30.0, -33.0);
        this.chainedBezierCurve = new ChainedCubicBezierCurve3([
            new CubicBezierCurve3(
                new Vector3(-25.0, 4.0, -61.0),
                new Vector3(-25.0, 4.0, -71.0),
                prev0,
                join0
            ),
            new CubicBezierCurve3(
                join0,
                join0.clone().add(join0.clone().sub(prev0)),
                prev1,
                join1
            ),
            new CubicBezierCurve3(
                join1,
                join1.clone().add(join1.clone().sub(prev1).multiplyScalar(2.0)),
                new Vector3(-180.0, 50.0, 0.0),
                new Vector3(-180.0, 50.0, 0.0)
            )
        ]);
        this.bezierCamera = this.camera.clone(true);
        this.useSplineCamera = false;

        this.clock = new THREE.Clock();

        this.renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Lighting
        this.scene.add(new THREE.AmbientLight(0x808080));

        const hemisphereLight = new THREE.HemisphereLight(skyColour, 0x444444);
        hemisphereLight.position.set(0.0, 20.0, 0.0);
        this.scene.add(hemisphereLight);

        const dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(-3.0, 10.0, -10.0);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 2.0;
        dirLight.shadow.camera.bottom = -2.0;
        dirLight.shadow.camera.left = -2.0;
        dirLight.shadow.camera.right = 2.0;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 40.0;
        this.scene.add(dirLight);

        // Controls
        this.flyControls = new FlyControls(this.camera, document.body);
        this.flyControls.shiftMultiplier = 50.0;
        this.updatables.push(this.flyControls);

        this.controls = new PointerLockControls(this.camera, document.body);
        this.controls.sensitivity = 0.5;
        this.renderer.domElement.addEventListener("click", () => this.controls.lock());

        // Events
        window.addEventListener("resize", () => {
            this.bezierCamera.aspect = this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.bezierCamera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);

        // GUI and Stats controls
        this.gui = this.createGui();
        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        // B-spline surface
        const nsControlPoints = [
            [
                new THREE.Vector4(-150, -50, -150, 1),
                new THREE.Vector4(-200, -50, -200, 1),
                new THREE.Vector4(-200, -70, 200, 1),
                new THREE.Vector4(-150, -50, 150, 1)
            ],
            [
                new THREE.Vector4(0, -30, -200, 1),
                new THREE.Vector4(0, 100, -100, 1),
                new THREE.Vector4(0, 85, 100, 1),
                new THREE.Vector4(0, -50, 200, 1)
            ],
            [
                new THREE.Vector4(150, -50, -150, 1),
                new THREE.Vector4(200, -20, -200, 1),
                new THREE.Vector4(200, -50, 200, 1),
                new THREE.Vector4(150, -50, 150, 1)
            ]
        ];
        const degree1 = 2;
        const degree2 = 3;
        const knots1 = [0, 0, 0, 1, 1, 1];
        const knots2 = [0, 0, 0, 0, 1, 1, 1, 1];
        const nurbsSurface = new NURBSSurface(degree1, degree2, knots1, knots2, nsControlPoints);

        const map = new THREE.TextureLoader().load("assets/textures/wall-dirty-gray.jpg");
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;

        function getSurfacePoint(u: number, v: number, target: Vector3) {
            return nurbsSurface.getPoint(u, v, target);
        }

        const geometry = new ParametricGeometry(getSurfacePoint, 20, 20);
        const material = new THREE.MeshLambertMaterial({map: map, side: THREE.DoubleSide});
        const object = new THREE.Mesh(geometry, material);
        object.position.set(-200.0, 5.0, 0.0);
        object.scale.multiplyScalar(1);
        this.scene.add(object);

        // Asset loading
        const assetManager = new AssetManager(manager => manager.initGui(this.gui)).load();
        this.scene.add(assetManager);
        this.updatables.push(assetManager);
    }

    private createGui(): GUI {
        const gui = new GUI();
        gui.add(this.camera.position, "x", -100.0, 100.0, 1.0);
        gui.add(this.camera.position, "y", -20.0, 20.0, 1.0);
        gui.add(this.camera.position, "z", -100.0, 100.0, 1.0);
        gui.add(this, "useSplineCamera");
        gui.add(this, "bezierCameraSpeed", 0.0, 4.0, 0.1);
        gui.add(this, "t", 0.0, this.chainedBezierCurve.length, 0.01);
        return gui;
    }

    public run(): void {
        this.mainloop();
    }

    private mainloop(): void {
        requestAnimationFrame(this.mainloop.bind(this));

        const deltaTime = MathUtils.clamp(this.clock.getDelta(), 0.0, 1.0);
        this.update(deltaTime);
        this.draw(deltaTime);
    }

    public update(deltaTime: number): void {
        this.t += deltaTime * 0.1 * this.bezierCameraSpeed;
        if (this.t > this.chainedBezierCurve.length)
            this.t = 0.0;
        const position = this.chainedBezierCurve.sample(this.t);
        const derivative = this.chainedBezierCurve.sampleDerivative(this.t);
        this.bezierCamera.position.copy(position);
        this.bezierCamera.matrix.lookAt(this.bezierCamera.position, position.add(derivative), new Vector3(0.0, 1.0, 0.0));
        this.bezierCamera.quaternion.setFromRotationMatrix(this.bezierCamera.matrix);

        for (let i = 0; i < this.updatables.length; i++)
            this.updatables[i].update(deltaTime);
    }

    public draw(deltaTime: number): void {
        this.renderer.render(this.scene, this.useSplineCamera ? this.bezierCamera : this.camera);
        this.stats.update();
    }
}
