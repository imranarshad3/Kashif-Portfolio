/**
 * PRIVATE — not imported anywhere in the site, so nothing here ships to the browser.
 *
 * Records from the supplied documentation whose relationship to Kashif is not yet
 * confirmed. To publish one, confirm the details with Kashif, move it into
 * `content/experience.ts` or `content/projects.ts`, and delete it from here.
 */

export const unpublishedCompanies = [
  { name: "ApptimumLabs", source: "original_md/40-company-apptimumlabs.md", needs: "relationship, role, dates, personal contribution, logo permission" },
  { name: "Zeikh Technologies", source: "original_md/41-company-zeikh-technologies.md", needs: "relationship, role, dates, personal contribution, logo permission" },
  { name: "Holacia", source: "original_md/42-company-holacia.md", needs: "relationship, role, dates, personal contribution, logo permission" },
] as const;

export const unpublishedProjects = [
  { name: "Wizlo telehealth infrastructure (core platform + lab/wearable/payment modules)", source: "original_md/11, 13", url: "https://www.wizlo.com/", needs: "Kashif's exact contribution and permission" },
  { name: "Digital Obesity & GLP-1 Care Platform", source: "original_md/10", needs: "identity, contribution and permission" },
  { name: "Brello weight-care platform", source: "original_md/22", url: "https://www.brellohealth.com/", needs: "contribution and permission" },
  { name: "Qalorie nutrition app", source: "original_md/14", url: "https://play.google.com/store/apps/details?id=com.qalorieapp", needs: "contribution and permission" },
  { name: "Wattl AI business platform", source: "original_md/12", needs: "confirm whether this is an alias of Waltz-AI; contribution" },
  { name: "IntoCities", source: "original_md/16", url: "https://intocities.com/", needs: "contribution and permission" },
  { name: "GoalMogul", source: "original_md/19", url: "https://goalmogul.com/", needs: "contribution and permission" },
  { name: "AI Chatbot Product Suite (publisher tools)", source: "original_md/20", needs: "contribution and permission" },
  { name: "Construction estimator — detailed four-agent / PDF-geometry / canvas architecture", source: "original_md/17", needs: "confirm which components Kashif built" },
  { name: "Legal warehouse — 10+ services, transcript classification, offline-conversion export", source: "original_md/18", needs: "confirm whether these extensions were Kashif's work" },
] as const;
