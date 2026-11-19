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
    noticesTitle: 'Explain a notice',
    noticesSub: 'Real government notices, checked against the official copy. Tap one.',
    tapToExplain: 'Explain',
    photoTitle: 'Or explain a photo',
    photoSub: 'Take a photo of a notice or letter you got. Sollu reads it and tells you what it says, what to do, and by when.',
    photoButton: 'Take or choose a photo',
    photoCover: 'Cover Aadhaar, bank and phone numbers before you take the photo. We don\'t keep your photo.',
    photoExamples: 'Or try one of these photos',
    photoSent: 'Photo of a notice',
    photoAttach: 'Explain a photo of a notice',
    reading: 'Reading your photo…',
    photoNote: 'Read from your photo by AI, not checked by Sollu. Check names, numbers and dates on the paper.',
    photoChecked: 'Sollu has checked this notice against its official copy, linked above.',
    photoFrom: 'From',
    photoBadFile: "That file isn't a photo Sollu can open. Try a JPEG or PNG photo.",
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
    types: { scheme: 'Scheme', right: 'Your right', notice: 'Notice', service: 'Certificate or service' },
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
    noticesTitle: 'ஒரு அறிவிப்பை விளக்கிக்கோங்க',
    noticesSub: 'அதிகாரப்பூர்வ நகலோட சரிபார்த்த உண்மையான அரசு அறிவிப்புகள். ஒன்றை தட்டுங்க.',
    tapToExplain: 'விளக்கு',
    photoTitle: 'இல்லன்னா ஒரு போட்டோவ விளக்கிக்கோங்க',
    photoSub: 'உங்களுக்கு வந்த அறிவிப்போ கடிதமோ போட்டோ எடுங்க. சொல்லு அதைப் படிச்சு, என்ன சொல்லுது, நீங்க என்ன பண்ணணும், எப்போ வரைன்னு சொல்லும்.',
    photoButton: 'போட்டோ எடுங்க அல்லது தேர்வு பண்ணுங்க',
    photoCover: 'போட்டோ எடுக்கறதுக்கு முன்னாடி ஆதார், வங்கி, போன் நம்பரை மறைச்சிடுங்க. உங்க போட்டோவ நாங்க வச்சுக்கறதில்ல.',
    photoExamples: 'இல்லன்னா இந்த போட்டோக்கள்ல ஒன்றை முயற்சி பண்ணுங்க',
    photoSent: 'அறிவிப்பின் போட்டோ',
    photoAttach: 'அறிவிப்பின் போட்டோவை விளக்கு',
    reading: 'உங்க போட்டோவ படிக்குது…',
    photoNote: 'உங்க போட்டோவுல இருந்து AI படிச்சது, சொல்லு சரிபார்க்கல. பேர், எண், தேதியை காகிதத்துல பாருங்க.',
    photoChecked: 'இந்த அறிவிப்பை சொல்லு அதிகாரப்பூர்வ நகலோட சரிபார்த்திருக்கு. இணைப்பு மேல இருக்கு.',
    photoFrom: 'அனுப்பியவர்',
    photoBadFile: 'இந்த ஃபைலை சொல்லுவால திறக்க முடியல. JPEG அல்லது PNG போட்டோவ முயற்சி பண்ணுங்க.',
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
    types: { scheme: 'திட்டம்', right: 'உங்க உரிமை', notice: 'அறிவிப்பு', service: 'சான்றிதழ் / சேவை' },
  },
} satisfies Record<Lang, unknown>;

export const verdictLabel: Record<Lang, Record<Verdict, string>> = {
  en: { likely: 'May fit you', need_info: 'Need one detail', no: "Doesn't fit" },
  ta: { likely: 'கிடைக்கலாம்', need_info: 'ஒரு தகவல் வேணும்', no: 'பொருந்தல' },
};

/** Questions that our checked data can answer. */
/**
 * The 3 checked notices (data/notices/). Titles, issuers and dates come from the checked entries.
 * Tapping one asks Sollu to explain it; the answers are saved in data/demo-answers.json.
 */
export const noticeCards: {
  id: string;
  title: { en: string; ta: string };
  from: { en: string; ta: string };
  date: string;
  ask: { en: string; ta: string };
}[] = [
  {
    id: 'rn-notice-census-2027',
    title: { en: 'Census 2027: dates to fill in your own details', ta: 'சென்சஸ் 2027: உங்க விவரத்தை நீங்களே நிரப்ப தேதிகள்' },
    from: { en: 'Registrar General of India', ta: 'இந்திய பதிவாளர் ஜெனரல்' },
    date: '2026-11-06',
    ask: {
      en: 'Explain the Census 2027 notice. What should I do?',
      ta: 'சென்சஸ் 2027 அறிவிப்பை விளக்குங்க. நான் என்ன பண்ணணும்?',
    },
  },
  {
    id: 'rn-notice-rice-stock-limit',
    title: { en: 'Rice stock limits for traders and millers', ta: 'வியாபாரிகள், ஆலைகளுக்கு அரிசி இருப்பு வரம்பு' },
    from: { en: 'Food and Consumer Protection Department', ta: 'உணவு மற்றும் நுகர்வோர் பாதுகாப்புத் துறை' },
    date: '2026-11-13',
    ask: {
      en: 'Explain the rice stock limit order. Who does it affect?',
      ta: 'அரிசி இருப்பு வரம்பு உத்தரவை விளக்குங்க. இது யாருக்கு?',
    },
  },
  {
    id: 'rn-notice-salem-marksheet',
    title: { en: 'Salem: collect old 10th and 12th mark sheets', ta: 'சேலம்: பழைய 10, 12ஆம் வகுப்பு மதிப்பெண் சான்றிதழ் வாங்குங்க' },
    from: { en: 'District Collector, Salem', ta: 'மாவட்ட ஆட்சியர், சேலம்' },
    date: '2026-10-14',
    ask: {
      en: 'Explain the Salem mark sheet notice. What should I do?',
      ta: 'சேலம் மதிப்பெண் சான்றிதழ் அறிவிப்பை விளக்குங்க. நான் என்ன பண்ணணும்?',
    },
  },
];

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

/**
 * Example photos for "Explain a photo": the first page of each checked notice, made from the official PDF.
 * Tapping one sends that exact file to /api/read, which returns the answer saved in data/read-examples.json.
 */
export const photoExamples: { id: string; src: string; thumb: string; label: { en: string; ta: string } }[] = [
  { id: 'census', src: '/notice-photos/census.jpg', thumb: '/notice-photos/census-thumb.webp', label: { en: 'Census 2027 gazette', ta: 'சென்சஸ் 2027 அரசிதழ்' } },
  { id: 'rice', src: '/notice-photos/rice.jpg', thumb: '/notice-photos/rice-thumb.webp', label: { en: 'Rice stock order', ta: 'அரிசி இருப்பு உத்தரவு' } },
  { id: 'salem', src: '/notice-photos/salem.jpg', thumb: '/notice-photos/salem-thumb.webp', label: { en: 'Salem press release', ta: 'சேலம் செய்திக் குறிப்பு' } },
];
