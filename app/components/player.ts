import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import songs from 'lofi/data/lofigirl-songs';

type PlayerArgs = Record<string, never>;

export default class PlayerComponent extends Component<PlayerArgs> {
  @tracked isPlaying = false;
  @tracked currentSongName = '';
  @tracked volume = 1;
  @tracked currentTime = 0;
  @tracked duration = 0;
  private previousVolume = 1;
  private previousIndex = -1;
  private audioElement = new Audio();
  private baseUrl = 'https://lofigirl.com/wp-content/uploads/';

  @tracked history: number[] = [];

  constructor(owner: unknown, args: PlayerArgs) {
    super(owner, args);
    this.audioElement.volume = this.volume;
    this.setRandomSong();
    this.audioElement.addEventListener('ended', this.handleEnded);
    this.audioElement.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audioElement.addEventListener(
      'loadedmetadata',
      this.handleLoadedMetadata,
    );
  }

  willDestroy(): void {
    super.willDestroy();
    this.audioElement.pause();
    this.audioElement.removeEventListener('ended', this.handleEnded);
    this.audioElement.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.audioElement.removeEventListener(
      'loadedmetadata',
      this.handleLoadedMetadata,
    );
  }

  private handleTimeUpdate = () => {
    this.currentTime = this.audioElement.currentTime;
  };

  private handleLoadedMetadata = () => {
    this.duration = this.audioElement.duration;
  };

  private formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  get currentTimeDisplay(): string {
    return this.formatTime(this.currentTime);
  }

  get durationDisplay(): string {
    return this.formatTime(this.duration);
  }

  private handleEnded = (): void => {
    // Using `void` to explicitly discard the promise
    void this.nextSong();
  };

  private getRandomIndex(): number {
    if (songs.length === 0) {
      return -1;
    }

    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * songs.length);
    } while (newIndex === this.previousIndex && songs.length > 1);

    return newIndex;
  }

  private setRandomSong(): void {
    const index = this.getRandomIndex();
    if (index === -1) {
      return;
    }

    if (this.previousIndex !== -1) {
      this.history = [...this.history, this.previousIndex];
    }

    this.previousIndex = index;
    const songPath = songs[index]!;
    this.currentSongName = this.formatSongName(songPath);
    this.audioElement.src = `${this.baseUrl}${songPath}`;
  }

  private formatSongName(path: string): string {
    const filename = path.split('/').pop() ?? '';
    return filename
      .replace(/^\d+-/, '')
      .replace(/\.mp3$/, '')
      .replace(/-/g, ' ');
  }

  get isMuted(): boolean {
    return this.volume === 0;
  }

  get isPreviousDisabled(): boolean {
    return this.history.length === 0;
  }

  @action
  async togglePlay(): Promise<void> {
    if (this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
    } else {
      try {
        await this.audioElement.play();
        this.isPlaying = true;
      } catch (err) {
        console.log(err);
      }
    }
  }

  @action
  async nextSong(): Promise<void> {
    this.isPlaying = false;
    this.setRandomSong();
    try {
      await this.audioElement.play();
      this.isPlaying = true;
    } catch (err) {
      console.log(err);
    }
  }

  @action
  async previousSong(): Promise<void> {
    if (this.history.length === 0) {
      console.log('No previous song in history.');
      return;
    }

    const newHistory = [...this.history];
    const previousIndex = newHistory.pop()!;
    this.history = newHistory;

    this.previousIndex = previousIndex;
    const songPath = songs[previousIndex]!;
    this.currentSongName = this.formatSongName(songPath);
    this.audioElement.src = `${this.baseUrl}${songPath}`;

    try {
      await this.audioElement.play();
      this.isPlaying = true;
    } catch (err) {
      console.log(err);
    }
  }

  @action
  updateVolume(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newVolume = parseFloat(target.value);
    this.volume = newVolume;
    this.audioElement.volume = newVolume;
  }

  @action
  toggleMute(): void {
    if (this.volume === 0) {
      this.volume = this.previousVolume;
    } else {
      this.previousVolume = this.volume;
      this.volume = 0;
    }
    this.audioElement.volume = this.volume;
  }
}
