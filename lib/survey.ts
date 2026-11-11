// ─────────────────────────────────────────────────────────────────────────────
// LOOKSMAX Survey — comprehensive lifestyle & habits assessment (68 questions)
//
// Purpose: the scan measures WHAT your face is; the survey finds WHY —
// the habits and issues holding your rating back — and drives the fix plan.
//
// Scoring: every option carries 0–10 points (10 = optimal). Category score =
// sum of points / max possible × 100. Options can raise issue `flags`;
// flags map to FIXES, which are merged with scan-metric weaknesses to build
// the final improvement plan.
// ─────────────────────────────────────────────────────────────────────────────

export type CategoryId =
  | 'skin'
  | 'hair'
  | 'jaw'
  | 'eyes'
  | 'body'
  | 'sleep'
  | 'nutrition'
  | 'posture'
  | 'style'
  | 'habits';

export interface SurveyCategory {
  id: CategoryId;
  name: string;
  description: string;
}

export interface SurveyOption {
  label: string;
  points: number; // 0–10, higher = better
  flags?: string[];
}

export interface SurveyQuestion {
  id: string;
  category: CategoryId;
  text: string;
  options: SurveyOption[];
}

export interface Fix {
  title: string;
  description: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  timeframe: string; // e.g. "2–4 weeks"
}

export const CATEGORIES: SurveyCategory[] = [
  { id: 'skin', name: 'Skin', description: 'Skin quality, routine, and protection' },
  { id: 'hair', name: 'Hair & Grooming', description: 'Hair health, style, and upkeep' },
  { id: 'jaw', name: 'Jaw & Dental', description: 'Jawline habits, teeth, and oral posture' },
  { id: 'eyes', name: 'Eye Area', description: 'Dark circles, puffiness, and brows' },
  { id: 'body', name: 'Body & Fitness', description: 'Body composition and training' },
  { id: 'sleep', name: 'Sleep & Recovery', description: 'Sleep quality and duration' },
  { id: 'nutrition', name: 'Nutrition & Hydration', description: 'Diet quality and water intake' },
  { id: 'posture', name: 'Posture', description: 'Neck, shoulder, and head position' },
  { id: 'style', name: 'Style & Presentation', description: 'Fashion, fit, and presentation' },
  { id: 'habits', name: 'Lifestyle Habits', description: 'Habits that accelerate or reverse aging' },
];

const YN = (yesPoints: number, noPoints: number, yesFlags?: string[], noFlags?: string[]): SurveyOption[] => [
  { label: 'Yes', points: yesPoints, flags: yesFlags },
  { label: 'No', points: noPoints, flags: noFlags },
];

