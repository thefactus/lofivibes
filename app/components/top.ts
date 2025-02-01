import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

type TopArgs = Record<string, never>;

export default class TopComponent extends Component<TopArgs> {
  @tracked showNoiseDropdown = false;

  @action
  toggleNoiseDropdown() {
    this.showNoiseDropdown = !this.showNoiseDropdown;
  }

  @action
  hideNoiseDropdown() {
    this.showNoiseDropdown = false;
  }
}
