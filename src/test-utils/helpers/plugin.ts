import AbstractPlugin from '../../shared/AbstractPlugin';

export class TestPlugin extends AbstractPlugin {
  attachFunction? = vi.fn();
  detachFunction? = vi.fn();

  attach() {
    this.attachFunction();
  }

  detach() {
    this.detachFunction();
  }
}
