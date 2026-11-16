// All page copy lives here so wording can change without touching layout.
import type { IconName } from './components/Icon';

// Word rules (see FLOW.md): Ask · Check · Explain · Hear · Know · Save · Share · Find.

export type Lang = 'en' | 'ta';

export interface HeroCopy {
  pill: string;
  sub: string;
  cta1: string;
  cta2: string;
  micro: string;
}

export const hero: Record<Lang, HeroCopy> = {
  en: {
    pill: 'Now in Tamil Nadu. All of India next.',
    sub: 'Sollu reads government schemes, notices and local laws for you. Then it explains them in plain Tamil or English. Ask by voice. Check what you can get. Know your rights.',
    cta1: 'Ask Sollu — free',
    cta2: 'Check a scheme',
    micro: 'No sign-in. No fees. Works on any phone.',
  },
  ta: {
    pill: 'இப்போ தமிழ்நாட்டில். அடுத்து இந்தியா முழுக்க.',
    sub: 'அரசுத் திட்டங்கள், அறிவிப்புகள், சட்டங்கள் — எல்லாத்தையும் சொல்லு படிக்கும். அப்புறம் எளிய தமிழ்ல சொல்லும். குரல்ல கேளுங்க. உங்களுக்கு என்ன கிடைக்கும்னு பாருங்க. உங்க உரிமைகளை தெரிஞ்சுக்கோங்க.',
    cta1: 'இலவசமா கேளுங்க',
    cta2: 'திட்டத்தை சரிபாருங்க',
    micro: 'உள்நுழைவு தேவையில்லை. கட்டணம் இல்லை. எந்த போனிலும் வேலை செய்யும்.',
  },
};

export const heroSpeech: Record<Lang, string> = {
  en: 'You are 62, so you may fit the old age pension. Take your Aadhaar, age proof and income certificate to your nearest e-Sevai centre.',
  ta: 'உங்களுக்கு 62 வயசு. நீங்க முதியோர் உதவித்தொகைக்கு தகுதி பெறலாம். ஆதார், வயது சான்று, வருமானச் சான்று எடுத்துட்டு போங்க.',
};

export const stats = [
  { value: '38', label: 'districts in Tamil Nadu' },
  { value: '2', label: 'languages at launch' },
] as const;

export type FitKey = 'senior' | 'farmer' | 'student' | 'worker' | 'woman';

/** Sample counts for the demo chips only — not real scheme data. */
export const fitTags: { key: FitKey; label: string; sample: number }[] = [
  { key: 'senior', label: 'Age 60+', sample: 3 },
  { key: 'farmer', label: 'Farmer', sample: 4 },
  { key: 'student', label: 'Student', sample: 3 },
  { key: 'worker', label: 'Daily-wage worker', sample: 2 },
  { key: 'woman', label: 'Woman head of family', sample: 2 },
];

export const schemeCircles: { icon: IconName; color: string }[] = [
  { icon: 'heart', color: 'var(--pink)' },
  { icon: 'leaf', color: 'var(--green)' },
  { icon: 'cap', color: 'var(--sky)' },
  { icon: 'home', color: 'var(--purple)' },
  { icon: 'plus-cross', color: 'var(--coral)' },
  { icon: 'rupee', color: '#C89200' },
];

export const noticeLines = [
  { tag: 'Says', tone: 'g', text: 'Land records in your village are being updated.' },
  { tag: 'Do', tone: 'o', text: 'Bring your patta and Aadhaar to the camp.' },
  { tag: 'By', tone: 'r', text: 'The date on page 2. Missing it means a later visit to the taluk office.' },
] as const;

export type FeatureIcon = Extract<IconName, 'mic' | 'doc' | 'check' | 'scale' | 'list' | 'pin'>;
export type Tone = 'sky' | 'pink' | 'coral' | 'yellow' | 'green' | 'purple';

