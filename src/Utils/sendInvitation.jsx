// Coaching-Dashboard/src/utils/sendInvitation.js
import { collection, doc, addDoc, getDoc, updateDoc, arrayUnion  } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; // Ensure proper Firebase config import
import axios from "axios";

export const sendInvitation = async (athleteEmail) => {
  try {
    const coachId = auth.currentUser.uid;
    const coachEmail = auth.currentUser.email;

    const userDoc = await getDoc(doc(db, "Users", coachId));
    const userData = userDoc.data();
    const coachName = `${userData.firstName} ${userData.lastName}`;
    //const institution = userData.institution;

    // Reference the Invitations collection
    const invitationsRef = collection(db, "Invitations");

    // Add a new document to the Invitations collection and store the document reference
    const newInvitationRef = await addDoc(invitationsRef, {
      coachId,
      coachName,
      coachEmail,
      // institution, // Uncomment if using institution
      athleteEmail,
      status: "pending",
    });

    console.log("Invitation sent successfully with ID:", newInvitationRef.id);

    // Add the invitation ID to the coach's document (under invitationsSent array)
    const coachRef = doc(db, "Users", coachId);
    await updateDoc(coachRef, {
      invitationsSent: arrayUnion(newInvitationRef.id) // Append the new invitation ID to the array
    });
    console.log("Invitation ID added to coach's document.");
    

    // Email Service Here
    // const response = await axios.post("http://localhost:3001/send-invitation", {
    //   athleteEmail,
    //   coachName,
    //   // institution,
    // });

    // console.log(response.data);
  } catch (error) {
    console.error("Error sending invitation:", error);
  }
};
