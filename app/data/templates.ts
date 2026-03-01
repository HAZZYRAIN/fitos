// ============================================================
// YOURTRAINER — APPROVED WORKOUT TEMPLATES
// Admin-curated. Trainers pick from these.
// Add new templates here — they auto-appear in both
// Admin Templates tab and Trainer Plans tab.
// ============================================================

import { Template } from "../types";

export const APPROVED_TEMPLATES: Template[] = [
  {
    id: "t1",
    name: "Beginner Fat Loss",
    category: "Fat Loss",
    days: "3x/week",
    duration: "45 min",
    exercises: 8,
    level: "Beginner",
    description: "Full body circuit focusing on calorie burn and basic movements",
  },
  {
    id: "t2",
    name: "Senior Mobility & Strength",
    category: "Mobility",
    days: "3x/week",
    duration: "40 min",
    exercises: 6,
    level: "Beginner",
    description: "Low-impact movements, joint mobility, light resistance",
  },
  {
    id: "t3",
    name: "Strength Basics",
    category: "Strength",
    days: "4x/week",
    duration: "60 min",
    exercises: 6,
    level: "Intermediate",
    description: "Compound lifts with progressive overload — squat, bench, deadlift",
  },
  {
    id: "t4",
    name: "Athletic Performance",
    category: "Performance",
    days: "5x/week",
    duration: "70 min",
    exercises: 9,
    level: "Advanced",
    description: "Power, agility, speed — suited for sport-specific athletes",
  },
  {
    id: "t5",
    name: "Post-Rehab Recovery",
    category: "Rehab",
    days: "3x/week",
    duration: "35 min",
    exercises: 5,
    level: "Beginner",
    description: "Gentle progressive loading post-injury — admin approved protocol",
  },
];