export const QUESTIONS: SurveyQuestion[] = [
  // ── SKIN (10) ───────────────────────────────────────────────────────────────
  {
    id: 'skin-1', category: 'skin',
    text: 'How would you describe your skin right now?',
    options: [
      { label: 'Clear and even', points: 10 },
      { label: 'Occasional breakouts', points: 7, flags: ['mild-acne'] },
      { label: 'Frequent breakouts', points: 3, flags: ['acne'] },
      { label: 'Severe / cystic acne', points: 0, flags: ['severe-acne'] },
    ],
  },
  {
    id: 'skin-2', category: 'skin',
    text: 'Do you wash your face with a dedicated cleanser?',
    options: [
      { label: 'Twice daily', points: 10 },
      { label: 'Once daily', points: 8 },
      { label: 'Occasionally', points: 4, flags: ['no-routine'] },
      { label: 'Just water / never', points: 1, flags: ['no-routine'] },
    ],
  },
  {
    id: 'skin-3', category: 'skin',
    text: 'Do you wear sunscreen (SPF 30+) daily?',
    options: [
      { label: 'Every day, rain or shine', points: 10 },
      { label: 'Only when sunny', points: 6, flags: ['low-spf'] },
      { label: 'Only at the beach', points: 2, flags: ['low-spf'] },
      { label: 'Never', points: 0, flags: ['no-spf'] },
    ],
  },
  {
    id: 'skin-4', category: 'skin',
    text: 'Do you moisturize?',
    options: [
      { label: 'Daily', points: 10 },
      { label: 'Sometimes', points: 5, flags: ['no-routine'] },
      { label: 'Never', points: 1, flags: ['no-routine'] },
    ],
  },
  {
    id: 'skin-5', category: 'skin',
    text: 'Do you use any active ingredients (retinol, vitamin C, AHA/BHA)?',
    options: [
      { label: 'Yes, consistently', points: 10 },
      { label: 'Tried but not consistent', points: 5, flags: ['no-actives'] },
      { label: 'No, never', points: 2, flags: ['no-actives'] },
    ],
  },
  {
    id: 'skin-6', category: 'skin',
    text: 'How oily does your skin get through the day?',
    options: [
      { label: 'Balanced', points: 10 },
      { label: 'Slightly oily T-zone', points: 7 },
      { label: 'Very oily', points: 4, flags: ['oily-skin'] },
      { label: 'Very dry / flaky', points: 4, flags: ['dry-skin'] },
    ],
  },
  {
    id: 'skin-7', category: 'skin',
    text: 'Do you have visible blackheads or enlarged pores?',
    options: [
      { label: 'No', points: 10 },
      { label: 'A few on the nose', points: 7, flags: ['pores'] },
      { label: 'Noticeable across face', points: 3, flags: ['pores'] },
    ],
  },
  {
    id: 'skin-8', category: 'skin',
    text: 'Do you touch or pick at your face during the day?',
    options: [
      { label: 'Rarely / never', points: 10 },
      { label: 'Sometimes without noticing', points: 5, flags: ['face-touching'] },
      { label: 'Constantly', points: 1, flags: ['face-touching'] },
    ],
  },
  {
    id: 'skin-9', category: 'skin',
    text: 'How often do you change your pillowcase?',
    options: [
      { label: 'Weekly or more', points: 10 },
      { label: 'Every 2–3 weeks', points: 6 },
      { label: 'Monthly or less', points: 2, flags: ['dirty-pillowcase'] },
    ],
  },
  {
    id: 'skin-10', category: 'skin',
    text: 'Do you have acne scarring or hyperpigmentation?',
    options: [
      { label: 'None', points: 10 },
      { label: 'Mild marks that fade', points: 7 },
      { label: 'Visible scarring', points: 3, flags: ['scarring'] },
    ],
  },

  // ── HAIR & GROOMING (7) ─────────────────────────────────────────────────────
  {
    id: 'hair-1', category: 'hair',
    text: 'Does your current haircut suit your face shape?',
    options: [
      { label: 'Yes — chosen for my face shape', points: 10 },
      { label: 'Not sure, never thought about it', points: 5, flags: ['hair-mismatch'] },
      { label: 'No, I just get the same cut', points: 3, flags: ['hair-mismatch'] },
    ],
  },
  {
    id: 'hair-2', category: 'hair',
    text: 'How often do you get a haircut or shape-up?',
    options: [
      { label: 'Every 2–4 weeks', points: 10 },
      { label: 'Every 1–2 months', points: 7 },
      { label: 'When it gets out of control', points: 3, flags: ['grooming-neglect'] },
    ],
  },
  {
    id: 'hair-3', category: 'hair',
    text: 'Is your hair thinning or your hairline receding?',
    options: [
      { label: 'No', points: 10 },
      { label: 'Slightly, or starting to worry', points: 5, flags: ['hair-loss-early'] },
      { label: 'Noticeably', points: 2, flags: ['hair-loss'] },
    ],
  },
  {
    id: 'hair-4', category: 'hair',
    text: 'Do you use styling products and know how to use them?',
    options: [
      { label: 'Yes, dialed in', points: 10 },
      { label: 'Sometimes, basic routine', points: 6 },
      { label: 'Never style my hair', points: 3, flags: ['no-styling'] },
    ],
  },
  {
    id: 'hair-5', category: 'hair',
    text: 'How is your dandruff / scalp health?',
    options: [
      { label: 'No issues', points: 10 },
      { label: 'Occasional flakes', points: 6, flags: ['scalp'] },
      { label: 'Persistent dandruff or itching', points: 2, flags: ['scalp'] },
    ],
  },
  {
    id: 'hair-6', category: 'hair',
    text: 'Facial hair: is it intentional and maintained?',
    options: [
      { label: 'Clean shaven or sharply maintained', points: 10 },
      { label: 'Maintained but inconsistent', points: 6 },
      { label: 'Patchy / unmaintained growth', points: 2, flags: ['facial-hair'] },
    ],
  },
  {
    id: 'hair-7', category: 'hair',
    text: 'Do you groom eyebrows, nose, and ear hair?',
    options: [
      { label: 'Regularly', points: 10 },
      { label: 'Occasionally', points: 6 },
      { label: 'Never', points: 2, flags: ['grooming-neglect'] },
    ],
  },

  // ── JAW & DENTAL (8) ────────────────────────────────────────────────────────
  {
    id: 'jaw-1', category: 'jaw',
    text: 'Where does your tongue rest naturally?',
    options: [
      { label: 'Flat against the roof of my mouth', points: 10 },
      { label: 'Tip touches the roof, rest is low', points: 6, flags: ['tongue-posture'] },
      { label: 'Bottom of my mouth / not sure', points: 2, flags: ['tongue-posture'] },
    ],
  },
  {
    id: 'jaw-2', category: 'jaw',
    text: 'Do you breathe through your nose or mouth?',
    options: [
      { label: 'Nose, almost always', points: 10 },
      { label: 'Mix of both', points: 5, flags: ['mouth-breathing'] },
      { label: 'Mostly mouth', points: 1, flags: ['mouth-breathing'] },
    ],
  },
  {
    id: 'jaw-3', category: 'jaw',
    text: 'Do you sleep with your mouth open?',
    options: [
      { label: 'No', points: 10 },
      { label: 'Sometimes / wake up dry-mouthed', points: 4, flags: ['mouth-breathing-sleep'] },
      { label: 'Yes, every night', points: 1, flags: ['mouth-breathing-sleep'] },
    ],
  },
  {
    id: 'jaw-4', category: 'jaw',
    text: 'How straight are your teeth?',
    options: [
      { label: 'Straight (naturally or post-braces)', points: 10 },
      { label: 'Slightly crooked', points: 6, flags: ['teeth-alignment'] },
      { label: 'Noticeably misaligned', points: 2, flags: ['teeth-alignment'] },
    ],
  },
  {
    id: 'jaw-5', category: 'jaw',
    text: 'How white are your teeth?',
    options: [
      { label: 'White', points: 10 },
      { label: 'Slightly yellowed', points: 6, flags: ['teeth-color'] },
      { label: 'Visibly stained', points: 2, flags: ['teeth-color'] },
    ],
  },
  {
    id: 'jaw-6', category: 'jaw',
    text: 'Do you chew tough foods (meat, raw vegetables, mastic gum)?',
    options: [
      { label: 'Daily — my diet requires real chewing', points: 10 },
      { label: 'Sometimes', points: 6 },
      { label: 'Mostly soft/processed foods', points: 2, flags: ['soft-diet'] },
    ],
  },
  {
    id: 'jaw-7', category: 'jaw',
    text: 'Do you grind your teeth or clench your jaw?',
    options: [
      { label: 'No', points: 10 },
      { label: 'When stressed', points: 5, flags: ['bruxism'] },
      { label: 'Yes, chronically (or diagnosed)', points: 2, flags: ['bruxism'] },
    ],
  },
  {
    id: 'jaw-8', category: 'jaw',
    text: 'Is there visible fat under your chin (double chin at rest)?',
    options: [
      { label: 'No', points: 10 },
      { label: 'Slight, only at bad angles', points: 6, flags: ['submental-fat'] },
      { label: 'Yes, visible straight-on', points: 2, flags: ['submental-fat'] },
    ],
  },

  // ── EYE AREA (6) ────────────────────────────────────────────────────────────
  {
    id: 'eyes-1', category: 'eyes',
    text: 'Do you have dark circles under your eyes?',
    options: [
      { label: 'No', points: 10 },
      { label: 'Mild, when tired', points: 6, flags: ['dark-circles'] },
      { label: 'Yes, always visible', points: 2, flags: ['dark-circles'] },
    ],
  },
  {
    id: 'eyes-2', category: 'eyes',
    text: 'Are your eyes puffy in the morning?',
    options: [
      { label: 'Rarely', points: 10 },
      { label: 'Sometimes', points: 6, flags: ['puffiness'] },
      { label: 'Every morning', points: 2, flags: ['puffiness'] },
    ],
  },
  {
    id: 'eyes-3', category: 'eyes',
    text: 'How much screen time do you get in the 2 hours before bed?',
    options: [
      { label: 'Little to none', points: 10 },
      { label: 'Some, with night mode', points: 6 },
      { label: 'Heavy scrolling until sleep', points: 2, flags: ['late-screens'] },
    ],
  },
  {
    id: 'eyes-4', category: 'eyes',
    text: 'Are your eyebrows groomed and shaped?',
    options: [
      { label: 'Yes, intentionally shaped', points: 10 },
      { label: 'Natural but tidy', points: 7 },
      { label: 'Never touched them', points: 3, flags: ['brows'] },
    ],
  },
  {
    id: 'eyes-5', category: 'eyes',
    text: 'Do you squint or strain your eyes often (screens, no glasses)?',
    options: [
      { label: 'No', points: 10 },
      { label: 'Sometimes', points: 6 },
      { label: 'Constantly', points: 2, flags: ['eye-strain'] },
    ],
  },
  {
    id: 'eyes-6', category: 'eyes',
    text: 'Does your upper eyelid look hooded or heavy?',
    options: [
      { label: 'No', points: 10 },
      { label: 'Slightly', points: 6 },
      { label: 'Yes, noticeably', points: 3, flags: ['hooded-eyes'] },
    ],
  },

  // ── BODY & FITNESS (7) ──────────────────────────────────────────────────────
  {
    id: 'body-1', category: 'body',
    text: 'What is your approximate body fat level?',
    options: [
      { label: 'Lean (visible facial definition)', points: 10 },
      { label: 'Average', points: 6, flags: ['bodyfat'] },
      { label: 'Carrying extra weight', points: 2, flags: ['bodyfat-high'] },
      { label: 'Underweight', points: 4, flags: ['underweight'] },
    ],
  },
  {
    id: 'body-2', category: 'body',
    text: 'How often do you do resistance training?',
    options: [
      { label: '3+ times a week', points: 10 },
      { label: '1–2 times a week', points: 7 },
      { label: 'Rarely / never', points: 2, flags: ['no-training'] },
    ],
  },
  {
    id: 'body-3', category: 'body',
    text: 'How often do you do cardio?',
    options: [
      { label: '3+ times a week', points: 10 },
      { label: 'Once or twice a week', points: 7 },
      { label: 'Rarely / never', points: 3, flags: ['no-cardio'] },
    ],
  },
  {
    id: 'body-4', category: 'body',
    text: 'Has your weight changed significantly in the last year?',
    options: [
      { label: 'Stable', points: 10 },
      { label: 'Gained noticeably', points: 4, flags: ['weight-gain'] },
      { label: 'Lost noticeably (unintentionally)', points: 4, flags: ['weight-loss'] },
      { label: 'Intentional recomposition', points: 9 },
    ],
  },
  {
    id: 'body-5', category: 'body',
    text: 'Do you have a defined neck and trap area?',
    options: [
      { label: 'Yes', points: 10 },
      { label: 'Average', points: 6 },
      { label: 'Thin / undefined neck', points: 3, flags: ['thin-neck'] },
    ],
  },
  {
    id: 'body-6', category: 'body',
    text: 'How active is your typical day outside workouts?',
    options: [
      { label: 'On my feet a lot, 8k+ steps', points: 10 },
      { label: 'Moderate movement', points: 6 },
      { label: 'Sedentary — desk all day', points: 2, flags: ['sedentary'] },
    ],
  },
  {
    id: 'body-7', category: 'body',
    text: 'Do you know your daily protein intake?',
    options: [
      { label: 'Yes, I hit a target', points: 10 },
      { label: 'Roughly aware', points: 6 },
      { label: 'No idea', points: 3, flags: ['low-protein'] },
    ],
  },

  // ── SLEEP & RECOVERY (6) ────────────────────────────────────────────────────
  {
    id: 'sleep-1', category: 'sleep',
    text: 'How many hours do you sleep on a typical night?',
    options: [
      { label: '7–9 hours', points: 10 },
      { label: '6–7 hours', points: 6, flags: ['sleep-debt'] },
      { label: 'Under 6 hours', points: 1, flags: ['sleep-debt'] },
      { label: 'Over 9, still tired', points: 5, flags: ['sleep-quality'] },
    ],
  },
  {
    id: 'sleep-2', category: 'sleep',
    text: 'Is your sleep schedule consistent (same times daily)?',
    options: [
      { label: 'Yes, within an hour', points: 10 },
      { label: 'Weekdays only', points: 6, flags: ['sleep-schedule'] },
      { label: 'All over the place', points: 2, flags: ['sleep-schedule'] },
    ],
  },
  {
    id: 'sleep-3', category: 'sleep',
    text: 'What position do you sleep in?',
    options: [
      { label: 'Back', points: 10 },
      { label: 'Side', points: 7 },
      { label: 'Stomach (face in pillow)', points: 3, flags: ['stomach-sleeping'] },
    ],
  },
  {
    id: 'sleep-4', category: 'sleep',
    text: 'Do you wake up rested?',
    options: [
      { label: 'Usually', points: 10 },
      { label: 'Sometimes', points: 6 },
      { label: 'Almost never', points: 2, flags: ['sleep-quality'] },
    ],
  },
  {
    id: 'sleep-5', category: 'sleep',
    text: 'Is your bedroom dark, cool, and quiet?',
    options: [
      { label: 'All three', points: 10 },
      { label: 'Partially', points: 6 },
      { label: 'No — light/noise/heat issues', points: 2, flags: ['sleep-environment'] },
    ],
  },
  {
    id: 'sleep-6', category: 'sleep',
    text: 'Do you snore or suspect sleep apnea?',
    options: [
      { label: 'No', points: 10 },
      { label: 'Occasionally snore', points: 6, flags: ['snoring'] },
      { label: 'Loud snoring / gasping reported', points: 1, flags: ['apnea-risk'] },
    ],
  },

  // ── NUTRITION & HYDRATION (7) ───────────────────────────────────────────────
  {
    id: 'nutrition-1', category: 'nutrition',
    text: 'How much water do you drink daily?',
    options: [
      { label: '2–3+ liters', points: 10 },
      { label: 'About 1–2 liters', points: 6, flags: ['dehydration'] },
      { label: 'Mostly other drinks, little water', points: 2, flags: ['dehydration'] },
    ],
  },
  {
    id: 'nutrition-2', category: 'nutrition',
    text: 'How often do you eat processed / fast food?',
    options: [
      { label: 'Rarely', points: 10 },
      { label: 'A few times a week', points: 5, flags: ['processed-diet'] },
      { label: 'Daily', points: 1, flags: ['processed-diet'] },
    ],
  },
  {
    id: 'nutrition-3', category: 'nutrition',
    text: 'How much sugar do you consume (drinks, snacks, desserts)?',
    options: [
      { label: 'Minimal', points: 10 },
      { label: 'Moderate', points: 6, flags: ['sugar'] },
      { label: 'High — daily sugary drinks/snacks', points: 1, flags: ['sugar'] },
    ],
  },
  {
    id: 'nutrition-4', category: 'nutrition',
    text: 'How is your sodium intake / do you wake up puffy after salty meals?',
    options: [
      { label: 'Balanced, no bloat', points: 10 },
      { label: 'Occasionally puffy', points: 6, flags: ['sodium'] },
      { label: 'Often bloated/puffy', points: 2, flags: ['sodium'] },
    ],
  },
  {
    id: 'nutrition-5', category: 'nutrition',
    text: 'Do you eat fruits and vegetables daily?',
    options: [
      { label: '5+ servings', points: 10 },
      { label: '1–2 servings', points: 6, flags: ['micronutrients'] },
      { label: 'Rarely', points: 2, flags: ['micronutrients'] },
    ],
  },
  {
    id: 'nutrition-6', category: 'nutrition',
    text: 'Do you consume dairy heavily?',
    options: [
      { label: 'Minimal / no issues', points: 10 },
      { label: 'Moderate', points: 7 },
      { label: 'Heavy, and I break out often', points: 3, flags: ['dairy-acne'] },
    ],
  },
  {
    id: 'nutrition-7', category: 'nutrition',
    text: 'Do you take any supplements (vitamin D, omega-3, etc.)?',
    options: [
      { label: 'Yes, targeted stack', points: 10 },
      { label: 'Multivitamin sometimes', points: 6 },
      { label: 'None', points: 4, flags: ['no-supplements'] },
    ],
  },

  // ── POSTURE (4) ─────────────────────────────────────────────────────────────
  {
    id: 'posture-1', category: 'posture',
    text: 'Does your head sit forward of your shoulders (check side profile)?',
    options: [
      { label: 'No, ears over shoulders', points: 10 },
      { label: 'Slightly forward', points: 5, flags: ['forward-head'] },
      { label: 'Noticeably forward (tech neck)', points: 1, flags: ['forward-head'] },
    ],
  },
  {
    id: 'posture-2', category: 'posture',
    text: 'How many hours a day do you look down at a phone/laptop?',
    options: [
      { label: 'Under 2, or screens at eye level', points: 10 },
      { label: '2–5 hours', points: 5, flags: ['tech-neck'] },
      { label: '5+ hours looking down', points: 1, flags: ['tech-neck'] },
    ],
  },
  {
    id: 'posture-3', category: 'posture',
    text: 'Are your shoulders rounded forward?',
    options: [
      { label: 'No', points: 10 },
      { label: 'Slightly', points: 5, flags: ['rounded-shoulders'] },
      { label: 'Yes, noticeably', points: 1, flags: ['rounded-shoulders'] },
    ],
  },
  {
    id: 'posture-4', category: 'posture',
    text: 'Do you do any posture or mobility work?',
    options: [
      { label: 'Regularly', points: 10 },
      { label: 'Occasionally', points: 5 },
      { label: 'Never', points: 2, flags: ['no-mobility'] },
    ],
  },

  // ── STYLE & PRESENTATION (5) ────────────────────────────────────────────────
  {
    id: 'style-1', category: 'style',
    text: 'Do your clothes fit properly (shoulders, length, taper)?',
    options: [
      { label: 'Yes, fit is dialed', points: 10 },
      { label: 'Mostly, some pieces off', points: 6, flags: ['fit'] },
      { label: 'I wear whatever, fit unknown', points: 2, flags: ['fit'] },
    ],
  },
  {
    id: 'style-2', category: 'style',
    text: 'Do you have a consistent personal style?',
    options: [
      { label: 'Yes, intentional wardrobe', points: 10 },
      { label: 'Somewhat', points: 6 },
      { label: 'No, random pieces', points: 3, flags: ['no-style'] },
    ],
  },
  {
    id: 'style-3', category: 'style',
    text: 'Do you know which colors complement your skin tone?',
    options: [
      { label: 'Yes and I dress accordingly', points: 10 },
      { label: 'Vague idea', points: 5 },
      { label: 'Never considered it', points: 3, flags: ['color-theory'] },
    ],
  },
  {
    id: 'style-4', category: 'style',
    text: 'How is your fragrance game?',
    options: [
      { label: 'Signature scent, applied right', points: 10 },
      { label: 'Own one, use sometimes', points: 6 },
      { label: 'None', points: 3, flags: ['fragrance'] },
    ],
  },
  {
    id: 'style-5', category: 'style',
    text: 'Nails, skin on hands, and small details — maintained?',
    options: [
      { label: 'Yes', points: 10 },
      { label: 'Basic upkeep', points: 6 },
      { label: 'Neglected', points: 2, flags: ['grooming-neglect'] },
    ],
  },

  // ── LIFESTYLE HABITS (8) ────────────────────────────────────────────────────
  {
    id: 'habits-1', category: 'habits',
    text: 'Do you smoke or vape?',
    options: [
      { label: 'Never', points: 10 },
      { label: 'Socially', points: 4, flags: ['smoking'] },
      { label: 'Daily', points: 0, flags: ['smoking'] },
    ],
  },
  {
    id: 'habits-2', category: 'habits',
    text: 'How much alcohol do you drink?',
    options: [
      { label: 'None / rarely', points: 10 },
      { label: '1–3 drinks a week', points: 7 },
      { label: 'Weekend binges', points: 2, flags: ['alcohol'] },
      { label: 'Daily', points: 0, flags: ['alcohol'] },
    ],
  },
  {
    id: 'habits-3', category: 'habits',
    text: 'How is your stress level day to day?',
    options: [
      { label: 'Managed and low', points: 10 },
      { label: 'Moderate', points: 6 },
      { label: 'Chronically high', points: 1, flags: ['stress'] },
    ],
  },
  {
    id: 'habits-4', category: 'habits',
    text: 'Caffeine intake?',
    options: [
      { label: 'Moderate, none after 2pm', points: 10 },
      { label: 'Heavy but early', points: 7 },
      { label: 'Heavy, late into the evening', points: 2, flags: ['late-caffeine'] },
    ],
  },
  {
    id: 'habits-5', category: 'habits',
    text: 'Do you spend time outdoors in daylight (without burning)?',
    options: [
      { label: '30+ minutes daily', points: 10 },
      { label: 'A few times a week', points: 6 },
      { label: 'Rarely see the sun', points: 2, flags: ['no-daylight'] },
    ],
  },
  {
    id: 'habits-6', category: 'habits',
    text: 'Any recreational drug use?',
    options: [
      { label: 'None', points: 10 },
      { label: 'Occasional', points: 4, flags: ['substances'] },
      { label: 'Regular', points: 0, flags: ['substances'] },
    ],
  },
  {
    id: 'habits-7', category: 'habits',
    text: 'How consistent are you once you start a self-improvement routine?',
    options: [
      { label: 'Very — I stick to systems', points: 10 },
      { label: 'Start strong, fade out', points: 5, flags: ['consistency'] },
      { label: 'Rarely follow through', points: 2, flags: ['consistency'] },
    ],
  },
  {
    id: 'habits-8', category: 'habits',
    text: 'How old are you?',
    options: [
      { label: 'Under 18', points: 10, flags: ['minor'] },
      { label: '18–25', points: 10 },
      { label: '26–35', points: 10 },
      { label: '36+', points: 10 },
    ],
  },
];

