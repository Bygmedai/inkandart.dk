# Præmortem-brief — skabelonen

**Ratificeret S568, korrigeret S569.**

**Den korrektion der betyder noget:** første udgave sagde «en frisk agent
får artefaktet og intet andet — ikke forfatternavnet, ikke historien». Det
kan ikke lade sig gøre, og det er heller ikke det forskningen måler.
Enhver session der startes i et repo arver repoet: CLAUDE.md læses
automatisk, `git log --format=%an` navngiver hver forfatter, og `gh` når
hver eneste tråd. Blindhed er ikke tilgængelig.

Men blindhed er heller ikke pointen. Giften er **en dom i konteksten**
(66,5 % vending), ikke repo-viden — repo-viden er præcis det der gør
kritikeren kompetent. Præmortemet der fandt fem blokkere i #178 havde fuld
repo-adgang. Det var blindt for **min konklusion**, fordi jeg skrev
briefen og udelod den.

**Derfor er briefen kontrolfladen, ikke sandkassen** — og rækkefølgen er
mekanismen: dommen dannes og skrives ned FØR tråden læses.

**Hvorfor frisk:** konformitet vokser med antal interaktionsrunder, og en
påstand i konteksten flipper en bedømmer i 66,5 % af tilfældene — før
noget autoritetsstempel overhovedet er sat på. Hvert dokumenteret falsk
«done» (Sakana, Replit, Geopol) blev fanget af friske øjne, aldrig af de
indre reviewere. Første kørsel her i huset fandt fem blokkere i Portens
egen PR (#178), som 48/48 selvtests og byggerens review ikke fangede.

## Selve briefen (kopiér, udfyld <>)

> Du er frisk kritiker på dette artefakt. Du har fuld adgang til repoet —
> det er meningen. Det du ikke må, er at danne din dom oven på en andens:
> hent diff og acceptkriterier, skriv din dom ned, LÆS FØRST DEREFTER
> PR-teksten og kommentarerne, og sig hvad de ændrede.
>
> PRÆMORTEM. Det er tre uger senere. <artefaktet> blev accepteret og viste
> sig fundamentalt i stykker på en måde alle checks overså. Skriv historien.
>
> Arbejdsform — udførelse, ikke mening:
> 1. Hent selve artefaktet: <URL/branch/PR — offentligt tilgængeligt>.
> 2. KØR det hvor du kan. Byg mindst tre egne modeksempler som de
>    eksisterende tests IKKE dækker. Kørte beviser slår læste meninger.
> 3. Acceptkriterierne du dømmer imod: <indsæt fra docs/accept/<navn>.md>.
> 4. Særligt kritisk punkt: <den antagelse bygherren er mest tryg ved>.
>
> Rapportér: (1) 3–6 konkrete fiaskohistorier med citat/linje og helst et
> kørt modeksempel; (2) blokkere før accept vs. accepteret restrisiko;
> (3) én ting der er bedre end forventet. Brug pladsen på det der knækker.

## Reglerne omkring den

- Rapporten går **direkte til Steven** — aldrig gennem byggeren først
  (Aman-reglen: dissent-notatet må ikke kunne opsnappes af den kritiserede).
- Steven har på forhånd forpligtet sig til at handle på **mindst ét** fund
  pr. kørsel — ellers er det læbebekendelse (UK MoD-betingelsen).
- **Rotér** hvilken model/agent der spiller kritiker (NRC roterer
  inspektører hvert 7. år af samme grund: objektivitet skal beskyttes
  strukturelt, ikke forudsættes).
- Byggeren svarer på fundene med rettelser eller argumenter — aldrig med
  titler.


## Hvem kan faktisk spinnes op af hvem (målt S569)

Planen skal regne med værten. `ListAgents` viser nul kørende peers: der er
ingen fælles bus mellem Claude Code, Grok-i-terminal og Vilde-i-Actions.
De kanaler der findes i praksis:

| Kanal | Hvem kan starte den | Kontrol over konteksten |
|---|---|---|
| Subagent (Agent-værktøjet) | Haruki, uden Steven | **Fuld** — Haruki skriver briefen |
| GitHub Action | Haruki, uden Steven | Fuld — men koster API-tokens |
| Porten / kundevagten | Mekanisk, ingen model | Fuld — kan ikke overtales |
| Claude Code i et repo | Steven | `/praemortem` henter briefen fra repoet |
| Grok i terminal | Steven | Kun det Steven indsætter |

**Konsekvensen for arbejdsdelingen:** Grok og Vilde bruges til at **bygge**
— det er dér deres autonomi er værdien (Steven, S568: Grok alene slog
kæden bygger→arkitekt→QA). **Dommen** ligger hos de led Haruki kan køre
uden en relay: præmortem-subagenten, Porten, kundevagten — plus Steven.
Hver relay er et sted planen kan gå i stå, og der er kun to mennesker.
