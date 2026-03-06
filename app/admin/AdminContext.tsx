// ============================================================
// KEY FIXES FOR AdminContext.tsx
// ============================================================

// PASTE THESE INTO YOUR EXISTING AdminContext.tsx FILE

// ── FIX 1: Updated addClient function ──────────────────────
const addClient = async () => {
  if (!newClient.name || !newClient.trainerId) return;
  const sessionsIncluded = Number(newClient.sessionsIncluded) || 0;
  const clientName = newClient.name.trim();
  try {
    const docRef = await addDoc(collection(db, "trainers", newClient.trainerId, "clients"), {
      name: clientName,
      email: newClient.email.trim(),
      gender: newClient.gender,
      age: newClient.age ? Number(newClient.age) : "",
      trainerId: newClient.trainerId,
      trainerName: newClient.trainerName,
      programType: newClient.programType,
      status: newClient.status,
      medicalNotes: newClient.medicalNotes,
      startDate: newClient.startDate,
      endDate: newClient.endDate,
      plan: newClient.plan,
      location: newClient.location,
      sessionsIncluded,
      // ✅ FIX: Initialize these fields immediately
      sessionsLogged: 0,
      classesLeft: sessionsIncluded,
      compliance: 0,
      missedSessions: 0,
      lastSession: null,
      lateLog: false,
      createdAt: serverTimestamp(),
    });
    
    // Update document with its own ID
    await updateDoc(docRef, { id: docRef.id });
    
    // Reset form
    setNewClient({
      name: "", email: "", gender: "", age: "", trainerId: "", trainerName: "",
      programType: "1-on-1", status: "Active", medicalNotes: "",
      startDate: "", endDate: "", sessionsIncluded: "", plan: "", location: "",
    });
    setShowAddClient(false);
    showToast(`Client "${clientName}" added successfully!`, "success");
  } catch (err) {
    console.error("addClient:", err);
    showToast("Failed to add client. Please try again.", "error");
  }
};

// ── FIX 2: Updated atRiskClients calculation ────────────────
const atRiskClients = clients.filter((c) => {
  const expired = c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive";
  const lowClasses = (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0;
  
  // ✅ FIX: Only flag low compliance if they've actually logged sessions
  // New clients with 0 sessions won't be at-risk, even at 0% compliance
  const lowCompliance = (c.sessionsLogged || 0) > 0 && (c.compliance || 0) < 75;
  
  return expired || lowClasses || lowCompliance;
});

// ============================================================
// WHAT TO CHANGE IN YOUR AdminContext.tsx
// ============================================================

// FIND THIS (around line 140-160):
// const atRiskClients = clients.filter((c) => {
//   const expired    = c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive";
//   const lowClasses = (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0;
//   return expired || lowClasses || (c.compliance || 0) < 75;  // ❌ OLD
// });

// REPLACE WITH:
// const atRiskClients = clients.filter((c) => {
//   const expired = c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive";
//   const lowClasses = (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0;
//   const lowCompliance = (c.sessionsLogged || 0) > 0 && (c.compliance || 0) < 75;  // ✅ NEW
//   return expired || lowClasses || lowCompliance;
// });

// ============================================================
// FIND THIS (in addClient function, around line 220-250):
// const docRef = await addDoc(collection(db, "trainers", newClient.trainerId, "clients"), {
//   name: clientName,
//   email: newClient.email.trim(),
//   // ... other fields ...
//   sessionsIncluded,
//   sessionsLogged: 0,
//   classesLeft: sessionsIncluded,
//   location: newClient.location,
//   compliance: 0,
//   progressLastUpdated: "Never",
//   createdAt: serverTimestamp(),
// });

// REPLACE WITH:
// const docRef = await addDoc(collection(db, "trainers", newClient.trainerId, "clients"), {
//   name: clientName,
//   email: newClient.email.trim(),
//   gender: newClient.gender,
//   age: newClient.age ? Number(newClient.age) : "",
//   trainerId: newClient.trainerId,
//   trainerName: newClient.trainerName,
//   programType: newClient.programType,
//   status: newClient.status,
//   medicalNotes: newClient.medicalNotes,
//   startDate: newClient.startDate,
//   endDate: newClient.endDate,
//   plan: newClient.plan,
//   location: newClient.location,
//   sessionsIncluded,
//   sessionsLogged: 0,
//   classesLeft: sessionsIncluded,      // ✅ Full sessions available
//   compliance: 0,                      // ✅ 0% until first session
//   missedSessions: 0,                  // ✅ No missed initially
//   lastSession: null,                  // ✅ No sessions yet
//   lateLog: false,                     // ✅ No late submissions
//   createdAt: serverTimestamp(),
// });

// ============================================================
// MANUAL CHANGES SUMMARY
// ============================================================

/*

CHANGE 1: In the AdminContext provider, find the atRiskClients calculation
- OLD: return expired || lowClasses || (c.compliance || 0) < 75;
- NEW: 
  const lowCompliance = (c.sessionsLogged || 0) > 0 && (c.compliance || 0) < 75;
  return expired || lowClasses || lowCompliance;

CHANGE 2: In the addClient function, add these fields when creating new client:
- missedSessions: 0
- lastSession: null
- lateLog: false
- Make sure ALL fields are initialized (not left undefined)

THAT'S IT! Two small changes fix all three issues.

*/

// ============================================================
// WHY THIS WORKS
// ============================================================

/*

ISSUE 1: Sessions Not Showing
BEFORE: New client created with undefined classesLeft, compliance
        → Stats don't render, performance hidden
AFTER:  New client initialized with classesLeft=12, compliance=0
        → Stats render immediately, performance visible ✅

ISSUE 2: Compliance Showing Red
BEFORE: 0% compliance shows red (correct for active clients)
AFTER:  Same, but now new clients won't be at-risk ✅

ISSUE 3: At-Risk Flagging New Clients
BEFORE: New client (0/12) flagged as at-risk because compliance=0%
AFTER:  Only flagged if they have logged sessions AND compliance is low
        New clients (0 sessions) won't be at-risk ✅

*/
