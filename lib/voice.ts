/**
 * Stemmer til gadens figurer. Samme nøgler på da og en — når Haruki
 * sætter <html lang="en">, skifter motoren og CSS :lang med. Ingen
 * hardcoded dansk i den interaktive kopi.
 */
export type Voice = "da" | "en";

export function voiceFromLang(lang: string | null | undefined): Voice {
  return lang?.toLowerCase().startsWith("en") ? "en" : "da";
}

export const VOICE = {
  da: {
    "mor.sr": "En due i tagrenden. Hun ryger, hun kigger, og hun holder af gaden.",
    "mor.gutter": "HUN HAR SET DET HELE FRA TAGRENDEN",
    "mor.warm": "KOM IND. DER ER VARMT.",
    "mor.walkin": "TO SMÅ. I AFTEN.",
    "mor.smoke": "JEG RYGER MIN. IKKE DIN.",
    "mor.chalk": "DEN PLADS HOLDER JEG",
    "mor.unmarked": "INGEN FLYVER HERFRA UMÆRKET",
    "mor.tusse": "VI SÆLGER TUSSE. IKKE OPMÆRKSOMHED.",
    "mor.sit": "HOLD KÆFT OG SÆT DIG",
    "mor.gift": "GIV DET VIDERE",
    "rat.steal": "JEG TOG SMØGEN",
    "rat.late": "FOR SENT. DEN ER VÆK.",
    "skull.ha": "NÅ.",
    "skull.watch": "JEG SÅ DET.",
    "dice.line": "TO SEKSERE. LØGN.",
  },
  en: {
    "mor.sr": "A pigeon in the gutter. She smokes, she watches, and she likes this street.",
    "mor.gutter": "SHE HAS SEEN IT ALL FROM THE GUTTER",
    "mor.warm": "COME IN. IT'S WARM.",
    "mor.walkin": "TWO SMALL ONES. TONIGHT.",
    "mor.smoke": "I SMOKE MINE. NOT YOURS.",
    "mor.chalk": "THAT SPOT IS TAKEN",
    "mor.unmarked": "NOBODY LEAVES HERE UNMARKED",
    "mor.tusse": "WE SELL INK. NOT ATTENTION.",
    "mor.sit": "SHUT UP AND SIT DOWN",
    "mor.gift": "PASS IT ON",
    "rat.steal": "I TOOK THE CIG",
    "rat.late": "TOO LATE. IT'S GONE.",
    "skull.ha": "HUH.",
    "skull.watch": "I SAW THAT.",
    "dice.line": "DOUBLE SIX. LIAR.",
  },
} as const;

export type VoiceKey = keyof (typeof VOICE)["da"];
