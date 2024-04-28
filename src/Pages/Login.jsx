import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Initialize Firebase
      const auth = getAuth();
      const firestore = getFirestore();

      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // info from Firestore
      const userDoc = doc(firestore, "Users", user.uid);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        if (userData && userData.role) {
          const userRole = userData.role;
          navigate("/home", {
            state: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userRole,
            },
          });
        } else {
          console.log("Role not found in user data");
          navigate("/home");
        }
      } else {
        console.log("User data not found in Firestore");
        navigate("/home");
      }
    } catch (error) {
      console.error("Error signing in:", error.message);
    }
  };

  return (
    <div className="tw-text-white tw-h-[100vh] tw-flex tw-items-center tw-justify-center tw-bg-cover">
      <div className="tw-bg-slate-800 border tw-border-slate-600 tw-rounded-md tw-p-8 tw-shadow-lg tw-backdrop-filler tw-backdrop-blur-lg tw-relative">
        <h1 className="tw-text-4xl tw-font-bold tw-text-center tw-mb-6">
          Login
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="tw-relative tw-my-4">
            <input
              type="email"
              className="tw-block tw-w-72 tw-py-2.5 tw-px-0 tw-text-sm tw-text-white tw-bg-transparent tw-border-0 tw-border-b-2 tw-border-gray-300 tw-appearance-none tw-dark:focus:border-blue-500 tw-focus:outline-none tw-focus:ring-0 tw-focus:text-white tw-focus:border-blue-600 tw-peer"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="tw-relative tw-my-4">
            <input
              type="password"
              id="password"
              className="tw-block tw-w-72 tw-py-2.5 tw-px-0 tw-text-sm tw-text-white tw-bg-transparent tw-border-0 tw-border-b-2 tw-border-gray-300 tw-appearance-none tw-dark:focus:border-blue-500 tw-focus:outline-none tw-focus:ring-0 tw-focus:text-white tw-focus:border-blue-600 tw-peer"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
          </div>
          <button
            type="submit"
            className="tw-w-full tw-mt-6 tw-mb-4 tw-text-[18px] tw-rounded tw-bg-blue-500 tw-transitions-colors tw-duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
