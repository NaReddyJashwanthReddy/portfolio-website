export type GuardianClip = 'idle' | 'left' | 'right' | 'hover' | 'human' | 'cloud_form' | 'cloud_drift' | 'cloud_dissolve' | 'fire';
export type ClipSpec = { frames: number; fps: number; width: number; height: number; left: number; top: number; loop: boolean; pages: string[] };
export type GuardianManifest = { version: number; width: number; height: number; bodySize: number; feet: number; columns: number; pageFrames: number; animations: Record<GuardianClip, ClipSpec>; cloudSeconds: number; hoverSeconds: number; fireSeconds: number };
export const guardianBase = '/assets/skygarden/guardian/v2/';
export function clipFrame(spec: ClipSpec, seconds: number) {
  const frame = Math.floor(Math.max(0, seconds) * spec.fps);
  return spec.loop ? frame % spec.frames : Math.min(spec.frames - 1, frame);
}

/** Decode only nearby texture pages. Eviction releases references, not active images. */
export class GuardianTextures {
  private pages = new Map<string, HTMLImageElement>();
  private pending = new Map<string, Promise<HTMLImageElement>>();
  private retryAfter = new Map<string, number>();
  private disposed = false;
  constructor(public manifest: GuardianManifest, private base: string, private onDecoded = () => {}) {}
  get count() { return this.pages.size; }
  async load(file: string): Promise<HTMLImageElement> {
    const cached = this.pages.get(file); if (cached) return cached;
    const pending = this.pending.get(file); if (pending) return pending;
    if ((this.retryAfter.get(file) ?? 0) > performance.now()) throw new Error('Texture retry pending');
    const image = new Image(); image.src = this.base + file;
    const promise = image.decode().then(() => {
      if (!this.disposed) {
        this.pages.set(file, image); this.retryAfter.delete(file);
        while (this.pages.size > 8) this.pages.delete(this.pages.keys().next().value!);
        this.onDecoded();
      }
      return image;
    }).catch(error => { this.retryAfter.set(file, performance.now() + 3000); throw error; })
      .finally(() => this.pending.delete(file));
    this.pending.set(file, promise); return promise;
  }
  warm(clip: GuardianClip) { return this.load(this.manifest.animations[clip].pages[0]); }
  sample(clip: GuardianClip, seconds: number) {
    const spec = this.manifest.animations[clip], frame = clipFrame(spec, seconds);
    const page = Math.floor(frame / this.manifest.pageFrames), file = spec.pages[page];
    const image = this.pages.get(file);
    if (image) { this.pages.delete(file); this.pages.set(file, image); }
    else void this.load(file).catch(() => {});
    const next = page + 1 < spec.pages.length ? page + 1 : spec.loop ? 0 : page;
    if (next !== page) void this.load(spec.pages[next]).catch(() => {});
    if (!image) return null;
    const slot = frame % this.manifest.pageFrames;
    return { image, frame, spec, sx: slot % this.manifest.columns * spec.width, sy: Math.floor(slot / this.manifest.columns) * spec.height };
  }
  dispose() { this.disposed = true; this.pages.clear(); this.retryAfter.clear(); }
}
