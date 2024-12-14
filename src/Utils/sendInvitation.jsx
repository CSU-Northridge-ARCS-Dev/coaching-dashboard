import { query, collection, doc, where, addDoc, getDoc, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; // Ensure proper Firebase config import
import axios from "axios";

export const sendInvitation = async (athleteEmail) => {
  try {
    const coachId = auth.currentUser.uid;
    const coachEmail = auth.currentUser.email;

    // Fetch coach details
    const userDoc = await getDoc(doc(db, "Users", coachId));
    const userData = userDoc.data();
    const coachFirstName = userData.firstName;
    const coachLastName = userData.lastName;
    //const institution = userData.institution;

    // Reference the Invitations collection
    const invitationsRef = collection(db, "Invitations");

    // Add a new document to the Invitations collection and store the document reference
    const newInvitationRef = await addDoc(invitationsRef, {
      coachId,
      coachFirstName,
      coachLastName,
      coachEmail,
      // institution, // Uncomment if using institution
      athleteEmail,
      status: "pending",
    });

    console.log("Invitation sent successfully with ID:", newInvitationRef.id);

    // Add the invitation reference to the coach's document (under invitationsSent array)
    const coachRef = doc(db, "Users", coachId);
    await updateDoc(coachRef, {
      invitationsSent: arrayUnion(doc(db, "Invitations", newInvitationRef.id)), // Append the new invitation reference to the array
    });
    console.log("Invitation reference added to coach's document.");

    // Query the Users collection to find the document with the specified athleteEmail
    const userRef = collection(db, "Users");
    const athleteQuery = query(userRef, where("email", "==", athleteEmail));
    const querySnapshot = await getDocs(athleteQuery);

    if (querySnapshot.empty) {
      console.log("No user found with the specified athlete email");
      return;
    }

    // Fetch athlete's document
    const athleteDoc = querySnapshot.docs[0]; // Email must be unique
    const athleteId = athleteDoc.id;
    console.log("Athlete ID found:", athleteId);

    // Append the coach reference to the athlete's pendingPermissions array
    const athleteRef = doc(db, "Users", athleteId);
    await updateDoc(athleteRef, {
      pendingPermissions: arrayUnion(doc(db, "Users", coachId)), // Store reference to the coach document
    });
    console.log(`Coach reference added to athlete's pendingPermissions.`);
  } catch (error) {
    console.error("Error sending invitation:", error);
  }
};


// // Coaching-Dashboard/src/utils/sendInvitation.js
// import { query, collection, doc, where, addDoc, getDoc, getDocs, updateDoc, arrayUnion  } from "firebase/firestore";
// import { auth, db } from "../../firebaseConfig"; // Ensure proper Firebase config import
// import axios from "axios";

// export const sendInvitation = async (athleteEmail) => {
//   try {
//     const coachId = auth.currentUser.uid;
//     const coachEmail = auth.currentUser.email;

//     const userDoc = await getDoc(doc(db, "Users", coachId));
//     const userData = userDoc.data();
//     const coachName = `${userData.firstName} ${userData.lastName}`;
//     //const institution = userData.institution;

//     // Reference the Invitations collection
//     const invitationsRef = collection(db, "Invitations");

//     // Add a new document to the Invitations collection and store the document reference
//     const newInvitationRef = await addDoc(invitationsRef, {
//       coachId,
//       coachName,
//       coachEmail,
//       // institution, // Uncomment if using institution
//       athleteEmail,
//       status: "pending",
//     });

//     console.log("Invitation sent successfully with ID:", newInvitationRef.id);

//     // Add the invitation ID to the coach's document (under invitationsSent array)
//     const coachRef = doc(db, "Users", coachId);
//     await updateDoc(coachRef, {
//       invitationsSent: arrayUnion(newInvitationRef.id) // Append the new invitation ID to the array
//     });
//     console.log("Invitation ID added to coach's document.");
    


//     // Query the Users collection to find the document with the specified athleteEmail
//     const userRef = collection(db, "Users");
//     const athleteQuery = query(userRef, 
//       where("email", "==", athleteEmail));
//     const querySnapshot = await getDocs(athleteQuery);
//     if(querySnapshot.empty) {
//       console.log("No user found with the specified athlete email");
//     }
//     const athleteDoc = querySnapshot.docs[0]; // Email must be unique
//     const athleteId = athleteDoc.id;
//     console.log("Athlete ID found:", athleteId);
//     // Append the coachId to the athlete's pendingPermissions array
//     const athleteRef = doc(db, "Users", athleteId);
//     await updateDoc(athleteRef, {
//       pendingPermissions: arrayUnion(coachId),
//     });
//     console.log(`Coach ID ${coachId} added to athlete's pendingPermissions.`);



//     // Email Service Here
//     // const response = await axios.post("http://localhost:3001/send-invitation", {
//     //   athleteEmail,
//     //   coachName,
//     //   // institution,
//     // });

//     // console.log(response.data);
//   } catch (error) {
//     console.error("Error sending invitation:", error);
//   }
// };
