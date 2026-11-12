## Observation: CommandCreateAttribute's CODE claims many lines
- **Context**: porting the err-no-brace and Syntax Error tests.
- **Finding**: `CODE` is `[%pLN%s_.:]+`, so `entity A` (no brace), `wibble wobble` and `left  to right direction` all match `CommandCreateAttribute`. With no owner they refuse with "Attribute must be inside an entity, relationship or another attribute" (kind `execution`), never "Syntax Error?". A line with a char outside that set (`%%%`) is the real syntax error.
- **Impact**: D7's "err-no-brace -> Welcome page" is the first-line-failure path for an `execution` refusal at line 0, not a syntax refusal; T3a's routing check should expect that.
- **Confidence**: High (ported regex + unit tests; the Welcome decision itself is the dispatcher's, not checked here)

## Observation: `{ A, }` resolves an empty subclass name
- **Context**: Java `split(",")` test for CommandMultiSubclass.
- **Finding**: SUBCLASSES is `(.+)` between the braces, so `{ A, }` captures " A, " and splits to [" A", " "]; the second trims to "" and `quarkInContext(true, "")` yields a quark whose entity is not a Chen leaf (name "", no leaf type), so a third link is added with no error. Only `{A,}` drops the trailing empty. Not compared with a jar render.
- **Impact**: a probe for `{ A, }` should be rendered with scripts/oracle-render.sh before any fixture relies on it.
- **Confidence**: Medium (port behaviour observed; jar not rendered)
