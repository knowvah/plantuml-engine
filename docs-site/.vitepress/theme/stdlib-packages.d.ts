// SPDX-License-Identifier: MIT
// The workspace stdlib subpaths playground-render.ts imports. Their real
// typings live in packages/*/generated/*.d.ts, which is gitignored and built by
// `npm run build:stdlib`; CI's static job typechecks before that build exists
// (.github/workflows/ci.yml, "static gates"), so these declarations keep
// `npm run typecheck` hermetic. TypeScript resolves an ambient module ahead of
// the package's own types, so tests/unit/docs-site/playground-render.test.ts
// resolves every registry key through the real packages to catch any drift.
declare module '@knowvah/plantuml-stdlib/c4' {
  import type { BundleData } from '@knowvah/plantuml-engine';
  export const c4: BundleData;
}
declare module '@knowvah/plantuml-stdlib/archimate' {
  import type { BundleData } from '@knowvah/plantuml-engine';
  export const archimate: BundleData;
}
declare module '@knowvah/plantuml-stdlib/cloudinsight' {
  import type { BundleData } from '@knowvah/plantuml-engine';
  export const cloudinsight: BundleData;
}
declare module '@knowvah/plantuml-stdlib/cloudogu' {
  import type { BundleData } from '@knowvah/plantuml-engine';
  export const cloudogu: BundleData;
}
declare module '@knowvah/plantuml-stdlib/bootstrap' {
  import type { BundleData } from '@knowvah/plantuml-engine';
  export const bootstrap: BundleData;
  export const bootstrap1_13_1: BundleData;
}
declare module '@knowvah/plantuml-stdlib-aws/awslib14.remote' {
  import type { StdlibRemoteManifest } from '@knowvah/plantuml-engine';
  export const awslib14Remote: StdlibRemoteManifest;
}
declare module '@knowvah/plantuml-stdlib-aws/awslib.remote' {
  import type { StdlibRemoteManifest } from '@knowvah/plantuml-engine';
  export const awslibRemote: StdlibRemoteManifest;
}
declare module '@knowvah/plantuml-stdlib-tupadr3/tupadr3.remote' {
  import type { StdlibRemoteManifest } from '@knowvah/plantuml-engine';
  export const tupadr3Remote: StdlibRemoteManifest;
}
