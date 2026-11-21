import Phaser from 'phaser';

import { KEY } from '../constants';

type MusicKey = (typeof KEY.MUSIC)[keyof typeof KEY.MUSIC];

export class MusicManager {
  private readonly scene: Phaser.Scene;
  private readonly playlist: MusicKey[] = [];
  private readonly sounds = new Map<MusicKey, Phaser.Sound.BaseSound>();
  private currentIndex = -1;
  private currentTrack?: Phaser.Sound.BaseSound;
  private loadQueue: Promise<void> = Promise.resolve();
  private started = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  async play(): Promise<void> {
    if (this.started) {
      return;
    }

    this.started = true;
    this.playlist.push(...Object.values(KEY.MUSIC));
    Phaser.Utils.Array.Shuffle(this.playlist);
    this.currentIndex = -1;

    return this.advance();
  }

  private async advance(): Promise<void> {
    if (!this.playlist.length) {
      return;
    }

    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    return this.playTrack(this.playlist[this.currentIndex]);
  }

  private async playTrack(key: MusicKey): Promise<void> {
    await this.loadTrack(key);

    let track = this.sounds.get(key);

    if (!track) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-class-instance-assignment
      track = this.scene.sound.add(key);
      this.sounds.set(key, track);
    }

    this.currentTrack = track;

    track.once(Phaser.Sound.Events.COMPLETE, () => {
      if (this.currentTrack === track) {
        this.currentTrack = undefined;
      }

      void this.advance();
      this.preloadNext();
    });

    // Volume isn't set since all music tracks are normalized to -6 dB.
    track.play();
    this.preloadNext();
  }

  private async loadTrack(key: MusicKey): Promise<void> {
    if (this.scene.cache.audio.has(key)) {
      return;
    }

    const load = this.loadQueue.then(async () => {
      // Another queued request may have loaded this key while we waited.
      if (this.scene.cache.audio.has(key)) {
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const loader = this.scene.load;
        const completeEvent = `filecomplete-audio-${key}`;

        const cleanup = (): void => {
          loader.off(completeEvent, onComplete);
          loader.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onError);
        };

        const onComplete = (): void => {
          cleanup();
          resolve();
        };

        const onError = (file: Phaser.Loader.File): void => {
          if (file.key !== key) {
            return;
          }

          cleanup();
          reject(new Error(`Failed to load audio: ${key}`));
        };

        loader.once(completeEvent, onComplete);
        loader.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onError);

        loader.audio(key, [`${key}.ogg`, `${key}.mp3`]);

        if (!loader.isLoading()) {
          loader.start();
        }
      });
    });

    // Keep the queue usable after a failed load while still rejecting this request.
    this.loadQueue = load.catch();
    return load;
  }

  private preloadNext(): void {
    if (!this.playlist.length) {
      return;
    }

    const nextIndex = (this.currentIndex + 1) % this.playlist.length;
    const nextKey = this.playlist[nextIndex];

    if (!this.scene.cache.audio.has(nextKey)) {
      void this.loadTrack(nextKey);
    }
  }
}
