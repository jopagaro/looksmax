// Physical products, devices, and tools for appearance — the gear side of the index.
// outcome: 'durable' = lasting biological/physical change, 'temporary' = only while used, 'unsupported' = the structural claim has no evidence.

import { Evidence } from './compounds';

export type GearCategory =
  | 'teeth'
  | 'faceDevices'
  | 'hairGear'
  | 'grooming'
  | 'hairRemoval'
  | 'training'
  | 'posture'
  | 'tanGear'
  | 'bodyCare'
  | 'sleep'
  | 'style';

export type Outcome = 'durable' | 'temporary' | 'unsupported';

export interface GearItem {
  name: string;
  category: GearCategory;
  evidence: Evidence;
  outcome: Outcome;
  summary: string;
  note?: string;
  /** Rough street price, shown on the card. */
  price?: string;
  /** Product photo URL — to be added later. */
  image?: string;
  /** Affiliate / store link — to be added later. */
  buyLink?: string;
}

export const GEAR_CATEGORY_META: Record<GearCategory, { name: string; blurb: string }> = {
  teeth: { name: 'Teeth & Smile', blurb: 'Whitening works. Jaw gadgets mostly don’t.' },
  faceDevices: { name: 'Face Devices', blurb: 'LED and lasers have data. Straps and clips don’t.' },
  hairGear: { name: 'Hair & Scalp', blurb: 'Laser caps, fibers, and the right cut' },
  grooming: { name: 'Grooming', blurb: 'Beard, brows, lashes — high ROI, zero biology' },
  hairRemoval: { name: 'Hair Removal', blurb: 'IPL is one of the most credible device categories' },
  training: { name: 'Training', blurb: 'The best evidence-to-cost ratio in this whole catalog' },
  posture: { name: 'Posture & Frame', blurb: 'Neck, shoulders, and apparent height' },
  tanGear: { name: 'Tan & SPF', blurb: 'Fake the tan, block the sun' },
  bodyCare: { name: 'Body & Nails', blurb: 'Hands, feet, scars, body skin' },
  sleep: { name: 'Sleep & Environment', blurb: 'Sleep is the realest looksmax there is' },
  style: { name: 'Fit & Style', blurb: 'Not biology — often more visible than anything above' },
};

export const OUTCOME_META: Record<Outcome, { label: string }> = {
  durable: { label: 'Lasting change' },
  temporary: { label: 'While you use it' },
  unsupported: { label: 'Claim unsupported' },
};

