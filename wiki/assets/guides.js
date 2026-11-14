// Hand-written wiki articles. Neutral point of view: describe what practitioners believe and what
// published research / medical bodies report, with attribution. No verdicts.
// Body HTML supports wiki links:
//   [[Tretinoin]]              → links to that entry (compound, gear or meta, by exact name)
//   [[Tretinoin|label]]        → same, custom label
//   [[guide:skincare|Skincare 101]]  → links to another guide
//   [[cat:skin|Skin & Wrinkles]]     → links to a category page
window.LM_GUIDES = [
  {
    slug: 'what-is-looksmaxxing',
    title: 'What Is Looksmaxxing',
    kicker: 'Start here',
    summary: 'The term, its origins, the two main approaches, and how the community prioritises.',
    sections: [
      {
        h: 'Definition',
        body: `<p><b>Looksmaxxing</b> (from "looks maximising") is the practice of deliberately trying to improve one's physical appearance. The term originated on online forums in the 2010s and spread widely on TikTok, YouTube and Reddit in the 2020s. It covers everything from grooming, fitness and skincare to drugs, surgery and practices that have little or no research behind them.</p>
<p>This wiki documents the full range of practices. For each one it lays out how it helps your looks, how people use it, what practitioners say and what research reports — see [[guide:index-explained|How to Read This Wiki]].</p>`,
      },
      {
        h: 'Softmaxxing and hardmaxxing',
        body: `<p>The community commonly divides methods into two groups. <b>Softmaxxing</b> refers to non-invasive changes such as sleep, body-fat reduction, skincare, dental care, haircuts, grooming, posture and clothing. <b>Hardmaxxing</b> refers to surgery, injectables, and prescription or unregulated drugs.</p>
<p>Some hardmaxxing methods are established medical treatments prescribed by doctors, such as [[Tretinoin]] or [[Finasteride]]. Others involve compounds sold as research chemicals that are not approved for human use; see [[cat:muscle|Muscle]] and [[cat:recovery|Recovery]].</p>`,
      },
      {
        h: 'Commonly recommended priorities',
        body: `<p>Guides written by community members and by dermatologists and trainers frequently suggest addressing the following areas before considering invasive options. The order below reflects that common advice, not a ranking by this wiki.</p>
<ol class="steps">
<li><b>Sleep.</b> Associated with skin appearance, under-eye darkness and recovery. See [[cat:sleep|Sleep & Environment]].</li>
<li><b>Body fat.</b> Lower body fat changes facial fat distribution and how the jaw and cheekbones appear. See [[guide:fat-loss|Fat Loss & Facial Leanness]].</li>
<li><b>Skin.</b> Daily sunscreen and a topical retinoid are the most commonly recommended routine in dermatology. See [[guide:skincare|Skincare 101]].</li>
<li><b>Teeth.</b> [[Whitening strips]] and orthodontics are common steps.</li>
<li><b>Hair.</b> Haircut choice and, for those with hair loss, early treatment. See [[guide:hair-loss|Hair Loss Primer]].</li>
<li><b>Grooming.</b> Brows, beard lines, nose and ear hair.</li>
<li><b>Training and posture.</b> Muscle, shoulders and neck change overall silhouette.</li>
<li><b>Clothing fit.</b> [[Tailoring (any clothes)|Tailoring]] is a common recommendation in style communities.</li>
</ol>`,
      },
      {
        h: 'How articles are written',
        body: `<p>Each article records what practitioners and proponents say about a method alongside what published research, regulators and clinicians report, with sources for both. Prescription drugs are marked <span class="tag">℞ Rx only</span>, and nothing in this wiki is medical advice.</p>`,
      },
    ],
  },
  {
    slug: 'index-explained',
    title: 'How to Read This Wiki',
    kicker: 'Start here',
    summary: 'What each part of an article does — the looksmax angle, goals, topics, quick take vs in-depth, and the links layer.',
    sections: [
      {
        h: 'The looksmax angle',
        body: `<p>Every article opens with a <b>Looksmax angle</b> box: the appearance goal it's used for (Height, Skin, Physique, Jawline & face shape…) and the chain from what it does to how you look — for example <i>joint comfort &amp; recovery → more training volume → more muscle</i>. Some things change your look directly (lifts, makeup, haircuts); others work through a step in between (sleep, recovery, hormones, fat loss).</p>
<p>The wiki doesn't grade anything. Each article lays out what the thing does, how people use it, what research has looked at, what people claim, and the risks — you decide what's worth it.</p>`,
      },
      {
        h: 'Goals and topics',
        body: `<p><b>Goals</b> group entries by what they improve; filter <a href="#/index">The Index</a> by goal to see every compound, gear item and meta aimed at the same result. <b>Topics</b> go wider — search "tanning" or "jawline" and you get everything tagged to that problem across the whole wiki.</p>`,
      },
      {
        h: 'Quick take and In-depth',
        body: `<p><b>Quick take</b> is the short version: what it does for your looks, how people use it, and the risks. <b>In-depth</b> is the full encyclopedia article — history, mechanism, clinical studies, what believers and experts each say, community discussion, news coverage and references.</p>`,
      },
      {
        h: 'Labels',
        body: `<table class="wtable">
<tr><th>Label</th><th>Meaning</th></tr>
<tr><td><span class="tag">℞ Rx only</span></td><td>Prescription medicine in most countries.</td></tr>
<tr><td><span class="tag">⚠ Research chem</span></td><td>Not approved for human use; sold as a "research chemical". Documented here for information; the wiki does not link to sellers.</td></tr>
<tr><td><span class="tag">Lasting change</span></td><td>Gear whose result sticks after you stop — e.g. whiter teeth, less hair.</td></tr>
<tr><td><span class="tag">While you use it</span></td><td>Gear whose result lasts while you use or wear it — e.g. lifts, an [[Ice roller]].</td></tr>
</table>`,
      },
      {
        h: 'What people claim',
        body: `<p>In-depth articles include a <b>What people claim</b> section: each row is a claim from the community, what proponents say in support of it, and what published research or clinicians report — side by side, without a verdict.</p>`,
      },
      {
        h: 'Links',
        body: `<p>Each article shows the top 10 studies and threads; <b>See all</b> opens the full link library — papers, trials, Reddit, looksmax.org, T Nation, Hacker News, Lemmy and news coverage.</p>`,
      },
      {
        h: 'Buy links',
        body: `<p>Some entries show a buy button. These may be affiliate links. A link is not an endorsement.</p>`,
      },
    ],
  },
  {
    slug: 'facial-metrics',
    title: 'Facial Metrics Glossary',
    kicker: 'Measurements',
    summary: 'Canthal tilt, fWHR, gonial angle and the other measurements used in looksmaxxing communities and attractiveness research.',
    sections: [
      {
        h: 'About these measurements',
        body: `<p>These measurements come from looksmaxxing forum culture and from attractiveness research. Research generally reports them as population averages and statistical associations; the values below are those commonly cited in the community.</p>`,
      },
      {
        h: 'Eye area',
        body: `<dl class="defs">
<dt>Canthal tilt</dt><dd>The angle of the line from the inner to the outer eye corner. Positive means the outer corner sits higher. Forum discussions commonly cite a mildly positive tilt (roughly <b>+4° to +8°</b>) as the preferred range.</dd>
<dt>Eye spacing (ES ratio)</dt><dd>Interpupillary distance divided by cheekbone width. Typical adult values are around <b>0.45–0.47</b>.</dd>
<dt>Dark circles / under-eye ratio</dt><dd>Under-eye brightness relative to the cheek. 1.0 = no shadow. See [[Caffeine (topical)]] and [[cat:depuff|De-Puff]].</dd>
</dl>`,
      },
      {
        h: 'Face shape',
        body: `<dl class="defs">
<dt>fWHR</dt><dd>Facial width-to-height ratio. Usually bizygomatic (cheekbone) width divided by upper-face height (brow to upper lip); forums commonly cite values around <b>1.9–2.0</b> as preferred for men. Some tools use full face height instead, which gives smaller numbers.</dd>
<dt>Midface ratio</dt><dd>The vertical distance between the eyes and the mouth relative to the width between the pupils; forums associate a shorter, more compact midface with attractiveness.</dd>
<dt>Symmetry</dt><dd>Average left/right difference across paired landmarks. All faces show some asymmetry.</dd>
</dl>`,
      },
      {
        h: 'Jaw & lower face',
        body: `<dl class="defs">
<dt>Gonial angle</dt><dd>The angle at the corner of the jaw. Measured in profile; forums commonly cite <b>115–125°</b>.</dd>
<dt>Bigonial-to-bizygomatic ratio</dt><dd>Jaw width relative to cheekbone width; forums discuss a ratio of roughly 0.75–0.85. Body fat affects how the jaw appears.</dd>
<dt>Lower third</dt><dd>Chin height vs philtrum height. A philtrum-to-chin ratio of about <b>1:2</b> is commonly cited.</dd>
<dt>Mouth-to-nose</dt><dd>Mouth width divided by nose width.</dd>
</dl>`,
      },
      {
        h: 'Skin & teeth',
        body: `<dl class="defs">
<dt>Skin evenness</dt><dd>How much skin tone varies across facial zones. See [[Azelaic acid]] and [[Tranexamic acid]].</dd>
<dt>Redness</dt><dd>How much redder the cheeks are than the forehead and chin.</dd>
<dt>Teeth whiteness</dt><dd>A yellowness index sampled from an open smile. See [[Whitening strips]].</dd>
</dl>`,
      },
    ],
  },
  {
    slug: 'skincare',
    title: 'Skincare 101',
    kicker: 'Routine',
    summary: 'The routine most commonly recommended by dermatologists, and the actives people add.',
    sections: [
      {
        h: 'The core routine',
        body: `<p>Dermatology guidance and skincare communities most commonly describe a three-step base:</p>
<ol class="steps">
<li><b>Cleanse</b> with a gentle cleanser.</li>
<li><b>Moisturise</b> — [[Ceramides]] and [[Hyaluronic acid]] are common ingredients.</li>
<li><b>Sunscreen</b> each morning — [[Broad-spectrum sunscreen]] is the step dermatologists most often emphasise for photoaging; [[Tinted facial SPF]] is a common variant.</li>
</ol>`,
      },
      {
        h: 'Retinoids',
        body: `<p>A night-time retinoid is the most frequently recommended addition. In ascending strength: [[Retinol]] (OTC), [[Adapalene]] (strongest OTC), then [[Tretinoin]] or [[Tazarotene]] (Rx). Product labelling and dermatologists typically advise gradual introduction because irritation is common early on.</p>
<div class="callout">Retinoid labels warn of increased sun sensitivity; daily sunscreen is generally advised alongside them.</div>`,
      },
      {
        h: 'Targeted actives',
        body: `<ul>
<li><b>Acne:</b> [[Salicylic acid]], [[Azelaic acid]], [[Adapalene]], [[Pimple patches]]; severe or scarring acne is often treated by dermatologists with [[Isotretinoin]].</li>
<li><b>Dark spots & uneven tone:</b> [[Niacinamide]], [[Azelaic acid]], [[Tranexamic acid]], [[Vitamin C (topical)]].</li>
<li><b>Texture:</b> [[Glycolic acid]] or [[Lactic acid]].</li>
<li><b>Fine lines:</b> retinoids have the largest body of evidence; peptides such as [[GHK-Cu]] and [[Matrixyl]] have less published research.</li>
</ul>`,
      },
      {
        h: 'Devices',
        body: `<p>[[Red light LED mask|LED masks]] and [[At-home fractional laser|at-home fractional lasers]] have published trial data. Reported [[Microcurrent device|microcurrent]] effects are temporary in available studies. Professional microneedling has clinical studies; [[Derma roller (home)|home derma rolling]] has less research and carries an infection risk noted by dermatologists.</p>`,
      },
    ],
  },
  {
    slug: 'hair-loss',
    title: 'Hair Loss Primer',
    kicker: 'Hairline',
    summary: 'Male-pattern hair loss and the treatments people use to keep and regrow hair.',
    sections: [
      {
        h: 'Background',
        body: `<p>Androgenetic alopecia is driven by dihydrotestosterone (DHT) gradually miniaturising hair follicles. Clinical literature generally reports that medication is more effective at maintaining existing hair than regrowing lost hair, which is why many guides emphasise starting early.</p>`,
      },
      {
        h: 'Treatments',
        body: `<table class="wtable">
<tr><th>Type</th><th>Entries</th></tr>
<tr><td><span class="tag">Medications</span></td><td>[[Finasteride]], [[Dutasteride]] (Rx, DHT blockers) and [[Minoxidil]] (OTC). Many treatment protocols combine a DHT blocker with minoxidil.</td></tr>
<tr><td><span class="tag">Devices</span></td><td>[[Laser hair-growth cap]], [[Laser comb]], [[Scalp microneedling roller]].</td></tr>
<tr><td><span class="tag">Supplements</span></td><td>[[Saw palmetto]], [[Pumpkin seed oil]], [[Melatonin (topical)]], [[Biotin]] (studied mainly in deficiency).</td></tr>
<tr><td><span class="tag">Research compounds</span></td><td>[[RU58841]], [[Pyrilutamide]] — not approved for human use; used on hair-loss forums.</td></tr>
</table>`,
      },
      {
        h: 'Cosmetic options',
        body: `<p>Common cosmetic approaches include shorter haircuts, [[Hair fibers]], [[Hairline concealer / powder]] and [[Thickening spray]].</p>
<p>Clinicians often check [[Iron]] and [[Vitamin D]] levels when shedding is sudden or diffuse, since that pattern can have causes other than androgenetic alopecia.</p>`,
      },
    ],
  },
  {
    slug: 'fat-loss',
    title: 'Fat Loss & Facial Leanness',
    kicker: 'Body comp',
    summary: 'How body fat relates to facial appearance, and the methods people use.',
    sections: [
      {
        h: 'Body fat and the face',
        body: `<p>Facial fat overlies features the looksmaxxing community focuses on — jaw angle, cheekbones and the area under the chin. Changes in body fat therefore change the readings for [[guide:facial-metrics|jawline definition]] and similar measures.</p>`,
      },
      {
        h: 'Common methods',
        body: `<ul>
<li>A calorie deficit with high protein intake ([[Whey protein]] is a common convenience food).</li>
<li>Resistance training to retain muscle: [[Adjustable dumbbells]], [[Pull-up bar]], [[Barbell + plates]].</li>
<li>Increased daily walking, e.g. a [[Walking pad]].</li>
<li>Tracking trends with a [[Smart scale]] and [[Measuring tape]].</li>
</ul>`,
      },
      {
        h: 'Medication and supplements',
        body: `<p>GLP-1 receptor agonists — [[Semaglutide]], [[Tirzepatide]], [[Liraglutide]] — are prescription medicines with strong trial evidence for weight loss. [[Retatrutide]] and [[Cagrilintide]] are in clinical trials; versions sold online outside trials are unregulated.</p>
<p>Supplements such as [[EGCG]] and [[Capsaicin]] show small effects in published studies. Manufacturers market [[EMS ab belt|EMS belts]] and [[Waist trainer|waist trainers]] for fat loss; published studies have not shown fat reduction from them.</p>`,
      },
    ],
  },
  {
    slug: 'glossary',
    title: 'Slang Glossary',
    kicker: 'Terms',
    summary: 'Forum vocabulary, defined.',
    sections: [
      {
        h: 'A–Z',
        body: `<dl class="defs">
<dt>Ascend / ascension</dt><dd>Noticeably improving one's looks over time.</dd>
<dt>Bloat</dt><dd>Water retention and facial puffiness. See [[cat:depuff|De-Puff]].</dd>
<dt>Canthal tilt</dt><dd>Eye-corner angle. See [[guide:facial-metrics|Facial Metrics]].</dd>
<dt>Hardmaxxing</dt><dd>Surgery, injectables and drugs. See [[guide:what-is-looksmaxxing|What Is Looksmaxxing]].</dd>
<dt>Hunter eyes</dt><dd>Forum term for deep-set eyes with positive tilt and little visible upper eyelid.</dd>
<dt>Leanmaxxing</dt><dd>Reducing body fat to reveal facial structure. See [[guide:fat-loss|Fat Loss]].</dd>
<dt>Mewing</dt><dd>Resting the whole tongue against the palate, associated with orthotropics.</dd>
<dt>Mogging</dt><dd>Being judged better-looking than someone else.</dd>
<dt>Softmaxxing</dt><dd>Non-invasive improvements.</dd>
<dt>Skinmaxxing</dt><dd>A focus on skincare. See [[guide:skincare|Skincare 101]].</dd>
</dl>`,
      },
    ],
  },
];