export const features: { icon: FeatureIcon; tone: Tone; title: string; body: string }[] = [
  { icon: 'mic', tone: 'sky', title: 'Ask by voice.', body: 'Speak in Tamil or English. Sollu understands everyday words, not just official ones.' },
  { icon: 'doc', tone: 'pink', title: 'Explain a notice.', body: 'Photo, PDF or text. Get what it says, what you must do, and by when.' },
  { icon: 'check', tone: 'coral', title: 'Check eligibility.', body: 'See which schemes you may fit, and why, before you stand in a queue.' },
  { icon: 'scale', tone: 'yellow', title: 'Know your rights.', body: 'Rent, wages, ration, RTI, police complaints. Plain rules and real steps.' },
  { icon: 'list', tone: 'green', title: 'Get the papers list.', body: 'Know every document you need before you leave home.' },
  { icon: 'pin', tone: 'purple', title: 'Find the office.', body: 'The nearest e-Sevai centre, taluk office or free legal aid desk.' },
];

export const sourceRows: [string, string][] = [
  ['Answer', 'You may fit this scheme.'],
  ['Source', 'Government Order (G.O.)'],
  ['From', 'Social Welfare Department'],
  ['Published', 'Date shown here'],
  ['Last checked by Sollu', 'Date shown here'],
];

export type PersonaIcon = Extract<IconName, 'user' | 'leaf' | 'cap' | 'tool' | 'heart'>;

export interface Persona {
  id: FitKey;
  label: string;
  icon: PersonaIcon;
  color: string;
  ta: string;
  en: string;
  answers: [title: string, body: string][];
}

export const personas: Persona[] = [
  {
    id: 'senior', label: 'Seniors', icon: 'user', color: 'var(--pink)',
    ta: 'எனக்கு 62 வயசு. பென்ஷன் கிடைக்குமா?', en: '"I\'m 62. Can I get a pension?"',
    answers: [
      ['You may fit 2 pension schemes.', "Sollu checks your age, income and family card against each scheme's rules, and shows which ones fit."],
      ['Papers you need.', 'Aadhaar, age proof, income certificate and a bank passbook.'],
      ['Where to apply.', 'Your nearest e-Sevai centre or taluk office. Sollu shows the closest one.'],
    ],
  },
  {
    id: 'farmer', label: 'Farmers', icon: 'leaf', color: 'var(--green)',
    ta: 'மழையால என் நெல் பயிர் சேதமாச்சு. உதவி கிடைக்குமா?', en: '"Rain damaged my paddy. Is there help?"',
    answers: [
      ['Crop insurance may cover it.', 'If you enrolled this season, you can claim. Sollu tells you how to check.'],
      ['Report the loss fast.', 'Claims have a time limit. Sollu shows the date from the scheme rules.'],
      ['Papers you need.', 'Patta or chitta, bank passbook, and proof of sowing.'],
    ],
  },
  {
    id: 'student', label: 'Students', icon: 'cap', color: 'var(--sky)',
    ta: 'அரசுப் பள்ளியில படிச்சேன். இப்போ B.Sc முதல் வருஷம். உதவித்தொகை இருக்கா?', en: '"I studied in a government school. Now in first-year B.Sc. Any support?"',
    answers: [
      ['You may fit 3 schemes.', 'Girl-student support, scholarships and fee help. Sollu explains each one.'],
      ['Ask your college desk.', 'Most student schemes are applied through your college. Sollu tells you what to say.'],
      ['Papers you need.', 'School TC, Aadhaar, community certificate and a bank account in your name.'],
    ],
  },
  {
    id: 'worker', label: 'Workers', icon: 'tool', color: 'var(--yellow)',
    ta: 'ரெண்டு மாசமா சம்பளம் வரல. என்ன பண்ணலாம்?', en: '"My salary is 2 months late. What can I do?"',
    answers: [
      ['Your employer must pay on time.', 'Wage laws set a deadline for paying salary. Sollu shows the rule.'],
      ['Write it down today.', 'Note your work days, the amount owed and any messages from your employer.'],
      ['Complain for free.', 'The Labour Office takes wage complaints. Sollu finds yours.'],
    ],
  },
  {
    id: 'woman', label: 'Women', icon: 'heart', color: 'var(--purple)',
    ta: 'குடும்பத் தலைவிக்கான மாத உதவித்தொகை எனக்கு கிடைக்குமா?', en: '"Can I get the monthly support for women heads of family?"',
    answers: [
      ['You may fit.', 'It depends on family income and your family card. Sollu asks 3 questions to check.'],
      ['Check your status.', 'Sollu shows how to check if your application went through.'],
      ['Papers you need.', 'Family card, Aadhaar and a bank account in your name.'],
    ],
  },
];

