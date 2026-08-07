/**
 * Pediatric Clinical Decision Logic based on AboutKidsHealth (SickKids) Guidelines
 */

export type TriageCategory = 'HIGH_EMERGENCY' | 'MODERATE_URGENT_CARE' | 'LOW_PRIMARY_CARE';

export interface RedFlagSymptom {
  id: string;
  label: string;
  description: string;
  category: 'respiratory' | 'neurological' | 'dermatological' | 'systemic' | 'dehydration';
}

export const RED_FLAG_SYMPTOMS: RedFlagSymptom[] = [
  {
    id: 'infant_fever',
    label: 'Infant Fever (< 3 Months)',
    description: 'Fever >= 38.0°C (100.4°F) in an infant under 12 weeks old.',
    category: 'systemic',
  },
  {
    id: 'respiratory_distress',
    label: 'Severe Breathing Trouble',
    description: 'Rapid gasping, grunting, chest retractions (sucking in under ribs), or blue/pale lips.',
    category: 'respiratory',
  },
  {
    id: 'unresponsive_lethargy',
    label: 'Lethargy / Hard to Wake',
    description: 'Child is extremely sluggish, un-responsive, weak cry, or impossible to wake up.',
    category: 'neurological',
  },
  {
    id: 'non_blanching_rash',
    label: 'Non-Blanching Rash',
    description: 'Purple or tiny dark red spots that do NOT fade when pressed under a glass tumbler.',
    category: 'dermatological',
  },
  {
    id: 'stiff_neck_photophobia',
    label: 'Stiff Neck / Extreme Light Sensitivity',
    description: 'Unable to touch chin to chest, severe headache, or fontanelle (soft spot) bulging.',
    category: 'neurological',
  },
  {
    id: 'seizure_activity',
    label: 'Seizure or Convulsion',
    description: 'Rhythmic twitching, eye rolling, or loss of consciousness during fever.',
    category: 'neurological',
  },
  {
    id: 'severe_dehydration',
    label: 'Severe Dehydration',
    description: 'No wet diaper or urination for 8+ hours, no tears when crying, dry mouth, or sunken eyes.',
    category: 'dehydration',
  },
];

export type PrimarySymptom = 'select' | 'fever' | 'chest_pain' | 'abdominal_pain' | 'hypertension' | 'soft_tissue_injury' | 'head_injury';

export interface SymptomDefinition {
  id: string;
  label: string;
  description: string;
  isRedFlag: boolean;
}

