

import { Exercise } from "../types";

export const WORKOUT_LIBRARY: Record<string, Exercise[]> = {
  Chest: [
    { name: "Barbell Bench Press", muscles: "Pecs, Triceps, Delts", equipment: "Barbell", level: "Intermediate" },
    { name: "Incline Dumbbell Press", muscles: "Upper Pecs, Delts", equipment: "Dumbbell", level: "Intermediate" },
    { name: "Cable Flye", muscles: "Pecs", equipment: "Cable", level: "Beginner" },
    { name: "Push-Up", muscles: "Pecs, Triceps", equipment: "Bodyweight", level: "Beginner" },
    { name: "Decline Bench Press", muscles: "Lower Pecs", equipment: "Barbell", level: "Intermediate" },
    { name: "Dumbbell Pullover", muscles: "Pecs, Lats", equipment: "Dumbbell", level: "Intermediate" },
  ],
  Back: [
    { name: "Deadlift", muscles: "Full Back, Hamstrings, Glutes", equipment: "Barbell", level: "Advanced" },
    { name: "Pull-Up", muscles: "Lats, Biceps", equipment: "Bodyweight", level: "Intermediate" },
    { name: "Barbell Row", muscles: "Lats, Rhomboids, Biceps", equipment: "Barbell", level: "Intermediate" },
    { name: "Lat Pulldown", muscles: "Lats, Biceps", equipment: "Cable", level: "Beginner" },
    { name: "Seated Cable Row", muscles: "Mid Back, Biceps", equipment: "Cable", level: "Beginner" },
    { name: "Face Pull", muscles: "Rear Delts, Traps", equipment: "Cable", level: "Beginner" },
  ],
  Legs: [
    { name: "Barbell Squat", muscles: "Quads, Glutes, Hamstrings", equipment: "Barbell", level: "Intermediate" },
    { name: "Romanian Deadlift", muscles: "Hamstrings, Glutes", equipment: "Barbell", level: "Intermediate" },
    { name: "Leg Press", muscles: "Quads, Glutes", equipment: "Machine", level: "Beginner" },
    { name: "Walking Lunges", muscles: "Quads, Glutes, Balance", equipment: "Bodyweight", level: "Beginner" },
    { name: "Leg Curl", muscles: "Hamstrings", equipment: "Machine", level: "Beginner" },
    { name: "Calf Raises", muscles: "Calves", equipment: "Machine", level: "Beginner" },
    { name: "Bulgarian Split Squat", muscles: "Quads, Glutes", equipment: "Dumbbell", level: "Intermediate" },
  ],
  Shoulders: [
    { name: "Overhead Press", muscles: "All Delts, Triceps", equipment: "Barbell", level: "Intermediate" },
    { name: "Lateral Raise", muscles: "Side Delts", equipment: "Dumbbell", level: "Beginner" },
    { name: "Front Raise", muscles: "Front Delts", equipment: "Dumbbell", level: "Beginner" },
    { name: "Arnold Press", muscles: "All Delts", equipment: "Dumbbell", level: "Intermediate" },
    { name: "Upright Row", muscles: "Traps, Side Delts", equipment: "Barbell", level: "Intermediate" },
    { name: "Rear Delt Flye", muscles: "Rear Delts", equipment: "Dumbbell", level: "Beginner" },
  ],
  Arms: [
    { name: "Barbell Curl", muscles: "Biceps", equipment: "Barbell", level: "Beginner" },
    { name: "Tricep Dip", muscles: "Triceps, Chest", equipment: "Bodyweight", level: "Intermediate" },
    { name: "Hammer Curl", muscles: "Biceps, Brachialis", equipment: "Dumbbell", level: "Beginner" },
    { name: "Skull Crusher", muscles: "Triceps", equipment: "Barbell", level: "Intermediate" },
    { name: "Cable Curl", muscles: "Biceps", equipment: "Cable", level: "Beginner" },
    { name: "Tricep Pushdown", muscles: "Triceps", equipment: "Cable", level: "Beginner" },
  ],
  Core: [
    { name: "Plank", muscles: "Core, Shoulders", equipment: "Bodyweight", level: "Beginner" },
    { name: "Cable Crunch", muscles: "Abs", equipment: "Cable", level: "Beginner" },
    { name: "Hanging Leg Raise", muscles: "Lower Abs, Hip Flexors", equipment: "Bodyweight", level: "Intermediate" },
    { name: "Russian Twist", muscles: "Obliques", equipment: "Bodyweight", level: "Beginner" },
    { name: "Ab Wheel Rollout", muscles: "Full Core", equipment: "Equipment", level: "Advanced" },
    { name: "Side Plank", muscles: "Obliques, Core", equipment: "Bodyweight", level: "Beginner" },
  ],
  Cardio: [
    { name: "Treadmill Run", muscles: "Full Body", equipment: "Machine", level: "Beginner" },
    { name: "Cycling", muscles: "Legs, Cardio", equipment: "Machine", level: "Beginner" },
    { name: "Jump Rope", muscles: "Full Body, Calves", equipment: "Equipment", level: "Beginner" },
    { name: "Box Jump", muscles: "Legs, Power", equipment: "Bodyweight", level: "Intermediate" },
    { name: "Battle Ropes", muscles: "Full Body", equipment: "Equipment", level: "Intermediate" },
    { name: "Rowing Machine", muscles: "Back, Arms, Legs", equipment: "Machine", level: "Beginner" },
  ],
};

export const WORKOUT_CATEGORIES = Object.keys(WORKOUT_LIBRARY);
