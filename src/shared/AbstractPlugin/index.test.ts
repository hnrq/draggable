import AbstractPlugin from '.';
import Draggable from '../../Draggable';

describe('AbstractPlugin', () => {
  describe('#constructor', () => {
    it('receives a Draggable instance', () => {
      const draggable = new Draggable();
      const plugin = new AbstractPlugin(draggable);

      expect(plugin.draggable).toBe(draggable);
    });
  });

  describe('#attach', () => {
    it('throws `Not implemented`', () => {
      expect(() => {
        new AbstractPlugin(new Draggable()).attach();
      }).toThrow('Not Implemented');
    });
  });

  describe('#detach', () => {
    it('throws `Not implemented`', () => {
      expect(() => {
        new AbstractPlugin(new Draggable()).detach();
      }).toThrow('Not Implemented');
    });
  });
});