export interface SampleQuestion {
  tag: string;
  en: string;
  ta: string;
  topic: string;
  icon: IconName;
  color: string;
}

export const sampleQuestions: SampleQuestion[] = [
  { tag: 'Money', en: 'Can my mother get a pension?', ta: 'என் அம்மாவுக்கு பென்ஷன் கிடைக்குமா?', topic: 'Senior care', icon: 'user', color: 'var(--pink)' },
  { tag: 'Work', en: 'My salary is late by 2 months. What can I do?', ta: 'ரெண்டு மாசமா சம்பளம் வரல.', topic: 'Wages', icon: 'tool', color: '#C89200' },
  { tag: 'Land', en: 'Is this land notice about my plot?', ta: 'இந்த நில அறிவிப்பு என் நிலத்தைப் பத்தியா?', topic: 'Notices', icon: 'doc', color: 'var(--sky)' },
  { tag: 'Study', en: 'Which scholarships fit a first-year B.Sc student?', ta: 'B.Sc முதல் வருஷம் — உதவித்தொகை?', topic: 'Education', icon: 'cap', color: 'var(--green)' },
  { tag: 'Food', en: 'Can the shop refuse my ration?', ta: 'ரேஷன் கடை மறுக்கலாமா?', topic: 'Ration', icon: 'home', color: 'var(--purple)' },
];

export const roadmap = [
  {
    when: 'Now · Version 1', title: 'Tamil Nadu', now: true,
    items: ['All 38 districts.', 'Tamil and English, by voice and text.', 'State and central schemes that apply in Tamil Nadu.', 'Rights library for everyday problems.'],
  },
  {
    when: 'Next · Version 2', title: 'All of India', now: false,
    items: ['22 Indian languages.', "Every state's schemes, one state at a time.", 'Missed-call and WhatsApp access.', 'Tools for NGOs and e-Sevai helpers.'],
  },
] as const;

export const faqs: [q: string, a: string][] = [
  ['Is Sollu free?', 'Yes. Asking is free, and it always will be.'],
  ['Is this legal advice?', 'No. Sollu explains rules in plain words. For a legal case, it connects you to free legal aid in your district.'],
  ['Do I need to sign in?', 'No. Your saved answers stay on your phone.'],
  ['What happens to my voice?', "It's turned into text to answer you, then deleted. We never sell your data."],
  ['What if Sollu is wrong?', 'Tap "Report a wrong answer". A person checks it, and we fix the source.'],
  ['Will it work on my phone?', "Yes. It's built for low-cost Android phones and slow networks."],
];

export const footerCols: { title: string; links: [label: string, href: string][] }[] = [
  { title: 'Product', links: [['Ask', '#ask'], ['Schemes', '#what'], ['Notices', '#what'], ['Rights', '#people'], ['Saved', '#top']] },
  { title: 'Learn', links: [['How it works', '#trust'], ['Sources', '#trust'], ['Languages', '#top'], ['Roadmap', '#top']] },
  { title: 'Help', links: [['For helpers', '#top'], ['Report a wrong answer', '#top'], ['Contact', '#top'], ['FAQ', '#faq-h']] },
  { title: 'Legal', links: [['Privacy', '#top'], ['Terms', '#top'], ['Not legal advice', '#top']] },
];

export const starterQuestion = 'Can I get a pension at 60?';