export const SYMPTOMS_BY_PRIMARY: Record<PrimarySymptom, SymptomDefinition[]> = {
  select: [],
  fever: [
    { id: 'infant_fever', label: 'Infant Fever (< 3 Months)', description: 'Fever >= 38.0°C (100.4°F) in an infant under 12 weeks old.', isRedFlag: true },
    { id: 'respiratory_distress', label: 'Severe Breathing Trouble', description: 'Rapid gasping, grunting, chest retractions, or blue/pale lips.', isRedFlag: true },
    { id: 'unresponsive_lethargy', label: 'Lethargy / Hard to Wake', description: 'Child is extremely sluggish, unresponsive, or impossible to wake.', isRedFlag: true },
    { id: 'non_blanching_rash', label: 'Non-Blanching Rash', description: 'Purple or tiny dark red spots that do not fade when pressed.', isRedFlag: true },
    { id: 'stiff_neck_photophobia', label: 'Stiff Neck / Extreme Light Sensitivity', description: 'Unable to touch chin to chest, severe headache, or fontanelle bulging.', isRedFlag: true },
    { id: 'seizure_activity', label: 'Seizure or Convulsion', description: 'Rhythmic twitching, eye rolling, or loss of consciousness.', isRedFlag: true },
    { id: 'severe_dehydration', label: 'Severe Dehydration', description: 'No wet diaper for 8+ hours, no tears when crying, dry mouth, or sunken eyes.', isRedFlag: true },
    { id: 'persistent_vomiting', label: 'Persistent Vomiting', description: 'Cannot keep any fluids down for more than 8 hours.', isRedFlag: false },
    { id: 'earache_severe', label: 'Severe Earache or Tug/Pain', description: 'Crying or screaming from ear pain, fluid draining from ear.', isRedFlag: false },
    { id: 'limping_pain', label: 'New Limping or Joint Pain', description: 'Difficulty walking or moving a joint due to pain.', isRedFlag: false },
  ],
  chest_pain: [
    { id: 'chest_crushing', label: 'Crushing or Squeezing Chest Pain', description: 'Sudden, intense, crushing, or squeezing feeling in the chest.', isRedFlag: true },
    { id: 'chest_spread', label: 'Pain Spreading to Arm, Neck, or Back', description: 'Chest pain that radiates to the left arm, neck, jaw, shoulder, or back.', isRedFlag: true },
    { id: 'chest_breathing', label: 'Breathing Difficulty / Shortness of Breath', description: 'Child is breathing very fast, gasping, or short of breath.', isRedFlag: true },
    { id: 'chest_syncope', label: 'Fainting, Dizziness, or Lightheadedness', description: 'Child feels dizzy, lightheaded, or passed out (syncope) with pain.', isRedFlag: true },
    { id: 'chest_pale_sweaty', label: 'Pale, Sweaty Skin or Blue Lips', description: 'Child looks abnormally pale, is sweating heavily, or lips look blue.', isRedFlag: true },
    { id: 'chest_palpitations', label: 'Racing or Skipping Heartbeat', description: 'Child complains of heart racing, fluttering, or skipping beats.', isRedFlag: true },
    { id: 'chest_cough_pain', label: 'Pain When Coughing or Deep Breathing', description: 'Pain is only present or worsens when taking a deep breath or coughing.', isRedFlag: false },
    { id: 'chest_tender', label: 'Chest Wall Tender to the Touch', description: 'Pain is reproducible when pressing on the bones/muscles of the chest.', isRedFlag: false },
    { id: 'chest_chronic', label: 'Chronic or Recurrent Pain', description: 'Mild pain that has been coming and going for weeks or months.', isRedFlag: false },
  ],
  abdominal_pain: [
    { id: 'abd_sudden_severe', label: 'Sudden, Severe, or Constant Belly Pain', description: 'Intense stomach pain that does not improve or go away.', isRedFlag: true },
    { id: 'abd_lower_right', label: 'Pain in the Lower Right Side', description: 'Pain localized to the lower right abdomen (possible appendicitis).', isRedFlag: true },
    { id: 'abd_high_fever', label: 'High Fever with Stomach Pain', description: 'Fever accompanying the abdominal pain.', isRedFlag: true },
    { id: 'abd_bilious_vomiting', label: 'Persistent or Bilious (Green) Vomiting', description: 'Vomiting repeatedly, especially if vomit is green/yellow-green or contains blood.', isRedFlag: true },
    { id: 'abd_blood_stool', label: 'Blood in Stool or Vomit', description: 'Stool contains red blood or looks black/tarry; vomit contains blood.', isRedFlag: true },
    { id: 'abd_swollen_hard', label: 'Swollen, Hard, or Rigid Abdomen', description: 'Belly is bloated, swollen, hard, or extremely tender to touch.', isRedFlag: true },
    { id: 'abd_lethargy', label: 'Lethargy or Extreme Weakness', description: 'Child is floppy, sluggish, or difficult to wake.', isRedFlag: true },
    { id: 'abd_cramping', label: 'Mild Cramping or Bloating', description: 'Cramping pain that comes and goes, often relieved by passing gas.', isRedFlag: false },
    { id: 'abd_constipation', label: 'Related to Constipation', description: 'Child has not had a bowel movement in days or has hard stools.', isRedFlag: false },
    { id: 'abd_stress', label: 'Linked to Anxiety or Stress', description: 'Pain occurs mostly on school days or during stressful situations.', isRedFlag: false },
  ],
  hypertension: [
    { id: 'ht_headache', label: 'Sudden, Severe Headache', description: 'Intense, throbbing headache that comes on suddenly.', isRedFlag: true },
    { id: 'ht_vision', label: 'Vision Changes', description: 'Blurred vision, double vision, or temporary loss of vision.', isRedFlag: true },
    { id: 'ht_dyspnea', label: 'Shortness of Breath or Chest Pain', description: 'Difficulty breathing or discomfort in the chest.', isRedFlag: true },
    { id: 'ht_seizure_confusion', label: 'Seizures or Sudden Confusion', description: 'Seizure activity, twitching, or sudden disorientation.', isRedFlag: true },
    { id: 'ht_neurological', label: 'Numbness, Weakness, or Slurred Speech', description: 'Facial droop, weakness on one side of body, or trouble talking.', isRedFlag: true },
    { id: 'ht_mild_dizziness', label: 'Mild Dizziness without Other Symptoms', description: 'Feeling slightly lightheaded but otherwise acting normally.', isRedFlag: false },
    { id: 'ht_flushed', label: 'Flushed Face or Warm Skin', description: 'Redness or warmth in face/skin without headache or pain.', isRedFlag: false },
    { id: 'ht_known_high', label: 'Asymptomatic High Blood Pressure Reading', description: 'Elevated blood pressure measurement but child has zero symptoms.', isRedFlag: false },
  ],
  soft_tissue_injury: [
    { id: 'sti_deformed', label: 'Deformed Joint or Crooked Bone', description: 'Visibly crooked limb, suspected fracture or joint dislocation.', isRedFlag: true },
    { id: 'sti_immobility', label: 'Complete Inability to Move or Bear Weight', description: 'Inability to use limb or bear any weight on the affected area.', isRedFlag: true },
    { id: 'sti_unmanageable_pain', label: 'Extreme, Unmanageable Pain', description: 'Pain is severe and cannot be relieved by standard measures.', isRedFlag: true },
    { id: 'sti_instability', label: 'Joint Instability / Giving Way', description: 'Joint feels completely loose or gives way when moved.', isRedFlag: true },
    { id: 'sti_numbness', label: 'Numbness or Tingling Below Injury', description: 'Loss of feeling or "pins and needles" below the injured site.', isRedFlag: true },
    { id: 'sti_cold_pale', label: 'Cold, Pale, or Blue Skin below Injury', description: 'Limb below injury feels cold or looks pale/blue (poor circulation).', isRedFlag: true },
    { id: 'sti_open_bleed', label: 'Visible Bone or Heavy Bleeding', description: 'Bone protruding through skin or severe, uncontrollable bleeding.', isRedFlag: true },
    { id: 'sti_mild_swelling', label: 'Mild Swelling, Soreness, or Bruising', description: 'Standard bruising and localized swelling without deformity.', isRedFlag: false },
    { id: 'sti_partial_movement', label: 'Can Bear Weight with Mild Pain', description: 'Can walk or move limb, but experiences discomfort.', isRedFlag: false },
  ],
  head_injury: [
    { id: 'head_loc', label: 'Loss of Consciousness (Blackout)', description: 'Blacked out, passed out, or became unresponsive, even for a few seconds.', isRedFlag: true },
    { id: 'head_vomit', label: 'Repeated Vomiting', description: 'Vomited two or more times after the injury.', isRedFlag: true },
    { id: 'head_seizure', label: 'Seizure or Convulsion', description: 'Twitching, shaking, or seizure activity following the impact.', isRedFlag: true },
    { id: 'head_fluid', label: 'Fluid or Blood from Nose/Ears', description: 'Clear watery fluid or blood draining from nose or ears.', isRedFlag: true },
    { id: 'head_confusion', label: 'Confusion, Disorientation, or Slurred Speech', description: 'Cannot answer simple questions, acts confused, or slurs words.', isRedFlag: true },
    { id: 'head_pupil', label: 'Unequal Pupils or Vision Changes', description: 'Pupils are different sizes, or child reports double/blurred vision.', isRedFlag: true },
    { id: 'head_worse_headache', label: 'Worsening or Severe Headache', description: 'Headache grows steadily worse and does not respond to medicine.', isRedFlag: true },
    { id: 'head_weakness', label: 'Weakness/Numbness in Arms or Legs', description: 'Numbness, loss of motor control, or weakness in limbs.', isRedFlag: true },
    { id: 'head_sleepy', label: 'Extreme Sleepiness / Hard to Wake', description: 'Cannot wake the child up, or they are extremely sleepy/lethargic.', isRedFlag: true },
    { id: 'head_mild_headache', label: 'Mild Headache', description: 'Slight headache that is stable and relieved by rest.', isRedFlag: false },
    { id: 'head_single_vomit', label: 'Single Vomit Episode', description: 'Threw up only once immediately after the injury, with no other signs.', isRedFlag: false },
    { id: 'head_dizziness', label: 'Mild Dizziness or Nausea', description: 'Feeling slightly dizzy or nauseous, but acting alert.', isRedFlag: false },
  ],
};

