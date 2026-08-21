/**
 * Stemmer til gadens figurer. Tørt, absurdistisk, lidt træt.
 * Krog, runde 3 — 4–5 mumlen pr. figur, én linje ad gangen.
 * Samme nøgler på da og en. Haruki: <html lang="en"> skifter motor og CSS :lang.
 */
export type Voice = "da" | "en";

export function voiceFromLang(lang: string | null | undefined): Voice {
  return lang?.toLowerCase().startsWith("en") ? "en" : "da";
}

export const VOICE = {
  da: {
    "mor.sr": "En due i tagrenden. Hun har hængt her længe.",
    "mor.line": [
      "Jeg har skidt på bedre steder.",
      "Jeg er her af gamle vaner. Ikke af loyalitet.",
      "Folk bliver sure. Det ændrer ikke noget.",
      "Jeg flyver væk, når det passer mig.",
      "Der er altid smulder et sted.",
    ],
    "rat.line": [
      "Jeg har boet her længere end de fleste af jer. Det er ikke noget at prale af.",
      "Folk tror stadig, jeg er midlertidig. Det er jeg ikke.",
      "Jeg har set dem komme og gå. De fleste går.",
      "Der er mad nok, hvis man ikke er kræsen.",
      "Jeg flytter mig ikke. Det er mit eneste princip.",
    ],
    "skull.line": [
      "Der er stadig nogen der tror, det her er midlertidigt.",
      "Jeg er det mest ærlige i lokalet.",
      "Alle ender med at kigge på mig til sidst.",
      "Jeg har ingen mening om det. Jeg har heller ikke andet.",
      "Det er okay. Jeg har tid.",
    ],
    "dice.line": [
      "I tror stadig, det er tilfældigt. Sødt.",
      "Jeg lander, som jeg lander. Det er ikke mit problem.",
      "Nogen ryster mig for hårdt. Det ændrer ikke resultatet.",
      "Jeg har kun seks sider. Det er mere end de fleste.",
      "Kast mig igen hvis det hjælper dig.",
    ],
    "snake.line": [
      "Jeg ligger her bare. Det er mit bidrag.",
      "Jeg ruller mig sammen, når det bliver for meget.",
      "De fleste træder udenom. Det er klogt.",
      "Jeg har ikke travlt. Det har jeg aldrig haft.",
      "Hvis du står stille længe nok, bliver du en del af inventaret.",
    ],
    "dagger.line": [
      "De fleste bruger mig forkert. Det er okay. Jeg er vant til det.",
      "Jeg ligger her og venter. Det er det, jeg er bedst til.",
      "Nogen tror, jeg er symbolsk. Det er jeg ikke.",
      "Jeg er skarp. Det er ikke det samme som nyttig.",
      "Tag mig op hvis du tør. Ellers lad mig ligge.",
    ],
    "cup.line": [
      "Jeg er væltet tre gange i dag. Det er rekord for en tirsdag.",
      "Der er altid noget tilbage i bunden. Det er det eneste positive.",
      "Folk undskylder, når de vælter mig. Det hjælper ikke.",
      "Jeg har set værre spild.",
      "Jeg er ikke sur. Jeg er bare tom.",
    ],
    "machine.line": [
      "Jeg summer stadig. Det er det tætteste jeg kommer på en mening.",
      "Jeg laver det samme hver gang. Det er min styrke.",
      "Nogen synes, jeg lyder aggressiv. Det er bare arbejde.",
      "Jeg bliver varm. Det er ikke personligt.",
      "Når jeg stopper, er det slut for i dag.",
    ],
    "rose.line": [
      "Jeg er smuk. Det har jeg fået at vide. Det hjælper ikke.",
      "Tornene er der af en grund. De fleste glemmer det.",
      "Jeg visner langsomt. Det er den ærlige version.",
      "Folk plukker mig alligevel. Det er forudsigeligt.",
      "Jeg er her stadig. Det er næsten imponerende.",
    ],
    "wire.line": [
      "Kom nærmere hvis du har lyst. Jeg flytter mig ikke.",
      "Jeg er ikke her for at holde nogen ude. Jeg er bare her.",
      "De fleste går udenom. Det er den nemme løsning.",
      "Jeg ruster langsomt. Det er min version af udvikling.",
      "Tag ikke noget personligt. Jeg stikker alle.",
    ],
    "butt.line": [
      "Der er altid en tilbage. Det er det eneste man kan regne med.",
      "Jeg er næsten færdig. Det har jeg været længe.",
      "Nogen træder på mig. Det ændrer ikke noget.",
      "Jeg har set bedre nætter. Og værre.",
      "Lad mig ligge. Jeg er færdig med at brænde.",
    ],
    "bottle.line": [
      "Tom igen. Det er det tætteste jeg kommer på en personlighed.",
      "Jeg har været fuld før. Det er ikke en undskyldning.",
      "Nogen samler mig op. De fleste gør ikke.",
      "Jeg ruller, hvis nogen skubber. Det er fysik.",
      "Der er ikke mere. Det er den ærlige melding.",
    ],
    "swallow.line": [
      "Jeg flyver lavt af en grund.",
      "Jeg lander, når det passer mig.",
      "De fleste kigger op. De misser det, der sker nede.",
      "Jeg er her ikke for at være symbolsk.",
      "Jeg forsvinder igen om lidt. Det er okay.",
    ],
    "ouro.line": [
      "Jeg er halvvejs færdig med mig selv. Det går meget godt.",
      "Det er en cirkel. Det har jeg sagt før.",
      "Nogen synes, det er dybt. Det er det ikke.",
      "Jeg bliver ved, indtil der ikke er mere.",
      "Det er ikke en metafor. Det er bare det, jeg gør.",
    ],
  },
  en: {
    "mor.sr": "A pigeon in the gutter. She's been here a while.",
    "mor.line": [
      "I've shit on better places.",
      "I'm here out of old habits. Not loyalty.",
      "People get angry. It doesn't change anything.",
      "I fly off when it suits me.",
      "There's always crumbs somewhere.",
    ],
    "rat.line": [
      "I've lived here longer than most of you. That's not a boast.",
      "People still think I'm temporary. I'm not.",
      "I've seen them come and go. Most go.",
      "There's food enough, if you're not picky.",
      "I'm not moving. That's my only principle.",
    ],
    "skull.line": [
      "There are still people who think this is temporary.",
      "I'm the most honest thing in the room.",
      "Everyone ends up looking at me eventually.",
      "I have no opinion on it. I don't have anything else either.",
      "It's fine. I have time.",
    ],
    "dice.line": [
      "You still think it's random. Sweet.",
      "I land how I land. Not my problem.",
      "Some shake me too hard. It doesn't change the result.",
      "I only have six sides. That's more than most.",
      "Throw me again if it helps you.",
    ],
    "snake.line": [
      "I'm just lying here. That's my contribution.",
      "I coil up when it gets too much.",
      "Most people step around. That's wise.",
      "I'm not in a hurry. I never have been.",
      "Stand still long enough and you become furniture.",
    ],
    "dagger.line": [
      "Most people use me wrong. That's fine. I'm used to it.",
      "I lie here and wait. That's what I'm best at.",
      "Some think I'm symbolic. I'm not.",
      "I'm sharp. That's not the same as useful.",
      "Pick me up if you dare. Otherwise leave me.",
    ],
    "cup.line": [
      "I've been knocked over three times today. A record for a Tuesday.",
      "There's always something left at the bottom. That's the only positive.",
      "People apologise when they knock me over. It doesn't help.",
      "I've seen worse spills.",
      "I'm not angry. I'm just empty.",
    ],
    "machine.line": [
      "I'm still humming. That's as close as I get to a point.",
      "I do the same thing every time. That's my strength.",
      "Some think I sound aggressive. It's just work.",
      "I get warm. It's not personal.",
      "When I stop, that's it for today.",
    ],
    "rose.line": [
      "I'm beautiful. I've been told. It doesn't help.",
      "The thorns are there for a reason. Most people forget.",
      "I wilt slowly. That's the honest version.",
      "People pick me anyway. It's predictable.",
      "I'm still here. That's almost impressive.",
    ],
    "wire.line": [
      "Come closer if you like. I'm not moving.",
      "I'm not here to keep anyone out. I'm just here.",
      "Most people go around. That's the easy way.",
      "I rust slowly. That's my version of development.",
      "Don't take it personally. I stick everyone.",
    ],
    "butt.line": [
      "There's always one left. That's the only thing you can count on.",
      "I'm almost done. I have been for a while.",
      "People step on me. It doesn't change anything.",
      "I've seen better nights. And worse.",
      "Leave me. I'm done burning.",
    ],
    "bottle.line": [
      "Empty again. That's as close as I get to a personality.",
      "I've been full before. That's not an excuse.",
      "Someone picks me up. Most don't.",
      "I roll if someone pushes. That's physics.",
      "There's nothing left. That's the honest report.",
    ],
    "swallow.line": [
      "I fly low for a reason.",
      "I land when it suits me.",
      "Most people look up. They miss what's happening down here.",
      "I'm not here to be symbolic.",
      "I'll disappear again in a bit. That's fine.",
    ],
    "ouro.line": [
      "I'm halfway done with myself. It's going alright.",
      "It's a circle. I've said that before.",
      "Some think it's deep. It isn't.",
      "I keep going until there's nothing left.",
      "It's not a metaphor. It's just what I do.",
    ],
  },
} as const;

export type VoiceKey = keyof (typeof VOICE)["da"];
export type LineKey = Exclude<VoiceKey, "mor.sr">;

export function isLineKey(key: string): key is LineKey {
  return key !== "mor.sr" && key in VOICE.da;
}

export function linesOf(voice: Voice, key: LineKey): readonly string[] {
  return VOICE[voice][key];
}

/** Tilfældig linje fra figurens bank. Gentager ikke den sidste, hvis der er andre. */
export function pickLine(voice: Voice, key: LineKey, avoid?: string): string {
  const all = VOICE[voice][key];
  const pool = avoid ? all.filter((line) => line !== avoid) : all;
  const src = pool.length > 0 ? pool : all;
  return src[Math.floor(Math.random() * src.length)]!;
}
