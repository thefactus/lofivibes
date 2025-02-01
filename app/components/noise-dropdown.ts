import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

// Use a type alias instead of an empty interface to avoid ESLint warnings.
type NoiseDropdownArgs = Record<string, never>;

type NoiseType = 'brown' | 'green' | 'white';

interface Noise {
  active: boolean;
  audio: HTMLAudioElement;
}

export default class NoiseDropdownComponent extends Component<NoiseDropdownArgs> {
  @tracked volume = 1;
  private previousVolume = 1;

  // Each noise is mapped to an audio element; note that the green noise plays blue_noise.mp3.
  noises: Record<NoiseType, Noise> = {
    brown: {
      active: false,
      audio: new Audio('/brown_noise.mp3'),
    },
    green: {
      active: false,
      audio: new Audio('/blue_noise.mp3'),
    },
    white: {
      active: false,
      audio: new Audio('/white_noise.mp3'),
    },
  };

  constructor(owner: unknown, args: NoiseDropdownArgs) {
    super(owner, args);
    // Set each audio element to loop and initialise its volume.
    Object.values(this.noises).forEach((noise) => {
      noise.audio.loop = true;
      noise.audio.volume = this.volume;
    });
  }

  // Computed property to indicate whether the volume is muted.
  get isMuted(): boolean {
    return this.volume === 0;
  }

  // Toggle the given noise on or off.
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

  // Toggle mute by setting the volume to zero or restoring the previous volume.
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