export const GEAR: GearItem[] = [
  // ───────────── TEETH & SMILE ─────────────
  { name: 'Whitening strips', category: 'teeth', evidence: 'strong', outcome: 'durable', price: '$38', summary: 'Peroxide bleaching that actually lifts tooth discoloration. ADA-backed, highest-confidence cosmetic buy.' },
  { name: 'Whitening gel trays', category: 'teeth', evidence: 'strong', outcome: 'durable', price: '$30–60', summary: 'More even peroxide coverage than strips; dentist-fitted trays are the top tier.' },
  { name: 'LED whitening kit', category: 'teeth', evidence: 'limited', outcome: 'durable', price: '$40–80', summary: 'The peroxide does the work.', note: 'The blue light adds little beyond the gel alone.' },
  { name: 'Electric toothbrush', category: 'teeth', evidence: 'strong', outcome: 'durable', price: '$70', summary: 'Better plaque removal and gum health than manual brushing.' },
  { name: 'Water flosser', category: 'teeth', evidence: 'strong', outcome: 'durable', price: '$50', summary: 'Interdental cleaning and gum health — healthy gums frame the smile.' },
  { name: 'Tongue scraper', category: 'teeth', evidence: 'moderate', outcome: 'temporary', price: '$8', summary: 'Removes tongue coating; fresher breath for a few hours.' },
  { name: 'Clear aligners', category: 'teeth', evidence: 'strong', outcome: 'durable', price: '$$$$', summary: 'Actually moves teeth and fixes bite in suitable cases.', note: 'Dentist territory — not a DIY purchase.' },
  { name: 'Bruxism night guard', category: 'teeth', evidence: 'strong', outcome: 'durable', price: '$15–120', summary: 'Stops grinding from flattening your teeth over the years.' },
  { name: 'Jaw exerciser', category: 'teeth', evidence: 'unproven', outcome: 'unsupported', price: '$20–30', summary: 'Works the chewing muscles, sure — but bigger masseters make the lower face wider, not sharper.', note: 'Overuse can aggravate TMJ. The marketing outruns the anatomy.' },
  { name: 'Mastic / hard gum', category: 'teeth', evidence: 'limited', outcome: 'unsupported', price: '$15–25', summary: 'Masseter workout in gum form. Jawline effects uncertain, same width-vs-definition problem.' },
  { name: 'Mouth tape', category: 'teeth', evidence: 'unproven', outcome: 'unsupported', price: '$10–20', summary: 'Encourages nasal breathing at night. Adult jaw remodeling claims: unsupported.', note: 'Risky if you have undiagnosed sleep apnea — rule that out first.' },
  { name: 'Mewing appliances', category: 'teeth', evidence: 'unproven', outcome: 'unsupported', price: '$20–200', summary: 'Marketed for palate/jaw remodeling. No adult skeletal change without real orthodontic treatment.' },

  // ───────────── FACE DEVICES ─────────────
  { name: 'Red light LED mask', category: 'faceDevices', evidence: 'moderate', outcome: 'durable', price: '$200–450', summary: 'Photobiomodulation for fine lines, tone, and texture — one of the few device categories with decent trial data.' },
  { name: 'Blue light acne device', category: 'faceDevices', evidence: 'moderate', outcome: 'durable', price: '$30–150', summary: 'Reduces some inflammatory acne lesions.' },
  { name: 'At-home fractional laser', category: 'faceDevices', evidence: 'moderate', outcome: 'durable', price: '$400+', summary: 'Fine lines and texture; the strongest home-device category in the 2026 review — device-dependent.' },
  { name: 'RF skin-tightening device', category: 'faceDevices', evidence: 'moderate', outcome: 'durable', price: '$100–400', summary: 'Modest, real tightening with consistent use.' },
  { name: 'Microcurrent device', category: 'faceDevices', evidence: 'limited', outcome: 'temporary', price: '$150–400', summary: 'The "lifted" look is real — and gone by tomorrow.' },
  { name: 'Multi-head facial tool', category: 'faceDevices', evidence: 'limited', outcome: 'temporary', price: '$420', summary: 'TheraFace-type all-in-ones: the LED head has data, the microcurrent head mostly has marketing.' },
  { name: 'Sonic cleansing brush', category: 'faceDevices', evidence: 'moderate', outcome: 'temporary', price: '$30–200', summary: 'Better debris and makeup removal than hands.' },
  { name: 'Dermaplaning razor', category: 'faceDevices', evidence: 'strong', outcome: 'temporary', price: '$10–20', summary: 'Instant peach-fuzz removal and smoother makeup/skin surface.' },
  { name: 'Derma roller (home)', category: 'faceDevices', evidence: 'limited', outcome: 'unsupported', price: '$10–30', summary: 'Professional microneedling has real collagen data. Home rolling is weak — plus an infection risk.', note: 'The 2026 device review called home microneedling out specifically.' },
  { name: 'Gua sha stone', category: 'faceDevices', evidence: 'limited', outcome: 'temporary', price: '$10–25', summary: 'Massage and transient fluid movement. Pleasant; fleeting.' },
  { name: 'Ice roller', category: 'faceDevices', evidence: 'moderate', outcome: 'temporary', price: '$10–20', summary: 'Real short-term depuff. Morning-of-event tool.' },
  { name: 'Pimple patches', category: 'faceDevices', evidence: 'moderate', outcome: 'temporary', price: '$5–15', summary: 'Hydrocolloid protects the spot, absorbs drainage, stops you picking.' },
  { name: 'Silicone scar sheets', category: 'faceDevices', evidence: 'moderate', outcome: 'durable', price: '$10–30', summary: 'Genuinely improves some raised scars with consistent wear.' },
  { name: 'Under-eye cooling mask', category: 'faceDevices', evidence: 'moderate', outcome: 'temporary', price: '$10–25', summary: 'Temporarily shrinks morning puffiness.' },
  { name: 'High-frequency wand', category: 'faceDevices', evidence: 'unproven', outcome: 'unsupported', price: '$30–60', summary: 'Purple lightning, weak evidence.' },
  { name: 'Face slimming strap', category: 'faceDevices', evidence: 'unproven', outcome: 'unsupported', price: '$10–25', summary: 'Compression does not melt fat or move bone. Full stop.' },
  { name: 'Nose reshaping clip', category: 'faceDevices', evidence: 'unproven', outcome: 'unsupported', price: '$10–20', summary: 'Adult cartilage does not care about a clothespin.' },
  { name: 'Facial lifting tape', category: 'faceDevices', evidence: 'strong', outcome: 'temporary', price: '$10–20', summary: 'Physically pulls skin into place. Works exactly until you take it off.' },
  { name: 'Lip plumping device', category: 'faceDevices', evidence: 'limited', outcome: 'temporary', price: '$10–25', summary: 'Suction swelling for a few hours. Bruising risk if you get greedy.' },
  { name: 'Facial exerciser', category: 'faceDevices', evidence: 'unproven', outcome: 'unsupported', price: '$15–40', summary: 'Cheek/smile trainers — weak evidence for any aesthetic outcome.' },

  // ───────────── HAIR & SCALP ─────────────
  { name: 'Laser hair-growth cap', category: 'hairGear', evidence: 'moderate', outcome: 'durable', price: '$200–1200', summary: 'FDA-cleared low-level light devices measurably improve density in pattern hair loss.', note: 'Per the AAD: helps, but won’t restore a full head of hair.' },
  { name: 'Laser comb', category: 'hairGear', evidence: 'moderate', outcome: 'durable', price: '$100–400', summary: 'Same photobiomodulation idea, cheaper and slower to use.' },
  { name: 'Scalp massager', category: 'hairGear', evidence: 'limited', outcome: 'temporary', price: '$8–15', summary: 'Feels incredible. Will not regrow hair.' },
  { name: 'Scalp microneedling roller', category: 'hairGear', evidence: 'limited', outcome: 'unsupported', price: '$10–30', summary: 'Marketed to boost minoxidil response; home evidence is thin.' },
  { name: 'Hair fibers', category: 'hairGear', evidence: 'strong', outcome: 'temporary', price: '$20–30', summary: 'Instant density illusion. The single best cosmetic trick for thinning hair.' },
  { name: 'Hairline concealer / powder', category: 'hairGear', evidence: 'strong', outcome: 'temporary', price: '$10–25', summary: 'Fills the hairline and part visually.' },
  { name: 'Thickening spray', category: 'hairGear', evidence: 'strong', outcome: 'temporary', price: '$10–25', summary: 'Fatter-looking strands until the next wash.' },
  { name: 'Pro clippers + edge trimmer', category: 'hairGear', evidence: 'strong', outcome: 'temporary', price: '$40–150', summary: 'A sharp lineup and maintained cut is a top-3 ROI purchase, period.' },
  { name: 'Blow dryer + round brush', category: 'hairGear', evidence: 'strong', outcome: 'temporary', price: '$30–100', summary: 'Root lift and volume that flat air-drying never gives you.' },
  { name: 'Silk pillowcase', category: 'hairGear', evidence: 'limited', outcome: 'temporary', price: '$20–50', summary: 'Less friction on hair and skin overnight. Modest but cheap.' },

  // ───────────── GROOMING ─────────────
  { name: 'Precision beard trimmer', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$30–100', summary: 'Length control and symmetry — the foundation of every good beard.' },
  { name: 'Beard shaping guide', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$10–15', summary: 'Consistent cheek and neck lines every time.' },
  { name: 'Safety razor', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$20–40', summary: 'Closer shave, fewer ingrowns than cartridge razors for many.' },
  { name: 'Beard oil', category: 'grooming', evidence: 'moderate', outcome: 'temporary', price: '$10–25', summary: 'Softens and conditions; fixes the scratchy look.' },
  { name: 'Beard balm', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$12–25', summary: 'Shape and flyaway control that holds all day.' },
  { name: 'Heated beard straightener', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$25–60', summary: 'Turns wiry chaos into a deliberate beard.' },
  { name: 'Beard dye', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$10–20', summary: 'Evens patchy color, hides gray.' },
  { name: 'Brow tweezers + scissors', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$10–25', summary: 'Clean brows change the whole eye area. Don’t over-pluck.' },
  { name: 'Brow tint kit', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$10–20', summary: 'Darker brows read as denser brows.' },
  { name: 'Brow lamination kit', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$15–30', summary: 'Redirects brow hairs up and out for weeks.' },
  { name: 'Clear brow gel', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$5–15', summary: 'Holds the shape all day. Cheapest item on this list that people notice.' },
  { name: 'Eyelash curler', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$5–20', summary: 'Opens the eyes instantly.' },
  { name: 'Lash lift kit', category: 'grooming', evidence: 'strong', outcome: 'temporary', price: '$15–35', summary: 'Weeks-long lash curl.', note: 'Eye-area chemistry — follow instructions exactly; irritation risk.' },
  { name: 'Beard growth roller', category: 'grooming', evidence: 'unproven', outcome: 'unsupported', price: '$10–25', summary: 'If anything grows beard, it’s the minoxidil people use alongside it — not the roller.' },

  // ───────────── HAIR REMOVAL ─────────────
  { name: 'IPL hair removal device', category: 'hairRemoval', evidence: 'strong', outcome: 'durable', price: '$350', summary: 'Clinical trials show real, lasting hair-count reduction. One of the most credible device categories.', note: 'Works best with light skin + dark hair; not suitable for every skin tone.' },
  { name: 'Home laser hair removal', category: 'hairRemoval', evidence: 'moderate', outcome: 'durable', price: '$200–400', summary: 'Diode-laser cousins of IPL; similar caveats.' },
  { name: 'Electric body groomer', category: 'hairRemoval', evidence: 'strong', outcome: 'temporary', price: '$40–80', summary: 'Chest, abs, back — trimmed, not bare.' },
  { name: 'Nose + ear trimmer', category: 'hairRemoval', evidence: 'strong', outcome: 'temporary', price: '$15–30', summary: 'Nobody should ever see nose hair. $15 solves it forever.' },
  { name: 'Epilator', category: 'hairRemoval', evidence: 'strong', outcome: 'temporary', price: '$40–100', summary: 'Pulls from the root — weeks of smooth, at the cost of some pain.' },
  { name: 'Wax kit', category: 'hairRemoval', evidence: 'strong', outcome: 'temporary', price: '$25–60', summary: 'Weeks of hair-free skin.' },
  { name: 'Depilatory cream', category: 'hairRemoval', evidence: 'strong', outcome: 'temporary', price: '$8–15', summary: 'Dissolves surface hair painlessly. Patch-test first.' },

  // ───────────── TRAINING ─────────────
  { name: 'Adjustable dumbbells', category: 'training', evidence: 'strong', outcome: 'durable', price: '$150–400', summary: 'Progressive overload at home. The single best evidence-to-cost ratio in this entire catalog.' },
  { name: 'Resistance bands', category: 'training', evidence: 'strong', outcome: 'durable', price: '$15–40', summary: 'Real hypertrophy stimulus for the price of lunch. Also the fix for posture muscles.' },
  { name: 'Pull-up bar', category: 'training', evidence: 'strong', outcome: 'durable', price: '$25–40', summary: 'Back and shoulder width — the V-taper that changes how clothes fit.' },
  { name: 'Barbell + plates', category: 'training', evidence: 'strong', outcome: 'durable', price: '$200+', summary: 'The gold standard for progressive overload.' },
  { name: 'Kettlebells', category: 'training', evidence: 'strong', outcome: 'durable', price: '$30–100', summary: 'Strength + conditioning in one lump of iron.' },
  { name: 'Dip bars', category: 'training', evidence: 'strong', outcome: 'durable', price: '$40–80', summary: 'Chest, shoulders, triceps with bodyweight.' },
  { name: 'Ab wheel', category: 'training', evidence: 'strong', outcome: 'durable', price: '$15–25', summary: 'Brutal, effective core training. The abs still come from the kitchen.' },
  { name: 'Weighted vest', category: 'training', evidence: 'strong', outcome: 'durable', price: '$40–120', summary: 'Scales bodyweight work and walks.' },
  { name: 'Jump rope', category: 'training', evidence: 'strong', outcome: 'durable', price: '$10–25', summary: 'Conditioning and calf development for pocket change.' },
  { name: 'Walking pad', category: 'training', evidence: 'strong', outcome: 'durable', price: '$150–400', summary: 'Quietly adds thousands of fat-burning steps to desk days.' },
  { name: 'Smart scale', category: 'training', evidence: 'moderate', outcome: 'durable', price: '$25–60', summary: 'Weight trends: reliable. Body-fat % reading: noisy — watch the trend, not the number.' },
  { name: 'Measuring tape', category: 'training', evidence: 'strong', outcome: 'durable', price: '$5', summary: 'Waist, chest, arms. The most honest progress tracker ever made.' },
  { name: 'EMS ab belt', category: 'training', evidence: 'unproven', outcome: 'unsupported', price: '$30–200', summary: 'Muscles twitch; physiques don’t change. Abs come from barbells and a deficit.' },
  { name: 'Waist trainer', category: 'training', evidence: 'unproven', outcome: 'temporary', price: '$20–50', summary: 'Compression while worn. Zero fat loss, zero reshaping.' },

  // ───────────── POSTURE & FRAME ─────────────
  { name: 'Posture corrector brace', category: 'posture', evidence: 'limited', outcome: 'temporary', price: '$15–40', summary: 'A reminder, not a fix. The fix is training the muscles (see: resistance bands).' },
  { name: 'Foam roller', category: 'posture', evidence: 'moderate', outcome: 'temporary', price: '$15–40', summary: 'Short-term mobility and thoracic extension work.' },
  { name: 'Neck training harness', category: 'posture', evidence: 'moderate', outcome: 'durable', price: '$20–40', summary: 'Actually builds neck muscle. A thicker neck changes how the whole head sits on camera.', note: 'Load it slowly — necks don’t forgive ego lifting.' },
  { name: 'Chin tuck trainer', category: 'posture', evidence: 'limited', outcome: 'durable', price: '$15–30', summary: 'Deep neck flexor work; helps the forward-head-posture profile.' },
  { name: 'Cervical pillow', category: 'posture', evidence: 'limited', outcome: 'temporary', price: '$30–70', summary: 'Neck position support at night. Hit or miss by sleeper.' },
  { name: 'Standing desk / riser', category: 'posture', evidence: 'moderate', outcome: 'durable', price: '$30–400', summary: 'Posture variation beats any single "perfect" position.' },
  { name: 'Shoe lifts / elevator shoes', category: 'posture', evidence: 'strong', outcome: 'temporary', price: '$15–200', summary: 'Instant +2–3cm (inserts) to +7cm (elevator shoes) while worn.' },

  // ───────────── TAN & SPF ─────────────
  { name: 'Self-tanning mousse', category: 'tanGear', evidence: 'strong', outcome: 'temporary', price: '$10–30', summary: 'DHA color without a single UV photon. Lasts about a week.' },
  { name: 'Self-tanning drops', category: 'tanGear', evidence: 'strong', outcome: 'temporary', price: '$15–35', summary: 'Mix into moisturizer, dial in the depth.' },
  { name: 'Tanning mitt', category: 'tanGear', evidence: 'strong', outcome: 'temporary', price: '$5–10', summary: 'The difference between a tan and orange palms.' },
  { name: 'Tinted facial SPF', category: 'tanGear', evidence: 'strong', outcome: 'durable', price: '$15–40', summary: 'UV protection + tone correction daily. The highest-ROI skincare purchase, full stop.' },
  { name: 'Broad-spectrum sunscreen', category: 'tanGear', evidence: 'strong', outcome: 'durable', price: '$10–25', summary: 'The #1 proven anti-aging product on earth. Everything else is a rounding error.' },
  { name: 'UV-protective sunglasses', category: 'tanGear', evidence: 'strong', outcome: 'durable', price: '$20+', summary: 'Protects the eye area — where wrinkles show first. Also squinting causes crow’s feet.' },
  { name: 'UV tanning bed', category: 'tanGear', evidence: 'strong', outcome: 'temporary', price: '—', summary: 'Yes, it tans you.', note: 'Also carcinogenic and the fastest way to buy wrinkles. Hard skip — use DHA.' },

  // ───────────── BODY & NAILS ─────────────
  { name: 'Glass nail file + buffer', category: 'bodyCare', evidence: 'strong', outcome: 'temporary', price: '$8–15', summary: 'Clean, shaped nails. People notice hands more than you think.' },
  { name: 'Cuticle oil pen', category: 'bodyCare', evidence: 'moderate', outcome: 'temporary', price: '$8–12', summary: 'Conditioned cuticles finish the look.' },
  { name: 'Electric foot file', category: 'bodyCare', evidence: 'strong', outcome: 'temporary', price: '$15–30', summary: 'Smooth heels in minutes.' },
  { name: 'Korean exfoliating mitt', category: 'bodyCare', evidence: 'strong', outcome: 'temporary', price: '$6–12', summary: 'Aggressive, satisfying full-body exfoliation.' },
  { name: 'Dry brush', category: 'bodyCare', evidence: 'limited', outcome: 'temporary', price: '$10–20', summary: 'Fine exfoliation. The lymph-drainage claims are marketing.' },
  { name: 'Silicone scar tape', category: 'bodyCare', evidence: 'moderate', outcome: 'durable', price: '$10–30', summary: 'Flattens some raised scars over months of wear.' },

  // ───────────── SLEEP & ENVIRONMENT ─────────────
  { name: 'Blackout curtains', category: 'sleep', evidence: 'strong', outcome: 'durable', price: '$25–80', summary: 'Deep sleep is when skin repairs and hormones reset. Darkness is step one.' },
  { name: 'Sleep mask', category: 'sleep', evidence: 'strong', outcome: 'durable', price: '$10–30', summary: 'Blackout curtains for your face.' },
  { name: 'Humidifier', category: 'sleep', evidence: 'moderate', outcome: 'durable', price: '$30–80', summary: 'Dry indoor air dries skin. Especially in winter.' },
  { name: 'White noise machine', category: 'sleep', evidence: 'moderate', outcome: 'durable', price: '$20–50', summary: 'Fewer wake-ups in noisy environments.' },
  { name: 'Cooling eye mask', category: 'sleep', evidence: 'moderate', outcome: 'temporary', price: '$10–25', summary: 'Morning depuff in 10 minutes.' },
  { name: 'Nasal dilator / strips', category: 'sleep', evidence: 'moderate', outcome: 'temporary', price: '$10–25', summary: 'Better nasal airflow for some sleepers. Airflow — not jaw development.' },
  { name: 'Sunrise alarm clock', category: 'sleep', evidence: 'moderate', outcome: 'durable', price: '$30–120', summary: 'Consistent wake time → consistent sleep → better face.' },
  { name: 'Anti-wrinkle pillow', category: 'sleep', evidence: 'unproven', outcome: 'unsupported', price: '$40–100', summary: 'The sleep-compression theory is plausible; the product evidence is weak. Back-sleeping is free.' },

  // ───────────── FIT & STYLE ─────────────
  { name: 'Tailoring (any clothes)', category: 'style', evidence: 'strong', outcome: 'temporary', price: '$15–40/item', summary: 'The biggest instant upgrade per dollar in existence. Fit beats brand every time.' },
  { name: 'Clothes steamer', category: 'style', evidence: 'strong', outcome: 'temporary', price: '$25–60', summary: 'Wrinkled shirt = unmade bed. 90 seconds fixes it.' },
  { name: 'Fabric shaver', category: 'style', evidence: 'strong', outcome: 'temporary', price: '$10–20', summary: 'De-pills sweaters back to new.' },
  { name: 'Compression undershirt', category: 'style', evidence: 'strong', outcome: 'temporary', price: '$20–50', summary: 'Smoother torso silhouette under fitted clothes, instantly.' },
  { name: 'Collar stays', category: 'style', evidence: 'strong', outcome: 'temporary', price: '$8–15', summary: 'Crisp collars frame the face.' },
  { name: 'Shoe trees + polish kit', category: 'style', evidence: 'strong', outcome: 'temporary', price: '$20–40', summary: 'People read shoes. Keep them sharp.' },
  { name: 'Good sunglasses', category: 'style', evidence: 'strong', outcome: 'temporary', price: '$20+', summary: 'Reframes facial proportions instantly — pick the shape that balances yours.' },
];
