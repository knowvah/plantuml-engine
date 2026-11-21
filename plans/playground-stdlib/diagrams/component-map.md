# Component map: what this mission touches

```plantuml
@startuml
title playground-stdlib: touched (bold) and read-only components
skinparam componentStyle rectangle

package "docs-site" {
  component "**Playground.vue**" as PV
  component "**playground-render.ts**\n(new)" as PR
  component "**copy-stdlib-assets.mjs**\n(new)" as CSA
  component "public/stdlib/\n(gitignored output)" as PUB
}

package "library src/ (read-only)" {
  component "stdlibRegistry\nremoteStdlib" as REG
  component "prepareIncludeStore\nrenderSync / render" as API
}

package "workspace packages (read-only)" {
  component "@knowvah/plantuml-stdlib\n(eager: C4, archimate, ...)" as STD
  component "@knowvah/plantuml-stdlib-aws\n(remote: awslib14, awslib)" as AWS
  component "@knowvah/plantuml-stdlib-tupadr3\n(remote: tupadr3)" as TUP
}

package "CI" {
  component "**docs.yml**" as DOCS
  component "**ci.yml e2e**" as E2E
  component "vendored-stdlib action" as VS
}

PV --> PR : render(src)
PR --> API : prepare + render
PR --> REG : registry of import() thunks
REG ..> STD : lazy import()
REG ..> AWS : lazy import() of manifest
REG ..> TUP : lazy import() of manifest
CSA --> PUB : verbatim copy + LICENSE
AWS --> CSA : assets/awslib14
TUP --> CSA : assets/tupadr3
REG ..> PUB : fetch at runtime
DOCS --> VS : restore assets/stdlib
E2E --> VS : restore assets/stdlib
@enduml
```