export interface TriageInput {
  primarySymptom?: PrimarySymptom;
  ageInMonths: number;
  feverTempCelsius?: number;
  feverDurationHours?: number;
  selectedRedFlags: string[];
  selectedSecondarySymptoms?: string[];
  hasChronicCondition?: boolean;
}

export interface TriageEvaluationResult {
  category: TriageCategory;
  title: string;
  badgeText: string;
  badgeBg: string;
  summary: string;
  timeframeNotice: string;
  actionPlan: string[];
  redFlagsTriggered: string[];
  recommendedFacilityType: 'Emergency Room' | 'Urgent Care Clinic' | 'Pediatrician / Family Doctor';
  disclaimer: string;
}

/**
 * Main evaluation function implementing AboutKidsHealth decision tree rules.
 */
export function evaluatePediatricTriage(input: TriageInput): TriageEvaluationResult {
  const {
    primarySymptom = 'fever',
    ageInMonths,
    feverTempCelsius = 37.0,
    feverDurationHours = 0,
    selectedRedFlags = [],
    selectedSecondarySymptoms = [],
  } = input;

  const activeRedFlags = [...selectedRedFlags];

  // Clinical Rule 1: Infant under 3 months (<= 3 months) with fever >= 38.0°C (100.4°F) is AUTOMATIC HIGH_EMERGENCY
  if (primarySymptom === 'fever') {
    const isInfantUnder3Months = ageInMonths <= 3;
    const hasFeverInInfant = isInfantUnder3Months && feverTempCelsius >= 38.0;
    if (hasFeverInInfant && !activeRedFlags.includes('infant_fever')) {
      activeRedFlags.push('infant_fever');
    }
  }

  // --- 🚨 STEP 1: EVALUATE HIGH EMERGENCY CONDITIONS ---
  if (activeRedFlags.length > 0) {
    const defs = SYMPTOMS_BY_PRIMARY[primarySymptom];
    const flagLabels = activeRedFlags
      .map((id) => defs.find((d) => d.id === id)?.label || id)
      .join(', ');

    const actionPlan = [
      'Call 911 immediately if your child is un-responsive, turning blue, or having breathing difficulty.',
      'Head directly to the nearest Emergency Department (do not wait for an urgent care appointment).',
      'Keep your child calm and do not administer solid food or heavy liquids if vomiting or lethargic.',
      'Bring health insurance card, photo ID, and any current medication bottles.',
    ];

    if (primarySymptom === 'head_injury') {
      actionPlan.push('Do not give pain medications or sedatives before medical evaluation if there is severe drowsiness.');
    }

    return {
      category: 'HIGH_EMERGENCY',
      title: 'Immediate Emergency Care Recommended',
      badgeText: 'Level 1 / 2 Priority',
      badgeBg: 'bg-rose-600 text-white',
      summary: `Your child exhibits high-priority symptoms (${flagLabels}) requiring immediate evaluation at an Emergency Department.`,
      timeframeNotice: 'Go to the nearest ER or Call 911 immediately.',
      actionPlan,
      redFlagsTriggered: activeRedFlags,
      recommendedFacilityType: 'Pediatric Emergency Room',
      disclaimer: `This recommendation is based on AboutKidsHealth clinical screening protocols for ${primarySymptom.replace('_', ' ')}. Seek emergency care immediately.`,
    };
  }

  // --- ⚠️ STEP 2: EVALUATE MODERATE URGENT CARE CONDITIONS ---
  let isModerate = false;
  let moderateReasons: string[] = [];

  if (primarySymptom === 'fever') {
    const isFeverOver3Days = feverDurationHours >= 72;
    const isVeryHighFever = feverTempCelsius >= 40.0;
    const hasPersistentVomiting = selectedSecondarySymptoms.includes('persistent_vomiting');
    const hasModeratePain = selectedSecondarySymptoms.includes('earache_severe') || selectedSecondarySymptoms.includes('limping_pain');

    if (isFeverOver3Days || isVeryHighFever || hasPersistentVomiting || hasModeratePain) {
      isModerate = true;
      if (isFeverOver3Days) moderateReasons.push('Fever duration >= 3 days');
      if (isVeryHighFever) moderateReasons.push('High temperature (>= 40.0°C)');
      if (hasPersistentVomiting) moderateReasons.push('Persistent vomiting');
      if (hasModeratePain) moderateReasons.push('Severe localized pain');
    }
  } else if (primarySymptom === 'chest_pain') {
    if (selectedSecondarySymptoms.includes('chest_tender') || selectedSecondarySymptoms.includes('chest_cough_pain') || selectedSecondarySymptoms.includes('chest_chronic')) {
      isModerate = true;
      if (selectedSecondarySymptoms.includes('chest_tender')) moderateReasons.push('Chest wall tenderness');
      if (selectedSecondarySymptoms.includes('chest_cough_pain')) moderateReasons.push('Discomfort when coughing');
      if (selectedSecondarySymptoms.includes('chest_chronic')) moderateReasons.push('Chronic chest pain');
    }
  } else if (primarySymptom === 'abdominal_pain') {
    if (selectedSecondarySymptoms.includes('abd_cramping') || selectedSecondarySymptoms.includes('abd_constipation') || selectedSecondarySymptoms.includes('abd_stress')) {
      isModerate = true;
      if (selectedSecondarySymptoms.includes('abd_cramping')) moderateReasons.push('Mild cramping belly pain');
      if (selectedSecondarySymptoms.includes('abd_constipation')) moderateReasons.push('Constipation related pain');
      if (selectedSecondarySymptoms.includes('abd_stress')) moderateReasons.push('Anxiety/stress related pain');
    }
  } else if (primarySymptom === 'hypertension') {
    if (selectedSecondarySymptoms.includes('ht_known_high') || selectedSecondarySymptoms.includes('ht_flushed') || selectedSecondarySymptoms.includes('ht_mild_dizziness')) {
      isModerate = true;
      if (selectedSecondarySymptoms.includes('ht_known_high')) moderateReasons.push('Asymptomatic elevated blood pressure');
      if (selectedSecondarySymptoms.includes('ht_flushed')) moderateReasons.push('Flushed face or warm skin');
      if (selectedSecondarySymptoms.includes('ht_mild_dizziness')) moderateReasons.push('Mild dizziness');
    }
  } else if (primarySymptom === 'soft_tissue_injury') {
    if (selectedSecondarySymptoms.includes('sti_mild_swelling') || selectedSecondarySymptoms.includes('sti_partial_movement')) {
      isModerate = true;
      if (selectedSecondarySymptoms.includes('sti_mild_swelling')) moderateReasons.push('Bruising and localized swelling');
      if (selectedSecondarySymptoms.includes('sti_partial_movement')) moderateReasons.push('Pain but able to partially bear weight');
    }
  } else if (primarySymptom === 'head_injury') {
    if (selectedSecondarySymptoms.includes('head_mild_headache') || selectedSecondarySymptoms.includes('head_single_vomit') || selectedSecondarySymptoms.includes('head_dizziness')) {
      isModerate = true;
      if (selectedSecondarySymptoms.includes('head_mild_headache')) moderateReasons.push('Mild headache');
      if (selectedSecondarySymptoms.includes('head_single_vomit')) moderateReasons.push('Single vomit episode');
      if (selectedSecondarySymptoms.includes('head_dizziness')) moderateReasons.push('Mild post-impact dizziness');
    }
  }

  if (isModerate) {
    const reasonsText = moderateReasons.join(', ');
    return {
      category: 'MODERATE_URGENT_CARE',
      title: 'Same-Day Urgent Care Recommended',
      badgeText: 'Level 3 / 4 Priority',
      badgeBg: 'bg-amber-500 text-white',
      summary: `Your child has symptoms (${reasonsText || 'moderate discomfort'}) that should be evaluated by a healthcare provider within 4–12 hours.`,
      timeframeNotice: 'Visit an Urgent Care Clinic.',
      actionPlan: [
        'Visit an Urgent Care clinic or book a same-day appointment with your pediatrician/family doctor.',
        'Encourage frequent rest, small sips of fluids, and keep the child comfortable.',
        'Monitor closely: if any new red flags emerge (e.g. extreme lethargy, severe pain, breathing issues), head to the ER immediately.',
      ],
      redFlagsTriggered: [],
      recommendedFacilityType: 'Urgent Care Clinic',
      disclaimer: `Guidance based on AboutKidsHealth care screening for ${primarySymptom.replace('_', ' ')}.`,
    };
  }

  // --- 🟢 STEP 3: LOW PRIMARY CARE CONDITIONS ---
  return {
    category: 'LOW_PRIMARY_CARE',
    title: 'Routine Care & Primary Pediatrician Follow-up',
    badgeText: 'Routine Priority',
    badgeBg: 'bg-teal-600 text-white',
    summary: 'Your child’s symptoms appear mild and manageable at home. Follow up with your pediatrician if symptoms worsen or persist.',
    timeframeNotice: 'Schedule a routine visit with your pediatrician if symptoms continue.',
    actionPlan: [
      'Ensure your child gets plenty of rest and stays hydrated.',
      'Monitor your child for any changes in temperature, pain level, or behavior.',
      'Contact your pediatrician if symptoms do not improve after 48-72 hours, or if new symptoms develop.',
    ],
    redFlagsTriggered: [],
    recommendedFacilityType: 'Pediatrician / Family Doctor',
    disclaimer: 'Home management guidance for mild pediatric symptoms.',
  };
}
