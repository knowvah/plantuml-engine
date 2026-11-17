# Data flow: an emoji on an edge label, after T1b-T1d

Before the mission, `drawAtoms` drew every emoji as its platform-glyph text run, because no `buildTextBlock` caller
could hand it the emoji store.

```plantuml
@startuml
start
:ast.sprites (SpriteRegistry, emoji store when wired);
:makeAtomImageResolverFor(registry) per font;
note right: T1b attaches emojiArtwork
:SvekEdge label block, quantifier block (T1c), legacy activity label (T1d);
:buildTextBlock, then drawAtoms;
if (atom is an emoji?) then (yes)
  :drawEmojiAtom with resolver.emojiArtwork;
  if (artwork resolves?) then (yes)
    :SvgNanoParser replays the artwork primitives;
  else (no)
    :platform-glyph text run (accepted fallback);
  endif
else (no)
  :text, sprite, image arms as before;
endif
:advance by the declared 36 x factor box;
stop
@enduml
```

Upstream: `SvekEdge.java:286-299,328-340` (label and quantifiers, one `skinParam`), `StripeSimple.java:245-250`
(`addEmoji`), `Emoji.java:111-118` (the global table), `AtomEmoji.java:66-68` and `Emoji.java:175-182` (the draw).
