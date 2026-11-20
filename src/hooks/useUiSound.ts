import { useRef, useScene } from 'phaser-jsx';

import { UiSound } from '../utils';

export function useUiSound(): UiSound {
  const scene = useScene();
  const ref = useRef<UiSound | null>(null);

  ref.current ??= new UiSound(scene);

  return ref.current;
}
