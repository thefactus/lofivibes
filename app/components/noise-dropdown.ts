import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

type NoiseDropdownArgs = Record<string, never>;

type NoiseType = 'brown' | 'green' | 'white';

interface Noise {
  active: boolean;
  audio: HTMLAudioElement;
}

export default class NoiseDropdownComponent extends Component<NoiseDropdownArgs> {
  @tracked volume = 1;
  private previousVolume = 1;

  noises: Record<NoiseType, Noise> = {
    brown: {
      active: false,
      audio: new Audio('/brown_noise.mp3'),
    },
    green: {
      active: false,
      audio: new Audio('/green_noise.mp3'),
    },
    white: {
      active: false,
      audio: new Audio('/white_noise.mp3'),
    },
  };

  constructor(owner: unknown, args: NoiseDropdownArgs) {
    super(owner, args);
    Object.values(this.noises).forEach((noise) => {
      noise.audio.loop = true;
      noise.audio.volume = this.volume;
    });
  }

  get isMuted(): boolean {
    return this.volume === 0;
  }

  @action
  toggleNoise(noiseType: NoiseType) {
    const noise = this.noises[noiseType];
    if (noise.active) {
      noise.audio.pause();
      noise.active = false;
    } else {
      noise.audio.currentTime = 0;
      noise.audio.play().catch((err) => {
        console.error(`Failed to play ${noiseType} noise:`, err);
      });
      noise.active = true;
    }
    // Reassign to trigger reactivity.
    this.noises = { ...this.noises };
  }

  // Update the volume for all noise audio elements.
  @action
  updateVolume(event: Event) {
    const target = event.target as HTMLInputElement;
    this.volume = parseFloat(target.value);
    Object.values(this.noises).forEach((noise) => {
      noise.audio.volume = this.volume;
    });
  }

  @action
  toggleMute() {
    if (this.volume === 0) {
      this.volume = this.previousVolume;
    } else {
      this.previousVolume = this.volume;
      this.volume = 0;
    }
    Object.values(this.noises).forEach((noise) => {
      noise.audio.volume = this.volume;
    });
  }
}
