"use client";
// ============================================================
// YOURTRAINER — FIRESTORE DATA HOOK
// Single place for ALL live Firestore listeners.
// Import useFirestoreData() anywhere you need live data.
//
// Returns: { clients, trainers, instructions, warnings,
//            sessionLogs, dbLoading }
//
// Adding a new collection?
//   1. Add listener here
//   2. Add type to SharedData in types/index.ts
//   3. Use in component — no other changes needed
// ============================================================
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import type {
  Client,
  Trainer,
  Instruction,
  Warning,
  SessionLog,
} from "../types";

export interface FirestoreData {
  clients: Client[];
  trainers: Trainer[];
  instructions: Instruction[];
  warnings: Warning[];
  sessionLogs: SessionLog[];
  dbLoading: boolean;
}

export function useFirestoreData(userId: string | undefined): FirestoreData {
  const [clients, setClients] = useState<Client[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Track when core collections have loaded
    let coreLoaded = 0;
    const checkReady = () => {
      if (++coreLoaded >= 3) setDbLoading(false);
    };

    // ── Clients: collectionGroup reads ALL trainers' clients ──
    const unsubClients = onSnapshot(
      collectionGroup(db, "clients"),
      (snap) => {
        setClients(
          snap.docs.map((d) => ({
            id: d.id,
            trainerId: d.ref.parent.parent?.id || "",
            ...(d.data() as Omit<Client, "id" | "trainerId">),
          }))
        );
        checkReady();
      }
    );

    // ── Trainers ──
    const unsubTrainers = onSnapshot(
      collection(db, "trainers"),
      (snap) => {
        setTrainers(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Trainer, "id">),
          }))
        );
        checkReady();
      }
    );

    // ── Instructions (newest first) ──
    const unsubInstructions = onSnapshot(
      query(collection(db, "instructions"), orderBy("createdAt", "desc")),
      (snap) => {
        setInstructions(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Instruction, "id">),
          }))
        );
        checkReady();
      }
    );

    // ── Session Logs (newest first) ──
    const unsubSessions = onSnapshot(
      query(collection(db, "sessionLogs"), orderBy("createdAt", "desc")),
      (snap) => {
        setSessionLogs(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<SessionLog, "id">),
          }))
        );
      }
    );

    // ── Warnings (newest first) ──
    const unsubWarnings = onSnapshot(
      query(collection(db, "warnings"), orderBy("createdAt", "desc")),
      (snap) => {
        setWarnings(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Warning, "id">),
          }))
        );
      }
    );

    return () => {
      unsubClients();
      unsubTrainers();
      unsubInstructions();
      unsubSessions();
      unsubWarnings();
    };
  }, [userId]);

  return { clients, trainers, instructions, warnings, sessionLogs, dbLoading };
}