// ── Fix library: flag → recommended action ───────────────────────────────────
export const FIXES: Record<string, Fix> = {
  'acne':                { title: 'Acne protocol', description: 'Consistent AM/PM cleanse, benzoyl peroxide or salicylic acid, non-comedogenic moisturizer. See a dermatologist if no progress in 8 weeks.', difficulty: 'moderate', timeframe: '6–12 weeks' },
  'severe-acne':         { title: 'See a dermatologist', description: 'Cystic/severe acne needs prescription treatment (tretinoin, antibiotics, or isotretinoin). This is the highest-ROI move available to you.', difficulty: 'moderate', timeframe: '3–6 months' },
  'mild-acne':           { title: 'Spot treatment + routine', description: 'Add a salicylic acid cleanser and benzoyl peroxide spot treatment to kill occasional breakouts fast.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'no-routine':          { title: 'Build a basic skincare routine', description: 'Cleanser + moisturizer + SPF in the morning; cleanser + moisturizer at night. Three products, 4 minutes a day.', difficulty: 'easy', timeframe: '4–8 weeks' },
  'no-spf':              { title: 'Daily SPF — non-negotiable', description: 'UV exposure is the #1 cause of visible skin aging. SPF 30+ every morning, reapply if outdoors.', difficulty: 'easy', timeframe: 'Immediate protection' },
  'low-spf':             { title: 'Make SPF daily', description: 'UV damage accumulates on cloudy days and through windows. Make SPF part of the morning routine, not a beach item.', difficulty: 'easy', timeframe: 'Immediate protection' },
  'no-actives':          { title: 'Introduce retinol', description: 'Start retinol 2×/week at night, building to nightly. The single most evidence-backed ingredient for skin texture and aging.', difficulty: 'moderate', timeframe: '8–12 weeks' },
  'oily-skin':           { title: 'Oil control', description: 'Gel cleanser, niacinamide serum, lightweight moisturizer. Do not strip skin — overwashing increases oil production.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'dry-skin':            { title: 'Barrier repair', description: 'Cream cleanser, hyaluronic acid on damp skin, ceramide moisturizer. Avoid hot water on the face.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'pores':               { title: 'Pore refinement', description: 'BHA (salicylic acid) 2–3×/week dissolves blackheads from inside the pore. Niacinamide tightens appearance over time.', difficulty: 'easy', timeframe: '4–8 weeks' },
  'face-touching':       { title: 'Stop face touching', description: 'Transfers oil and bacteria all day. Awareness is the fix — note triggers (boredom, stress) and keep hands busy.', difficulty: 'easy', timeframe: '2 weeks' },
  'dirty-pillowcase':    { title: 'Weekly pillowcase swaps', description: 'Your face spends 8 hours a night on it. Swap weekly; silk/satin also reduces friction and sleep lines.', difficulty: 'easy', timeframe: 'Immediate' },
  'scarring':            { title: 'Scar treatment', description: 'Hyperpigmentation: vitamin C + SPF + time. Textured scarring: microneedling or laser with a professional.', difficulty: 'hard', timeframe: '3–12 months' },
  'hair-mismatch':       { title: 'Face-shape haircut', description: 'Take your scan results to a good barber: the right cut balances face length/width and frames the forehead properly.', difficulty: 'easy', timeframe: 'Next haircut' },
  'hair-loss-early':     { title: 'Act on hair early', description: 'Hair loss is far easier to keep than regrow. See a dermatologist about minoxidil/finasteride while it is early.', difficulty: 'moderate', timeframe: '3–6 months' },
  'hair-loss':           { title: 'Hair loss consult', description: 'See a dermatologist or hair specialist for treatment options — and consider cuts that work with density, not against it.', difficulty: 'moderate', timeframe: '3–12 months' },
  'no-styling':          { title: 'Learn to style your hair', description: 'A $15 product and 3 minutes transforms most haircuts. Ask your barber what to use for your hair type.', difficulty: 'easy', timeframe: 'Immediate' },
  'scalp':               { title: 'Scalp care', description: 'Ketoconazole or zinc pyrithione shampoo 2–3×/week clears most dandruff. Persistent itching → dermatologist.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'facial-hair':         { title: 'Commit to a facial hair decision', description: 'Patchy growth reads as neglect. Either clean-shave consistently or maintain deliberate lines at the neck and cheeks.', difficulty: 'easy', timeframe: 'Immediate' },
  'grooming-neglect':    { title: 'Grooming cadence', description: 'Put haircuts, brow cleanup, and nail care on a recurring schedule instead of waiting until they are overdue.', difficulty: 'easy', timeframe: 'Immediate' },
  'tongue-posture':      { title: 'Fix tongue posture (mewing)', description: 'Full tongue flat on the palate, lips sealed, teeth lightly touching. Make it the default, especially during focus time.', difficulty: 'moderate', timeframe: 'Months–years; posture benefits immediate' },
  'mouth-breathing':     { title: 'Switch to nasal breathing', description: 'Mouth breathing affects facial development and posture. Practice conscious nasal breathing; see an ENT if your nose is always blocked.', difficulty: 'moderate', timeframe: '4–8 weeks' },
  'mouth-breathing-sleep': { title: 'Nighttime nasal breathing', description: 'Mouth taping (if safe for you) or nasal strips at night. Waking with dry mouth = 8 hours of mouth breathing daily.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'teeth-alignment':     { title: 'Orthodontic consult', description: 'Clear aligners handle most mild-moderate cases. Teeth frame the lower third of your face in every interaction.', difficulty: 'hard', timeframe: '6–24 months' },
  'teeth-color':         { title: 'Whiten your teeth', description: 'Whitening strips are cheap and effective. Cut back staining drinks or use a straw.', difficulty: 'easy', timeframe: '2–3 weeks' },
  'soft-diet':           { title: 'Chew harder foods', description: 'The masseter responds to load like any muscle. Tougher meats, raw vegetables, or mastic gum give the jaw real work.', difficulty: 'easy', timeframe: '2–6 months' },
  'bruxism':             { title: 'Address grinding', description: 'Grinding enlarges the masseter unevenly and wears teeth. Night guard + stress management; see a dentist.', difficulty: 'moderate', timeframe: '4–8 weeks' },
  'submental-fat':       { title: 'Reduce under-chin fat', description: 'Submental fat responds to overall fat loss. A caloric deficit sharpens the jawline more than any gadget.', difficulty: 'moderate', timeframe: '2–6 months' },
  'dark-circles':        { title: 'Dark circle protocol', description: 'Fix sleep first, then hydration; caffeine eye cream helps puffiness-related shadows. Genetic hollows are a filler conversation.', difficulty: 'moderate', timeframe: '4–8 weeks' },
  'puffiness':           { title: 'Morning de-puff', description: 'Reduce evening sodium and alcohol, sleep with head slightly elevated, cold water rinse in the morning.', difficulty: 'easy', timeframe: '1–2 weeks' },
  'late-screens':        { title: 'Screen curfew', description: 'Blue light late at night wrecks sleep quality, which shows up under your eyes first. Hard cutoff 60 minutes before bed.', difficulty: 'moderate', timeframe: '1–2 weeks' },
  'brows':               { title: 'Brow grooming', description: 'Clean the unibrow area and stray hairs below the brow line. Keep it natural — overplucked reads worse than untouched.', difficulty: 'easy', timeframe: 'Immediate' },
  'eye-strain':          { title: 'Reduce eye strain', description: 'Get your vision checked, use proper screen distance and brightness. Chronic squinting etches lines early.', difficulty: 'easy', timeframe: 'Immediate' },
  'hooded-eyes':         { title: 'Eyelid appearance', description: 'Often genetic; leanness and good sleep minimize it. Severe hooding affecting vision is a blepharoplasty conversation.', difficulty: 'hard', timeframe: 'Varies' },
  'bodyfat':             { title: 'Lean out moderately', description: 'Facial definition appears in the 10–15% body fat range for men. A modest deficit with high protein preserves muscle.', difficulty: 'moderate', timeframe: '2–4 months' },
  'bodyfat-high':        { title: 'Fat loss first', description: 'Fat loss is the single biggest controllable facial change — jawline, eye area, and cheekbones all emerge. Deficit + steps + protein.', difficulty: 'hard', timeframe: '4–8 months' },
  'underweight':         { title: 'Build mass', description: 'Being underweight hollows the face unflatteringly. Caloric surplus + resistance training fills out the neck and face.', difficulty: 'moderate', timeframe: '3–6 months' },
  'no-training':         { title: 'Start resistance training', description: '3 full-body sessions a week. Improves posture, neck thickness, hormones, and skin — everything compounds.', difficulty: 'moderate', timeframe: '8–12 weeks' },
  'no-cardio':           { title: 'Add cardio', description: '2–3 zone-2 sessions weekly improves skin circulation and keeps body fat in check.', difficulty: 'easy', timeframe: '4 weeks' },
  'weight-gain':         { title: 'Reverse recent gain', description: 'Recent gain shows in the face first — and leaves it first. Act now while it is new weight.', difficulty: 'moderate', timeframe: '2–4 months' },
  'weight-loss':         { title: 'Investigate weight loss', description: 'Unintentional loss deserves a doctor visit, and rapid loss can age the face. Stabilize with adequate calories and protein.', difficulty: 'moderate', timeframe: '1–3 months' },
  'thin-neck':           { title: 'Neck and trap training', description: 'A thicker neck visually widens the jaw. Trap work + careful direct neck training (curls/extensions, light and controlled).', difficulty: 'moderate', timeframe: '3–6 months' },
  'sedentary':           { title: 'Daily movement floor', description: '8–10k steps as a non-negotiable. Fixes posture, aids fat loss, improves skin circulation.', difficulty: 'easy', timeframe: '2 weeks' },
  'low-protein':         { title: 'Protein target', description: '~1.6–2.2g per kg bodyweight daily. Skin, hair, and muscle are all protein — chronically low intake shows in all three.', difficulty: 'easy', timeframe: '4–8 weeks' },
  'sleep-debt':          { title: 'Extend sleep to 7–9h', description: 'Sleep deprivation measurably reduces attractiveness ratings in studies — eyes, skin tone, and expression all suffer.', difficulty: 'moderate', timeframe: '2–4 weeks' },
  'sleep-schedule':      { title: 'Consistent sleep window', description: 'Same sleep and wake time daily (±1 hour, weekends included). Consistency beats duration for how rested you look.', difficulty: 'moderate', timeframe: '2–3 weeks' },
  'stomach-sleeping':    { title: 'Stop face-down sleeping', description: 'Hours of face compression nightly causes asymmetry and sleep lines. Train back sleeping with pillow support.', difficulty: 'moderate', timeframe: '3–6 weeks' },
  'sleep-quality':       { title: 'Sleep quality audit', description: 'Dark/cool/quiet room, no late caffeine, no late screens. If still unrested, talk to a doctor about a sleep study.', difficulty: 'moderate', timeframe: '4 weeks' },
  'sleep-environment':   { title: 'Optimize the bedroom', description: 'Blackout curtains, 18–20°C, earplugs or white noise. One-time setup, nightly payoff.', difficulty: 'easy', timeframe: 'Immediate' },
  'snoring':             { title: 'Address snoring', description: 'Side sleeping, nasal strips, and leanness reduce most snoring. It fragments the sleep that your face depends on.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'apnea-risk':          { title: 'Get screened for sleep apnea', description: 'Gasping or loud chronic snoring warrants a sleep study. Untreated apnea visibly ages you and is a health risk.', difficulty: 'moderate', timeframe: '1–3 months' },
  'dehydration':         { title: 'Hydration habit', description: '2–3L water daily. Chronic mild dehydration dulls skin and deepens under-eye shadows. Carry a bottle.', difficulty: 'easy', timeframe: '1–2 weeks' },
  'processed-diet':      { title: 'Whole-food base', description: 'Processed food drives inflammation, bloat, and breakouts. Build meals from protein + produce; keep processed food occasional.', difficulty: 'moderate', timeframe: '4–8 weeks' },
  'sugar':               { title: 'Cut sugar', description: 'Glycation stiffens collagen — sugar literally ages skin. Cut liquid sugar first; it is the easiest high-impact win.', difficulty: 'moderate', timeframe: '4 weeks' },
  'sodium':              { title: 'Sodium awareness', description: 'Heavy sodium evenings = puffy mornings. Balance with potassium (fruit, vegetables) and front-load salt earlier in the day.', difficulty: 'easy', timeframe: '1 week' },
  'micronutrients':      { title: 'Eat the rainbow', description: 'Skin is built from micronutrients. 5 servings of fruit/veg daily; frozen counts.', difficulty: 'easy', timeframe: '4–8 weeks' },
  'dairy-acne':          { title: 'Test a dairy cut', description: 'Dairy is a common acne trigger. Eliminate for 6 weeks and compare skin — data beats guessing.', difficulty: 'moderate', timeframe: '6 weeks' },
  'no-supplements':      { title: 'Basic stack', description: 'Vitamin D (if low sun), omega-3, and creatine are the evidence-backed basics. Skip exotic pills.', difficulty: 'easy', timeframe: '8–12 weeks' },
  'forward-head':        { title: 'Fix forward head posture', description: 'Chin tucks, upper-trap stretches, and strengthening deep neck flexors. Instantly improves jawline appearance from the side.', difficulty: 'moderate', timeframe: '6–12 weeks' },
  'tech-neck':           { title: 'Raise your screens', description: 'Phone at eye level, laptop on a stand. Hours of looking down trains the exact posture that hides your jawline.', difficulty: 'easy', timeframe: 'Immediate' },
  'rounded-shoulders':   { title: 'Open the shoulders', description: 'Face pulls, rows, doorway chest stretches. Rounded shoulders drag the head forward and shrink your frame.', difficulty: 'moderate', timeframe: '6–12 weeks' },
  'no-mobility':         { title: '10-minute daily mobility', description: 'A short daily routine (neck, thoracic, hips) maintains the posture work everything else depends on.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'fit':                 { title: 'Fix your fit', description: 'Fit matters more than brand or price. Shoulders seam at your shoulder, slight taper, correct length. A tailor is cheap.', difficulty: 'easy', timeframe: 'Immediate' },
  'no-style':            { title: 'Build a capsule wardrobe', description: 'Pick a lane (clean/casual/streetwear), 10–15 interchangeable pieces that all fit well. Consistency reads as intentional.', difficulty: 'moderate', timeframe: '1–2 months' },
  'color-theory':        { title: 'Find your colors', description: 'Determine warm/cool undertone and build around the 3–4 colors that flatter it. Face looks healthier instantly.', difficulty: 'easy', timeframe: 'Immediate' },
  'fragrance':           { title: 'Get a signature scent', description: 'Fragrance is remembered. One versatile scent, 2–3 sprays, applied to skin not clothes.', difficulty: 'easy', timeframe: 'Immediate' },
  'smoking':             { title: 'Quit smoking/vaping', description: 'Smoking destroys collagen, yellows teeth, and ages skin faster than anything else on this list. Nothing else you do will out-train it.', difficulty: 'hard', timeframe: '12 weeks+' },
  'alcohol':             { title: 'Cut alcohol back', description: 'Alcohol dehydrates skin, bloats the face, and wrecks sleep architecture. Even 2 weeks off shows visibly.', difficulty: 'moderate', timeframe: '2–8 weeks' },
  'stress':              { title: 'Stress management', description: 'Chronic cortisol causes breakouts, hair shedding, and tension in the face. Exercise, daylight, and sleep are the foundation.', difficulty: 'moderate', timeframe: '4–8 weeks' },
  'late-caffeine':       { title: 'Caffeine cutoff at 2pm', description: 'Caffeine has a 5–6 hour half-life. Late intake silently degrades the deep sleep your face recovers during.', difficulty: 'easy', timeframe: '1–2 weeks' },
  'no-daylight':         { title: 'Daily daylight', description: '20–30 minutes of morning daylight anchors circadian rhythm, improves sleep, and supports vitamin D.', difficulty: 'easy', timeframe: '1–2 weeks' },
  'substances':          { title: 'Reduce substance use', description: 'Recreational drugs compound sleep, skin, and recovery damage. Reduction shows in the mirror within weeks.', difficulty: 'hard', timeframe: 'Varies' },
  'consistency':         { title: 'Systems over motivation', description: 'Attach new habits to existing ones, start embarrassingly small, track streaks. Every fix on this list only works if repeated.', difficulty: 'moderate', timeframe: 'Ongoing' },

  // ── Deep-tier hyper-specific fixes (each maps to exact products) ────────────
  'wrong-cleanser':      { title: 'Match cleanser to skin type', description: 'Oily → gel cleanser with salicylic acid. Dry → cream cleanser. Bar soap strips the barrier and makes everything worse.', difficulty: 'easy', timeframe: '2 weeks' },
  'no-spf-reapply':      { title: 'SPF reapplication stick', description: 'One coat at 8am is gone by noon. Keep a sunscreen stick in your bag/car and reapply every 2 hours outdoors.', difficulty: 'easy', timeframe: 'Immediate' },
  'no-vitc':             { title: 'Morning vitamin C serum', description: '10–20% L-ascorbic acid (or a stable derivative) under SPF. Brightens, fades marks, and doubles your UV defense.', difficulty: 'easy', timeframe: '4–8 weeks' },
  'over-exfoliation':    { title: 'Stop over-exfoliating', description: 'Daily acids wreck the barrier → redness, breakouts, sensitivity. Cap at 2–3×/week and add a ceramide moisturizer.', difficulty: 'easy', timeframe: '2–3 weeks' },
  'no-exfoliation':      { title: 'Add a chemical exfoliant', description: 'Start BHA (salicylic) or AHA (glycolic/lactic) 2×/week at night. Smoother texture and brighter tone in a month.', difficulty: 'easy', timeframe: '4 weeks' },
  'no-ceramides':        { title: 'Upgrade to a ceramide moisturizer', description: 'Ceramides rebuild the barrier that holds water in. The difference between "moisturized" and actually repaired.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'razor-burn':          { title: 'Fix the shave', description: 'Safety razor, shave with the grain on a warm face, finish with an alcohol-free balm. Exfoliating pads prevent ingrowns.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'hot-water-face':      { title: 'Lukewarm water only', description: 'Hot water strips the skin barrier and triggers redness. Lukewarm to wash, cool to finish.', difficulty: 'easy', timeframe: '1–2 weeks' },
  'redness':             { title: 'Redness protocol', description: 'Azelaic acid 10% is the OTC hero for persistent redness. Niacinamide helps. Constant flushing → dermatologist (rosacea).', difficulty: 'moderate', timeframe: '6–10 weeks' },
  'hair-loss-untreated': { title: 'Start treatment NOW', description: 'Every month untreated is follicles you may not get back. Minoxidil is OTC; finasteride talk with a doctor. Laser caps stack on top.', difficulty: 'moderate', timeframe: '3–6 months' },
  'harsh-shampoo':       { title: 'Gentler wash routine', description: 'Sulfate-free shampoo, 2–4×/week, conditioner mid-length. Daily harsh washing dries the scalp and dulls hair.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'heat-damage':         { title: 'Heat protectant, always', description: 'A $10 spray before any dryer/straightener prevents cumulative fry. Damaged hair never un-fries.', difficulty: 'easy', timeframe: 'Immediate' },
  'hair-mechanical-damage': { title: 'Stop wrecking wet hair', description: 'Wet hair is at its weakest. Microfiber towel, pat dry, wide-tooth comb only. Never brush soaking-wet hair.', difficulty: 'easy', timeframe: 'Immediate' },
  'beard-patchy':        { title: 'Patchy beard playbook', description: 'Either commit to the length where it connects (8–12 weeks of patience) or pick a style that works with your pattern — heavy stubble beats patchy full beard every time.', difficulty: 'moderate', timeframe: '2–3 months' },
  'no-edge-tool':        { title: 'Get an edge trimmer', description: 'A $25 precision trimmer keeps the neckline and sideburns sharp for the 3 weeks between cuts. Sharpest ROI in grooming.', difficulty: 'easy', timeframe: 'Immediate' },
  'never-whitened':      { title: 'Whitening strips, this week', description: 'Peroxide strips are ~$35, ADA-backed, and shift teeth several shades in 2 weeks. Single fastest smile upgrade.', difficulty: 'easy', timeframe: '2–3 weeks' },
  'no-floss':            { title: 'Floss or water-floss daily', description: 'Inflamed gums frame your teeth badly and cause recession. A water flosser makes it a 60-second habit.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'manual-brush':        { title: 'Switch to electric', description: 'Electric brushes remove measurably more plaque with a built-in timer. Whiter-looking, healthier teeth on autopilot.', difficulty: 'easy', timeframe: '4 weeks' },
  'staining-drinks':     { title: 'Outsmart the stains', description: 'Straw for iced drinks, water rinse after coffee/wine, whitening toothpaste for maintenance. Keep the coffee, lose the stains.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'no-tongue-scrape':    { title: 'Tongue scraper', description: '$8, ten seconds a day, dramatically fresher breath. Breath is part of your presentation whether you like it or not.', difficulty: 'easy', timeframe: 'Immediate' },
  'gum-health':          { title: 'Bleeding gums = see a dentist', description: 'Bleeding is gingivitis until proven otherwise. Cleaning + daily floss reverses it; ignoring it costs you gum line permanently.', difficulty: 'moderate', timeframe: '4–8 weeks' },
  'eye-rubbing':         { title: 'Stop rubbing your eyes', description: 'Chronic rubbing darkens and loosens under-eye skin. Treat the allergy (antihistamine, cold compress) instead of the itch.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'no-eye-cream':        { title: 'Caffeine eye cream', description: 'Caffeine constricts vessels under the eye — less shadow, less puff. Nightly retinol eye cream builds thicker skin long-term.', difficulty: 'easy', timeframe: '4–6 weeks' },
  'tear-trough':         { title: 'Tear trough reality check', description: 'Hollow under-eyes are mostly genetic/structural. Sleep + hydration minimize it; beyond that it is a filler consult, not a cream.', difficulty: 'hard', timeframe: 'Varies' },
  'sparse-lashes':       { title: 'Brow & lash density', description: 'Castor oil is cheap but weak; brow tinting adds instant density; a lash/brow serum over 3 months does the real work.', difficulty: 'easy', timeframe: '2–3 months' },
  'frames-mismatch':     { title: 'Frames that fit your face', description: 'Glasses sit on your face all day — frame shape should counter your face shape (round face → angular frames, and vice versa). Get sized properly.', difficulty: 'easy', timeframe: 'Next purchase' },
  'no-progression':      { title: 'Progressive overload', description: 'Muscles adapt to what they must. Log lifts, add weight or reps weekly. Same dumbbells for a year = same body for a year.', difficulty: 'moderate', timeframe: '8–12 weeks' },
  'no-creatine':         { title: 'Creatine, daily, forever', description: '5g monohydrate daily. The most-proven supplement in existence: strength, size, and recovery. Costs pennies.', difficulty: 'easy', timeframe: '4–8 weeks' },
  'no-vtaper':           { title: 'Build the V-taper', description: 'Lateral raises, overhead press, pull-ups, rows. Wider shoulders make the waist and face look leaner by contrast.', difficulty: 'moderate', timeframe: '3–6 months' },
  'no-tracking':         { title: 'Track or guess forever', description: 'Monthly photos (same light, same angle) + a tape measure. You cannot improve what you refuse to measure.', difficulty: 'easy', timeframe: 'Immediate' },
  'alcohol-sleep':       { title: 'No alcohol near bedtime', description: 'Alcohol within 3 hours of bed destroys REM and dehydrates you into a puffier morning face. Move drinks earlier or cut them.', difficulty: 'moderate', timeframe: '2 weeks' },
  'cotton-pillowcase':   { title: 'Silk/satin pillowcase', description: 'Less friction = fewer sleep lines and less hair breakage. Cheap upgrade you benefit from 8 hours a night.', difficulty: 'easy', timeframe: 'Immediate' },
  'no-omega3':           { title: 'Omega-3 baseline', description: 'Fatty fish 2×/week or 1–2g EPA/DHA daily. Anti-inflammatory base for skin, scalp, and recovery.', difficulty: 'easy', timeframe: '8–12 weeks' },
  'no-vitd':             { title: 'Test and fix vitamin D', description: 'Low D is rampant and shows up in skin, hair, and energy. Test it; supplement 1000–4000 IU if low.', difficulty: 'easy', timeframe: '8–12 weeks' },
  'low-collagen-aa':     { title: 'Collagen amino acids', description: 'Glycine/proline from bone broth, gelatin, or collagen peptides supports skin and joints. Evidence is modest — fundamentals first.', difficulty: 'easy', timeframe: '8–12 weeks' },
  'crash-diet':          { title: 'Never crash again', description: 'Rapid loss eats muscle and deflates the face. Cap the deficit at ~500 kcal, keep protein high, lift weights while cutting.', difficulty: 'moderate', timeframe: 'Ongoing' },
  'pillow-height':       { title: 'Fix your pillow stack', description: 'Stacked pillows crane the neck forward all night — training tech-neck while you sleep. One pillow, neutral spine.', difficulty: 'easy', timeframe: '2–4 weeks' },
  'no-tailor':           { title: 'Tailor your top 5 pieces', description: '$15–40 per piece to make shoulders, taper, and length actually fit. Fit upgrades your whole wardrobe more than new clothes.', difficulty: 'easy', timeframe: '2 weeks' },
  'clothes-care':        { title: 'Clothes maintenance kit', description: 'Steamer + lint roller + fabric shaver = every outfit reads intentional. Wrinkled clothing undoes everything else.', difficulty: 'easy', timeframe: 'Immediate' },
  'chapped':             { title: 'Lip + hand upkeep', description: 'Lip balm with SPF in your pocket, hand cream at your desk, cuticle oil at night. Small details people absolutely notice.', difficulty: 'easy', timeframe: '1–2 weeks' },
};

// ═════════════════════════════════════════════════════════════════════════════
// SURVEY TIERS
//   quick = 24 core questions (~3 min)   — the pulse check
//   full  = 68 questions (~10 min)       — the standard audit
//   deep  = 128 questions (~30 min)      — hyper-specific, product-targeted
// ═════════════════════════════════════════════════════════════════════════════

export type SurveyTier = 'quick' | 'full' | 'deep';

export const TIER_META: Record<
  SurveyTier,
  { name: string; tagline: string; count: number; minutes: string }
> = {
  quick: { name: 'The Pulse', tagline: 'Fast read on the big levers', count: 24, minutes: '~3 min' },
  full: { name: 'The Audit', tagline: 'Full habits breakdown + fix plan', count: 68, minutes: '~10 min' },
  deep: { name: 'The Deep Scan', tagline: 'Hyper-specific — maps every issue to exact products', count: 128, minutes: '~30 min' },
};

// The 24 highest-signal questions for the quick tier
const QUICK_IDS = new Set([
  'skin-1', 'skin-3', 'skin-5',
  'hair-2', 'hair-3', 'hair-6',
  'jaw-2', 'jaw-5', 'jaw-8',
  'eyes-1', 'eyes-4',
  'body-1', 'body-2', 'body-6',
  'sleep-1', 'sleep-3',
  'nutrition-1', 'nutrition-2',
  'posture-1',
  'style-1', 'style-2',
  'habits-1', 'habits-2', 'habits-3',
]);

// ── Deep-dive questions (deep tier only) ─────────────────────────────────────
// Hyper-specific: each flag maps to an exact product or protocol in FIXES.
export const DEEP_QUESTIONS: SurveyQuestion[] = [
  // SKIN (10)
  {
    id: 'dskin-1', category: 'skin',
    text: 'Does your cleanser match your skin type?',
    options: [
      { label: 'Yes — chosen for my skin type', points: 10 },
      { label: 'No idea what type it is', points: 4, flags: ['wrong-cleanser'] },
      { label: 'I use bar soap / body wash on my face', points: 1, flags: ['wrong-cleanser'] },
    ],
  },
  {
    id: 'dskin-2', category: 'skin',
    text: 'What retinoid are you on?',
    options: [
      { label: 'Prescription tretinoin/adapalene', points: 10 },
      { label: 'OTC retinol', points: 8 },
      { label: 'None', points: 3, flags: ['no-actives'] },
    ],
  },
  {
    id: 'dskin-3', category: 'skin',
    text: 'Do you reapply sunscreen when outside more than 2 hours?',
    options: [
      { label: 'Yes — stick or spray on me', points: 10 },
      { label: 'One morning coat only', points: 5, flags: ['no-spf-reapply'] },
      { label: "I don't wear SPF at all", points: 0, flags: ['no-spf'] },
    ],
  },
  {
    id: 'dskin-4', category: 'skin',
    text: 'Do you use a vitamin C serum in the morning?',
    options: [
      { label: 'Yes, daily under SPF', points: 10 },
      { label: 'Own one, rarely use it', points: 5, flags: ['no-vitc'] },
      { label: 'No', points: 4, flags: ['no-vitc'] },
    ],
  },
  {
    id: 'dskin-5', category: 'skin',
    text: 'How often do you chemically exfoliate (AHA/BHA)?',
    options: [
      { label: '2–3× a week', points: 10 },
      { label: 'Daily — more is better, right?', points: 3, flags: ['over-exfoliation'] },
      { label: 'Never', points: 4, flags: ['no-exfoliation'] },
    ],
  },
  {
    id: 'dskin-6', category: 'skin',
    text: 'Does your moisturizer contain ceramides or is it just "lotion"?',
    options: [
      { label: 'Ceramide/barrier formula', points: 10 },
      { label: 'Whatever was cheapest', points: 5, flags: ['no-ceramides'] },
      { label: "I don't moisturize", points: 2, flags: ['no-routine'] },
    ],
  },
  {
    id: 'dskin-7', category: 'skin',
    text: 'Do you get razor burn or ingrown hairs after shaving?',
    options: [
      { label: 'No', points: 10 },
      { label: 'Sometimes on the neck', points: 5, flags: ['razor-burn'] },
      { label: 'Every shave', points: 2, flags: ['razor-burn'] },
    ],
  },
  {
    id: 'dskin-8', category: 'skin',
    text: 'How hot is the water you wash your face with?',
    options: [
      { label: 'Lukewarm/cool', points: 10 },
      { label: 'Warm', points: 7 },
      { label: 'Hot — shower-steam hot', points: 3, flags: ['hot-water-face'] },
    ],
  },
  {
    id: 'dskin-9', category: 'skin',
    text: 'Do you deal with persistent redness or flushing (cheeks, nose)?',
    options: [
      { label: 'No', points: 10 },
      { label: 'Occasional flushing', points: 6, flags: ['redness'] },
      { label: 'Constant visible redness', points: 2, flags: ['redness'] },
    ],
  },
  {
    id: 'dskin-10', category: 'skin',
    text: 'Lips: chapped or maintained?',
    options: [
      { label: 'Maintained — balm with SPF', points: 10 },
      { label: 'Balm when they crack', points: 6, flags: ['chapped'] },
      { label: 'Chronically chapped', points: 2, flags: ['chapped'] },
    ],
  },

  // HAIR (6)
  {
    id: 'dhair-1', category: 'hair',
    text: 'If your hair is thinning: are you treating it?',
    options: [
      { label: 'Not thinning', points: 10 },
      { label: 'Thinning + on minoxidil/finasteride', points: 8 },
      { label: 'Thinning + doing nothing', points: 1, flags: ['hair-loss-untreated'] },
    ],
  },
  {
    id: 'dhair-2', category: 'hair',
    text: 'Does your shampoo have harsh sulfates, and do you wash daily?',
    options: [
      { label: 'Gentle shampoo, 2–4×/week', points: 10 },
      { label: 'Whatever shampoo, daily', points: 5, flags: ['harsh-shampoo'] },
      { label: 'No idea what’s in it', points: 4, flags: ['harsh-shampoo'] },
    ],
  },
  {
    id: 'dhair-3', category: 'hair',
    text: 'Do you use heat (dryer, straightener) without protectant?',
    options: [
      { label: 'Heat protectant always / no heat', points: 10 },
      { label: 'Sometimes skip it', points: 6, flags: ['heat-damage'] },
      { label: 'Raw heat daily', points: 2, flags: ['heat-damage'] },
    ],
  },
  {
    id: 'dhair-4', category: 'hair',
    text: 'How do you dry your hair?',
    options: [
      { label: 'Pat dry / microfiber / air', points: 10 },
      { label: 'Vigorous towel scrub', points: 4, flags: ['hair-mechanical-damage'] },
      { label: 'Scrub + brush it soaking wet', points: 2, flags: ['hair-mechanical-damage'] },
    ],
  },
  {
    id: 'dhair-5', category: 'hair',
    text: 'Beard (if you grow one): is patchiness an issue?',
    options: [
      { label: 'No beard / fills in fine', points: 10 },
      { label: 'Patchy — I let it ride', points: 4, flags: ['beard-patchy'] },
      { label: 'Patchy — ruins the look', points: 2, flags: ['beard-patchy'] },
    ],
  },
  {
    id: 'dhair-6', category: 'hair',
    text: 'Between barber visits, do you maintain your neckline/edges?',
    options: [
      { label: 'Yes — own an edge trimmer', points: 10 },
      { label: 'Let it grow wild until the next cut', points: 4, flags: ['no-edge-tool'] },
    ],
  },

  // JAW & DENTAL (7)
  {
    id: 'djaw-1', category: 'jaw',
    text: 'Have you ever actually whitened your teeth?',
    options: [
      { label: 'Yes — strips/trays, maintained', points: 10 },
      { label: 'Once, years ago', points: 5, flags: ['never-whitened'] },
      { label: 'Never', points: 3, flags: ['never-whitened'] },
    ],
  },
  {
    id: 'djaw-2', category: 'jaw',
    text: 'How often do you floss (or water floss)?',
    options: [
      { label: 'Daily', points: 10 },
      { label: 'Few times a week', points: 6, flags: ['no-floss'] },
      { label: 'Basically never', points: 1, flags: ['no-floss'] },
    ],
  },
  {
    id: 'djaw-3', category: 'jaw',
    text: 'Electric or manual toothbrush?',
    options: [
      { label: 'Electric', points: 10 },
      { label: 'Manual, thorough', points: 7, flags: ['manual-brush'] },
      { label: 'Manual, 30-second scrub', points: 3, flags: ['manual-brush'] },
    ],
  },
  {
    id: 'djaw-4', category: 'jaw',
    text: 'Coffee, tea, or red wine — how do they hit your teeth?',
    options: [
      { label: 'Rarely drink them / use a straw + rinse', points: 10 },
      { label: 'Daily coffee, no countermeasures', points: 4, flags: ['staining-drinks'] },
      { label: 'Multiple staining drinks daily', points: 2, flags: ['staining-drinks'] },
    ],
  },
  {
    id: 'djaw-5', category: 'jaw',
    text: 'Do you scrape your tongue?',
    options: [
      { label: 'Daily', points: 10 },
      { label: 'Sometimes', points: 6 },
      { label: 'Never heard of it', points: 3, flags: ['no-tongue-scrape'] },
    ],
  },
  {
    id: 'djaw-6', category: 'jaw',
    text: 'Do your gums bleed when brushing or flossing?',
    options: [
      { label: 'No', points: 10 },
      { label: 'Occasionally', points: 5, flags: ['gum-health'] },
      { label: 'Regularly', points: 1, flags: ['gum-health'] },
    ],
  },
  {
    id: 'djaw-7', category: 'jaw',
    text: 'If you grind your teeth: do you wear a night guard?',
    options: [
      { label: "Don't grind", points: 10 },
      { label: 'Grind + wear a guard', points: 8 },
      { label: 'Grind + no guard', points: 2, flags: ['bruxism'] },
    ],
  },

  // EYES (6)
  {
    id: 'deyes-1', category: 'eyes',
    text: 'Do you rub your eyes a lot (allergies, habit)?',
    options: [
      { label: 'Rarely', points: 10 },
      { label: 'Allergy season only', points: 6, flags: ['eye-rubbing'] },
      { label: 'Constantly', points: 2, flags: ['eye-rubbing'] },
    ],
  },
  {
    id: 'deyes-2', category: 'eyes',
    text: 'Do you use an eye cream (caffeine or retinol-based)?',
    options: [
      { label: 'Yes, nightly', points: 10 },
      { label: 'Sporadically', points: 6, flags: ['no-eye-cream'] },
      { label: 'No', points: 4, flags: ['no-eye-cream'] },
    ],
  },
  {
    id: 'deyes-3', category: 'eyes',
    text: 'Your under-eyes: hollow/sunken, or puffy/baggy?',
    options: [
      { label: 'Neither, flat and smooth', points: 10 },
      { label: 'Hollow — visible tear trough', points: 4, flags: ['tear-trough'] },
      { label: 'Puffy bags', points: 4, flags: ['puffiness'] },
    ],
  },
  {
    id: 'deyes-4', category: 'eyes',
    text: 'Lashes and brows: thin or sparse?',
    options: [
      { label: 'Full', points: 10 },
      { label: 'Brows sparse at the tails', points: 5, flags: ['sparse-lashes'] },
      { label: 'Both thin/sparse', points: 3, flags: ['sparse-lashes'] },
    ],
  },
  {
    id: 'deyes-5', category: 'eyes',
    text: 'Long screen sessions: do you take breaks (20-20-20)?',
    options: [
      { label: 'Yes, regularly', points: 10 },
      { label: 'When I remember', points: 6 },
      { label: 'Hours of unbroken staring', points: 2, flags: ['eye-strain'] },
    ],
  },
  {
    id: 'deyes-6', category: 'eyes',
    text: 'If you wear glasses: do the frames fit your face shape?',
    options: [
      { label: 'Chosen for my face / no glasses', points: 10 },
      { label: 'Never considered frame shape', points: 5, flags: ['frames-mismatch'] },
      { label: 'They slide, sit crooked, wrong size', points: 3, flags: ['frames-mismatch'] },
    ],
  },

  // BODY (6)
  {
    id: 'dbody-1', category: 'body',
    text: 'Is your training progressive (adding weight/reps over time)?',
    options: [
      { label: 'Yes, tracked and progressing', points: 10 },
      { label: 'Same weights for months', points: 5, flags: ['no-progression'] },
      { label: "Don't train", points: 2, flags: ['no-training'] },
    ],
  },
  {
    id: 'dbody-2', category: 'body',
    text: 'Do you train your neck directly?',
    options: [
      { label: 'Yes, weekly', points: 10 },
      { label: 'No, but traps get work', points: 6 },
      { label: 'Never touched it', points: 4, flags: ['thin-neck'] },
    ],
  },
  {
    id: 'dbody-3', category: 'body',
    text: 'Do you take creatine?',
    options: [
      { label: 'Daily 5g', points: 10 },
      { label: 'On and off', points: 6, flags: ['no-creatine'] },
      { label: 'No', points: 5, flags: ['no-creatine'] },
    ],
  },
  {
    id: 'dbody-4', category: 'body',
    text: 'Do you train side delts and upper back for the V-taper?',
    options: [
      { label: 'Yes — lateral raises, rows, pull-ups', points: 10 },
      { label: 'Mostly chest and arms', points: 5, flags: ['no-vtaper'] },
      { label: "Don't train", points: 2, flags: ['no-training'] },
    ],
  },
  {
    id: 'dbody-5', category: 'body',
    text: 'Do you track progress (photos, tape measurements, scale trend)?',
    options: [
      { label: 'Yes, consistently', points: 10 },
      { label: 'Scale only', points: 6, flags: ['no-tracking'] },
      { label: 'Nothing tracked', points: 3, flags: ['no-tracking'] },
    ],
  },
  {
    id: 'dbody-6', category: 'body',
    text: 'Daily step count?',
    options: [
      { label: '8k+', points: 10 },
      { label: '4–8k', points: 6 },
      { label: 'Under 4k', points: 2, flags: ['sedentary'] },
    ],
  },

  // SLEEP (5)
  {
    id: 'dsleep-1', category: 'sleep',
    text: 'Alcohol within 3 hours of bed?',
    options: [
      { label: 'Never / rarely', points: 10 },
      { label: 'Weekends', points: 5, flags: ['alcohol-sleep'] },
      { label: 'Most nights', points: 1, flags: ['alcohol-sleep'] },
    ],
  },
  {
    id: 'dsleep-2', category: 'sleep',
    text: 'What is your pillowcase made of?',
    options: [
      { label: 'Silk/satin', points: 10 },
      { label: 'Cotton, washed weekly', points: 7 },
      { label: 'Cotton, rarely washed', points: 2, flags: ['cotton-pillowcase', 'dirty-pillowcase'] },
    ],
  },
  {
    id: 'dsleep-3', category: 'sleep',
    text: 'Do you get sunlight within 30 minutes of waking?',
    options: [
      { label: 'Most days', points: 10 },
      { label: 'Sometimes', points: 6 },
      { label: 'Phone in bed, blinds closed', points: 2, flags: ['no-daylight'] },
    ],
  },
  {
    id: 'dsleep-4', category: 'sleep',
    text: 'Bedroom temperature at night?',
    options: [
      { label: 'Cool (18–20°C / 65–68°F)', points: 10 },
      { label: 'Warm but tolerable', points: 6 },
      { label: 'Hot / stuffy', points: 2, flags: ['sleep-environment'] },
    ],
  },
  {
    id: 'dsleep-5', category: 'sleep',
    text: 'Head position: flat, one pillow, or stacked pillows?',
    options: [
      { label: 'One supportive pillow, neutral neck', points: 10 },
      { label: 'Two+ stacked pillows', points: 4, flags: ['pillow-height'] },
      { label: 'Face-down in the pillow', points: 2, flags: ['stomach-sleeping'] },
    ],
  },

  // NUTRITION (6)
  {
    id: 'dnut-1', category: 'nutrition',
    text: 'Omega-3s: fatty fish 2×/week or a supplement?',
    options: [
      { label: 'Yes', points: 10 },
      { label: 'Occasionally', points: 6, flags: ['no-omega3'] },
      { label: 'Neither', points: 3, flags: ['no-omega3'] },
    ],
  },
  {
    id: 'dnut-2', category: 'nutrition',
    text: 'Vitamin D: tested or supplemented?',
    options: [
      { label: 'Tested and in range / supplementing', points: 10 },
      { label: 'No idea, lots of sun though', points: 6 },
      { label: 'Never tested, no supplement, indoors', points: 3, flags: ['no-vitd'] },
    ],
  },
  {
    id: 'dnut-3', category: 'nutrition',
    text: 'Collagen-supporting protein (bone broth, gelatin, glycine)?',
    options: [
      { label: 'Regular part of diet', points: 10 },
      { label: 'Rarely', points: 6, flags: ['low-collagen-aa'] },
      { label: 'Never — muscle meat only', points: 4, flags: ['low-collagen-aa'] },
    ],
  },
  {
    id: 'dnut-4', category: 'nutrition',
    text: 'Liquid calories: sodas, juices, sweet coffees per day?',
    options: [
      { label: 'Zero to one', points: 10 },
      { label: 'Two', points: 5, flags: ['sugar'] },
      { label: 'Three or more', points: 1, flags: ['sugar'] },
    ],
  },
  {
    id: 'dnut-5', category: 'nutrition',
    text: 'Have you ever crash-dieted (very low calories, fast loss)?',
    options: [
      { label: 'No, steady habits', points: 10 },
      { label: 'Once or twice', points: 6, flags: ['crash-diet'] },
      { label: 'It’s my pattern', points: 2, flags: ['crash-diet'] },
    ],
  },
  {
    id: 'dnut-6', category: 'nutrition',
    text: 'Late-night eating (within 2h of bed)?',
    options: [
      { label: 'Rarely', points: 10 },
      { label: 'Sometimes', points: 6 },
      { label: 'Every night — wake up puffy', points: 2, flags: ['sodium'] },
    ],
  },

  // POSTURE (4)
  {
    id: 'dpos-1', category: 'posture',
    text: 'Is your monitor/laptop at eye level?',
    options: [
      { label: 'Yes — riser or stand', points: 10 },
      { label: 'Slightly below', points: 6, flags: ['tech-neck'] },
      { label: 'Laptop flat on a desk/lap all day', points: 2, flags: ['tech-neck'] },
    ],
  },
  {
    id: 'dpos-2', category: 'posture',
    text: 'Do you do chin tucks or deep neck flexor work?',
    options: [
      { label: 'Yes, part of my routine', points: 10 },
      { label: 'Know about them, don’t do them', points: 5, flags: ['forward-head'] },
      { label: 'Never heard of them', points: 4, flags: ['forward-head'] },
    ],
  },
  {
    id: 'dpos-3', category: 'posture',
    text: 'Hours seated without standing up?',
    options: [
      { label: 'Break every 30–60 min', points: 10 },
      { label: '2–3 hour blocks', points: 5, flags: ['sedentary'] },
      { label: 'Marathon 4h+ sits', points: 2, flags: ['sedentary'] },
    ],
  },
  {
    id: 'dpos-4', category: 'posture',
    text: 'In candid photos, is your head jutting forward?',
    options: [
      { label: 'No, stacked and tall', points: 10 },
      { label: 'Sometimes', points: 5, flags: ['forward-head'] },
      { label: 'Every photo', points: 1, flags: ['forward-head'] },
    ],
  },

  // STYLE (5)
  {
    id: 'dstyle-1', category: 'style',
    text: 'Have you ever had anything tailored?',
    options: [
      { label: 'Yes — key pieces are tailored', points: 10 },
      { label: 'No, but sizes fit okay', points: 6, flags: ['no-tailor'] },
      { label: 'Everything off the rack, baggy', points: 2, flags: ['no-tailor', 'fit'] },
    ],
  },
  {
    id: 'dstyle-2', category: 'style',
    text: 'Do your sunglasses flatter your face shape?',
    options: [
      { label: 'Yes, picked deliberately', points: 10 },
      { label: 'Gas station specials', points: 5, flags: ['frames-mismatch'] },
      { label: 'Don’t wear any', points: 6 },
    ],
  },
  {
    id: 'dstyle-3', category: 'style',
    text: 'Shoes: clean and maintained?',
    options: [
      { label: 'Clean, shaped, rotated', points: 10 },
      { label: 'Decent but tired', points: 6 },
      { label: 'Beat up', points: 2, flags: ['grooming-neglect'] },
    ],
  },
  {
    id: 'dstyle-4', category: 'style',
    text: 'Hands: nails, cuticles, skin — maintained?',
    options: [
      { label: 'Yes — filed, cuticle oil, hand cream', points: 10 },
      { label: 'Clipped when long', points: 6 },
      { label: 'Bitten / cracked / neglected', points: 2, flags: ['chapped', 'grooming-neglect'] },
    ],
  },
  {
    id: 'dstyle-5', category: 'style',
    text: 'Clothes care: steamer/iron, lint roller, de-piller?',
    options: [
      { label: 'Own and use them', points: 10 },
      { label: 'Iron in emergencies', points: 6 },
      { label: 'Wrinkled is my texture', points: 2, flags: ['clothes-care'] },
    ],
  },

  // HABITS (5)
  {
    id: 'dhab-1', category: 'habits',
    text: 'Do you take progress photos (face + body)?',
    options: [
      { label: 'Monthly, same lighting', points: 10 },
      { label: 'Random selfies count?', points: 5, flags: ['no-tracking'] },
      { label: 'Never', points: 4, flags: ['no-tracking'] },
    ],
  },
  {
    id: 'dhab-2', category: 'habits',
    text: 'Daily grooming time (shower aside)?',
    options: [
      { label: '10–20 min — routine runs itself', points: 10 },
      { label: '5 min rush', points: 6 },
      { label: 'Roll out of bed and go', points: 2, flags: ['grooming-neglect'] },
    ],
  },
  {
    id: 'dhab-3', category: 'habits',
    text: 'How is your hydration tracked?',
    options: [
      { label: 'Bottle with me all day', points: 10 },
      { label: 'Drink when thirsty', points: 6, flags: ['dehydration'] },
      { label: 'Mostly coffee and soda', points: 2, flags: ['dehydration'] },
    ],
  },
  {
    id: 'dhab-4', category: 'habits',
    text: 'Monthly budget you could put toward looksmaxxing?',
    options: [
      { label: 'Under $25 — fundamentals only', points: 10 },
      { label: '$25–100', points: 10 },
      { label: '$100–300', points: 10 },
      { label: '$300+ — give me everything', points: 10 },
    ],
  },
  {
    id: 'dhab-5', category: 'habits',
    text: 'Biggest blocker to following a plan?',
    options: [
      { label: 'Nothing — just need the plan', points: 10 },
      { label: 'Time', points: 7, flags: ['consistency'] },
      { label: 'Money', points: 7 },
      { label: 'Motivation', points: 5, flags: ['consistency'] },
    ],
  },
];

export const ALL_QUESTIONS: SurveyQuestion[] = [...QUESTIONS, ...DEEP_QUESTIONS];

/** Question list for a tier, grouped so categories stay contiguous. */
export function getQuestionsForTier(tier: SurveyTier): SurveyQuestion[] {
  const pool =
    tier === 'quick'
      ? QUESTIONS.filter((q) => QUICK_IDS.has(q.id))
      : tier === 'full'
      ? QUESTIONS
      : ALL_QUESTIONS;
  return CATEGORIES.flatMap((c) => pool.filter((q) => q.category === c.id));
}

// ── Scoring helpers ──────────────────────────────────────────────────────────
export interface SurveyResult {
  categoryScores: Record<CategoryId, number>; // 0–100
  overallScore: number;                        // 0–100
  flags: string[];                             // deduped, in question order
}

export function scoreSurvey(answers: Record<string, number>): SurveyResult {
  const byCategory: Record<string, { earned: number; max: number }> = {};
  const flags: string[] = [];

  for (const q of ALL_QUESTIONS) {
    const idx = answers[q.id];
    if (idx === undefined || !q.options[idx]) continue;
    const opt = q.options[idx];
    const cat = (byCategory[q.category] ||= { earned: 0, max: 0 });
    cat.earned += opt.points;
    cat.max += 10;
    for (const f of opt.flags ?? []) {
      if (!flags.includes(f)) flags.push(f);
    }
  }

  const categoryScores = {} as Record<CategoryId, number>;
  let total = 0;
  let count = 0;
  for (const c of CATEGORIES) {
    const bucket = byCategory[c.id];
    const score = bucket && bucket.max > 0 ? Math.round((bucket.earned / bucket.max) * 100) : 0;
    categoryScores[c.id] = score;
    if (bucket && bucket.max > 0) {
      total += score;
      count++;
    }
  }

  return {
    categoryScores,
    overallScore: count > 0 ? Math.round(total / count) : 0,
    flags,
  };
}
