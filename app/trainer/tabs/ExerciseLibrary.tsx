"use client";
import { useTrainer } from "../TrainerContext";
import { WORKOUT_LIBRARY, WORKOUT_CATEGORIES } from "../../data/workoutLibrary";

export default function ExerciseLibrary() {
  const { libCat, setLibCat, setSessionExercises, setTab } = useTrainer();

  return (
    <>
      <div className="sh"><div className="sh-l"><h2>Exercise Library</h2><p>Tap any exercise to add to current session</p></div></div>
      <div className="tabs mb16">
        {WORKOUT_CATEGORIES.map((cat) => (
          <div key={cat} className={`tab ${libCat === cat ? "on" : ""}`} onClick={() => setLibCat(cat)}>{cat}</div>
        ))}
      </div>
      <div className="col gap8">
        {(WORKOUT_LIBRARY[libCat] || []).map((ex, i) => (
          <div key={i} className="ex-card" onClick={() => { setSessionExercises((p: any[]) => [...p, { ...ex, sets: "3", reps: "10", weight: "0" }]); setTab("log"); }}>
            <div>
              <div className="fw6 fs13 t1">{ex.name}</div>
              <div className="fs11 t3 mt4">{ex.muscles}</div>
            </div>
            <div className="row gap8">
              <span className="badge bgr fs10">{ex.equipment}</span>
              <span className={`badge fs10 ${ex.level === "Beginner" ? "bg" : ex.level === "Intermediate" ? "by" : "br"}`}>{ex.level}</span>
              <span className="fs12 t3">+ Add</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
