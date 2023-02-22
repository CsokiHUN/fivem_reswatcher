const path = require('path');
const fs = require('fs');

const watch = require('watch');

const __dirname = GetResourcePath(GetCurrentResourceName());

const currentPath = path.resolve(__dirname, '../../');

console.log('watching this: ', currentPath);

watch.watchTree(currentPath, { interval: 100 }, function (f, curr, prev) {
  if (typeof f == 'object' && prev === null && curr === null) {
    // Finished walking the tree
  } else if (prev === null) {
    // f is a new file
  } else if (curr.nlink === 0) {
    // f was removed
  } else {
    if (!f.includes('.lua')) return;

    let parent = path.resolve(__dirname, path.dirname(f));

    const scanDir = () => {
      fs.readdir(parent, (err, files) => {
        if (err) return console.error(err);

        const hasManifest = files.find((file) => file.includes('fxmanifest.lua'));
        if (!hasManifest) {
          parent = path.resolve(__dirname, path.dirname(parent));
          if (parent.includes('resources')) scanDir();
        } else {
          const resourceName = path.basename(parent);
          console.log(`${resourceName} changed, restart resource`);

          const state = GetResourceState(resourceName);
          if (state.search('start')) StopResource(resourceName);
          StartResource(resourceName);
        }
      });
    };

    scanDir();
  }
});
