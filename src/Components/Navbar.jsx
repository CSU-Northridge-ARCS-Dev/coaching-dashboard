import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faHeartbeat,
  faSignOutAlt,
  faBed,
} from "@fortawesome/free-solid-svg-icons";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const [user] = useAuthState(getAuth());
  const [role, setRole] = useState("");
  const auth = getAuth();
  const firestore = getFirestore();
  const location = useLocation();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && !role) {
        const userDoc = doc(firestore, "Users", user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setRole(userData.role);
        }
      }
    };
    fetchUserRole();
  }, [user, firestore, role]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const displayName = user ? user.displayName : "";
  const [firstName, lastName] = displayName ? displayName.split(" ") : ["", ""];

  const getDashboardPath = () => {
    switch (role) {
      case "admin":
        return "/admin";
      case "athlete":
        return "/athlete";
      case "coach":
        return "/coach";
      default:
        return "/";
    }
  };

  return (
    <div className="tw-fixed tw-top-0 tw-left-0 tw-w-64 tw-h-full tw-bg-[#1F2A40] tw-shadow-lg tw-flex tw-flex-col tw-items-center tw-pt-10">
      <div className="tw-text-white tw-text-2xl tw-font-bold tw-mb-2">
        {firstName} {lastName}
      </div>
      <div className="tw-text-white tw-text-lg tw-mb-6">{role}</div>
      <nav className="tw-flex-1 tw-w-full">
        <ul className="tw-flex tw-flex-col tw-space-y-6">
          <li>
            <Link
              to={getDashboardPath()}
              className={`tw-flex tw-items-center tw-space-x-2 tw-text-white tw-px-4 tw-py-2 hover:tw-bg-[#3D4F6D] ${
                ["/admin", "/athlete", "/coach"].includes(location.pathname)
                  ? "tw-text-red-500"
                  : ""
              }`}
            >
              <FontAwesomeIcon icon={faTachometerAlt} />
              <span
                className={`${
                  ["/admin", "/athlete", "/coach"].includes(location.pathname)
                    ? "tw-text-red-500"
                    : ""
                }`}
              >
                Dashboard
              </span>
            </Link>
          </li>
          {role === "athlete" && (
            <>
              <li>
                <Link
                  to="/heart"
                  className={`tw-flex tw-items-center tw-space-x-2 tw-text-white tw-px-4 tw-py-2 hover:tw-bg-[#3D4F6D] ${
                    location.pathname === "/heart" ? "tw-text-red-500" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faHeartbeat} />
                  <span
                    className={`${
                      location.pathname === "/heart" ? "tw-text-red-500" : ""
                    }`}
                  >
                    Heart Data
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/sleep"
                  className={`tw-flex tw-items-center tw-space-x-2 tw-text-white tw-px-4 tw-py-2 hover:tw-bg-[#3D4F6D] ${
                    location.pathname === "/sleep" ? "tw-text-red-500" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faBed} />
                  <span
                    className={`${
                      location.pathname === "/sleep" ? "tw-text-red-500" : ""
                    }`}
                  >
                    Sleep Data
                  </span>
                </Link>
              </li>
            </>
          )}
          <li>
            <button
              onClick={handleLogout}
              className="tw-flex tw-items-center tw-space-x-2 tw-w-full tw-text-white tw-px-4 tw-py-2 hover:tw-bg-[#3D4F6D]"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
