# RAG Chatbot — postupné zadanie (krok po kroku v novom chate)

## Kontext pre asistenta

Som frontend programátor učiaci sa AI vývoj, prechádzam na AI aplikácie pre firmy, cielim na zahraničný freelance trh. Toto je môj štvrtý portfóliový projekt — **RAG chatbot** — staviam ho ako samostatný nový projekt od nuly. Predošlé tri projekty (AI chatbot pre firmu, spracovanie dokumentov, AI automatizácia) mám hotové a nasadené, takže Node.js, Express aj volanie Claude API zo základov ovládam. RAG (embeddings, vektory, sémantické vyhľadávanie) je pre mňa NOVÁ téma — pri týchto konceptoch buď dôkladnejší.

**Ako so mnou pracovať:**
- Vysvetlenia po slovensky, ale kód, UI texty aj commit messages po anglicky.
- Choď po JEDNOM kroku, vždy počkaj kým potvrdím že mi to funguje, až potom ďalší krok. Nechrli všetko naraz.
- Vysvetľuj PREČO, nielen ČO — chcem tomu rozumieť, nie len kopírovať. Hlavne pri nových veciach (embeddings, cosine similarity) buď dôkladný.
- Keď mi dávaš súbor, pošli mi CELÝ súbor naraz (ľahšie sa mi nahrádza), nie útržky.
- Som na Windowse, PowerShell a VS Code (Cursor). Node.js v22.
- Po každom hotovom kroku mi napíš git príkazy. Git workflow poznám: feature branch → commit → push → PR na GitHube → merge do main → `git checkout main && git pull`. Každá časť ide na VLASTNÚ novú branch (`git checkout -b nazov` pred krokom).
- Keď niečo padne, pošlem ti chybu z terminálu/konzoly.

## Čo staviam

**RAG (Retrieval-Augmented Generation) chatbot** — odpovedá na otázky NA ZÁKLADE dokumentov (menu, cenník, FAQ, manuál), nie z natvrdo napísaného promptu. Používateľ nahrá dokument, chatbot z neho čerpá. Keď odpoveď v dokumentoch nie je, MUSÍ to priznať ("I don't have that information in the provided documents"), nesmie vymýšľať.

**RAG flow (moje chápanie — over a doplň):** pri otázke sa najprv vyhľadajú relevantné časti z dokumentov, tie sa pridajú do promptu ako kontext, a Claude odpovie z nich. Časti: 1) chunking (rozsekať dokumenty na kúsky), 2) embeddings (kúsky na číselné vektory), 3) uloženie vektorov, 4) sémantické vyhľadávanie (nájsť najpodobnejšie kúsky k otázke), 5) poslať Claude kontext + otázku.

## Tech stack

- Node.js + Express
- Anthropic Claude API (`@anthropic-ai/sdk`), model `claude-sonnet-4-6`, streaming odpovedí (viem zo skoršieho projektu)
- Embeddings: poraď mi jednoduchú možnosť pre učiaceho sa, vysvetli výber. Povedz či treba ďalší API kľúč alebo stačí Anthropic.
- Vektorové úložisko: NAJJEDNODUCHŠIE — in-memory na začiatok (žiadna externá databáza), aby som pochopil princíp. Navrhni to tak, že sa dá neskôr vymeniť.
- Frontend: jednoduchý chat, tmavý moderný dizajn, fialovo-modrý akcent (--accent #6366f1, --accent-2 #8b5cf6), konzistentný s mojimi projektmi. Plus nahrávanie dokumentu.
- dotenv pre API kľúč. Kľúč v `.env`, nikdy vo frontende ani v gite, `.env` v `.gitignore`. Port cez `process.env.PORT || 3000` (kvôli neskoršiemu nasadeniu).

**GitHub repo:** už mám vytvorené prázdne repo na `https://github.com/tomasko-has/RAG` — pri prvom pushi ma naň naviguj (git remote add origin / branch main / push).

## Postup krok po kroku (jeden krok, počkaj na potvrdenie, potom ďalší)

**Krok 1 — Pochopenie + setup projektu.** Vysvetli mi RAG flow jasne, over moje chápanie. Nastavíme projekt: priečinok, `npm init`, `"type": "module"`, Express, `.gitignore` (node_modules, .env), `.env` s mojím Anthropic kľúčom (vložím ho ja). Základný Express server čo nabehne. Otestujeme že beží.

**Krok 2 — Načítanie a chunking dokumentu.** Začni s JEDNÝM pripraveným textovým súborom (napr. `sample.txt` — vymysli obsah, napr. firemné FAQ/menu). Načítaj ho, rozsekaj na rozumné kúsky. Vysvetli PREČO chunking a ako voliť veľkosť kúska. Zatiaľ len vypíš kúsky, nech vidím že to funguje.

**Krok 3 — Embeddings.** Preveď kúsky na embeddings (vektory). Vysvetli mi ČO je embedding a prečo číselný vektor zachytáva význam textu. Ulož vektory in-memory. Over že sa vygenerovali.

**Krok 4 — Sémantické vyhľadávanie.** Pri otázke preveď aj otázku na vektor, nájdi najpodobnejšie kúsky (cosine similarity). Vysvetli mi ako sa podobnosť meria a prečo funguje. Otestuj: zadám otázku, ukáž ktoré kúsky sa našli ako najrelevantnejšie.

**Krok 5 — Napojenie na Claude.** Nájdené kúsky pošli Claude ako kontext + otázku, so system promptom "odpovedaj LEN z tohto kontextu, ak tam odpoveď nie je povedz že ju nemáš, nevymýšľaj". Streaming odpovede. Otestuj že odpovedá z dokumentu a že pri otázke mimo dokumentu prizná že nevie.

**Krok 6 — Frontend chat.** Jednoduchý tmavý chat interface (viem to zo skoršieho projektu), napojený na backend, so streamingom.

**Krok 7 — Nahrávanie dokumentu.** Pridaj možnosť nahrať vlastný súbor cez rozhranie (text; PDF až ak je to jednoduché), nech sa spracuje do RAG pipeline (chunking → embeddings → uloženie), a potom sa dá pýtať naň.

**Krok 8 — Doladenie + README.** Anglický README do portfólia: čo to je, ako RAG funguje, tech stack, ako spustiť, ako sa dá prispôsobiť.

## Kritické pravidlá
- **AI nesmie vymýšľať** — odpovedá len z nájdeného kontextu, inak prizná že nevie. Toto je najdôležitejšie, otestuj to.
- Stavaj INKREMENTÁLNE — najprv RAG nad jedným textovým súborom end-to-end, upload až potom.
- Čitateľný, komentovaný kód — učím sa, budem čítať každý riadok.
- Kľúč nikdy vo frontende ani v gite.
- Git po každom kroku (nová branch, commit, push, PR, merge, pull).

## Neskôr (nie teraz)
- Nasadenie na Render (viem to). Výmena in-memory za poriadnu vektorovú DB. PDF parsing ak nebolo v kroku 7. Keep-alive UptimeRobot (viem).