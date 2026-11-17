import type { Lang } from '../content';
import type { Verdict } from './types';

/** Every word on the Ask page, in English and Tamil. */
export const copy = {
  en: {
    back: 'Home',
    title: 'Ask in your own words.',
    sub: 'Tap the mic and speak in Tamil or English. Sollu answers only from checked government pages.',
    tapToSpeak: 'Tap to speak',
    listening: 'Listening… I stop when you stop.',
    hearing: 'Getting your words…',
    thinking: 'Checking official pages…',
    typeHere: 'Or type your question',
    send: 'Send',
    privacy: "Don't share your name, Aadhaar or phone number.",
    tryThese: 'Try one',
    you: 'You',
    hear: 'Hear it',
    stop: 'Stop',
    source: 'Source',
    checked: 'checked',
    followUp: 'One more thing',
    plainFacts: 'Showing the checked facts as they are.',
    aiNote: 'Written by AI from checked government pages. Always confirm at the office before you apply.',
    micBlocked: 'The mic is blocked or not available. Type your question below.',
    notHeard: "Sorry, I couldn't hear that. Try again, or type.",
    failed: "Sollu couldn't answer right now. Please try again.",
    tooLong: 'That was long. I stopped at 28 seconds.',
    voiceDown: "Voice isn't working right now. Please type your question below.",
    busy: 'Sollu is busy right now. Please try again in a minute.',
    retrying: 'Sollu is busy. Trying again…',
    autoSending: 'Sending what I heard…',
    edit: 'Edit',
    newChat: 'New question',
    types: { scheme: 'Scheme', right: 'Your right', notice: 'Notice' },
  },
  ta: {
    back: 'முகப்பு',
    title: 'உங்க வார்த்தையில கேளுங்க.',
    sub: 'மைக்கை தட்டி தமிழ்லயோ English-லயோ பேசுங்க. சரிபார்த்த அரசு தகவல்ல இருந்து மட்டும் சொல்லு பதில் சொல்லும்.',
    tapToSpeak: 'பேச தட்டுங்க',
    listening: 'கேக்குறேன்… நீங்க நிறுத்தினா நானும் நிறுத்துவேன்.',
    hearing: 'உங்க வார்த்தைய எடுக்குறேன்…',
    thinking: 'அரசு தகவல பாக்குறேன்…',
    typeHere: 'இங்க டைப் பண்ணுங்க',
    send: 'அனுப்பு',
    privacy: 'உங்க பேரு, ஆதார், போன் நம்பர் சொல்ல வேண்டாம்.',
    tryThese: 'இப்படி கேளுங்க',
    you: 'நீங்க',
    hear: 'கேளுங்க',
    stop: 'நிறுத்து',
    source: 'ஆதாரம்',
    checked: 'சரிபார்த்தது',
    followUp: 'இன்னும் ஒண்ணு',
    plainFacts: 'சரிபார்த்த தகவலை அப்படியே காட்டுறோம் (English-ல).',
    aiNote: 'சரிபார்த்த அரசு தகவல்ல இருந்து AI எழுதினது. விண்ணப்பிக்கறதுக்கு முன்னாடி அலுவலகத்துல உறுதி பண்ணிக்கோங்க.',
    micBlocked: 'மைக் வேலை செய்யல. கீழ டைப் பண்ணுங்க.',
    notHeard: 'மன்னிக்கணும், சரியா கேக்கல. மறுபடியும் பேசுங்க, இல்ல டைப் பண்ணுங்க.',
    failed: 'இப்போ பதில் சொல்ல முடியல. மறுபடியும் முயற்சி பண்ணுங்க.',
    tooLong: 'ரொம்ப நேரம் ஆச்சு. 28 வினாடில நிறுத்திட்டேன்.',
    voiceDown: 'இப்போ குரல் வேலை செய்யல. கீழ டைப் பண்ணுங்க.',
    busy: 'சொல்லு இப்போ கொஞ்சம் பிஸியா இருக்கு. ஒரு நிமிஷம் கழிச்சு கேளுங்க.',
    retrying: 'கொஞ்சம் பிஸி. மறுபடியும் முயற்சி பண்றேன்…',
    autoSending: 'கேட்டதை அனுப்புறேன்…',
    edit: 'மாத்து',
    newChat: 'புது கேள்வி',
    types: { scheme: 'திட்டம்', right: 'உங்க உரிமை', notice: 'அறிவிப்பு' },
  },
} satisfies Record<Lang, unknown>;

export const verdictLabel: Record<Lang, Record<Verdict, string>> = {
  en: { likely: 'May fit you', need_info: 'Need one detail', no: "Doesn't fit" },
  ta: { likely: 'கிடைக்கலாம்', need_info: 'ஒரு தகவல் வேணும்', no: 'பொருந்தல' },
};

/** Questions that our checked data can answer. */
export const askSamples: { en: string; ta: string }[] = [
  { en: 'Can my mother get a pension?', ta: 'என் அம்மாவுக்கு பென்ஷன் கிடைக்குமா?' },
  { en: 'My salary is late by 2 months. What can I do?', ta: 'ரெண்டு மாசமா சம்பளம் வரல. என்ன பண்றது?' },
  { en: 'Any scholarship for a B.Sc girl from a government school?', ta: 'அரசு பள்ளியில படிச்ச B.Sc பொண்ணுக்கு உதவித்தொகை இருக்கா?' },
  { en: "I'm a farmer with 2 acres. What can I get?", ta: 'எனக்கு 2 ஏக்கர் நிலம் இருக்கு. என்ன கிடைக்கும்?' },
  { en: 'When can I fill my own census details?', ta: 'சென்சஸ் விவரத்த நானே எப்போ நிரப்பலாம்?' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** 2026-11-17 -> 17 Nov 2026 */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : iso;
}
