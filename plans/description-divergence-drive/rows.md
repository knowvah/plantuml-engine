# Open description rows, 208

Written by `measurements/classify.mjs`. A family is a lead from source and diff patterns, not a proved cause.

## Families

| task | lead | rows |
|---|---|---:|
| T1a | `CommandCreateElementFull` DISPLAY2 and CODE1 forms | 9 |
| T1b | class factory refuses, description answers | 8 |
| T1c | missing commands: domain, `[` body, nested json/map, note url, unicode title | 11 |
| T2a | corners: `DiagonalCorner`, stereotype `RoundCorner` | 33 |
| T2b | stroke: `LineStyle`, `BorderStyle`, `BorderThickness`, cluster border | 31 |
| T2c | fonts: `FontName`, stereotype style, `HorizontalAlignment` | 17 |
| T2d | positional `<style>`: `Entity#getCurrentStyleBuilder` | 3 |
| T2e | colour specs: `text:`, `line.`, `#?a:b` | 14 |
| T3a | middle decor: `-0)-`, `-(0)-` | 9 |
| T3b | magnetic border: folder, cluster, note | 35 |
| T3c | quantifier and role text | 5 |
| T3d | arrow style: `<<tag>>`, `arrow {}`, rainbow, transparent | 28 |
| T3e | link labels: magic arrow, `maxMessageSize`, atoms | 9 |
| T4a | degenerate and leaf sizing | 68 |
| T4b | `skinparam guillemet` | 4 |
| T4c | empty and anonymous containers | 7 |
| T4d | sprites in a stereotype and in a body | 25 |
| T4e | notes: colour, stereotype, on link | 6 |
| T4f | archimate | 15 |
| T4g | creole rules and underline stroke | 4 |
| T5a | `skinparam handwritten` | 5 |
| T5b | `!theme`, `skin`, monochrome | 7 |
| T5c | inline gradient, shadow, interactive defs, transparent root | 13 |
| T5e | named end: LaTeX, Smetana, oracle error | 9 |
| T5d | unassigned: read first | 8 |

## Rows

