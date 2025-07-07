// Coaching-Dashboard/src/utils/fetchPendingInvitations.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export const fetchPendingInvitations = async (coachId) => {
  try {
    const invitationsRef = collection(db, "Invitations");
    const pendingQuery = query(
      invitationsRef,
      where("coachId", "==", coachId),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(pendingQuery);

    const pendingInvitations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return pendingInvitations;
  } catch (error) {
    console.error("Error fetching pending invitations:", error);
    throw error;
  }
};
