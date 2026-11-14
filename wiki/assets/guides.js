// Hand-written wiki articles. Body HTML supports wiki links:
//   [[Tretinoin]]              → links to that Index entry (compound or gear, by exact name)
//   [[Tretinoin|the gold standard]]  → same, custom label
//   [[guide:skincare|Skincare 101]]  → links to another guide
//   [[cat:skin|Skin & Wrinkles]]     → links to a category page (compound or gear id)
window.LM_GUIDES = [
  {
    slug: 'what-is-looksmaxxing',
    title: 'What Is Looksmaxxing',
    kicker: 'Start here',
    summary: 'The term, the two camps, and the honest order of operations.',
    sections: [
      {
        h: 'Definition',
        body: `<p><b>Looksmaxxing</b> is the practice of deliberately improving your appearance to its realistic ceiling. The word came out of online forums, but the underlying idea is old: grooming, fitness, skincare, and style, done on purpose instead of by accident.</p>
<p>This wiki takes one position above all others: <b>evidence first</b>. Every entry in [[guide:index-explained|The Index]] is rated by what studies actually show, not by what a product page claims.</p>`,
      },
      {
        h: 'Softmaxxing vs hardmaxxing',
        body: `<p><b>Softmaxxing</b> means non-invasive changes: sleep, body fat, skincare, teeth, hair, grooming, posture, and clothes. It is cheap, reversible, and where nearly all of the realistic gains live.</p>
<p><b>Hardmaxxing</b> means surgery, injectables, and prescription or research drugs. Some of it is legitimate medicine (a dermatologist prescribing [[Tretinoin]], a doctor managing [[Finasteride]]). A lot of it is gray-market chemistry with real risks — see [[cat:muscle|Muscle]] and [[cat:recovery|Recovery]] for how many "research chems" sit there.</p>
<div class="callout">Rule of thumb: exhaust the soft list before you even read about the hard one.</div>`,
      },
      {
        h: 'The honest priority order',
        body: `<ol class="steps">
<li><b>Sleep.</b> Puffiness, dark circles, skin repair, and training recovery all run through it. See [[cat:sleep|Sleep & Environment]].</li>
<li><b>Body fat.</b> A leaner body is a leaner face — the jaw and cheekbones you think you lack are often under a few kilos. See [[guide:fat-loss|Fat Loss & Facial Leanness]].</li>
<li><b>Skin.</b> Sunscreen daily plus a retinoid at night is the highest-evidence routine that exists. See [[guide:skincare|Skincare 101]].</li>
<li><b>Teeth.</b> [[Whitening strips]] are one of the most reliable cosmetic buys in the whole Index.</li>
<li><b>Hair.</b> The right cut for your face shape, and early action if your hairline is moving. See [[guide:hair-loss|Hair Loss Primer]].</li>
<li><b>Grooming.</b> Brows, beard lines, nose and ear hair — zero biology, huge visible return.</li>
<li><b>Training & posture.</b> Shoulders, neck, and how you stand change your whole silhouette.</li>
<li><b>Fit & style.</b> [[Tailoring (any clothes)|Tailoring]] beats any supplement on this site.</li>
</ol>`,
      },
      {
        h: 'What looksmaxxing cannot do',
        body: `<p>No pill, gum, strap, or tongue posture selectively grows an adult jaw or changes bone shape. Anyone selling that is lying. The [[guide:myths|Myths & Scams]] page keeps the list.</p>
<p>And none of this is a substitute for a doctor. Rx entries are marked <span class="tag">℞ Rx only</span> for a reason.</p>`,
      },
    ],
  },
  {
    slug: 'index-explained',
    title: 'How to Read The Index',
    kicker: 'Ratings',
    summary: 'Evidence levels, legal status, and outcome labels — what every chip means.',
    sections: [
      {
        h: 'Evidence levels',
        body: `<table class="wtable">
<tr><th>Label</th><th>Meaning</th></tr>
<tr><td><span class="tag tag-strong">Strong</span></td><td>Multiple good human trials or clinical consensus. You can expect it to work for its stated use.</td></tr>
<tr><td><span class="tag tag-moderate">Moderate</span></td><td>Some decent human data. Real effect, often smaller or less consistent than the marketing.</td></tr>
<tr><td><span class="tag tag-limited">Limited</span></td><td>Small, early, or mostly lab/animal data. Plausible, not proven.</td></tr>
<tr><td><span class="tag tag-unproven">Unproven</span></td><td>No meaningful human evidence for the appearance claim — or evidence against it.</td></tr>
</table>
<p>Evidence is rated <b>for the appearance use</b>. [[Afamelanotide]] has strong evidence — for a light-sensitivity disorder, not for a cosmetic tan.</p>`,
      },
      {
        h: 'Status (compounds)',
        body: `<table class="wtable">
<tr><th>Label</th><th>Meaning</th></tr>
<tr><td><span class="tag">OTC</span></td><td>Buyable supplement or cosmetic. Still read the note.</td></tr>
<tr><td><span class="tag">℞ Rx only</span></td><td>Prescription territory. Goes through a doctor, not a cart.</td></tr>
<tr><td><span class="tag tag-unproven">⚠ Research chem</span></td><td>Not approved for human use. The wiki documents it so you know what you are looking at; it never links to a seller.</td></tr>
</table>`,
      },
      {
        h: 'Outcome (gear)',
        body: `<table class="wtable">
<tr><th>Label</th><th>Meaning</th></tr>
<tr><td><span class="tag">Lasting change</span></td><td>Durable biological or physical change — whiter teeth, less hair, more muscle.</td></tr>
<tr><td><span class="tag">While you use it</span></td><td>Temporary. The [[Ice roller]] de-puffs this morning, not forever.</td></tr>
<tr><td><span class="tag tag-unproven">Claim unsupported</span></td><td>The structural claim on the box has no evidence. See [[Face slimming strap]].</td></tr>
</table>`,
      },
      {
        h: 'Buy links',
        body: `<p>Some OTC entries show a <b>Find on Amazon</b> button. These are plain searches, and may become affiliate links that support the site. A link is never an endorsement — the evidence chip is the endorsement, or the lack of one.</p>`,
      },
    ],
  },
  {
    slug: 'facial-metrics',
    title: 'Facial Metrics Glossary',
    kicker: 'Measurements',
    summary: 'Canthal tilt, fWHR, gonial angle and the rest — what the LOOKSMAX scanner measures and the targets it scores against.',
    sections: [
      {
        h: 'A warning first',
        body: `<p>These ratios come from forum culture and a handful of attractiveness studies. They are averages, not laws. Plenty of very attractive faces sit outside every "ideal" below. Treat them as vocabulary, not a verdict.</p>`,
      },
      {
        h: 'Eye area',
        body: `<dl class="defs">
<dt>Canthal tilt</dt><dd>The angle of the line from inner to outer eye corner. Positive = outer corner higher. The scanner scores against roughly <b>+3° to +10°</b>, ideal about <b>+6°</b>.</dd>
<dt>Eye spacing (ES ratio)</dt><dd>Interpupillary distance divided by cheekbone width. Typical value ≈ 0.45; the scanner's target is <b>0.46</b>.</dd>
<dt>Dark circles / under-eye ratio</dt><dd>Under-eye brightness vs the cheek. 1.0 = no shadow. Sleep, [[Caffeine (topical)]], and [[cat:depuff|De-Puff]] entries are relevant.</dd>
</dl>`,
      },
      {
        h: 'Face shape',
        body: `<dl class="defs">
<dt>fWHR</dt><dd>Facial width-to-height ratio. In the scanner it is cheekbone width over full forehead-to-chin height (≈ 0.70–0.95), target <b>0.82</b>.</dd>
<dt>Midface ratio</dt><dd>Eye-to-mouth vertical distance relative to the lower face. Target around <b>1.9</b> in the scanner's formula.</dd>
<dt>Symmetry</dt><dd>Average left/right mismatch across paired landmarks around a midline. Nobody is perfectly symmetric.</dd>
</dl>`,
      },
      {
        h: 'Jaw & lower face',
        body: `<dl class="defs">
<dt>Gonial angle</dt><dd>The angle at the corner of the jaw. Forums cite <b>115–125°</b> in profile; the scanner uses a front-view proxy targeting about <b>120°</b>.</dd>
<dt>Jawline definition</dt><dd>Jaw width over cheek width, target about <b>0.78</b>. Body fat changes this reading more than anything else.</dd>
<dt>Lower third</dt><dd>Chin height vs philtrum height. The classic rule is about 1:2; the scanner targets <b>2.2</b>.</dd>
<dt>Mouth-to-nose</dt><dd>Mouth width divided by nose width.</dd>
</dl>`,
      },
      {
        h: 'Skin & teeth',
        body: `<dl class="defs">
<dt>Skin evenness</dt><dd>How much skin tone drifts across zones. Sunscreen and pigment entries like [[Azelaic acid]] and [[Tranexamic acid]] target this.</dd>
<dt>Redness</dt><dd>How much redder the cheeks are than forehead and chin.</dd>
<dt>Teeth whiteness</dt><dd>A yellowness index sampled from an open smile. [[Whitening strips]] move it.</dd>
</dl>`,
      },
    ],
  },
  {
    slug: 'skincare',
    title: 'Skincare 101',
    kicker: 'Routine',
    summary: 'The short routine with the most evidence behind it.',
    sections: [
      {
        h: 'The core three',
        body: `<ol class="steps">
<li><b>Cleanse</b> — gentle, nothing that leaves skin squeaky.</li>
<li><b>Moisturize</b> — [[Ceramides]] and [[Hyaluronic acid]] are boring and effective.</li>
<li><b>Sunscreen, every morning</b> — [[Broad-spectrum sunscreen]] is the single best anti-aging product sold. [[Tinted facial SPF]] if you want it to double as tone-evening.</li>
</ol>`,
      },
      {
        h: 'Add a retinoid',
        body: `<p>At night, a retinoid is the next step. In ascending strength: [[Retinol]] (OTC) → [[Adapalene]] (strongest OTC) → [[Tretinoin]] or [[Tazarotene]] (Rx). Start every other night; irritation is normal for the first weeks.</p>
<div class="callout">Retinoids increase sun sensitivity. No SPF, no retinoid.</div>`,
      },
      {
        h: 'Targeted actives',
        body: `<ul>
<li><b>Acne:</b> [[Salicylic acid]], [[Azelaic acid]], [[Adapalene]], [[Pimple patches]]. Severe or scarring acne → a dermatologist and possibly [[Isotretinoin]].</li>
<li><b>Dark spots & uneven tone:</b> [[Niacinamide]], [[Azelaic acid]], [[Tranexamic acid]], [[Vitamin C (topical)]].</li>
<li><b>Texture:</b> [[Glycolic acid]] or [[Lactic acid]] a few times a week.</li>
<li><b>Fine lines:</b> retinoids first; peptides like [[GHK-Cu]] and [[Matrixyl]] are much weaker evidence.</li>
</ul>`,
      },
      {
        h: 'Devices worth knowing',
        body: `<p>[[Red light LED mask]] and [[At-home fractional laser]] have real trial data. [[Microcurrent device]] lifts are temporary. Skip home [[Derma roller (home)|derma rolling]] — professional microneedling is a different thing.</p>`,
      },
    ],
  },
  {
    slug: 'hair-loss',
    title: 'Hair Loss Primer',
    kicker: 'Hairline',
    summary: 'Male-pattern hair loss responds best to early action. Here is the evidence ladder.',
    sections: [
      {
        h: 'Why early matters',
        body: `<p>Androgenetic alopecia is driven by DHT shrinking follicles over years. Medication is far better at <b>keeping</b> hair than regrowing it, so the best time to act is when you first notice.</p>`,
      },
      {
        h: 'The evidence ladder',
        body: `<table class="wtable">
<tr><th>Tier</th><th>Entries</th></tr>
<tr><td><span class="tag tag-strong">Strong</span></td><td>[[Finasteride]], [[Dutasteride]] (Rx, DHT blockers) and [[Minoxidil]] (OTC, growth stimulant). Most protocols combine a blocker with minoxidil.</td></tr>
<tr><td><span class="tag tag-moderate">Device</span></td><td>[[Laser hair-growth cap]], [[Laser comb]], [[Scalp microneedling roller]] — supporting players.</td></tr>
<tr><td><span class="tag tag-limited">Limited</span></td><td>[[Saw palmetto]], [[Pumpkin seed oil]], [[Melatonin (topical)]], [[Biotin]] (only helps if you are deficient).</td></tr>
<tr><td><span class="tag tag-unproven">Research</span></td><td>[[RU58841]], [[Pyrilutamide]] — not approved, quality unknown.</td></tr>
</table>`,
      },
      {
        h: 'Cosmetic cover',
        body: `<p>While treatment works: a shorter cut from someone good with [[Pro clippers + edge trimmer|clippers]], [[Hair fibers]], [[Hairline concealer / powder]], or a [[Thickening spray]].</p>
<p>Check [[Iron]] and [[Vitamin D]] levels with a doctor if shedding is sudden or diffuse — that is often not pattern loss at all.</p>`,
      },
    ],
  },
  {
    slug: 'fat-loss',
    title: 'Fat Loss & Facial Leanness',
    kicker: 'Body comp',
    summary: 'The jawline upgrade that is usually just a calorie deficit.',
    sections: [
      {
        h: 'Why it matters for the face',
        body: `<p>Facial fat sits over the exact features looksmaxxing obsesses over — jaw angle, cheekbones, under-chin. Dropping body fat changes [[guide:facial-metrics|jawline definition]] readings more than any jaw gadget ever will.</p>`,
      },
      {
        h: 'The basics',
        body: `<ul>
<li>A modest calorie deficit, high protein ([[Whey protein]] is just convenient food).</li>
<li>Lift to keep muscle: [[Adjustable dumbbells]], [[Pull-up bar]], [[Barbell + plates]] — the best evidence-to-cost ratio in the catalog.</li>
<li>Walk a lot. A [[Walking pad]] counts.</li>
<li>Track trends, not days: [[Smart scale]] and [[Measuring tape]].</li>
</ul>`,
      },
      {
        h: 'Medication',
        body: `<p>GLP-1 drugs — [[Semaglutide]], [[Tirzepatide]], [[Liraglutide]] — have strong evidence for weight loss and are prescription medicine. [[Retatrutide]] and [[Cagrilintide]] are still in trials; gray-market versions are research chems.</p>
<p>Fat burners like [[EGCG]] and [[Capsaicin]] are rounding error. [[EMS ab belt|EMS belts]] and [[Waist trainer|waist trainers]] do not remove fat.</p>`,
      },
    ],
  },
  {
    slug: 'myths',
    title: 'Myths & Scams',
    kicker: 'Debunked',
    summary: 'Popular looksmaxxing claims that the evidence does not support.',
    sections: [
      {
        h: '"Mewing will rebuild my jaw"',
        body: `<p>Tongue posture does not remodel adult bone in any meaningful way. [[Mewing appliances]] and [[Mouth tape]] claims for adult jaw change are unsupported. Real skeletal change in adults means orthodontics or surgery.</p>`,
      },
      {
        h: '"Chewing makes a sharper jaw"',
        body: `<p>A [[Jaw exerciser]] or [[Mastic / hard gum]] can grow the masseter muscles — which makes the lower face <b>wider</b>, not more defined. Overuse can aggravate TMJ.</p>`,
      },
      {
        h: '"Straps, clips, and tape reshape your face"',
        body: `<p>[[Face slimming strap]], [[Nose reshaping clip]], and [[Facial lifting tape]] do nothing lasting. At most they compress tissue for a few minutes.</p>`,
      },
      {
        h: '"Tanning pills and injections are a shortcut"',
        body: `<p>[[Canthaxanthin]] is linked to crystal deposits in the retina. [[Melanotan II]] is unapproved and gray-market. The proven tan in a bottle is [[Dihydroxyacetone]] — i.e. [[Self-tanning mousse]]. Skip the [[UV tanning bed]].</p>`,
      },
      {
        h: '"Peptides from a research site are basically supplements"',
        body: `<p>They are not. [[BPC-157]], [[TB-500]], [[MK-677]], and SARMs like [[Ostarine]] are not approved for human use, have thin human data, and are sold with no quality guarantees.</p>`,
      },
    ],
  },
  {
    slug: 'glossary',
    title: 'Slang Glossary',
    kicker: 'Terms',
    summary: 'Forum vocabulary, translated.',
    sections: [
      {
        h: 'A–Z',
        body: `<dl class="defs">
<dt>Ascend / ascension</dt><dd>Noticeably improving your looks over time.</dd>
<dt>Bloat</dt><dd>Water retention and puffiness, often from sodium, alcohol, or poor sleep. See [[cat:depuff|De-Puff]].</dd>
<dt>Canthal tilt</dt><dd>Eye-corner angle. See [[guide:facial-metrics|Facial Metrics]].</dd>
<dt>Hardmaxxing</dt><dd>Surgery, injectables, drugs. See [[guide:what-is-looksmaxxing|What Is Looksmaxxing]].</dd>
<dt>Hunter eyes</dt><dd>Forum shorthand for deep-set eyes with positive tilt and low upper-eyelid exposure.</dd>
<dt>Leanmaxxing</dt><dd>Getting lean to reveal facial structure. See [[guide:fat-loss|Fat Loss]].</dd>
<dt>Mewing</dt><dd>Resting the whole tongue on the palate. Fine for posture; not a bone-remodeling tool. See [[guide:myths|Myths]].</dd>
<dt>Mogging</dt><dd>Out-looking someone. Mostly a forum game; ignore it.</dd>
<dt>Softmaxxing</dt><dd>Non-invasive improvements — where most real gains are.</dd>
<dt>Skinmaxxing</dt><dd>A skincare focus. See [[guide:skincare|Skincare 101]].</dd>
</dl>`,
      },
    ],
  },
];
