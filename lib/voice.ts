/**
 * Stemmer til gadens figurer. Tørt, absurdistisk, lidt træt.
 * Krog, runde 2 — ikke edgy. Samme nøgler på da og en. Haruki:
 * <html lang="en"> skifter motor og CSS :lang.
 */
export type Voice = "da" | "en";

export function voiceFromLang(lang: string | null | undefined): Voice {
  return lang?.toLowerCase().startsWith("en") ? "en" : "da";
}

export const VOICE = {
  da: {
    "mor.sr": "En due i tagrenden. Hun har hængt her længe.",
    "mor.line": "Jeg har skidt på bedre steder.",
    "rat.line": "Jeg har boet her længere end de fleste af jer. Det er ikke noget at prale af.",
    "skull.line": "Der er stadig nogen der tror, det her er midlertidigt.",
    "dice.line": "I tror stadig, det er tilfældigt. Sødt.",
    "snake.line": "Jeg ligger her bare. Det er mit bidrag.",
    "dagger.line": "De fleste bruger mig forkert. Det er okay. Jeg er vant til det.",
    "cup.line": "Jeg er væltet tre gange i dag. Det er rekord for en tirsdag.",
    "machine.line": "Jeg summer stadig. Det er det tætteste jeg kommer på en mening.",
    "rose.line": "Jeg er smuk. Det har jeg fået at vide. Det hjælper ikke.",
    "wire.line": "Kom nærmere hvis du har lyst. Jeg flytter mig ikke.",
    "butt.line": "Der er altid en tilbage. Det er det eneste man kan regne med.",
    "bottle.line": "Tom igen. Det er det tætteste jeg kommer på en personlighed.",
    "swallow.line": "Jeg flyver lavt af en grund.",
    "ouro.line": "Jeg er halvvejs færdig med mig selv. Det går meget godt.",
  },
  en: {
    "mor.sr": "A pigeon in the gutter. She's been here a while.",
    "mor.line": "I've shit on better places.",
    "rat.line": "I've lived here longer than most of you. That's not a boast.",
    "skull.line": "There are still people who think this is temporary.",
    "dice.line": "You still think it's random. Sweet.",
    "snake.line": "I'm just lying here. That's my contribution.",
    "dagger.line": "Most people use me wrong. That's fine. I'm used to it.",
    "cup.line": "I've been knocked over three times today. A record for a Tuesday.",
    "machine.line": "I'm still humming. That's as close as I get to a point.",
    "rose.line": "I'm beautiful. I've been told. It doesn't help.",
    "wire.line": "Come closer if you like. I'm not moving.",
    "butt.line": "There's always one left. That's the only thing you can count on.",
    "bottle.line": "Empty again. That's as close as I get to a personality.",
    "swallow.line": "I fly low for a reason.",
    "ouro.line": "I'm halfway done with myself. It's going alright.",
  },
} as const;

export type VoiceKey = keyof (typeof VOICE)["da"];
