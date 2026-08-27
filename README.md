# Společně pro Frýdek-Místek

Statická kampaňová prezentace koalice **KDU-ČSL, ODS, TOP 09 a STAN**
pro komunální volby 2026 ve Frýdku-Místku. *„Táhneme za jeden provaz!"*

Web je plně statický (HTML + CSS + vanilla JS, bez build kroku) a je připravený
k nasazení na **GitHub Pages**.

## Struktura

```
index.html          – kompletní homepage (jedna stránka)
program.html        – volební program 2026–2030 (13 oblastí, rozbalovací body)
soutez.html         – soutěž o ceny na letních akcích
css/styles.css      – brand design tokeny + styly všech sekcí
js/main.js          – interaktivita (slider, filtr, stránkování, orbit, mapa)
assets/
  fonts/            – Red Hat Display (300–900 + italiky)
  img/              – oficiální loga (SVG)
  photos/           – portrét pro slider
  docs/             – leták ke stažení (PDF)
.nojekyll           – aby GitHub Pages servíroval soubory beze změny
```

## Sekce stránky

1. **Hlavička** – sticky, frosted bílé menu s logem a navigací
2. **Hero** – brand gradient + mapová textura, headline „SPOLEČNĚ?" a orbitální grafika pěti pilířů
3. **Čísla** – klíčové statistiky koalice
4. **Naši kandidáti** – posuvník kruhových portrétů (střídavě magenta/navy)
5. **Seznam kandidátů** – kandidátka 2026 se stránkováním („Načíst další" / „Zobrazit všechny")
6. **Co nás čeká** – časová osa nadcházejících akcí
7. **Aktuality** – novinky s funkčním filtrem podle kategorií
8. **Proč společně** – hlavní slider (auto-play 6 s, šipky, tečky, pauza při najetí)
9. **Dokumenty ke stažení**
10. **Patička** – kontakt, sítě, povinný zadavatel/zpracovatel řádek

## Podstránky

- **program.html** – Volební program 2026–2030: hero, lepivá navigace po 13 oblastech,
  karty s třemi hlavními prioritami a nativně rozbalovacími (`<details>`) dalšími body, CTA „Držíme slovo“
- **soutez.html** – Soutěž o ceny: termíny akcí, pravidla, ceny

## Lokální spuštění

Jakýkoli statický server, např.:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Nasazení na GitHub Pages

V nastavení repozitáře zapněte **Settings → Pages → Deploy from a branch**,
zvolte větev a kořen (`/`). Web se servíruje z `index.html`.

## Design

Postaveno podle dodaného design systému *Společně pro Frýdek-Místek* — brand tokeny
(barvy, gradienty, typografie Red Hat Display, radii, stíny) jsou převzaty 1:1
z `tokens/*.css`, rozvržení a komponenty odpovídají `templates/homepage/`.
Jména, čísla i fotografie jsou ilustrativní.
