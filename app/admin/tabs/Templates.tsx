"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, orderBy, query, serverTimestamp
} from "firebase/firestore";
import { useAdmin } from "../AdminContext";
import { WORKOUT_LIBRARY } from "../../data/workoutLibrary";

// ── Types ─────────────────────────────────────────────────────
interface ExEntry { name: string; muscles: string; sets: string; reps: string; rest: string; notes: string; }
interface WorkoutDay { dayLabel: string; focus: string; exercises: ExEntry[]; }
interface Template {
  id: string; name: string; category: string; level: string;
  days: string; duration: string; description: string;
  status: "active" | "archived"; assignedTo?: string[];
  workoutDays?: WorkoutDay[]; createdAt?: any;
}

const EMPTY_FORM = { name: "", category: "Fat Loss", level: "Beginner", days: "", duration: "", description: "" };
const BLANK_EX = (): ExEntry => ({ name: "", muscles: "", sets: "3", reps: "10", rest: "60s", notes: "" });
const BLANK_DAY = (n: number): WorkoutDay => ({ dayLabel: `Day ${n}`, focus: "", exercises: [BLANK_EX()] });
const ALL_CATS = Object.keys(WORKOUT_LIBRARY);

// ── Pre-filled workout data for premade templates ─────────────
const PREMADE_DAYS: Record<string, WorkoutDay[]> = {
  "Beginner Fat Loss Kickstart": [
    { dayLabel: "Day 1", focus: "Full Body Circuit A", exercises: [
      { name: "Bodyweight Squat", muscles: "Quads, Glutes", sets: "3", reps: "15", rest: "45s", notes: "Focus on depth" },
      { name: "Push-Up", muscles: "Chest, Triceps", sets: "3", reps: "10", rest: "45s", notes: "Knees if needed" },
      { name: "Dumbbell Row", muscles: "Back, Biceps", sets: "3", reps: "12", rest: "45s", notes: "Each arm" },
      { name: "Jumping Jacks", muscles: "Cardio", sets: "3", reps: "30", rest: "30s", notes: "" },
      { name: "Plank Hold", muscles: "Core", sets: "3", reps: "20s", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Full Body Circuit B", exercises: [
      { name: "Reverse Lunge", muscles: "Quads, Glutes", sets: "3", reps: "10", rest: "45s", notes: "Each leg" },
      { name: "Dumbbell Shoulder Press", muscles: "Shoulders", sets: "3", reps: "12", rest: "45s", notes: "" },
      { name: "Lat Pulldown", muscles: "Back", sets: "3", reps: "12", rest: "45s", notes: "" },
      { name: "Mountain Climbers", muscles: "Core, Cardio", sets: "3", reps: "20", rest: "30s", notes: "" },
      { name: "Glute Bridge", muscles: "Glutes, Hamstrings", sets: "3", reps: "15", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Cardio + Core", exercises: [
      { name: "Treadmill Walk/Jog", muscles: "Cardio", sets: "1", reps: "20 min", rest: "—", notes: "60-70% max HR" },
      { name: "Bicycle Crunch", muscles: "Core", sets: "3", reps: "20", rest: "30s", notes: "" },
      { name: "Leg Raises", muscles: "Lower Abs", sets: "3", reps: "12", rest: "30s", notes: "" },
      { name: "Russian Twist", muscles: "Obliques", sets: "3", reps: "20", rest: "30s", notes: "" },
    ]},
  ],
  "Intermediate Fat Loss Shred": [
    { dayLabel: "Day 1", focus: "Upper Body Superset", exercises: [
      { name: "Bench Press", muscles: "Chest", sets: "4", reps: "10", rest: "60s", notes: "Superset with row" },
      { name: "Barbell Row", muscles: "Back", sets: "4", reps: "10", rest: "60s", notes: "" },
      { name: "Overhead Press", muscles: "Shoulders", sets: "3", reps: "10", rest: "60s", notes: "" },
      { name: "Pull-Up / Assisted", muscles: "Back, Biceps", sets: "3", reps: "8", rest: "60s", notes: "" },
      { name: "Tricep Dips", muscles: "Triceps", sets: "3", reps: "12", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Lower Body + HIIT Finisher", exercises: [
      { name: "Barbell Squat", muscles: "Quads, Glutes", sets: "4", reps: "10", rest: "75s", notes: "" },
      { name: "Romanian Deadlift", muscles: "Hamstrings", sets: "3", reps: "10", rest: "60s", notes: "" },
      { name: "Walking Lunge", muscles: "Quads, Glutes", sets: "3", reps: "12", rest: "60s", notes: "Each leg" },
      { name: "Battle Ropes", muscles: "Cardio", sets: "5", reps: "30s", rest: "30s", notes: "HIIT finisher" },
    ]},
    { dayLabel: "Day 3", focus: "HIIT Circuit", exercises: [
      { name: "Burpees", muscles: "Full Body", sets: "4", reps: "10", rest: "30s", notes: "" },
      { name: "Box Jump", muscles: "Quads, Power", sets: "4", reps: "8", rest: "45s", notes: "" },
      { name: "Kettlebell Swing", muscles: "Glutes, Hamstrings", sets: "4", reps: "15", rest: "45s", notes: "" },
      { name: "Sprint Intervals", muscles: "Cardio", sets: "8", reps: "20s", rest: "40s", notes: "" },
    ]},
    { dayLabel: "Day 4", focus: "Active Recovery + Core", exercises: [
      { name: "Light Cycling", muscles: "Cardio", sets: "1", reps: "20 min", rest: "—", notes: "Low intensity" },
      { name: "Plank Hold", muscles: "Core", sets: "3", reps: "45s", rest: "30s", notes: "" },
      { name: "Dead Bug", muscles: "Core", sets: "3", reps: "10", rest: "30s", notes: "Each side" },
      { name: "Hip Flexor Stretch", muscles: "Mobility", sets: "2", reps: "60s", rest: "—", notes: "Each side" },
    ]},
  ],
  "Beginner Strength Foundation": [
    { dayLabel: "Day 1", focus: "Squat + Push Pattern", exercises: [
      { name: "Goblet Squat", muscles: "Quads, Glutes", sets: "3", reps: "10", rest: "90s", notes: "Learn depth first" },
      { name: "Dumbbell Bench Press", muscles: "Chest", sets: "3", reps: "10", rest: "90s", notes: "" },
      { name: "Leg Press", muscles: "Quads", sets: "3", reps: "12", rest: "75s", notes: "" },
      { name: "Incline Push-Up", muscles: "Chest, Triceps", sets: "3", reps: "12", rest: "60s", notes: "" },
      { name: "Plank", muscles: "Core", sets: "3", reps: "20s", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Hinge + Pull Pattern", exercises: [
      { name: "Trap Bar Deadlift", muscles: "Hamstrings, Glutes", sets: "3", reps: "8", rest: "2 min", notes: "Or dumbbell deadlift" },
      { name: "Seated Cable Row", muscles: "Back", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Glute Bridge", muscles: "Glutes", sets: "3", reps: "15", rest: "60s", notes: "" },
      { name: "Lat Pulldown", muscles: "Back, Biceps", sets: "3", reps: "12", rest: "75s", notes: "" },
      { name: "Dumbbell Curl", muscles: "Biceps", sets: "2", reps: "12", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Full Body + Carry", exercises: [
      { name: "Barbell Squat", muscles: "Quads, Glutes", sets: "3", reps: "8", rest: "2 min", notes: "Light, focus form" },
      { name: "Overhead Press", muscles: "Shoulders", sets: "3", reps: "10", rest: "90s", notes: "" },
      { name: "Dumbbell Row", muscles: "Back", sets: "3", reps: "10", rest: "75s", notes: "Each arm" },
      { name: "Farmer's Carry", muscles: "Full Body, Grip", sets: "3", reps: "30m", rest: "90s", notes: "" },
      { name: "Ab Wheel / Plank", muscles: "Core", sets: "3", reps: "10", rest: "60s", notes: "" },
    ]},
  ],
  "Intermediate Strength Builder": [
    { dayLabel: "Day 1", focus: "Upper A — Push", exercises: [
      { name: "Barbell Bench Press", muscles: "Chest", sets: "4", reps: "6-8", rest: "2 min", notes: "Main lift" },
      { name: "Overhead Press", muscles: "Shoulders", sets: "3", reps: "8", rest: "2 min", notes: "" },
      { name: "Incline Dumbbell Press", muscles: "Upper Chest", sets: "3", reps: "10", rest: "90s", notes: "" },
      { name: "Tricep Pushdown", muscles: "Triceps", sets: "3", reps: "12", rest: "60s", notes: "" },
      { name: "Lateral Raise", muscles: "Side Delts", sets: "3", reps: "15", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Lower A — Squat Focus", exercises: [
      { name: "Barbell Back Squat", muscles: "Quads, Glutes", sets: "4", reps: "5", rest: "3 min", notes: "Work up to top set" },
      { name: "Bulgarian Split Squat", muscles: "Quads, Glutes", sets: "3", reps: "8", rest: "2 min", notes: "Each leg" },
      { name: "Leg Curl", muscles: "Hamstrings", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Calf Raise", muscles: "Calves", sets: "4", reps: "15", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Upper B — Pull", exercises: [
      { name: "Barbell Row", muscles: "Back", sets: "4", reps: "6-8", rest: "2 min", notes: "" },
      { name: "Weighted Pull-Up", muscles: "Back, Biceps", sets: "3", reps: "6", rest: "2 min", notes: "" },
      { name: "Face Pull", muscles: "Rear Delts", sets: "3", reps: "15", rest: "60s", notes: "" },
      { name: "Barbell Curl", muscles: "Biceps", sets: "3", reps: "10", rest: "75s", notes: "" },
    ]},
    { dayLabel: "Day 4", focus: "Lower B — Hinge Focus", exercises: [
      { name: "Conventional Deadlift", muscles: "Hamstrings, Glutes, Back", sets: "4", reps: "5", rest: "3 min", notes: "Main lift" },
      { name: "Romanian Deadlift", muscles: "Hamstrings", sets: "3", reps: "10", rest: "2 min", notes: "" },
      { name: "Leg Press", muscles: "Quads", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Hip Thrust", muscles: "Glutes", sets: "3", reps: "12", rest: "90s", notes: "" },
    ]},
  ],
  "Advanced Powerlifting Program": [
    { dayLabel: "Day 1", focus: "Squat Intensity", exercises: [
      { name: "Barbell Back Squat", muscles: "Quads, Glutes", sets: "5", reps: "3", rest: "4 min", notes: "85%+ 1RM" },
      { name: "Pause Squat", muscles: "Quads", sets: "3", reps: "3", rest: "3 min", notes: "3s pause at bottom" },
      { name: "Leg Press", muscles: "Quads", sets: "3", reps: "10", rest: "2 min", notes: "" },
      { name: "Leg Curl", muscles: "Hamstrings", sets: "3", reps: "12", rest: "90s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Bench Intensity", exercises: [
      { name: "Barbell Bench Press", muscles: "Chest", sets: "5", reps: "3", rest: "4 min", notes: "85%+ 1RM" },
      { name: "Close-Grip Bench", muscles: "Chest, Triceps", sets: "3", reps: "5", rest: "3 min", notes: "" },
      { name: "Dumbbell Flye", muscles: "Chest", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Tricep Pushdown", muscles: "Triceps", sets: "4", reps: "12", rest: "75s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Deadlift Intensity", exercises: [
      { name: "Conventional Deadlift", muscles: "Full Posterior Chain", sets: "5", reps: "2", rest: "5 min", notes: "90%+ 1RM" },
      { name: "Romanian Deadlift", muscles: "Hamstrings", sets: "3", reps: "8", rest: "2 min", notes: "" },
      { name: "Barbell Row", muscles: "Back", sets: "4", reps: "8", rest: "2 min", notes: "" },
      { name: "Pull-Up", muscles: "Back", sets: "3", reps: "8", rest: "90s", notes: "" },
    ]},
    { dayLabel: "Day 4", focus: "Accessory & Weak Points", exercises: [
      { name: "Box Squat", muscles: "Quads, Glutes", sets: "4", reps: "5", rest: "3 min", notes: "" },
      { name: "Paused Deadlift", muscles: "Hamstrings", sets: "3", reps: "4", rest: "3 min", notes: "Pause below knee" },
      { name: "Overhead Press", muscles: "Shoulders", sets: "4", reps: "6", rest: "2 min", notes: "" },
      { name: "Ab Circuit", muscles: "Core", sets: "4", reps: "15", rest: "60s", notes: "" },
    ]},
  ],
  "Beginner Muscle Gain": [
    { dayLabel: "Day 1", focus: "Full Body A", exercises: [
      { name: "Barbell Squat", muscles: "Quads, Glutes", sets: "3", reps: "10", rest: "2 min", notes: "" },
      { name: "Dumbbell Bench Press", muscles: "Chest", sets: "3", reps: "10", rest: "90s", notes: "" },
      { name: "Lat Pulldown", muscles: "Back", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Dumbbell Curl", muscles: "Biceps", sets: "3", reps: "12", rest: "60s", notes: "" },
      { name: "Tricep Pushdown", muscles: "Triceps", sets: "3", reps: "12", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Full Body B", exercises: [
      { name: "Romanian Deadlift", muscles: "Hamstrings, Glutes", sets: "3", reps: "10", rest: "2 min", notes: "" },
      { name: "Overhead Press", muscles: "Shoulders", sets: "3", reps: "10", rest: "90s", notes: "" },
      { name: "Seated Cable Row", muscles: "Back", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Leg Curl", muscles: "Hamstrings", sets: "3", reps: "12", rest: "75s", notes: "" },
      { name: "Calf Raise", muscles: "Calves", sets: "3", reps: "15", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Full Body C", exercises: [
      { name: "Leg Press", muscles: "Quads", sets: "3", reps: "12", rest: "2 min", notes: "" },
      { name: "Incline Dumbbell Press", muscles: "Upper Chest", sets: "3", reps: "10", rest: "90s", notes: "" },
      { name: "Dumbbell Row", muscles: "Back", sets: "3", reps: "12", rest: "75s", notes: "Each arm" },
      { name: "Lateral Raise", muscles: "Side Delts", sets: "3", reps: "15", rest: "60s", notes: "" },
      { name: "Plank", muscles: "Core", sets: "3", reps: "30s", rest: "45s", notes: "" },
    ]},
  ],
  "Intermediate Muscle Gain (PPL)": [
    { dayLabel: "Day 1", focus: "Push A", exercises: [
      { name: "Barbell Bench Press", muscles: "Chest", sets: "4", reps: "8-10", rest: "2 min", notes: "" },
      { name: "Incline Dumbbell Press", muscles: "Upper Chest", sets: "3", reps: "10-12", rest: "90s", notes: "" },
      { name: "Overhead Press", muscles: "Shoulders", sets: "3", reps: "10", rest: "90s", notes: "" },
      { name: "Tricep Pushdown", muscles: "Triceps", sets: "3", reps: "12", rest: "60s", notes: "" },
      { name: "Lateral Raise", muscles: "Side Delts", sets: "3", reps: "15", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Pull A", exercises: [
      { name: "Pull-Up / Weighted", muscles: "Back, Biceps", sets: "4", reps: "8", rest: "2 min", notes: "" },
      { name: "Barbell Row", muscles: "Back", sets: "4", reps: "8-10", rest: "2 min", notes: "" },
      { name: "Face Pull", muscles: "Rear Delts", sets: "3", reps: "15", rest: "60s", notes: "" },
      { name: "Barbell Curl", muscles: "Biceps", sets: "3", reps: "10", rest: "75s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Legs A", exercises: [
      { name: "Barbell Back Squat", muscles: "Quads, Glutes", sets: "4", reps: "8-10", rest: "2 min", notes: "" },
      { name: "Romanian Deadlift", muscles: "Hamstrings", sets: "3", reps: "10", rest: "2 min", notes: "" },
      { name: "Leg Press", muscles: "Quads", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Leg Curl", muscles: "Hamstrings", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Calf Raise", muscles: "Calves", sets: "4", reps: "15", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 4", focus: "Push B", exercises: [
      { name: "Dumbbell Shoulder Press", muscles: "Shoulders", sets: "4", reps: "10", rest: "90s", notes: "" },
      { name: "Incline Barbell Press", muscles: "Upper Chest", sets: "4", reps: "8", rest: "2 min", notes: "" },
      { name: "Cable Crossover", muscles: "Chest", sets: "3", reps: "15", rest: "60s", notes: "" },
      { name: "Skull Crusher", muscles: "Triceps", sets: "3", reps: "10", rest: "75s", notes: "" },
    ]},
    { dayLabel: "Day 5", focus: "Pull B", exercises: [
      { name: "Seated Cable Row", muscles: "Back", sets: "4", reps: "10-12", rest: "90s", notes: "" },
      { name: "Lat Pulldown", muscles: "Back", sets: "4", reps: "10", rest: "90s", notes: "" },
      { name: "Rear Delt Flye", muscles: "Rear Delts", sets: "3", reps: "15", rest: "60s", notes: "" },
      { name: "Incline Dumbbell Curl", muscles: "Biceps", sets: "3", reps: "12", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 6", focus: "Legs B", exercises: [
      { name: "Romanian Deadlift", muscles: "Hamstrings", sets: "4", reps: "8", rest: "2 min", notes: "" },
      { name: "Bulgarian Split Squat", muscles: "Quads, Glutes", sets: "3", reps: "10", rest: "2 min", notes: "Each leg" },
      { name: "Hip Thrust", muscles: "Glutes", sets: "4", reps: "12", rest: "90s", notes: "" },
      { name: "Leg Extension", muscles: "Quads", sets: "3", reps: "15", rest: "75s", notes: "" },
      { name: "Standing Calf Raise", muscles: "Calves", sets: "4", reps: "20", rest: "60s", notes: "" },
    ]},
  ],
  "Beginner HIIT & Conditioning": [
    { dayLabel: "Day 1", focus: "Low-Impact Cardio Circuit", exercises: [
      { name: "Marching in Place", muscles: "Cardio", sets: "3", reps: "60s", rest: "30s", notes: "Warm up" },
      { name: "Bodyweight Squat", muscles: "Quads, Glutes", sets: "3", reps: "15", rest: "30s", notes: "" },
      { name: "Modified Push-Up", muscles: "Chest", sets: "3", reps: "10", rest: "30s", notes: "Knees on floor" },
      { name: "High Knees (Slow)", muscles: "Cardio, Core", sets: "3", reps: "20s", rest: "40s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Upper + Core HIIT", exercises: [
      { name: "Jumping Jacks", muscles: "Cardio", sets: "4", reps: "30s", rest: "30s", notes: "" },
      { name: "Push-Up", muscles: "Chest, Triceps", sets: "3", reps: "10", rest: "30s", notes: "" },
      { name: "Dumbbell Row", muscles: "Back", sets: "3", reps: "12", rest: "30s", notes: "" },
      { name: "Mountain Climbers", muscles: "Core", sets: "3", reps: "20s", rest: "30s", notes: "" },
      { name: "Plank Hold", muscles: "Core", sets: "3", reps: "25s", rest: "30s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Lower HIIT + Stretch", exercises: [
      { name: "Bodyweight Squat", muscles: "Quads, Glutes", sets: "4", reps: "15", rest: "30s", notes: "" },
      { name: "Reverse Lunge", muscles: "Quads, Glutes", sets: "3", reps: "10", rest: "30s", notes: "Each leg" },
      { name: "Glute Bridge", muscles: "Glutes", sets: "3", reps: "15", rest: "30s", notes: "" },
      { name: "Hip Flexor Stretch", muscles: "Mobility", sets: "2", reps: "45s", rest: "—", notes: "Each side" },
    ]},
  ],
  "Mobility & Flexibility Reset": [
    { dayLabel: "Day 1", focus: "Lower Body Mobility", exercises: [
      { name: "90/90 Hip Stretch", muscles: "Hips", sets: "2", reps: "60s", rest: "—", notes: "Each side" },
      { name: "World's Greatest Stretch", muscles: "Full Body", sets: "3", reps: "5", rest: "—", notes: "Each side" },
      { name: "Pigeon Pose", muscles: "Hip Flexors, Glutes", sets: "2", reps: "90s", rest: "—", notes: "Each side" },
      { name: "Hamstring Stretch", muscles: "Hamstrings", sets: "3", reps: "45s", rest: "—", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Thoracic & Shoulder", exercises: [
      { name: "Thoracic Rotation", muscles: "T-Spine", sets: "3", reps: "10", rest: "—", notes: "Each side" },
      { name: "Cat-Cow", muscles: "Spine", sets: "3", reps: "10", rest: "—", notes: "" },
      { name: "Child's Pose", muscles: "Back, Lats", sets: "2", reps: "60s", rest: "—", notes: "" },
      { name: "Thread the Needle", muscles: "Thoracic, Shoulder", sets: "2", reps: "45s", rest: "—", notes: "Each side" },
    ]},
    { dayLabel: "Day 3", focus: "Full Body Flow", exercises: [
      { name: "Sun Salutation Flow", muscles: "Full Body", sets: "3", reps: "5 rounds", rest: "—", notes: "" },
      { name: "Seated Forward Fold", muscles: "Hamstrings, Back", sets: "3", reps: "60s", rest: "—", notes: "" },
      { name: "Spinal Twist", muscles: "Spine, Glutes", sets: "2", reps: "60s", rest: "—", notes: "Each side" },
      { name: "Frog Stretch", muscles: "Groin, Hips", sets: "2", reps: "90s", rest: "—", notes: "" },
    ]},
  ],
  "Post-Injury Rehab (Lower Body)": [
    { dayLabel: "Day 1", focus: "Knee Rehab", exercises: [
      { name: "Terminal Knee Extension", muscles: "VMO, Quads", sets: "3", reps: "15", rest: "45s", notes: "Band around knee" },
      { name: "Mini Band Side Walk", muscles: "Glutes, Hips", sets: "3", reps: "15", rest: "45s", notes: "Each direction" },
      { name: "Seated Leg Extension (light)", muscles: "Quads", sets: "3", reps: "15", rest: "60s", notes: "Pain-free range only" },
      { name: "Calf Raise", muscles: "Calves", sets: "3", reps: "15", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Hip & Glute Activation", exercises: [
      { name: "Glute Bridge", muscles: "Glutes", sets: "3", reps: "15", rest: "60s", notes: "" },
      { name: "Clamshell", muscles: "Glute Med", sets: "3", reps: "15", rest: "45s", notes: "Each side" },
      { name: "Dead Bug", muscles: "Core", sets: "3", reps: "8", rest: "45s", notes: "Each side" },
      { name: "Hip Flexor Stretch", muscles: "Hip Flexors", sets: "2", reps: "60s", rest: "—", notes: "Each side" },
    ]},
    { dayLabel: "Day 3", focus: "Functional Movement", exercises: [
      { name: "Box Step-Up (low)", muscles: "Quads, Glutes", sets: "3", reps: "10", rest: "60s", notes: "Pain-free only" },
      { name: "Partial Squat to Chair", muscles: "Quads, Glutes", sets: "3", reps: "12", rest: "60s", notes: "Touch chair, don't sit" },
      { name: "Hip Hinge (bodyweight)", muscles: "Hamstrings", sets: "3", reps: "12", rest: "60s", notes: "Learn the pattern" },
      { name: "Balance Stand", muscles: "Ankle, Stability", sets: "3", reps: "30s", rest: "30s", notes: "Each leg" },
    ]},
  ],
  "Post-Injury Rehab (Upper Body)": [
    { dayLabel: "Day 1", focus: "Shoulder Stability", exercises: [
      { name: "Band External Rotation", muscles: "Rotator Cuff", sets: "3", reps: "15", rest: "45s", notes: "Light band" },
      { name: "Wall Slides", muscles: "Scapular Stabilisers", sets: "3", reps: "12", rest: "45s", notes: "" },
      { name: "Face Pull (light)", muscles: "Rear Delts", sets: "3", reps: "15", rest: "45s", notes: "" },
      { name: "Prone Y-T-W", muscles: "Lower Traps", sets: "3", reps: "10", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Elbow & Wrist Care", exercises: [
      { name: "Wrist Flexion/Extension", muscles: "Forearm", sets: "3", reps: "15", rest: "30s", notes: "Light dumbbell" },
      { name: "Supination/Pronation", muscles: "Forearm", sets: "3", reps: "15", rest: "30s", notes: "" },
      { name: "Hammer Curl (light)", muscles: "Brachialis", sets: "3", reps: "12", rest: "45s", notes: "" },
      { name: "Tricep Pushdown (light)", muscles: "Triceps", sets: "3", reps: "15", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Loading Progressions", exercises: [
      { name: "Incline Push-Up", muscles: "Chest, Shoulders", sets: "3", reps: "12", rest: "60s", notes: "Pain-free only" },
      { name: "Seated Row (light)", muscles: "Back", sets: "3", reps: "12", rest: "60s", notes: "" },
      { name: "Lateral Raise (light)", muscles: "Side Delts", sets: "3", reps: "15", rest: "45s", notes: "" },
      { name: "Band Pull-Apart", muscles: "Rear Delts", sets: "3", reps: "15", rest: "45s", notes: "" },
    ]},
  ],
  "Advanced Fat Burn & Maintain": [
    { dayLabel: "Day 1", focus: "Upper HIIT + Strength", exercises: [
      { name: "Barbell Bench Press", muscles: "Chest", sets: "4", reps: "8", rest: "90s", notes: "" },
      { name: "Pull-Up", muscles: "Back", sets: "4", reps: "8", rest: "90s", notes: "" },
      { name: "Dumbbell Complex", muscles: "Full Body", sets: "4", reps: "6 each move", rest: "60s", notes: "6 press, 6 row, 6 squat" },
      { name: "Battle Ropes", muscles: "Cardio", sets: "5", reps: "30s", rest: "30s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Lower HIIT + Strength", exercises: [
      { name: "Barbell Back Squat", muscles: "Quads, Glutes", sets: "4", reps: "6", rest: "2 min", notes: "" },
      { name: "Romanian Deadlift", muscles: "Hamstrings", sets: "3", reps: "8", rest: "90s", notes: "" },
      { name: "Box Jump", muscles: "Power", sets: "4", reps: "6", rest: "60s", notes: "" },
      { name: "Sled Push/Row", muscles: "Full Body", sets: "5", reps: "20m", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "HIIT Metcon", exercises: [
      { name: "Burpees", muscles: "Full Body", sets: "5", reps: "10", rest: "30s", notes: "" },
      { name: "Kettlebell Swing", muscles: "Posterior Chain", sets: "5", reps: "15", rest: "30s", notes: "" },
      { name: "Sprint Intervals", muscles: "Cardio", sets: "10", reps: "15s", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 4", focus: "Full Body Strength", exercises: [
      { name: "Deadlift", muscles: "Full Body", sets: "4", reps: "5", rest: "3 min", notes: "" },
      { name: "Overhead Press", muscles: "Shoulders", sets: "3", reps: "8", rest: "2 min", notes: "" },
      { name: "Weighted Pull-Up", muscles: "Back", sets: "3", reps: "6", rest: "2 min", notes: "" },
    ]},
    { dayLabel: "Day 5", focus: "Active Recovery + Cardio", exercises: [
      { name: "Zone 2 Cardio", muscles: "Cardio", sets: "1", reps: "30 min", rest: "—", notes: "65% max HR, steady state" },
      { name: "Full Body Stretch", muscles: "Mobility", sets: "1", reps: "10 min", rest: "—", notes: "" },
    ]},
  ],
  "Advanced Mass & Symmetry": [
    { dayLabel: "Day 1", focus: "Chest + Biceps", exercises: [
      { name: "Barbell Bench Press", muscles: "Chest", sets: "4", reps: "8", rest: "2 min", notes: "" },
      { name: "Incline Dumbbell Press", muscles: "Upper Chest", sets: "4", reps: "10", rest: "90s", notes: "" },
      { name: "Cable Flye", muscles: "Chest", sets: "3", reps: "12-15", rest: "60s", notes: "" },
      { name: "Barbell Curl", muscles: "Biceps", sets: "4", reps: "8", rest: "75s", notes: "" },
      { name: "Incline Dumbbell Curl", muscles: "Biceps", sets: "3", reps: "12", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Back + Rear Delts", exercises: [
      { name: "Barbell Row", muscles: "Back", sets: "4", reps: "8", rest: "2 min", notes: "" },
      { name: "Weighted Pull-Up", muscles: "Back, Biceps", sets: "4", reps: "6", rest: "2 min", notes: "" },
      { name: "Seated Cable Row", muscles: "Mid Back", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Rear Delt Flye", muscles: "Rear Delts", sets: "4", reps: "15", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Legs", exercises: [
      { name: "Barbell Back Squat", muscles: "Quads, Glutes", sets: "4", reps: "8", rest: "2 min", notes: "" },
      { name: "Romanian Deadlift", muscles: "Hamstrings", sets: "4", reps: "10", rest: "2 min", notes: "" },
      { name: "Leg Press", muscles: "Quads", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Hip Thrust", muscles: "Glutes", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Leg Curl", muscles: "Hamstrings", sets: "3", reps: "12", rest: "75s", notes: "" },
      { name: "Calf Raise", muscles: "Calves", sets: "5", reps: "15", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 4", focus: "Shoulders + Triceps", exercises: [
      { name: "Overhead Press", muscles: "Shoulders", sets: "4", reps: "8", rest: "2 min", notes: "" },
      { name: "Lateral Raise", muscles: "Side Delts", sets: "5", reps: "15", rest: "60s", notes: "Drop set last set" },
      { name: "Arnold Press", muscles: "Shoulders", sets: "3", reps: "10", rest: "90s", notes: "" },
      { name: "Skull Crusher", muscles: "Triceps", sets: "4", reps: "10", rest: "75s", notes: "" },
      { name: "Overhead Tricep Extension", muscles: "Triceps", sets: "3", reps: "12", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 5", focus: "Lagging Muscles + Arms", exercises: [
      { name: "Hammer Curl", muscles: "Brachialis", sets: "4", reps: "12", rest: "60s", notes: "" },
      { name: "Reverse Curl", muscles: "Forearm", sets: "3", reps: "12", rest: "60s", notes: "" },
      { name: "Tricep Dips (weighted)", muscles: "Triceps", sets: "4", reps: "10", rest: "75s", notes: "" },
      { name: "Cable Curl (21s)", muscles: "Biceps", sets: "3", reps: "21", rest: "90s", notes: "7 lower, 7 upper, 7 full" },
    ]},
  ],
  "Intermediate HIIT Bootcamp": [
    { dayLabel: "Day 1", focus: "Kettlebell + Cardio", exercises: [
      { name: "Kettlebell Swing", muscles: "Posterior Chain", sets: "5", reps: "15", rest: "30s", notes: "" },
      { name: "Goblet Squat", muscles: "Quads, Glutes", sets: "4", reps: "12", rest: "30s", notes: "" },
      { name: "Burpees", muscles: "Full Body", sets: "4", reps: "10", rest: "30s", notes: "" },
      { name: "Kettlebell Clean & Press", muscles: "Shoulders, Glutes", sets: "3", reps: "8", rest: "45s", notes: "Each arm" },
    ]},
    { dayLabel: "Day 2", focus: "Plyometrics + Core", exercises: [
      { name: "Box Jump", muscles: "Power, Quads", sets: "4", reps: "8", rest: "45s", notes: "" },
      { name: "Plyo Push-Up", muscles: "Chest, Power", sets: "3", reps: "8", rest: "45s", notes: "" },
      { name: "Tuck Jump", muscles: "Cardio, Core", sets: "4", reps: "10", rest: "30s", notes: "" },
      { name: "Ab Circuit", muscles: "Core", sets: "3", reps: "60s", rest: "30s", notes: "Plank, crunch, mountain climbers" },
    ]},
    { dayLabel: "Day 3", focus: "Barbell Complex", exercises: [
      { name: "Barbell Complex", muscles: "Full Body", sets: "5", reps: "5 each", rest: "2 min", notes: "Deadlift, row, clean, press, squat — no rest between" },
      { name: "Sprint Finisher", muscles: "Cardio", sets: "8", reps: "20s", rest: "40s", notes: "" },
    ]},
    { dayLabel: "Day 4", focus: "Active Recovery", exercises: [
      { name: "Light Jog or Cycle", muscles: "Cardio", sets: "1", reps: "20 min", rest: "—", notes: "Zone 1-2, conversational pace" },
      { name: "Foam Rolling", muscles: "Full Body", sets: "1", reps: "10 min", rest: "—", notes: "" },
      { name: "Mobility Flow", muscles: "Full Body", sets: "1", reps: "10 min", rest: "—", notes: "" },
    ]},
  ],
  "Intermediate Mobility & Strength": [
    { dayLabel: "Day 1", focus: "Squat Mobility + Strength", exercises: [
      { name: "Deep Squat Hold", muscles: "Hips, Quads", sets: "3", reps: "60s", rest: "—", notes: "" },
      { name: "Cossack Squat", muscles: "Adductors, Hips", sets: "3", reps: "8", rest: "60s", notes: "Each side" },
      { name: "Goblet Squat", muscles: "Quads, Glutes", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Hip Hinge + Row", muscles: "Hamstrings, Back", sets: "3", reps: "10", rest: "75s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Shoulder Mobility + Press", exercises: [
      { name: "Shoulder CARs", muscles: "Shoulder Joint", sets: "3", reps: "5", rest: "—", notes: "Controlled articular rotations" },
      { name: "Band Pull-Apart", muscles: "Rear Delts", sets: "3", reps: "15", rest: "30s", notes: "" },
      { name: "Overhead Press", muscles: "Shoulders", sets: "3", reps: "10", rest: "90s", notes: "" },
      { name: "Single-Arm Carry", muscles: "Core, Shoulder Stability", sets: "3", reps: "30m", rest: "60s", notes: "Each arm" },
    ]},
    { dayLabel: "Day 3", focus: "Hinge + Thoracic", exercises: [
      { name: "Jefferson Curl", muscles: "Spine, Hamstrings", sets: "3", reps: "8", rest: "90s", notes: "Light weight, full spinal flexion" },
      { name: "Romanian Deadlift", muscles: "Hamstrings", sets: "3", reps: "10", rest: "2 min", notes: "" },
      { name: "Thoracic Extension on Roller", muscles: "T-Spine", sets: "3", reps: "60s", rest: "—", notes: "" },
      { name: "Turkish Get-Up", muscles: "Full Body Stability", sets: "3", reps: "3", rest: "90s", notes: "Each side" },
    ]},
  ],
  "Athletic Performance (Sport)": [
    { dayLabel: "Day 1", focus: "Speed + Lower Power", exercises: [
      { name: "Sprint Drills (A/B skip)", muscles: "Sprint Mechanics", sets: "4", reps: "20m", rest: "2 min", notes: "" },
      { name: "Barbell Back Squat", muscles: "Quads, Glutes", sets: "4", reps: "4", rest: "3 min", notes: "Explosive concentric" },
      { name: "Box Jump", muscles: "Power", sets: "4", reps: "5", rest: "2 min", notes: "" },
      { name: "Single-Leg Hop", muscles: "Power, Stability", sets: "3", reps: "5", rest: "90s", notes: "Each leg" },
    ]},
    { dayLabel: "Day 2", focus: "Upper Power + Push", exercises: [
      { name: "Medicine Ball Chest Pass", muscles: "Chest, Power", sets: "4", reps: "8", rest: "90s", notes: "" },
      { name: "Bench Press (Explosive)", muscles: "Chest", sets: "4", reps: "5", rest: "3 min", notes: "Speed focus" },
      { name: "Pull-Up", muscles: "Back", sets: "4", reps: "6", rest: "2 min", notes: "" },
      { name: "Overhead Press", muscles: "Shoulders", sets: "3", reps: "6", rest: "2 min", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Agility + Conditioning", exercises: [
      { name: "Ladder Drills", muscles: "Footwork, Agility", sets: "6", reps: "1 pattern", rest: "60s", notes: "In-in-out, lateral shuffles" },
      { name: "Cone Drill (5-10-5)", muscles: "Change of Direction", sets: "6", reps: "1 rep", rest: "90s", notes: "" },
      { name: "400m Intervals", muscles: "Aerobic Capacity", sets: "4", reps: "400m", rest: "3 min", notes: "85% effort" },
    ]},
    { dayLabel: "Day 4", focus: "Deadlift + Posterior Chain", exercises: [
      { name: "Trap Bar Deadlift", muscles: "Full Posterior Chain", sets: "4", reps: "4", rest: "3 min", notes: "Explosive" },
      { name: "Romanian Deadlift", muscles: "Hamstrings", sets: "3", reps: "8", rest: "2 min", notes: "" },
      { name: "Hip Thrust", muscles: "Glutes", sets: "3", reps: "10", rest: "90s", notes: "" },
      { name: "Nordic Hamstring Curl", muscles: "Hamstrings", sets: "3", reps: "5", rest: "2 min", notes: "Injury prevention" },
    ]},
    { dayLabel: "Day 5", focus: "Recovery + Mobility", exercises: [
      { name: "Zone 2 Cardio", muscles: "Cardio", sets: "1", reps: "25 min", rest: "—", notes: "Bike or swim preferred" },
      { name: "Full Body Mobility Flow", muscles: "Full Body", sets: "1", reps: "15 min", rest: "—", notes: "" },
      { name: "Cold/Contrast Therapy", muscles: "Recovery", sets: "1", reps: "10 min", rest: "—", notes: "If available" },
    ]},
  ],
  "Couple's Partner Workout": [
    { dayLabel: "Day 1", focus: "Partner Circuit A", exercises: [
      { name: "Partner Squat (back to back)", muscles: "Quads, Glutes", sets: "3", reps: "15", rest: "45s", notes: "Lean into each other" },
      { name: "Mirror Push-Up", muscles: "Chest", sets: "3", reps: "12", rest: "45s", notes: "Face each other, high five at top" },
      { name: "Partner Resistance Row", muscles: "Back", sets: "3", reps: "12", rest: "45s", notes: "Use towel or band" },
      { name: "Relay Sprint", muscles: "Cardio", sets: "4", reps: "20m each", rest: "30s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Partner Circuit B", exercises: [
      { name: "Wheelbarrow Walk", muscles: "Core, Shoulders", sets: "3", reps: "10m", rest: "60s", notes: "Switch roles" },
      { name: "Partner Plank Hold (tap)", muscles: "Core", sets: "3", reps: "30s", rest: "30s", notes: "Tap partner's shoulder alternately" },
      { name: "Medicine Ball Pass (squat)", muscles: "Full Body", sets: "3", reps: "15", rest: "45s", notes: "Squat and pass" },
      { name: "Tandem Jump Rope", muscles: "Cardio", sets: "4", reps: "45s", rest: "30s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Cardio + Cooldown", exercises: [
      { name: "Partner Stretch Assist", muscles: "Flexibility", sets: "2", reps: "60s each", rest: "—", notes: "Gently push each other's range" },
      { name: "Tandem Run / Walk", muscles: "Cardio", sets: "1", reps: "20 min", rest: "—", notes: "Keep same pace" },
      { name: "Back-to-Back Breathing", muscles: "Recovery", sets: "3", reps: "10 breaths", rest: "—", notes: "Synchronise breath" },
    ]},
  ],
  "Senior Fitness & Balance": [
    { dayLabel: "Day 1", focus: "Lower Body Strength", exercises: [
      { name: "Sit to Stand", muscles: "Quads, Glutes", sets: "3", reps: "10", rest: "60s", notes: "Use chair for safety" },
      { name: "Mini Band Side Walk", muscles: "Glutes", sets: "3", reps: "10", rest: "45s", notes: "Each direction" },
      { name: "Calf Raise (standing)", muscles: "Calves", sets: "3", reps: "15", rest: "45s", notes: "Hold chair for balance" },
      { name: "Single-Leg Balance", muscles: "Stability", sets: "3", reps: "20s", rest: "30s", notes: "Each leg, hold chair nearby" },
    ]},
    { dayLabel: "Day 2", focus: "Upper Body + Core", exercises: [
      { name: "Seated Dumbbell Press", muscles: "Shoulders", sets: "3", reps: "12", rest: "60s", notes: "Light weight" },
      { name: "Seated Row (band)", muscles: "Back", sets: "3", reps: "12", rest: "60s", notes: "" },
      { name: "Seated Twist", muscles: "Core, Spine", sets: "3", reps: "10", rest: "30s", notes: "Each side" },
      { name: "Diaphragmatic Breathing", muscles: "Core", sets: "3", reps: "10 breaths", rest: "—", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Balance + Flexibility", exercises: [
      { name: "Tandem Walk (heel to toe)", muscles: "Balance", sets: "3", reps: "10 steps", rest: "45s", notes: "Along a line" },
      { name: "Tai Chi Step", muscles: "Balance, Coordination", sets: "3", reps: "8", rest: "45s", notes: "Slow and controlled" },
      { name: "Hip Flexor Stretch (chair)", muscles: "Hip Flexors", sets: "2", reps: "45s", rest: "—", notes: "Each side" },
      { name: "Neck and Shoulder Rolls", muscles: "Neck, Traps", sets: "2", reps: "5", rest: "—", notes: "Gentle, no strain" },
    ]},
  ],
  "Online Home Workout (No Equipment)": [
    { dayLabel: "Day 1", focus: "Full Body A", exercises: [
      { name: "Bodyweight Squat", muscles: "Quads, Glutes", sets: "4", reps: "15", rest: "45s", notes: "" },
      { name: "Push-Up", muscles: "Chest, Triceps", sets: "3", reps: "12", rest: "45s", notes: "" },
      { name: "Superman Hold", muscles: "Lower Back, Glutes", sets: "3", reps: "10", rest: "45s", notes: "" },
      { name: "Plank", muscles: "Core", sets: "3", reps: "30s", rest: "30s", notes: "" },
      { name: "Jumping Jacks", muscles: "Cardio", sets: "3", reps: "45s", rest: "30s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Lower Body Focus", exercises: [
      { name: "Reverse Lunge", muscles: "Quads, Glutes", sets: "4", reps: "12", rest: "45s", notes: "Each leg" },
      { name: "Glute Bridge", muscles: "Glutes", sets: "4", reps: "15", rest: "45s", notes: "" },
      { name: "Wall Sit", muscles: "Quads", sets: "3", reps: "45s", rest: "60s", notes: "" },
      { name: "Single-Leg Glute Bridge", muscles: "Glutes", sets: "3", reps: "10", rest: "45s", notes: "Each leg" },
      { name: "Calf Raise", muscles: "Calves", sets: "3", reps: "20", rest: "30s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "Upper Body Focus", exercises: [
      { name: "Wide Push-Up", muscles: "Chest", sets: "3", reps: "12", rest: "45s", notes: "" },
      { name: "Diamond Push-Up", muscles: "Triceps", sets: "3", reps: "10", rest: "45s", notes: "" },
      { name: "Pike Push-Up", muscles: "Shoulders", sets: "3", reps: "10", rest: "45s", notes: "" },
      { name: "Inverted Row (table)", muscles: "Back", sets: "3", reps: "12", rest: "60s", notes: "Use sturdy table" },
      { name: "Plank to Downward Dog", muscles: "Core, Shoulders", sets: "3", reps: "10", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 4", focus: "HIIT + Core", exercises: [
      { name: "Burpees", muscles: "Full Body", sets: "4", reps: "8", rest: "30s", notes: "" },
      { name: "High Knees", muscles: "Cardio, Core", sets: "4", reps: "30s", rest: "30s", notes: "" },
      { name: "Mountain Climbers", muscles: "Core, Cardio", sets: "3", reps: "20s", rest: "30s", notes: "" },
      { name: "Bicycle Crunch", muscles: "Core", sets: "3", reps: "20", rest: "30s", notes: "" },
      { name: "Flutter Kicks", muscles: "Lower Abs", sets: "3", reps: "20s", rest: "30s", notes: "" },
    ]},
  ],
  "Pre-Wedding Transformation": [
    { dayLabel: "Day 1", focus: "Upper Sculpt", exercises: [
      { name: "Dumbbell Bench Press", muscles: "Chest", sets: "4", reps: "12", rest: "75s", notes: "" },
      { name: "Seated Cable Row", muscles: "Back", sets: "4", reps: "12", rest: "75s", notes: "" },
      { name: "Lateral Raise", muscles: "Side Delts", sets: "4", reps: "15", rest: "60s", notes: "" },
      { name: "Tricep Rope Pushdown", muscles: "Triceps", sets: "3", reps: "15", rest: "60s", notes: "" },
      { name: "Dumbbell Curl", muscles: "Biceps", sets: "3", reps: "12", rest: "60s", notes: "" },
    ]},
    { dayLabel: "Day 2", focus: "Lower Tone + Glutes", exercises: [
      { name: "Hip Thrust", muscles: "Glutes", sets: "4", reps: "15", rest: "75s", notes: "" },
      { name: "Bulgarian Split Squat", muscles: "Quads, Glutes", sets: "3", reps: "12", rest: "90s", notes: "Each leg" },
      { name: "Romanian Deadlift", muscles: "Hamstrings", sets: "3", reps: "12", rest: "90s", notes: "" },
      { name: "Leg Curl", muscles: "Hamstrings", sets: "3", reps: "15", rest: "60s", notes: "" },
      { name: "Calf Raise", muscles: "Calves", sets: "4", reps: "20", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 3", focus: "HIIT Fat Burn", exercises: [
      { name: "Jump Squat", muscles: "Quads, Power", sets: "4", reps: "12", rest: "30s", notes: "" },
      { name: "Push-Up to Plank", muscles: "Chest, Core", sets: "4", reps: "10", rest: "30s", notes: "" },
      { name: "Kettlebell Swing", muscles: "Posterior Chain", sets: "4", reps: "15", rest: "30s", notes: "" },
      { name: "Box Jump", muscles: "Power", sets: "4", reps: "8", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 4", focus: "Back & Posture", exercises: [
      { name: "Lat Pulldown", muscles: "Back", sets: "4", reps: "12", rest: "90s", notes: "" },
      { name: "Face Pull", muscles: "Rear Delts, Posture", sets: "4", reps: "15", rest: "60s", notes: "Key for posture" },
      { name: "Dumbbell Row", muscles: "Back", sets: "3", reps: "12", rest: "75s", notes: "Each arm" },
      { name: "Band Pull-Apart", muscles: "Rear Delts", sets: "3", reps: "15", rest: "45s", notes: "" },
    ]},
    { dayLabel: "Day 5", focus: "Full Body Tone + Cardio", exercises: [
      { name: "Barbell Squat", muscles: "Quads, Glutes", sets: "3", reps: "10", rest: "90s", notes: "" },
      { name: "Dumbbell Press", muscles: "Chest, Shoulders", sets: "3", reps: "12", rest: "75s", notes: "" },
      { name: "Treadmill Intervals", muscles: "Cardio", sets: "8", reps: "30s sprint", rest: "60s walk", notes: "" },
      { name: "Core Circuit", muscles: "Core", sets: "3", reps: "45s each", rest: "30s", notes: "Plank, crunches, leg raise" },
    ]},
  ],
};

const PREMADE_LIST: Omit<Template, "id" | "status" | "createdAt">[] = [
  { name: "Beginner Fat Loss Kickstart",        category: "Fat Loss",    level: "Beginner",     days: "3x / week", duration: "40 min", description: "Full-body circuits for beginners. Cardio + bodyweight moves to ignite metabolism.", assignedTo: [] },
  { name: "Intermediate Fat Loss Shred",        category: "Fat Loss",    level: "Intermediate", days: "4x / week", duration: "50 min", description: "Superset-based training with moderate weights and cardio finishers.", assignedTo: [] },
  { name: "Advanced Fat Burn & Maintain",       category: "Fat Loss",    level: "Advanced",     days: "5x / week", duration: "60 min", description: "High-intensity resistance + HIIT hybrid for clients near goal weight.", assignedTo: [] },
  { name: "Beginner Strength Foundation",       category: "Strength",    level: "Beginner",     days: "3x / week", duration: "45 min", description: "Teaches the 5 fundamental movement patterns — squat, hinge, push, pull, carry.", assignedTo: [] },
  { name: "Intermediate Strength Builder",      category: "Strength",    level: "Intermediate", days: "4x / week", duration: "55 min", description: "Upper/Lower split with progressive overload protocol.", assignedTo: [] },
  { name: "Advanced Powerlifting Program",      category: "Strength",    level: "Advanced",     days: "4x / week", duration: "75 min", description: "Periodised program built around squat, bench and deadlift.", assignedTo: [] },
  { name: "Beginner Muscle Gain",               category: "Muscle Gain", level: "Beginner",     days: "3x / week", duration: "50 min", description: "Full-body hypertrophy plan with 8–12 rep ranges.", assignedTo: [] },
  { name: "Intermediate Muscle Gain (PPL)",     category: "Muscle Gain", level: "Intermediate", days: "6x / week", duration: "60 min", description: "Push / Pull / Legs split twice a week. High volume hypertrophy.", assignedTo: [] },
  { name: "Advanced Mass & Symmetry",           category: "Muscle Gain", level: "Advanced",     days: "5x / week", duration: "70 min", description: "Body-part split with lagging muscle emphasis and advanced techniques.", assignedTo: [] },
  { name: "Beginner HIIT & Conditioning",       category: "HIIT",        level: "Beginner",     days: "3x / week", duration: "30 min", description: "Low-impact HIIT circuits using bodyweight. 30/30 work-rest intervals.", assignedTo: [] },
  { name: "Intermediate HIIT Bootcamp",         category: "HIIT",        level: "Intermediate", days: "4x / week", duration: "40 min", description: "High-energy interval training with kettlebells and plyometrics.", assignedTo: [] },
  { name: "Mobility & Flexibility Reset",       category: "Mobility",    level: "Beginner",     days: "3x / week", duration: "35 min", description: "Yoga-inspired stretching + joint mobility work.", assignedTo: [] },
  { name: "Intermediate Mobility & Strength",   category: "Mobility",    level: "Intermediate", days: "3x / week", duration: "45 min", description: "Functional movement patterns combined with mobility drills.", assignedTo: [] },
  { name: "Post-Injury Rehab (Lower Body)",     category: "Rehab",       level: "Beginner",     days: "3x / week", duration: "40 min", description: "Gentle lower body rehabilitation for knees, hips and ankles.", assignedTo: [] },
  { name: "Post-Injury Rehab (Upper Body)",     category: "Rehab",       level: "Beginner",     days: "3x / week", duration: "35 min", description: "Shoulder, elbow and wrist rehabilitation protocol.", assignedTo: [] },
  { name: "Athletic Performance (Sport)",       category: "Performance", level: "Advanced",     days: "5x / week", duration: "65 min", description: "Speed, power and agility training for competitive athletes.", assignedTo: [] },
  { name: "Couple's Partner Workout",           category: "Fat Loss",    level: "Beginner",     days: "3x / week", duration: "45 min", description: "Fun partner-based circuit training for couple program clients.", assignedTo: [] },
  { name: "Senior Fitness & Balance",           category: "Mobility",    level: "Beginner",     days: "3x / week", duration: "35 min", description: "Low-impact functional training for 55+ clients.", assignedTo: [] },
  { name: "Online Home Workout (No Equipment)", category: "Fat Loss",    level: "Intermediate", days: "4x / week", duration: "35 min", description: "Bodyweight-only program for online clients training at home.", assignedTo: [] },
  { name: "Pre-Wedding Transformation",         category: "Muscle Gain", level: "Intermediate", days: "5x / week", duration: "55 min", description: "12-week body composition program for brides/grooms.", assignedTo: [] },
];

const categoryColor: Record<string, string> = {
  "Fat Loss": "by", "Strength": "bo", "Mobility": "bb",
  "Performance": "bp", "Rehab": "bg", "HIIT": "br", "Muscle Gain": "bp"
};
const levelColor: Record<string, string> = {
  "Beginner": "bg", "Intermediate": "by", "Advanced": "br"
};

// ── Library Picker bottom sheet ───────────────────────────────
function LibraryPicker({ onAdd, onClose }: { onAdd: (name: string, muscles: string) => void; onClose: () => void }) {
  const [cat, setCat] = useState(ALL_CATS[0]);
  const [search, setSearch] = useState("");
  const list = search.trim()
    ? ALL_CATS.flatMap((c) => ((WORKOUT_LIBRARY as any)[c] || []).filter((e: any) =>
        e.name.toLowerCase().includes(search.toLowerCase())
      ).map((e: any) => ({ ...e, _cat: c })))
    : ((WORKOUT_LIBRARY as any)[cat] || []).map((e: any) => ({ ...e, _cat: cat }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,8,3,.6)", zIndex: 900, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "var(--bg1)", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 540, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>Add from Library</span>
          <button className="btn btn-g btn-xs" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: "0 14px 8px" }}>
          <input className="fi" placeholder="🔍 Search exercise..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 8 }} />
          {!search && (
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 }}>
              {ALL_CATS.map((c) => (
                <button key={c} onClick={() => setCat(c)}
                  style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: `1px solid ${cat === c ? "rgba(201,168,76,.4)" : "var(--b1)"}`, background: cat === c ? "rgba(201,168,76,.1)" : "var(--bg2)", color: cat === c ? "var(--brand1)" : "var(--t3)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{c}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 14px" }}>
          {list.map((ex: any, i: number) => (
            <div key={i} onClick={() => { onAdd(ex.name, ex.muscles || ex._cat); onClose(); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", border: "1px solid var(--b0)", marginBottom: 6, background: "var(--bg2)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)" }}>{ex.name}</div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>{ex.muscles || ex._cat}</div>
              </div>
              <span style={{ fontSize: 20, color: "var(--brand1)", fontWeight: 700 }}>+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Workout Day Editor ────────────────────────────────────────
function DayEditor({ day, dayIdx, onChange, onRemove }: {
  day: WorkoutDay; dayIdx: number;
  onChange: (d: WorkoutDay) => void;
  onRemove: () => void;
}) {
  const [showLib, setShowLib] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const updateEx = (ei: number, field: keyof ExEntry, val: string) =>
    onChange({ ...day, exercises: day.exercises.map((e, i) => i === ei ? { ...e, [field]: val } : e) });
  const addEx = (name = "", muscles = "") =>
    onChange({ ...day, exercises: [...day.exercises, { ...BLANK_EX(), name, muscles }] });
  const removeEx = (ei: number) =>
    onChange({ ...day, exercises: day.exercises.filter((_, i) => i !== ei) });

  return (
    <div style={{ background: "var(--bg1)", border: "1.5px solid var(--b0)", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
      {showLib && <LibraryPicker onAdd={addEx} onClose={() => setShowLib(false)} />}

      {/* Day header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--bg2)", borderBottom: collapsed ? "none" : "1px solid var(--b0)" }}>
        <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 9px", borderRadius: 6, background: "rgba(201,168,76,.12)", color: "var(--brand1)", border: "1px solid rgba(201,168,76,.25)", flexShrink: 0 }}>
          {day.dayLabel || `Day ${dayIdx + 1}`}
        </span>
        <input className="fi" style={{ flex: 1, height: 32, fontSize: 12, fontWeight: 600 }}
          placeholder="Focus (e.g. Chest & Triceps)"
          value={day.focus}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChange({ ...day, focus: e.target.value })} />
        <button className="btn btn-g btn-xs" onClick={() => setCollapsed(!collapsed)}>{collapsed ? "▼" : "▲"}</button>
        <button className="btn btn-dn btn-xs" onClick={onRemove}>✕</button>
      </div>

      {!collapsed && (
        <div style={{ padding: 12 }}>
          {/* Exercise rows */}
          {day.exercises.map((ex, ei) => (
            <div key={ei} style={{ background: "var(--bg2)", border: "1px solid var(--b0)", borderRadius: 8, padding: "10px 10px 8px", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input className="fi" style={{ flex: 2, height: 34, fontSize: 12 }}
                  placeholder="Exercise name *" value={ex.name}
                  onChange={(e) => updateEx(ei, "name", e.target.value)} />
                <input className="fi" style={{ flex: 1, height: 34, fontSize: 12 }}
                  placeholder="Muscles" value={ex.muscles}
                  onChange={(e) => updateEx(ei, "muscles", e.target.value)} />
                <button className="btn btn-dn btn-xs" onClick={() => removeEx(ei)} style={{ flexShrink: 0 }}>✕</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: 6 }}>
                <div>
                  <div style={{ fontSize: 9, color: "var(--t4)", marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>Sets</div>
                  <input className="fi" style={{ height: 32, fontSize: 12, textAlign: "center" }}
                    value={ex.sets} onChange={(e) => updateEx(ei, "sets", e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--t4)", marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>Reps</div>
                  <input className="fi" style={{ height: 32, fontSize: 12, textAlign: "center" }}
                    value={ex.reps} onChange={(e) => updateEx(ei, "reps", e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--t4)", marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>Rest</div>
                  <input className="fi" style={{ height: 32, fontSize: 12, textAlign: "center" }}
                    value={ex.rest} onChange={(e) => updateEx(ei, "rest", e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--t4)", marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>Notes</div>
                  <input className="fi" style={{ height: 32, fontSize: 11 }}
                    placeholder="Optional" value={ex.notes}
                    onChange={(e) => updateEx(ei, "notes", e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          {/* Add exercise buttons */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            <button className="btn btn-g btn-xs" onClick={() => setShowLib(true)}>+ From Library</button>
            <button className="btn btn-g btn-xs" onClick={() => addEx()}>+ Manual</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function Templates() {
  const { trainers } = useAdmin();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showWorkoutEditor, setShowWorkoutEditor] = useState<Template | null>(null);
  const [showAssign, setShowAssign] = useState<Template | null>(null);
  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [catFilter, setCatFilter] = useState("All");
  const [assignSaving, setAssignSaving] = useState(false);
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "templates"), orderBy("createdAt", "desc")),
      (snap) => setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Template)))
    );
    return () => unsub();
  }, []);

  const seedPremade = async () => {
    // Only add templates that don't already exist by name
    const existingNames = new Set(templates.map((t) => t.name));
    const toAdd = PREMADE_LIST.filter((t) => !existingNames.has(t.name));
    if (toAdd.length === 0) {
      alert("All 20 premade templates are already loaded. Use \"🔄 Fill Workout Plans\" to update their exercises.");
      return;
    }
    if (!confirm(`This will add ${toAdd.length} new premade template(s). Continue?`)) return;
    setSeeding(true);
    for (const t of toAdd) {
      const days = PREMADE_DAYS[t.name] || [];
      await addDoc(collection(db, "templates"), {
        ...t, status: "active", assignedTo: [],
        workoutDays: days,
        createdAt: serverTimestamp()
      });
    }
    setSeeding(false);
  };

  // Delete duplicate templates — keep the one with most data (workoutDays) per name
  const dedupTemplates = async () => {
    const grouped: Record<string, Template[]> = {};
    templates.forEach((t) => {
      if (!grouped[t.name]) grouped[t.name] = [];
      grouped[t.name].push(t);
    });
    const duplicates = Object.values(grouped).filter((g) => g.length > 1);
    if (duplicates.length === 0) { alert("No duplicates found!"); return; }
    const totalDupes = duplicates.reduce((s, g) => s + g.length - 1, 0);
    if (!confirm(`Found ${totalDupes} duplicate(s) across ${duplicates.length} template name(s). Delete them now?`)) return;
    setSeeding(true);
    for (const group of duplicates) {
      // Keep the one with the most workoutDays, delete the rest
      const sorted = [...group].sort((a, b) => (b.workoutDays?.length || 0) - (a.workoutDays?.length || 0));
      const toDelete = sorted.slice(1);
      for (const t of toDelete) {
        await deleteDoc(doc(db, "templates", t.id));
      }
    }
    setSeeding(false);
    alert(`✓ Done! ${totalDupes} duplicate(s) removed.`);
  };

  // Force-fill workoutDays into ALL templates that match a premade name
  const patchWorkoutDays = async () => {
    const patchable = templates.filter((t) => PREMADE_DAYS[t.name] && PREMADE_DAYS[t.name].length > 0);
    if (patchable.length === 0) { alert("No matching premade templates found to fill."); return; }
    if (!confirm(`This will overwrite workout plans for ${patchable.length} template(s) with the full premade data. Continue?`)) return;
    setSeeding(true);
    for (const t of patchable) {
      await updateDoc(doc(db, "templates", t.id), { workoutDays: PREMADE_DAYS[t.name] });
    }
    setSeeding(false);
    alert(`✓ Done! ${patchable.length} templates filled with workout plans.`);
  };

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (t: Template) => {
    setEditTarget(t);
    setForm({ name: t.name, category: t.category, level: t.level, days: t.days, duration: t.duration, description: t.description });
    setShowForm(true);
  };
  const openWorkoutEditor = (t: Template) => {
    setShowWorkoutEditor(t);
    setWorkoutDays(t.workoutDays && t.workoutDays.length > 0
      ? t.workoutDays
      : [BLANK_DAY(1)]
    );
  };
  const openAssign = (t: Template) => { setShowAssign(t); setSelectedTrainers(t.assignedTo || []); };

  const save = async () => {
    if (!form.name || !form.days || !form.duration) return;
    setSaving(true);
    if (editTarget) {
      await updateDoc(doc(db, "templates", editTarget.id), { ...form });
    } else {
      await addDoc(collection(db, "templates"), {
        ...form, status: "active", assignedTo: [], workoutDays: [], createdAt: serverTimestamp()
      });
    }
    setSaving(false); setShowForm(false); setForm(EMPTY_FORM); setEditTarget(null);
  };

  const saveWorkout = async () => {
    if (!showWorkoutEditor) return;
    setSavingWorkout(true);
    await updateDoc(doc(db, "templates", showWorkoutEditor.id), { workoutDays });
    setSavingWorkout(false);
    setShowWorkoutEditor(null);
    setWorkoutDays([]);
  };

  const saveAssign = async () => {
    if (!showAssign) return;
    setAssignSaving(true);
    await updateDoc(doc(db, "templates", showAssign.id), { assignedTo: selectedTrainers });
    setAssignSaving(false); setShowAssign(null);
  };

  const toggleTrainer = (id: string) =>
    setSelectedTrainers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const archive = async (id: string) => updateDoc(doc(db, "templates", id), { status: "archived" });
  const restore = async (id: string) => updateDoc(doc(db, "templates", id), { status: "active" });
  const remove  = async (id: string) => {
    if (!confirm("Delete this template permanently?")) return;
    await deleteDoc(doc(db, "templates", id));
  };

  const addDay = () => setWorkoutDays((p) => [...p, BLANK_DAY(p.length + 1)]);
  const updateDay = (i: number, d: WorkoutDay) => setWorkoutDays((p) => p.map((x, j) => j === i ? d : x));
  const removeDay = (i: number) => setWorkoutDays((p) => p.filter((_, j) => j !== i));

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];
  const visible = templates.filter((t) => t.status === filter).filter((t) => catFilter === "All" || t.category === catFilter);

  return (
    <>
      <style>{`
        .tmpl-grid { display:grid; grid-template-columns:1fr; gap:10px; }
        @media(min-width:640px){ .tmpl-grid { grid-template-columns:1fr 1fr; } }
        @media(min-width:1100px){ .tmpl-grid { grid-template-columns:1fr 1fr 1fr; } }
        .tmpl-card { background:var(--bg1); border:1px solid var(--b0); border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:8px; transition:box-shadow .15s,transform .15s; box-shadow:0 1px 4px rgba(0,0,0,.05); }
        .tmpl-card:hover { box-shadow:0 4px 16px rgba(201,168,76,.1); transform:translateY(-1px); }
        .tmpl-name { font-size:13px; font-weight:700; color:var(--t1); line-height:1.3; }
        .tmpl-desc { font-size:11px; color:var(--t3); line-height:1.5; flex:1; }
        .tmpl-meta { display:flex; gap:12px; flex-wrap:wrap; }
        .tmpl-meta span { font-size:10px; color:var(--t3); }
        .tmpl-actions { display:flex; gap:6px; flex-wrap:wrap; margin-top:4px; }
        .assign-chip { display:inline-flex; align-items:center; font-size:10px; font-weight:600; background:rgba(201,168,76,.1); color:var(--brand1); border:1px solid rgba(201,168,76,.25); padding:2px 7px; border-radius:8px; }
        .trainer-row { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px; cursor:pointer; border:1.5px solid var(--b0); margin-bottom:6px; transition:border-color .15s,background .15s; background:var(--bg2); }
        .trainer-row.selected { border-color:var(--brand1); background:rgba(201,168,76,.06); }
        .trainer-check { width:18px; height:18px; border-radius:5px; border:2px solid var(--b1); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:11px; }
        .trainer-row.selected .trainer-check { background:var(--brand1); border-color:var(--brand1); color:#fff; }
        .seed-banner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:rgba(201,168,76,.07); border:1px solid rgba(201,168,76,.2); border-radius:10px; padding:12px 16px; margin-bottom:14px; }
        .filter-scroll { display:flex; gap:6px; overflow-x:auto; padding-bottom:4px; margin-bottom:12px; }
        .filter-scroll::-webkit-scrollbar { height:3px; }
        .filter-scroll::-webkit-scrollbar-thumb { background:var(--b1); border-radius:2px; }
        .sh-wrap { display:flex; flex-direction:column; gap:10px; margin-bottom:14px; }
        @media(min-width:640px){ .sh-wrap { flex-direction:row; align-items:center; } }
        .sh-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
        @media(min-width:640px){ .sh-actions { margin-left:auto; } }
        .day-preview { background:var(--bg2); border:1px solid var(--b0); border-radius:8px; padding:10px 12px; margin-top:8px; }
        .ex-row { display:flex; gap:8px; padding:5px 0; border-bottom:1px solid var(--b0); font-size:11px; }
        .ex-row:last-child { border:none; }
        .workout-editor-modal { background:var(--bg0); border-radius:14px; width:100%; max-width:680px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 8px 40px rgba(0,0,0,.3); }
      `}</style>

      {/* ── CREATE / EDIT MODAL ── */}
      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">{editTarget ? "Edit Template" : "Create Template"}</div>
            <div className="field"><label>Template Name *</label>
              <input className="fi" placeholder="e.g. Beginner Fat Loss" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="g2">
              <div className="field"><label>Category</label>
                <select className="fi" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  <option>Fat Loss</option><option>Strength</option><option>Muscle Gain</option>
                  <option>Mobility</option><option>HIIT</option><option>Performance</option><option>Rehab</option>
                </select>
              </div>
              <div className="field"><label>Level</label>
                <select className="fi" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Days per Week *</label>
                <input className="fi" placeholder="e.g. 3x/week" value={form.days} onChange={(e) => setForm((p) => ({ ...p, days: e.target.value }))} />
              </div>
              <div className="field"><label>Session Duration *</label>
                <input className="fi" placeholder="e.g. 45 min" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
              </div>
            </div>
            <div className="field"><label>Description</label>
              <textarea className="fi" rows={3} placeholder="What is this template for?" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ resize: "none" }} />
            </div>
            <div className="row mt16">
              <button className="btn btn-g btn-s" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-p btn-s mla" onClick={save} disabled={saving}>{saving ? "Saving..." : editTarget ? "Save Changes" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── WORKOUT EDITOR MODAL ── */}
      {showWorkoutEditor && (
        <div className="overlay" onClick={() => setShowWorkoutEditor(null)}>
          <div className="workout-editor-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--b0)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--t1)" }}>📋 Edit Workout Plan</div>
                <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{showWorkoutEditor.name}</div>
              </div>
              <button className="btn btn-g btn-xs" onClick={() => setShowWorkoutEditor(null)}>✕</button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
              {workoutDays.length === 0 && (
                <div className="alert al-b mb12">No days yet. Add a day to start building the workout plan.</div>
              )}
              {workoutDays.map((day, i) => (
                <DayEditor key={i} day={day} dayIdx={i}
                  onChange={(d) => updateDay(i, d)}
                  onRemove={() => removeDay(i)} />
              ))}
              <button className="btn btn-g btn-s" style={{ width: "100%", marginTop: 4 }} onClick={addDay}>
                + Add Day
              </button>
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--b0)", display: "flex", gap: 10, flexShrink: 0 }}>
              <button className="btn btn-g btn-s" onClick={() => setShowWorkoutEditor(null)}>Cancel</button>
              <button className="btn btn-p btn-s mla" onClick={saveWorkout} disabled={savingWorkout}>
                {savingWorkout ? "Saving..." : `✓ Save ${workoutDays.length} Day${workoutDays.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN MODAL ── */}
      {showAssign && (
        <div className="overlay" onClick={() => setShowAssign(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Assign Template</div>
            <div className="fs12 t3 mb12" style={{ lineHeight: 1.5 }}>
              Assigning <strong style={{ color: "var(--t1)" }}>{showAssign.name}</strong> to trainers.
            </div>
            {trainers.length === 0 && <div className="alert al-b">No trainers found.</div>}
            {trainers.map((t) => {
              const sel = selectedTrainers.includes(t.id);
              return (
                <div key={t.id} className={`trainer-row ${sel ? "selected" : ""}`} onClick={() => toggleTrainer(t.id)}>
                  <div className="trainer-check">{sel ? "✓" : ""}</div>
                  <div className="av av-t" style={{ width: 28, height: 28, fontSize: 10 }}>
                    {(t.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="fs12 fw6 t1">{t.name}</div>
                    <div className="fs10 t3">{t.speciality || "Trainer"}</div>
                  </div>
                  <span className={`badge fs10 ${t.status === "active" ? "bg" : "br"}`}>{t.status}</span>
                </div>
              );
            })}
            <div className="row mt16 gap8">
              <button className="btn btn-g btn-s" onClick={() => setShowAssign(null)}>Cancel</button>
              <div className="fs11 t3" style={{ flex: 1, textAlign: "center", alignSelf: "center" }}>
                {selectedTrainers.length} selected
              </div>
              <button className="btn btn-p btn-s" onClick={saveAssign} disabled={assignSaving}>
                {assignSaving ? "Saving..." : "Confirm Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SEED BANNER ── */}
      {templates.length === 0 && (
        <div className="seed-banner">
          <div style={{ fontSize: 12, color: "var(--t2)" }}>
            <strong style={{ color: "var(--t1)" }}>No templates yet.</strong> Load 20 premade templates with full day-by-day workout plans instantly.
          </div>
          <button className="btn btn-p btn-s" onClick={seedPremade} disabled={seeding}>
            {seeding ? "Loading..." : "⚡ Load 20 Premade Templates"}
          </button>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="sh-wrap">
        <div className="sh-l">
          <h2>Workout Templates</h2>
          <p>{templates.filter((t) => t.status === "active").length} active · with day-by-day plans</p>
        </div>
        <div className="sh-actions">
          <div className="tabs" style={{ marginBottom: 0 }}>
            <div className={`tab ${filter === "active" ? "on" : ""}`} onClick={() => setFilter("active")}>
              Active ({templates.filter((t) => t.status === "active").length})
            </div>
            <div className={`tab ${filter === "archived" ? "on" : ""}`} onClick={() => setFilter("archived")}>
              Archived ({templates.filter((t) => t.status === "archived").length})
            </div>
          </div>
          {templates.length > 0 && (
            <button className="btn btn-g btn-s" onClick={seedPremade} disabled={seeding}>
              {seeding ? "Loading..." : "⚡ Add Premade"}
            </button>
          )}
          {templates.length > 0 && (
            <button className="btn btn-b btn-s" onClick={patchWorkoutDays} disabled={seeding}>
              {seeding ? "Updating..." : "🔄 Fill Workout Plans"}
            </button>
          )}
          {templates.length > 0 && (
            <button className="btn btn-dn btn-s" onClick={dedupTemplates} disabled={seeding}>
              {seeding ? "Cleaning..." : "🧹 Remove Duplicates"}
            </button>
          )}
          <button className="btn btn-p btn-s" onClick={openCreate}>+ Create</button>
        </div>
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div className="filter-scroll">
        {categories.map((c) => (
          <div key={c} className={`tab ${catFilter === c ? "on" : ""}`} onClick={() => setCatFilter(c)} style={{ flexShrink: 0 }}>{c}</div>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="alert al-b" style={{ textAlign: "center", padding: 20 }}>
          {filter === "active" ? "No active templates in this category." : "No archived templates."}
        </div>
      )}

      {/* ── TEMPLATE GRID ── */}
      <div className="tmpl-grid">
        {visible.map((t) => {
          const assignedNames = (t.assignedTo || []).map((id) => trainers.find((tr) => tr.id === id)?.name).filter(Boolean);
          const dayCount = (t.workoutDays || []).length;
          const exCount  = (t.workoutDays || []).reduce((s, d) => s + d.exercises.length, 0);
          const expanded = expandedId === t.id;

          return (
            <div key={t.id} className="tmpl-card" style={{ opacity: t.status === "archived" ? 0.65 : 1 }}>
              {/* Badges */}
              <div className="row gap6" style={{ flexWrap: "wrap" }}>
                <span className={`badge fs10 ${categoryColor[t.category] || "bgr"}`}>{t.category}</span>
                <span className={`badge fs10 ${levelColor[t.level] || "bgr"}`}>{t.level}</span>
                {dayCount > 0 && <span className="badge bb fs10">📋 {dayCount} days</span>}
                {t.status === "archived" && <span className="badge bgr fs10">Archived</span>}
              </div>

              <div className="tmpl-name">{t.name}</div>
              {t.description && <div className="tmpl-desc">{t.description}</div>}

              <div className="tmpl-meta">
                <span>📅 {t.days}</span>
                <span>⏱ {t.duration}</span>
                {exCount > 0 && <span>🏋 {exCount} exercises</span>}
              </div>

              {/* Assigned trainers */}
              {assignedNames.length > 0 && (
                <div className="row gap6" style={{ flexWrap: "wrap" }}>
                  {assignedNames.map((n, i) => <span key={i} className="assign-chip">👤 {n}</span>)}
                </div>
              )}

              {/* Workout preview (expandable) */}
              {dayCount > 0 && (
                <>
                  <button className="btn btn-g btn-xs" style={{ alignSelf: "flex-start" }}
                    onClick={() => setExpandedId(expanded ? null : t.id)}>
                    {expanded ? "▲ Hide Plan" : `▼ View ${dayCount}-Day Plan`}
                  </button>
                  {expanded && (
                    <div style={{ marginTop: 4 }}>
                      {(t.workoutDays || []).map((day, di) => (
                        <div key={di} className="day-preview">
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--brand1)", background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.2)", padding: "1px 7px", borderRadius: 5 }}>
                              {day.dayLabel}
                            </span>
                            {day.focus && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--t2)" }}>{day.focus}</span>}
                          </div>
                          {day.exercises.map((ex, ei) => (
                            <div key={ei} className="ex-row">
                              <span style={{ flex: 1, fontWeight: 600, color: "var(--t1)" }}>{ex.name}</span>
                              <span style={{ color: "var(--t3)" }}>{ex.sets}×{ex.reps}</span>
                              {ex.rest && ex.rest !== "—" && <span style={{ color: "var(--t4)" }}>rest {ex.rest}</span>}
                              {ex.muscles && <span style={{ color: "var(--t4)" }}>{ex.muscles}</span>}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="tmpl-actions">
                {t.status === "active" ? (
                  <>
                    <button className="btn btn-p btn-xs" onClick={() => openAssign(t)}>
                      Assign{assignedNames.length > 0 ? ` (${assignedNames.length})` : ""}
                    </button>
                    <button className="btn btn-b btn-xs" onClick={() => openWorkoutEditor(t)}>
                      {dayCount > 0 ? "✏️ Edit Plan" : "＋ Add Plan"}
                    </button>
                    <button className="btn btn-g btn-xs" onClick={() => openEdit(t)}>Edit Info</button>
                    <button className="btn btn-dn btn-xs" onClick={() => archive(t.id)}>Archive</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-ok btn-xs" onClick={() => restore(t.id)}>Restore</button>
                    <button className="btn btn-dn btn-xs" onClick={() => remove(t.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
