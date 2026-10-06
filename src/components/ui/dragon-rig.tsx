import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type DragonModelInfo = { animations: string[]; head: boolean; bones: number };
export default function DragonRig({ url, moving, clip, onReady, onError }: {
  url: string; moving: boolean; clip: string; onReady: (info: DragonModelInfo) => void; onError: (message: string) => void;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const controls = useRef({ moving, clip });
  const callbacks = useRef({ onReady, onError });
  useEffect(() => { controls.current = { moving, clip }; callbacks.current = { onReady, onError }; }, [moving, clip, onReady, onError]);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch { callbacks.current.onError('WebGL is unavailable on this device.'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(37, 1, .01, 100);
    camera.position.set(0, .75, 5.5); camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xfff1d8, 0x374359, 2.5));
    const key = new THREE.DirectionalLight(0xffd896, 3); key.position.set(-3, 4, 4); scene.add(key);
    const fill = new THREE.DirectionalLight(0xddeaff, 2); fill.position.set(3, 2, -2); scene.add(fill);
    const pivot = new THREE.Group(); scene.add(pivot);
    let root: THREE.Object3D | undefined;
    let mixer: THREE.AnimationMixer | undefined;
    let head: THREE.Object3D | undefined;
    let chest: THREE.Object3D | undefined;
    let tail: THREE.Object3D | undefined;
    const rests = new Map<THREE.Object3D, THREE.Quaternion>();
    const actions = new Map<string, THREE.AnimationAction>();
    let currentAction = '';
    const pointer = new THREE.Vector2();
    const gaze = new THREE.Vector2();
    const offset = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pointer.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight * 2 - 1));
    };
    const resetPointer = () => pointer.set(0, 0);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', resetPointer);
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width && height) { renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); }
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const disposeObject = (object: THREE.Object3D) => {
      object.traverse(node => {
        if (!(node instanceof THREE.Mesh)) return;
        node.geometry.dispose();
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
          material.dispose();
        }
      });
    };
    new GLTFLoader().load(url, gltf => {
      if (disposed) { disposeObject(gltf.scene); return; }
      root = gltf.scene;
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      root.position.sub(center);
      pivot.scale.setScalar(3 / Math.max(size.x, size.y, size.z, .001));
      pivot.add(root);
      let bones = 0;
      root.traverse(node => {
        if (node instanceof THREE.Bone) bones++;
        if (!head && /head|skull/i.test(node.name) && !/end|tip/i.test(node.name)) head = node;
        if (!chest && /chest|spine.?2|upper.?spine/i.test(node.name)) chest = node;
        if (!tail && /tail.?1|tail.?base/i.test(node.name)) tail = node;
      });
      for (const node of [head, chest, tail]) if (node) rests.set(node, node.quaternion.clone());
      mixer = new THREE.AnimationMixer(root);
      for (const animation of gltf.animations) actions.set(animation.name, mixer.clipAction(animation));
      const idle = gltf.animations.find(animation => /idle|breath|rest/i.test(animation.name)) ?? gltf.animations[0];
      if (idle) { currentAction = idle.name; actions.get(idle.name)?.play(); }
      callbacks.current.onReady({ animations: gltf.animations.map(animation => animation.name), head: Boolean(head), bones });
    }, undefined, () => { if (!disposed) callbacks.current.onError('This model could not be loaded. Use a GLB with embedded textures.'); });
    let frame = 0;
    let last = performance.now();
    let time = 0;
    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, .05); last = now;
      if (controls.current.moving) time += dt;
      for (const [node, quaternion] of rests) node.quaternion.copy(quaternion);
      if (controls.current.clip && controls.current.clip !== currentAction && actions.has(controls.current.clip)) {
        actions.get(currentAction)?.fadeOut(.3);
        actions.get(controls.current.clip)?.reset().fadeIn(.3).play(); currentAction = controls.current.clip;
      }
      mixer?.update(controls.current.moving ? dt : 0);
      gaze.lerp(controls.current.moving ? pointer : new THREE.Vector2(), 1 - Math.exp(-dt * 5));
      if (head) {
        offset.setFromEuler(euler.set(-gaze.y * .18, gaze.x * .42, 0)); head.quaternion.multiply(offset);
      }
      if (chest && controls.current.moving) {
        offset.setFromEuler(euler.set(Math.sin(time * 1.7) * .012, 0, 0)); chest.quaternion.multiply(offset);
      }
      if (tail && controls.current.moving) {
        offset.setFromEuler(euler.set(0, Math.sin(time * .9) * .08, 0)); tail.quaternion.multiply(offset);
      }
      pivot.position.x = controls.current.moving ? Math.sin(time * .24) * .12 : 0;
      pivot.rotation.y = controls.current.moving ? Math.sin(time * .17) * .1 : 0;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('pointermove', onPointer); document.documentElement.removeEventListener('pointerleave', resetPointer);
      mixer?.stopAllAction(); if (root) { mixer?.uncacheRoot(root); disposeObject(root); }
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [url]);
  return <div className="sky-dragon-canvas" ref={mount} role="img" aria-label="Interactive dragon model" />;
}
