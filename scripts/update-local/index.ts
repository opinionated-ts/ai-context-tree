import { updateSkills } from "@scripts/update-local/update-skills";

// oxlint-disable-next-line unicorn/no-single-promise-in-promise-methods
await Promise.all([updateSkills()]);