| row | verdict | diffs | dotEqual | families | first diff (ours / jar) |
|---|---|---:|---|---|---|
| `usecase/fepuvo-06-rugi981` | oracle-error | 0 | false | T4g |  |
| `component/bagoze-78-lada681` | diverged | 1 | true | T3d | `g[3][childCount]` 3 / 4 |
| `component/misube-65-seni576` | diverged | 1 | true | T3c | `g[5][childCount]` 1 / 2 |
| `component/purevo-74-pamo264` | diverged | 1 | true | T3c | `g[5][childCount]` 1 / 3 |
| `unknown/bavezi-52-bive782` | diverged | 1 | true | T2a | `g[1]/rect[1]` rect / path |
| `unknown/delagi-06-leji038` | diverged | 1 | true | T5c | `svg/defs[1][childCount]` 0 / 2 |
| `unknown/gipeda-98-bigo389` | diverged | 1 | true | T2a | `g[2]/rect[1]` rect / path |
| `unknown/jubaba-44-tole509` | diverged | 1 | true | T2b | `g[1]/rect[1]/@stroke-dasharray`  / 7,7 |
| `unknown/mafaki-14-cido418` | diverged | 1 | true | T2a T4f | `g[1]/rect[1]` rect / path |
| `unknown/pagega-99-fizu220` | diverged | 1 | true | T4d T4f | `g[2][childCount]` 1 / 2 |
| `unknown/pofali-42-vule505` | diverged | 1 | true | T2d | `g[2]/rect[1]/@fill` #98FB98 / #FFC0CB |
| `unknown/potani-24-vata851` | diverged | 1 | true | T2a T4f | `g[1]/rect[1]` rect / path |
| `unknown/rugora-14-muxa930` | diverged | 1 | true | T4d | `g[1][childCount]` 2 / 3 |
| `unknown/simegi-12-fezi978` | diverged | 1 | true | T2b T3d T5e | `g[3]/path[1]/@stroke-dasharray`  / 3,2 |
| `unknown/xilosu-00-taju695` | diverged | 1 | true | T2b T3d | `g[3]/path[1]/@stroke-dasharray`  / 3,2 |
| `unknown/zodela-36-sica712` | structural-match | 1 | true | T3b | `g[3]/path[1]/@d[22]` 121.66 / 121.88 |
| `component/pafefo-52-zeli644` | diverged | 2 | true | T2b | `g[1]/path[1]/@stroke` #000 / #F00 |
| `component/pemifo-35-kute324` | diverged | 2 | true | T2b T3d | `g[4]/path[1]/@stroke-dasharray`  / 10,5 |
| `component/sacuso-94-gugi476` | diverged | 2 | true | T2b | `g[1]/path[1]/@stroke` #000 / #F00 |
| `component/xusuxe-62-guba767` | diverged | 2 | true | T4d | `g[1]/text[1]/@fill` #FFF / #000 |
| `usecase/baxodi-80-doto381` | diverged | 2 | true | T2e | `g[1]/text[1]/@fill` #?black:white / #FFF |
| `usecase/gogamo-72-pibo470` | diverged | 2 | true | T2c | `g[1]/text[1]/@font-family`  / Courier |
| `usecase/jecici-56-bimu826` | diverged | 2 | true | T2a T3d T4a T4e T5c | `svg/@height` 372 /  |
| `usecase/nixura-77-bina738` | diverged | 2 | true | T4g | `g[1]/line[4]/@stroke-width` 1 / 0.5 |
| `unknown/barobi-40-zusa254` | structural-match | 2 | true | T5d | `g[1]/text[1]/@x` 260.669 / 267.834 |
| `unknown/bitujo-81-gunu116` | diverged | 2 | true | T2e | `g[1]/text[1]/@fill` #?black:white / #FFF |
| `unknown/buvofa-22-vozi025` | diverged | 2 | true | T5b | `g[1]/path[1]/@stroke` #000 / #393939 |
| `unknown/degici-07-kura718` | diverged | 2 | true | T2e | `g[1]/text[1]/@fill` #?black:white / #FFF |
| `unknown/dunila-61-licu078` | structural-match | 2 | true | T2a | `g[2]/rect[1]/@rx` 2.5 / 7.5 |
| `unknown/fukoku-72-zudi472` | diverged | 2 | true | T4c | `g[1]/path[1]/@fill` #F1F1F1 / #FF0 |
| `unknown/gigetu-10-funi859` | structural-match | 2 | true | T3b | `g[2]/path[1]/@d[14]` 117.67 / 133.585 |
| `unknown/gitaxu-39-zifa189` | structural-match | 2 | true | T2a T4f | `g[2]/rect[1]/@rx` 2.5 / 12.5 |
| `unknown/golamo-46-lume529` | diverged | 2 | true | T2b T5c | `g[1]/rect[1]/@stroke-dasharray`  / 7,7 |
| `unknown/kijipu-30-vona046` | structural-match | 2 | true | T2c | `g[1]/text[1]/@x` 96.816 / 67.71 |
| `unknown/pexaxo-70-dofe187` | diverged | 2 | true | T2e | `g[1]/text[1]/@fill` #?black:white / #FFF |
| `unknown/ricute-48-xocu720` | diverged | 2 | true | T4c | `g[5]/path[1]/@fill` #F1F1F1 / #FF0 |
| `unknown/tinizu-50-vamu491` | diverged | 2 | true | T4e | `g[2]/path[1]/@fill` #FEFFDD / #000 |
| `unknown/xikefu-26-vora536` | diverged | 2 | true | T4g | `g[2]/line[1]/@stroke-width` 1 / 0.5 |
| `unknown/xozonu-96-nota512` | diverged | 2 | true | T4d | `g[1][childCount]` 2 / 3 |
| `unknown/zumuvu-52-jure458` | diverged | 2 | true | T4d | `g[1][childCount]` 2 / 3 |
| `component/nuxebu-15-sixe797` | diverged | 3 | true | T2b | `g[1]/path[1]/@stroke` #000 /  |
| `usecase/lunexo-59-fupo775` | diverged | 3 | true | T2c | `g[1]/text[1]/@fill` #000 / #008000 |
| `unknown/biruxu-93-gola114` | diverged | 3 | true | T4d | `g[1][childCount]` 3 / 4 |
| `unknown/dunudu-55-zene634` | diverged | 3 | true | T4d | `g[2][childCount]` 1 / 2 |
| `unknown/fexeci-32-japu912` | diverged | 3 | true | T2c T3d | `g[1]/text[1]/@font-family`  / 'Roboto' |
| `unknown/fuceci-90-lero070` | diverged | 3 | true | T4d | `g[1][childCount]` 3 / 4 |
| `unknown/jobuje-80-mopu051` | diverged | 3 | true | T2e | `g[2]/text[1]/@fill` #000 / #FFF |
| `unknown/kazugi-06-bano280` | diverged | 3 | true | T4c | `svg/@viewBox[2]` 122 / 187 |
| `unknown/kekeli-82-vagi037` | diverged | 3 | true | T2c T3d | `g[1]/text[1]/@font-family`  / 'Roboto' |
| `unknown/mepuro-90-lage386` | diverged | 3 | true | T4d | `g[2][childCount]` 1 / 2 |
| `unknown/mofora-39-nole251` | diverged | 3 | true | T4d | `g[2][childCount]` 1 / 2 |
| `unknown/resesi-61-jopa181` | diverged | 3 | true | T4d | `g[1][childCount]` 3 / 4 |
| `unknown/sprite-SVG-fill-management-5` | diverged | 3 | true | T4d | `g[2][childCount]` 1 / 2 |
| `unknown/sprite-SVG-stroke-management-1` | diverged | 3 | true | T4d | `g[2][childCount]` 1 / 2 |
| `unknown/sprite-SVG-stroke-management-2` | diverged | 3 | true | T4d | `g[2][childCount]` 1 / 2 |
| `unknown/xajome-41-tozi211` | diverged | 3 | true | T4d | `g[1][childCount]` 3 / 4 |
| `component/gekage-52-dato745` | diverged | 4 | true | T2e T3d | `g[5]/path[1]/@stroke` #line.dashed:blue / #FFF |
| `component/kezodo-14-pume985` | structural-match | 4 | true | T4a T5e | `svg/@height` 132 / 156 |
| `component/kuciku-99-tedu217` | structural-match | 4 | true | T2c T4a | `svg/@height` 78 / 84 |
| `component/lakuti-06-dobi447` | diverged | 4 | true | T3a | `g[3]/path[1]/@d` M39.07,51.13 C39.0 / M31.999,87.872 A10 |
| `component/mavicu-17-mago821` | structural-match | 4 | true | T4a | `svg/@height` 78 / 84 |
| `component/minulo-12-bare186` | diverged | 4 | true | T3d | `g[7]/text[1]/@fill` #008000 / #F00 |
| `component/ruciga-77-ruja233` | diverged | 4 | true | T4d T4f | `g[4]/text[1]/@y` 55.111 / 62.111 |
| `component/seguci-13-zure968` | diverged | 4 | true | T2c | `g[1]/text[1]/@font-family`  / Hack, DejaVu Sans  |
| `component/tuliba-37-liza126` | structural-match | 4 | true | T2a T4d T4f | `g[2]/rect[1]/@rx` 2.5 / 12.5 |
| `component/vimulo-11-buni641` | structural-match | 4 | true | T4a T5e | `svg/@height` 264 / 312 |
| `component/xagino-11-vazo768` | diverged | 4 | true | T2b | `g[1]/path[1]/@stroke` #000 / #F00 |
| `component/xekale-36-tiri787` | diverged | 4 | true | T2e T3d | `g[5]/path[1]/@stroke` #line.dashed:blue / #FFF |
| `unknown/bocija-94-lexe894` | diverged | 4 | true | T2b | `g[1]/path[1]/@stroke-dasharray`  / 7,7 |
| `unknown/bujigu-81-nima035` | diverged | 4 | true | T2b T5c | `g[2]/rect[1]/@stroke` #181818 /  |
| `unknown/depali-74-visa399` | structural-match | 4 | true | T3e T4a | `svg/@height` 84 / 96 |
| `unknown/luzeti-08-lafa321` | diverged | 4 | true | T2b | `g[1]/rect[1]/@stroke-dasharray`  / 5,5 |
| `unknown/manama-22-joxi528` | structural-match | 4 | true | T2a | `g[1]/rect[1]/@rx` 2.5 / 22.5 |
| `unknown/midevi-31-poga014` | diverged | 4 | true | T2a T2b | `g[1]/rect[1]/@rx` 2.5 / 7.5 |
| `unknown/mocucu-79-goge681` | diverged | 4 | true | T2a T2b | `g[2]/rect[1]/@rx` 2.5 / 12.5 |
| `unknown/nefire-75-sudo926` | structural-match | 4 | true | T3e T4a | `svg/@height` 84 / 96 |
| `unknown/ninipe-96-roro815` | diverged | 4 | true | T2b | `g[1]/path[1]/@stroke-dasharray`  / 7,7 |
| `unknown/nopelu-51-lopo302` | diverged | 4 | true | T2a T2b | `g[1]/rect[1]/@rx` 2.5 / 12.5 |
| `unknown/nuzada-73-goke308` | diverged | 4 | true | T2b | `g[1]/path[1]/@stroke-dasharray`  / 7,7 |
| `unknown/pacope-41-pufu938` | diverged | 4 | true | T4d | `g[3]/text[1]/@x` 225.377 / 219.711 |
| `unknown/xefuma-94-cura811` | diverged | 4 | true | T1b T2b | `g[3]/path[1]/@stroke-width` 1.5 / 1 |
| `unknown/zodiro-57-zuli767` | diverged | 4 | true | T4e | `g[4]/path[1]/@fill` #FEFFDD / #00F |
| `unknown/zoguvu-43-vami815` | structural-match | 4 | true | T3e T4a | `svg/@height` 70 / 82 |
| `component/cudazo-20-silo903` | diverged | 5 | true | T2b T2d T3d | `g[4]/path[1]/@stroke` #00F / #008000 |
| `component/fetefi-28-figu176` | diverged | 5 | true | T3c | `g[5]/text[1]/@textLength` 19.581 / 18.038 |
| `unknown/corevo-13-cega392` | diverged | 5 | true | T1a T3d T4a | `svg/@height` 68 / 122 |
| `unknown/gugapu-35-kama674` | diverged | 5 | false | T1a T4a | `svg/@height` 272 / 286 |
| `unknown/joliva-50-vuva261` | diverged | 5 | true | T2b T5c | `g[2]/rect[1]/@stroke` #181818 /  |
| `unknown/tipado-10-jave498` | diverged | 5 | false | T1a T4a | `svg/@height` 140 / 211 |
| `component/lotofa-28-rudo664` | diverged | 6 | true | T1b T2b T5c | `g[1]/path[1]/@stroke-dasharray`  / 2,2 |
| `component/vaseda-71-suje167` | diverged | 6 | true | T2b T3d | `g[5]/path[1]/@stroke-dasharray`  / 10,5 |
| `unknown/ceboti-36-tuza211` | diverged | 6 | true | T1c T4a T4f | `svg/@background` #000000 / #FFFFFF |
| `unknown/fesusa-40-gabo183` | diverged | 6 | true | T4a T5c | `svg/@height` 69 / 75 |
| `unknown/gacoxo-93-guti295` | diverged | 6 | false | T1c T4a | `svg/@background` #000000 / #FFFFFF |
| `unknown/gijegu-60-jori109` | diverged | 6 | true | T2a T4a | `svg/@height` 188 / 189 |
| `unknown/liripi-72-kefa167` | diverged | 6 | false | T1c T4a | `svg/@background` #000000 / #FFFFFF |
| `unknown/maxeme-36-rale224` | diverged | 6 | false | T1c T4a | `svg/@background` #000000 / #FFFFFF |
| `unknown/mideva-42-fumu406` | diverged | 6 | false | T1a T1c T2c T4a | `svg/@background` #000000 / #FFFFFF |
| `unknown/popufa-55-goci799` | diverged | 6 | false | T1a T1c T4a | `svg/@background` #000000 / #FFFFFF |
| `unknown/refabu-21-jesu466` | diverged | 6 | true | T2b | `g[2]/text[2]/@x` 299.002 / 322.3 |
| `unknown/sapeka-40-zoze338` | structural-match | 6 | true | T2a T4a | `svg/@height` 68 / 66 |
| `unknown/sifagi-73-kexu776` | diverged | 6 | false | T1c T4a T4g | `svg/@background` #000000 / #FFFFFF |
| `unknown/suzuge-76-jova272` | diverged | 6 | true | T2b | `g[1]/rect[1]/@stroke-dasharray`  / 7,7 |
| `unknown/vajeje-58-peli352` | diverged | 6 | false | T1a T1c T4a | `svg/@background` #000000 / #FFFFFF |
| `unknown/zisuvu-18-goja196` | diverged | 6 | false | T1a T1c T4a | `svg/@background` #000000 / #FFFFFF |
| `component/bozoju-49-kufo528` | structural-match | 7 | true | T3b T4c | `g[4]/path[1]/@d[5]` 87.83 / 90.994 |
| `component/gucefa-91-pume734` | structural-match | 7 | true | T3b | `g[5]/path[1]/@d[23]` 139.003 / 142.167 |
| `component/kanute-77-lacu414` | structural-match | 7 | true | T3b T4c | `g[5]/path[1]/@d[5]` 114.03 / 117.194 |
| `component/texacu-57-daci050` | diverged | 7 | true | T3b T4c | `g[16]/path[1]/@d[1]` 138 / 158 |
| `usecase/bixofa-44-siso224` | diverged | 7 | true | T4a | `svg/@height` 61 / 69 |
| `usecase/kafexo-72-xupa679` | diverged | 7 | true | T3e | `svg/@viewBox[2]` 328 / 166 |
| `usecase/zotiru-33-legi180` | structural-match | 7 | true | T1b T3b | `g[3]/path[1]/@d[2]` 90.713 / 309.5 |
| `unknown/kifogu-44-zebo642` | structural-match | 7 | true | T3b | `g[5]/path[1]/@d[47]` 125.629 / 145.629 |
| `unknown/xoviku-63-jici084` | diverged | 7 | false | T2b T3d T5e | `line[1]/@stroke` #181818 / #F00 |
| `unknown/xupiko-87-dafi146` | diverged | 7 | true | T2c | `g[1]/text[2]/@fill` #000 / #F00 |
| `component/reroca-56-safi108` | diverged | 8 | true | T5b | `g[1]/rect[1]/@stroke` #C6C6C6 /  |
| `component/sevage-80-seva382` | diverged | 8 | true | T2b | `g[1]/path[1]/@stroke-dasharray`  / 5,5 |
| `unknown/selapa-88-lopi279` | structural-match | 8 | true | T3b | `g[18]/path[1]/@d[29]` 154.618 / 174.618 |
| `unknown/tireno-34-buta139` | diverged | 8 | true | T3a T3b | `g[5]/path[1]/@d` M167.07,24 C178.43 / M191.181,31.071 A1 |
| `unknown/tufixe-50-zimu614` | diverged | 8 | true | T2a T4a | `svg/@height` 209 / 210 |
| `component/kokodo-61-dano461` | diverged | 9 | true | T2e T3d | `g[7]/path[1]/@stroke` text:Red / #008000 |
| `component/koxeca-82-mese950` | diverged | 9 | true | T2e T3d | `g[6]/path[1]/@stroke` text:Red / #008000 |
| `usecase/zavitu-69-cemu013` | structural-match | 9 | true | T3b T4e | `g[17]/path[1]/@d[23]` 644.177 / 664.177 |
| `usecase/funeme-74-tenu200` | diverged | 10 | true | T3e | `svg/@viewBox[2]` 136 / 138 |
| `unknown/beguta-99-gixu960` | diverged | 10 | true | T2c | `g[1]/text[1]/@fill` #000 / #008000 |
| `unknown/runedi-09-voce726` | diverged | 10 | true | T5d | `g[11]/text[1]/@textLength` 18.038 /  |
| `unknown/sacupe-57-dejo730` | diverged | 10 | true | T2a T4a | `svg/@height` 71 / 72 |
| `unknown/zonamu-61-kocu599` | diverged | 10 | true | T2a T4a | `svg/@height` 71 / 72 |
| `unknown/zucave-84-moki390` | diverged | 10 | true | T2a | `g[1]/rect[1]` rect / path |
| `component/bokumi-45-pupo531` | diverged | 12 | true | T3a T3d | `g[7]/path[1]/@d` M122.69,51.13 C128 / M134.247,73.718 A1 |
| `component/golati-24-xika861` | diverged | 12 | true | T2b T2e T3d | `g[10]/path[1]/@stroke` text:Red / #008000 |
| `component/jegure-48-cesi766` | diverged | 12 | true | T2b T4e T5c | `g[2]/path[1]/@fill` #FEFFDD / #008000 |
| `component/perapa-23-mobu798` | structural-match | 12 | true | T5d | `g[1]/rect[1]/@x` 92.585 / 98.378 |
| `usecase/mogidu-85-roxe269` | diverged | 12 | true | T2a T4b | `svg/@viewBox[2]` 129 / 109 |
| `unknown/doculo-43-rofe573` | diverged | 12 | true | T1a T4a T5a | `svg/@height` 109 / 129 |
| `unknown/somule-10-duci912` | diverged | 12 | true | T2a T4a | `svg/@height` 85 / 86 |
| `component/povuju-56-zafi701` | diverged | 13 | true | T3a | `g[16][childCount]` 3 / 4 |
| `component/titona-45-jile471` | diverged | 13 | true | T5c | `g[3]/polygon[1]/@fill` #F1F1F1 / url(#gk29t32nzws0j |
| `unknown/befemi-82-coro755` | diverged | 13 | false | T3a T3d T4a | `svg/@height` 292 / 320 |
| `unknown/virobu-13-gufo770` | diverged | 13 | false | T1a T1c T4a | `svg/@background` #000000 / #FFFFFF |
| `unknown/vusopa-96-tero462` | diverged | 13 | false | T3a T4a | `svg/@height` 438 / 480 |
| `component/banatu-09-koce254` | structural-match | 14 | true | T3b | `g[1]/polygon[1]/@points[0]` 55.25 / 55.375 |
| `component/cumofi-94-lixe862` | diverged | 14 | true | T4a T5a | `svg/@height` 195 / 255 |
| `component/vajaxu-62-poto986` | diverged | 14 | true | T5b T5c | `g[1]/polygon[1]/@stroke` #181818 / #E7E7E7 |
| `unknown/larevi-66-levu205` | diverged | 14 | true | T5d | `g[2]/path[1]/@d[1]` 11.5 / 16.5 |
| `unknown/puboke-80-sefi248` | structural-match | 14 | true | T3b | `g[20]/path[1]/@d[65]` 259.387 / 279.387 |
| `unknown/vakixe-15-jita507` | diverged | 14 | true | T4a T5a | `svg/@height` 92 / 112 |
| `unknown/zetedu-83-bugu867` | diverged | 14 | true | T2a T4a | `svg/@height` 103 / 95 |
| `unknown/toxeto-79-kile546` | diverged | 16 | true | T2a T4a | `svg/@height` 117 / 105 |
| `unknown/xapuji-91-dagu145` | diverged | 16 | true | T2a T4a | `svg/@height` 117 / 105 |
| `usecase/sotine-10-lore970` | diverged | 17 | true | T4a | `svg/@height` 84 / 98 |
| `usecase/sumata-59-zavu229` | diverged | 17 | true | T4a | `svg/@height` 84 / 98 |
| `usecase/xixaca-96-nene831` | diverged | 17 | true | T4a | `svg/@height` 84 / 98 |
| `component/sakare-67-voci462` | diverged | 18 | true | T2c T2d | `g[1]/polygon[1]/@stroke` #F00 / #181818 |
| `usecase/sprite-SVG-fill-management-3` | diverged | 18 | true | T3e T4d | `svg/@viewBox[2]` 81 / 97 |
| `usecase/tatori-66-kaci883` | diverged | 18 | true | T3e T4d | `svg/@viewBox[2]` 81 / 97 |
| `unknown/sifobi-72-bepi816` | diverged | 19 | false | T3b T5b | `g[2]/rect[1]/@stroke-width` 0.5 / 1 |
| `component/nujove-77-xiva558` | diverged | 20 | true | T3b T3d | `g[1]/@id` ent0002 / ent0001 |
| `unknown/gesapu-18-kazu561` | diverged | 20 | true | T3b T4a T5a | `svg/@height` 312 / 372 |
| `unknown/vugaso-74-supa801` | diverged | 20 | false | T3a T3d T4a | `svg/@height` 102 / 116 |
| `component/saveje-35-vumu271` | diverged | 25 | true | T3a T3d | `svg/@viewBox[2]` 162 / 184 |
| `usecase/vivido-49-nisu863` | structural-match | 25 | true | T4f | `g[2]/a[1]/text[1]/@y` 132.021 / 131.141 |
| `unknown/betifi-05-nuva576` | diverged | 25 | true | T4a T5a | `svg/@height` 203 / 223 |
| `component/balomu-94-kegi822` | diverged | 26 | true | T5c | `g[3]/polygon[1]/@fill` #F1F1F1 / url(#g1nejrz8nqqki |
| `usecase/ridola-99-jija391` | structural-match | 26 | true | T2a T4a | `svg/@height` 43 / 44 |
| `unknown/difufa-66-cici681` | diverged | 26 | true | T2b | `g[1]/path[1]/@stroke-dasharray`  / 2,2 |
| `component/nofunu-07-tuna518` | diverged | 27 | true | T3a | `g[16]/path[1]/@d` M378.181,79.77 C37 / M371.11,130.214 A1 |
| `unknown/divani-97-lode006` | diverged | 28 | false | T4b | `svg/@viewBox[2]` 333 / 228 |
| `unknown/gidike-19-rudi116` | diverged | 28 | false | T4b | `svg/@viewBox[2]` 333 / 228 |
| `unknown/gikizu-32-zolu433` | diverged | 28 | false | T4b | `svg/@viewBox[2]` 333 / 228 |
| `usecase/bivira-53-boja685` | diverged | 29 | true | T4d | `g[1]/ellipse[1]/@cy` 30.889 / 30.5 |
| `usecase/berufi-69-dara369` | structural-match | 30 | true | T5d | `g[36]/text[1]/@x` 12 / 22.075 |
| `usecase/bobije-35-nigi914` | structural-match | 30 | true | T5d | `g[36]/text[1]/@x` 433.44 / 443.515 |
| `usecase/seline-83-vifi756` | structural-match | 30 | true | T5d | `g[36]/text[1]/@x` 12 / 22.075 |
| `usecase/xoculo-95-fuvi894` | structural-match | 30 | true | T5d | `g[36]/text[1]/@x` 433.44 / 443.515 |
| `unknown/kufofi-19-livi163` | diverged | 36 | false | T2b T3b T3d T4a | `svg/@height` 321 / 335 |
| `unknown/luzida-92-gebi610` | diverged | 37 | false | T1b T3b T4a | `svg/@height` 238 / 221 |
| `unknown/zimuxu-52-lazi274` | structural-match | 37 | true | T3b T3e | `svg/@viewBox[2]` 536 / 457 |
| `unknown/doluca-89-bune889` | diverged | 38 | false | T2e T3b T3d T4a | `svg/@height` 321 / 335 |
| `unknown/nasuge-48-cesa800` | diverged | 39 | true | T4e T5c | `g[7]/polygon[1]/@fill` #F1F1F1 / url(#gulevlcb9ewbx |
| `component/vogefo-33-xeve917` | diverged | 40 | true | T3b T4c | `svg/@viewBox[2]` 239 / 301 |
| `unknown/pupuma-17-pifi294` | diverged | 58 | false | T2e T3b T3d | `g[1]/rect[1]/@x` 63.74 / 62.74 |
| `unknown/rukitu-26-seme622` | diverged | 59 | false | T1c T4a | `svg/@background` #000000 / #FFFFFF |
| `unknown/kajiko-47-vave573` | diverged | 60 | false | T2e T3b T3d | `g[1]/rect[1]/@x` 63.74 / 62.74 |
| `unknown/barufu-21-bedo723` | diverged | 64 | true | T2a T3b T4a T5e | `svg/@height` 244 / 227 |
| `unknown/nuvapa-57-joxi089` | diverged | 65 | true | T2c T4a T4f | `svg/@height` 88 / 84 |
| `unknown/ludipa-77-tako754` | diverged | 66 | true | T2c T4a T4f T5b | `svg/@height` 88 / 84 |
| `unknown/pixelu-98-bovo354` | diverged | 66 | true | T2c T4a T4f T5b | `svg/@height` 88 / 84 |
| `unknown/tegaju-61-mimo980` | diverged | 70 | false | T2e T3b T3d T4d | `svg/@viewBox[2]` 316 / 276 |
| `unknown/zomoba-18-raka718` | diverged | 74 | false | T3b T4a T5e | `svg/@height` 178 / 161 |
| `unknown/fotuko-85-voro628` | diverged | 79 | true | T2c T4a T4d T4f | `svg/@height` 119 / 110 |
| `unknown/vomaka-65-nalo536` | diverged | 82 | false | T3b T4a | `svg/@height` 264 / 278 |
| `component/ravodu-50-siso430` | structural-match | 94 | true | T3b T4d T4f | `g[1]/path[1]/@d[0]` 118.95 / 208.95 |
| `component/berelu-46-namo819` | diverged | 111 | false | T3e T4a | `svg/@height` 188 / 185 |
| `unknown/furepo-90-reri003` | diverged | 111 | false | T3b T4a | `svg/@height` 182 / 189 |
| `component/gevozu-46-sasu860` | structural-match | 166 | false | T2a T4a T5e | `svg/@height` 225 / 242 |
| `component/sunuju-01-pote718` | structural-match | 166 | false | T2a T4a T5e | `svg/@height` 450 / 484 |
| `unknown/fubuja-64-vane162` | diverged | 179 | false | T1b T2a T3b T4a | `svg/@height` 368 / 355 |
| `unknown/minece-51-xape147` | diverged | 181 | false | T1b T2a T3b T4a | `svg/@height` 368 / 355 |
| `unknown/xidaxi-41-niti333` | structural-match | 194 | true | T3b | `g[2]/path[1]/@d[0]` 321.26 / 324.191 |
| `unknown/gepuko-44-gizi401` | diverged | 199 | false | T1b T2a T3c T4a | `svg/@height` 196 / 210 |
| `unknown/zuzura-28-telu962` | diverged | 199 | false | T1b T2a T3c T4a | `svg/@height` 196 / 210 |
| `unknown/taneno-85-fatu449` | diverged | 273 | true | T3b T5b | `g[1]/ellipse[1]/@stroke-width` 0.521 / 1.042 |
| `unknown/kemidi-98-jara869` | diverged | 285 | false | T3b T4a | `svg/@height` 215 / 394 |
| `unknown/fupumu-08-zebu446` | diverged | 571 | true | T2a T2c T3b T4a T4d T4f | `svg/@height` 205 / 199 |
| `unknown/vevali-53-jiri075` | diverged | 676 | false | T4a | `svg/@height` 508 / 662 |
| `unknown/pumoko-38-sedi467` | diverged | 901 | false | T2a T2c T4a T4f | `svg/@height` 580 / 624 |
| `unknown/revezi-19-kuki251` | diverged | 1920 | false | T2b T3d T4a T5c T5e | `svg/@height` 1345 / 1106 |
