import { TextureLoader } from 'three';

class Textures {
  load(ready) {
    this.loader = new TextureLoader();
    this.textures = [
      { path: 'assets/images/lib/00019.png' },
      { path: 'assets/images/lib/00042.png' },
      { path: 'assets/images/lib/00005.png' },
      { path: 'assets/images/lib/00006.png' },
      { path: 'assets/images/lib/00044.png' },
      { path: 'assets/images/lib/00045.png' },
      { path: 'assets/images/lib/00007.png' },
      { path: 'assets/images/lib/00003.png' },
      { path: 'assets/images/lib/00010.png' },
      { path: 'assets/images/lib/00012.png' },
      { path: 'assets/images/lib/00013.png' },
      { path: 'assets/images/lib/00014.png' },
      { path: 'assets/images/lib/00019.png' },
      // { path: 'assets/images/lib/00020.png' },
      // { path: 'assets/images/lib/00021.png' },
      // { path: 'assets/images/lib/00022.png' },
      { path: 'assets/images/lib/00023.png' },
      { path: 'assets/images/lib/00025.png' },
      { path: 'assets/images/lib/00026.png' },
      { path: 'assets/images/lib/00028.png' },
      { path: 'assets/images/lib/00029.png' },
      { path: 'assets/images/lib/00030.png' },
      { path: 'assets/images/lib/00031.png' },
      { path: 'assets/images/lib/00032.png' },
      { path: 'assets/images/lib/00033.png' },
      { path: 'assets/images/lib/00034.png' },
      { path: 'assets/images/lib/00035.png' },
      { path: 'assets/images/lib/00036.png' },
      { path: 'assets/images/lib/00037.png' },
      { path: 'assets/images/lib/00038.png' },
      // { path: 'assets/images/lib/00039.png' },
      // { path: 'assets/images/lib/00040.png' },
      { path: 'assets/images/lib/00043.png' },
      { path: 'assets/images/lib/00046.png' },
      { path: 'assets/images/lib/00047.png' },
      { path: 'assets/images/lib/00048.png' },
    ];
    this.ready = ready;
    this.index = 0;
    this.toLoad = this.textures.length;
    this.loadAll();
  }

  loadAll() {
    this.textures.forEach(p => {
      this.loader.load(p.path, texture => {
        p.texture = texture;
        this.toLoad -= 1;

        if (this.toLoad <= 0) {
          this.ready();
        }
      });
    });
  }

  getNext() {
    return this.textures[(this.index++) % this.textures.length].texture;
  }
}

export default new Textures();
