// Coaching-Dashboard/src/utils/sendInvitation.js
import { collection, doc, addDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; // Ensure proper Firebase config import
import axios from "axios";

export const sendInvitation = async (athleteEmail) => {
  try {
    const coachId = auth.currentUser.uid;
    const coachEmail = auth.currentUser.email;

    const userDoc = await getDoc(doc(db, "Users", coachId));
    const userData = userDoc.data();
    const coachName = `${userData.firstName} ${userData.lastName}`;
    const institution = userData.institution;

    const invitationsRef = collection(db, "Invitations");

    await addDoc(invitationsRef, {
      coachId,
      coachName,
      coachEmail,
      institution,
      athleteEmail,
      status: "pending",
    });

    console.log("Invitation sent successfully.");

    const response = await axios.post("http://localhost:3001/send-invitation", {
      athleteEmail,
      coachName,
      institution,
    });

    console.log(response.data);
  } catch (error) {
    console.error("Error sending invitation:", error);
  }
};
