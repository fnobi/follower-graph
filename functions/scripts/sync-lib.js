const { join, dirname, relative } = require('path');
const { mkdir, rmdir, readFile, writeFile } = require('fs/promises');
const config = require('../sync-lib.config.json');

function processImportAlias(text, to) {
  // eslint-disable-next-line no-useless-escape
  return text.replace(/\~/g, to);
}

Promise.resolve()
  .then(() => rmdir(config.dest, { recursive: true }))
  .then(() =>
    Promise.all(
      config.files.map(filePath => {
        const src = join(config.src, filePath);
        const dest = join(config.dest, filePath);
        const dir = dirname(dest);
        return Promise.resolve()
          .then(() => mkdir(dir, {recursive: true}))
          .then(() => readFile(src, "utf8"))
          .then(body =>
            writeFile(
              dest,
              processImportAlias(body, relative(dir, config.dest)),
              { encoding: "utf8" }
            )
          );
      })
    )
  );
