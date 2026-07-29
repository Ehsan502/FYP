export const ROADMAPS = {
  Technology: [
    "Learn the fundamentals and core syntax",
    "Build 2-3 small practice projects",
    "Study data structures relevant to the field",
    "Contribute to an open-source or group project",
    "Build a portfolio project and get peer feedback",
  ],
  Design: [
    "Learn design principles: layout, color, typography",
    "Practice recreating existing designs",
    "Learn a design tool (Figma/Adobe XD) deeply",
    "Design 2-3 original mock projects",
    "Get feedback from experienced designers and iterate",
  ],
  Music: [
    "Learn basic theory: notes, scales, rhythm",
    "Practice fundamentals daily for muscle memory",
    "Learn to play or produce simple pieces",
    "Study a style or genre you enjoy in depth",
    "Perform or share your work for feedback",
  ],
  Language: [
    "Learn the alphabet/pronunciation and greetings",
    "Build core vocabulary (500-1000 words)",
    "Study basic grammar and sentence structure",
    "Practice speaking with a native/fluent partner",
    "Immerse via media and real conversation practice",
  ],
  Business: [
    "Learn core concepts and terminology",
    "Study real case studies in the field",
    "Apply concepts to a small real or mock project",
    "Learn from a mentor or experienced practitioner",
    "Present or pitch your own small plan",
  ],
  Fitness: [
    "Learn proper form and safety basics",
    "Build a consistent beginner routine",
    "Track progress and adjust intensity",
    "Learn nutrition basics that support the goal",
    "Set a milestone goal and work toward it",
  ],
  Art: [
    "Learn fundamentals: shape, form, composition",
    "Practice daily with simple studies",
    "Study a style or medium you're drawn to",
    "Recreate reference work to learn technique",
    "Create an original piece and share for feedback",
  ],
  Cooking: [
    "Learn basic knife skills and techniques",
    "Master 3-5 foundational recipes",
    "Understand flavor pairing and seasoning",
    "Try a new cuisine or technique each week",
    "Host a meal to put it all together",
  ],
  Other: [
    "Clarify what you want to be able to do",
    "Find foundational resources or a mentor",
    "Practice consistently in small sessions",
    "Apply the skill to a real small project",
    "Get feedback and refine your approach",
  ],
};

export const getRoadmap = (category) => ROADMAPS[category] || ROADMAPS.Other;
