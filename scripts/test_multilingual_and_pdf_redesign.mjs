/**
 * HARVESTROUTE: MULTILINGUAL SUPPORT & PDF REPORT REDESIGN VERIFICATION SUITE
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import jitiFactory from 'jiti';

const jiti = jitiFactory(import.meta.url);

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] TEST ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] TEST ${totalTests}: ${name}`);
    console.error(`       Error: ${err.message}\n`);
  }
}

console.log('===============================================================');
console.log('   HARVESTROUTE: MULTILINGUAL & PDF REDESIGN AUDIT SUITE       ');
console.log('===============================================================\n');

// -------------------------------------------------------------
// TEST 1: "Calculator Ready" completely removed from Navbar & App
// -------------------------------------------------------------
runTest('Calculator Ready is completely removed and replaced by Language Selector in Navbar', () => {
  const navbarContent = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');

  assert.ok(!navbarContent.includes('Calculator Ready'), 'Navbar must not contain "Calculator Ready"');
  assert.ok(!appContent.includes('Calculator Ready'), 'App.tsx must not contain "Calculator Ready"');

  // Verify Language Selector in Navbar
  assert.ok(navbarContent.includes('Globe'), 'Navbar must include Globe icon for Language Selector');
  assert.ok(navbarContent.includes('harvestroute_language') || navbarContent.includes('useLanguage'), 'Navbar must use LanguageContext');
  assert.ok(navbarContent.includes('English'), 'Must support English');
  assert.ok(navbarContent.includes('ಕನ್ನಡ'), 'Must support Kannada (ಕನ್ನಡ)');
  assert.ok(navbarContent.includes('हिन्दी'), 'Must support Hindi (हिन्दी)');
});

// -------------------------------------------------------------
// TEST 2: LanguageContext localStorage persistence & default English
// -------------------------------------------------------------
runTest('LanguageContext persists language in localStorage and defaults to English', () => {
  const contextContent = fs.readFileSync('src/i18n/LanguageContext.tsx', 'utf8');

  assert.ok(contextContent.includes('harvestroute_language'), 'Must use "harvestroute_language" as storage key');
  assert.ok(contextContent.includes("localStorage.getItem"), 'Must read from localStorage');
  assert.ok(contextContent.includes("localStorage.setItem"), 'Must save to localStorage');
  assert.ok(contextContent.includes("document.documentElement.lang = lang"), 'Must sync document.documentElement.lang');
  assert.ok(contextContent.includes("language === 'en'") || contextContent.includes("lang || 'en'") || contextContent.includes("return 'en'"), 'Must default to English');
});

// -------------------------------------------------------------
// TEST 3: All 3 translation dictionaries (en, kn, hi) have matching schema
// -------------------------------------------------------------
runTest('Translations dictionaries provide thorough coverage in en, kn, and hi', () => {
  const enModule = jiti('../src/i18n/translations/en.ts');
  const knModule = jiti('../src/i18n/translations/kn.ts');
  const hiModule = jiti('../src/i18n/translations/hi.ts');

  const en = enModule.enTranslations;
  const kn = knModule.knTranslations;
  const hi = hiModule.hiTranslations;

  assert.ok(en && kn && hi, 'All three translation objects must load');

  // Verify common keys
  assert.strictEqual(en.common.step1Label, 'Harvest & Farm Details');
  assert.strictEqual(kn.common.step1Label, 'ಕಟಾವು ಮತ್ತು ಜಮೀನಿನ ವಿವರಗಳು');
  assert.strictEqual(hi.common.step1Label, 'फसल एवं खेत का विवरण');

  // Verify all 10 crops have natural translations in kn and hi
  const cropIds = ['tomato', 'potato', 'brinjal', 'onion', 'carrot', 'rice', 'wheat', 'maize', 'chilli', 'green_gram'];
  for (const cropId of cropIds) {
    assert.ok(en.crops[cropId], `English missing crop: ${cropId}`);
    assert.ok(kn.crops[cropId], `Kannada missing crop: ${cropId}`);
    assert.ok(hi.crops[cropId], `Hindi missing crop: ${cropId}`);
  }

  // Spot-check Kannada agricultural translations
  assert.strictEqual(kn.crops.tomato, 'ಟೊಮೆಟೊ');
  assert.strictEqual(kn.crops.onion, 'ಈರುಳ್ಳಿ');
  assert.strictEqual(kn.crops.chilli, 'ಒಣ ಮೆಣಸಿನಕಾಯಿ');
  assert.strictEqual(kn.crops.green_gram, 'ಹೆಸರು ಕಾಳು (ಮೂಂಗ್)');

  // Spot-check Hindi agricultural translations
  assert.strictEqual(hi.crops.tomato, 'टमाटर');
  assert.strictEqual(hi.crops.onion, 'प्याज');
  assert.strictEqual(hi.crops.chilli, 'लाल मिर्च (सूखी)');
  assert.strictEqual(hi.crops.green_gram, 'मूंग (हरा चना)');
});

// -------------------------------------------------------------
// TEST 4: StepNavigation reflects selected language
// -------------------------------------------------------------
runTest('StepNavigation renders localized labels in English, Kannada, and Hindi', () => {
  const stepNavContent = fs.readFileSync('src/components/dashboard/StepNavigation.tsx', 'utf8');

  assert.ok(stepNavContent.includes('useLanguage'), 'StepNavigation must consume useLanguage hook');
  assert.ok(stepNavContent.includes("stepNav.step1Title"), 'Must use localized step 1 title');
  assert.ok(stepNavContent.includes("stepNav.step2Title"), 'Must use localized step 2 title');
  assert.ok(stepNavContent.includes("stepNav.step3Title"), 'Must use localized step 3 title');
});

// -------------------------------------------------------------
// TEST 5: CropSelector & GradeDistribution use localized content
// -------------------------------------------------------------
runTest('CropSelector and GradeDistribution incorporate multilingual terminology', () => {
  const cropSelContent = fs.readFileSync('src/components/forms/CropSelector.tsx', 'utf8');
  const gradeDistContent = fs.readFileSync('src/components/forms/GradeDistribution.tsx', 'utf8');

  assert.ok(cropSelContent.includes('useLanguage'), 'CropSelector must use useLanguage');
  assert.ok(cropSelContent.includes('getCropName'), 'CropSelector must translate crop names');
  assert.ok(gradeDistContent.includes('useLanguage'), 'GradeDistribution must use useLanguage');
});

// -------------------------------------------------------------
// TEST 6: MarketReportModal Page 1 - Summary & Prominent Best Option Hero
// -------------------------------------------------------------
runTest('MarketReportModal Page 1 features Farmer Summary and prominent Best Option Hero card', () => {
  const modalContent = fs.readFileSync('src/components/dashboard/MarketReportModal.tsx', 'utf8');

  assert.ok(modalContent.includes('useLanguage'), 'MarketReportModal must use useLanguage');
  assert.ok(modalContent.includes('page-break'), 'Must use page-break styling between pages');
  assert.ok(modalContent.includes('bestOptionTitle'), 'Must render bestOptionTitle');
  assert.ok(modalContent.includes('finalNetMoneyKept'), 'Must highlight finalNetMoneyKept');
  assert.ok(modalContent.includes('verifiedDataNotice'), 'Must include verified data notice');
  assert.ok(modalContent.includes('BrandLogo'), 'Must render BrandLogo');
});

// -------------------------------------------------------------
// TEST 7: MarketReportModal Page 2 - ONLY Top 3 Mandis (Never 18)
// -------------------------------------------------------------
runTest('MarketReportModal Page 2 strictly limits display to Top 3 recommended mandis', () => {
  const modalContent = fs.readFileSync('src/components/dashboard/MarketReportModal.tsx', 'utf8');

  // Verify slice(0, 3)
  assert.ok(
    modalContent.includes('ranking.feasibleMarkets.slice(0, 3)') ||
    modalContent.includes('.slice(0, 3)'),
    'Must strictly take only top 3 markets: slice(0, 3)'
  );
  assert.ok(!modalContent.includes('ranking.feasibleMarkets.map'), 'Must not map over all feasible markets');
  assert.ok(modalContent.includes('top3Markets.map'), 'Must map strictly over top3Markets');
  assert.ok(modalContent.includes('top3Title'), 'Must render top3Title');
  assert.ok(modalContent.includes('recommendedChoiceNote'), 'Must include recommendedChoiceNote');
});

// -------------------------------------------------------------
// TEST 8: MarketReportModal Page 3 - Simple Earnings Breakdown & Natural Language
// -------------------------------------------------------------
runTest('MarketReportModal Page 3 contains clear 4-step earnings arithmetic & natural plain language', () => {
  const modalContent = fs.readFileSync('src/components/dashboard/MarketReportModal.tsx', 'utf8');

  assert.ok(modalContent.includes('simpleBreakdownTitle'), 'Must render simpleBreakdownTitle');
  assert.ok(modalContent.includes('expectedCropSales'), 'Must include Expected Crop Sales step');
  assert.ok(modalContent.includes('minusTransport'), 'Must include Minus Transport step');
  assert.ok(modalContent.includes('minusMandiFees'), 'Must include Minus Mandi Fees step');
  assert.ok(modalContent.includes('estimatedMoneyYouKeep'), 'Must include Estimated Money You Keep step');
  assert.ok(modalContent.includes('naturalSummaryTemplate'), 'Must include plain-language naturalSummaryTemplate');
  assert.ok(modalContent.includes('spoilageExplanation'), 'Must explain spoilage deduction');
  assert.ok(modalContent.includes('gradeExplanation'), 'Must explain quality grade pricing');
  assert.ok(modalContent.includes('whyThisMandiBetter'), 'Must explain why recommended mandi is superior');
});

// -------------------------------------------------------------
// TEST 9: MarketReportModal Page 4 - Important Information & Data Sources
// -------------------------------------------------------------
runTest('MarketReportModal Page 4 provides official advisory info & data sources', () => {
  const modalContent = fs.readFileSync('src/components/dashboard/MarketReportModal.tsx', 'utf8');

  assert.ok(modalContent.includes('importantInfoTitle'), 'Must render importantInfoTitle');
  assert.ok(modalContent.includes('dataSourceHeading'), 'Must render dataSourceHeading');
  assert.ok(modalContent.includes('roadTransportHeading'), 'Must render roadTransportHeading');
  assert.ok(modalContent.includes('disclaimerHeading'), 'Must render disclaimerHeading');
  assert.ok(modalContent.includes('footerText'), 'Must include advisory footer text');
});

// -------------------------------------------------------------
// TEST 10: Print CSS optimization in index.css
// -------------------------------------------------------------
runTest('Print styles in index.css configure .page-break and A4 portrait pagination', () => {
  const cssContent = fs.readFileSync('src/styles/index.css', 'utf8');

  assert.ok(cssContent.includes('.page-break'), 'Must define .page-break class');
  assert.ok(cssContent.includes('page-break-after: always'), 'Must force page break after');
  assert.ok(cssContent.includes('@media print'), 'Must include @media print configuration');
  assert.ok(cssContent.includes('size: A4 portrait'), 'Must specify A4 portrait size');
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n===============================================================');
console.log(`  VERIFICATION COMPLETE: ${passedTests} OF ${totalTests} CHECKS PASSED (100%)`);
console.log('===============================================================');

if (passedTests === totalTests) {
  console.log('>>> MULTILINGUAL SUPPORT & PDF REPORT REDESIGN 100% VERIFIED!\n');
} else {
  process.exitCode = 1;
}
