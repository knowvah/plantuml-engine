// SPDX-License-Identifier: MIT
//
// Serve the remote stdlib bundles the playground registers (awslib14, its
// alias awslib, and tupadr3) from the docs site itself, at
// /stdlib/<bundle>/<relPath> -- the "self-hosted assets" recipe in
// docs/stdlib-remote.md (plans/playground-stdlib D2). The packages are the
// source: each one's own `copy-assets` script decides what its `assets/`
// holds, and this copies that tree byte-for-byte (awslib14 is CC BY-ND 2.0,
// so no read-and-rewrite), with the package's licence files beside it.
//
// The copies are gitignored; `docs:dev` and `docs:build` run this first (see
// package.json), the same shape as copy-brand-assets.mjs.

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../', import.meta.url));
const STDLIB_PUBLIC_DIR = fileURLToPath(new URL('./public/stdlib/', import.meta.url));
const VENDORED_STDLIB_DIR = join(REPO_ROOT, 'assets', 'stdlib');
const LICENSE_FILE = /^LICENSE(-[A-Z]+)?$/;
const LICENSES_INDEX = 'LICENSES.md';
const LICENSES_DIR = 'licenses';

/** Served folder → the workspace package whose `assets/<folder>/` backs it. */
const BUNDLES = {
  awslib14: 'stdlib-aws',
  tupadr3: 'stdlib-tupadr3',
};

function fail(message) {
  process.stderr.write(`copy-stdlib-assets: ${message}\n`);
  process.exit(1);
}

/** The package's licence texts: `LICENSE*`, `LICENSES.md`, and `licenses/`. */
function licenseEntries(packageDir) {
  return readdirSync(packageDir).filter(
    (name) => LICENSE_FILE.test(name) || name === LICENSES_INDEX || name === LICENSES_DIR,
  );
}

for (const folder of Object.keys(BUNDLES)) {
  if (!existsSync(join(VENDORED_STDLIB_DIR, folder))) {
    fail(
      `assets/stdlib/${folder}/ is missing. Restore the vendored stdlib (CI: ` +
        `./.github/actions/vendored-stdlib) and run \`npm run build:stdlib\` first.`,
    );
  }
}

rmSync(STDLIB_PUBLIC_DIR, { recursive: true, force: true });
mkdirSync(STDLIB_PUBLIC_DIR, { recursive: true });

for (const [folder, pkg] of Object.entries(BUNDLES)) {
  const packageDir = join(REPO_ROOT, 'packages', pkg);
  execFileSync(process.execPath, [join(packageDir, 'scripts', 'copy-assets.mjs')], { stdio: 'inherit' });

  const target = join(STDLIB_PUBLIC_DIR, folder);
  cpSync(join(packageDir, 'assets', folder), target, { recursive: true });
  const licenses = licenseEntries(packageDir);
  if (!licenses.includes(LICENSES_INDEX) || !licenses.some((name) => LICENSE_FILE.test(name))) {
    fail(`packages/${pkg} has no LICENSE or ${LICENSES_INDEX}; refusing to serve ${folder} without them.`);
  }
  for (const name of licenses) cpSync(join(packageDir, name), join(target, name), { recursive: true });
  process.stderr.write(`copy-stdlib-assets: packages/${pkg}/assets/${folder} -> docs-site/public/stdlib/${folder}\n`);
}
