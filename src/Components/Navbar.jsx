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
  faUser,
  faEnvelope,
  faChartLine,
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

  const displayName = user ? user.displayName || "" : "";
  const nameParts = displayName.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

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

  // active route helpers (handles nested paths too)
  const onDashboard = ["/admin", "/athlete", "/coach"].some((p) =>
    location.pathname.startsWith(p)
  );
  const onHeart = location.pathname.startsWith("/heart");
  const onSleep = location.pathname.startsWith("/sleep");
  const onInfo = location.pathname.startsWith("/info");
  const onInsights = location.pathname.startsWith("/insights");
  const onInvitation = location.pathname.startsWith("/invitation");

  const baseLink =
    "tw-flex tw-items-center tw-space-x-2 tw-px-4 tw-py-2 tw-text-[var(--text)] hover:tw-bg-[var(--sidebar-hover)]";
  const activeLink =
    "tw-bg-[var(--sidebar-active)] tw-text-[var(--accent)]";

  const iconClass = (active) =>
    active ? "tw-text-[var(--accent)]" : "tw-text-[var(--muted-text)]";

  return (
    <div className="tw-fixed tw-top-0 tw-left-0 tw-w-64 tw-h-full tw-bg-[var(--sidebar-bg)] tw-border-r tw-border-[var(--border)] tw-flex tw-flex-col tw-items-center tw-pt-10">
      <div className="tw-text-[var(--text)] tw-text-2xl tw-font-bold tw-mb-1">
        {firstName} {lastName}
      </div>
      <div className="tw-text-[var(--muted-text)] tw-text-sm tw-uppercase tw-tracking-wide tw-mb-6">
        {role}
      </div>

      <nav className="tw-flex-1 tw-w-full">
        <ul className="tw-flex tw-flex-col tw-space-y-2">
          <li>
            <Link
              to={getDashboardPath()}
              className={`${baseLink} ${onDashboard ? activeLink : ""}`}
            >
              <FontAwesomeIcon icon={faTachometerAlt} className={iconClass(onDashboard)} />
              <span className={onDashboard ? "tw-text-[var(--accent)]" : ""}>
                Dashboard
              </span>
            </Link>
          </li>

          {role === "athlete" && (
            <>
              <li>
                <Link
                  to="/heart"
                  className={`${baseLink} ${onHeart ? activeLink : ""}`}
                >
                  <FontAwesomeIcon icon={faHeartbeat} className={iconClass(onHeart)} />
                  <span className={onHeart ? "tw-text-[var(--accent)]" : ""}>
                    Heart Data
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/sleep"
                  className={`${baseLink} ${onSleep ? activeLink : ""}`}
                >
                  <FontAwesomeIcon icon={faBed} className={iconClass(onSleep)} />
                  <span className={onSleep ? "tw-text-[var(--accent)]" : ""}>
                    Sleep Data
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/insights"
                  className={`${baseLink} ${onInsights ? activeLink : ""}`}
                >
                  <FontAwesomeIcon icon={faChartLine} className={iconClass(onInsights)} />
                  <span className={onInsights ? "tw-text-[var(--accent)]" : ""}>
                    Insights
                  </span>
                </Link>
              </li>
            </>
          )}

          {role === "coach" && (
            <>
              <li>
                <Link
                  to="/info"
                  className={`${baseLink} ${onInfo ? activeLink : ""}`}
                >
                  <FontAwesomeIcon icon={faUser} className={iconClass(onInfo)} />
                  <span className={onInfo ? "tw-text-[var(--accent)]" : ""}>
                    Athlete Info
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/insights"
                  className={`${baseLink} ${onInsights ? activeLink : ""}`}
                >
                  <FontAwesomeIcon icon={faChartLine} className={iconClass(onInsights)} />
                  <span className={onInsights ? "tw-text-[var(--accent)]" : ""}>
                    Insights
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/invitation"
                  className={`${baseLink} ${onInvitation ? activeLink : ""}`}
                >
                  <FontAwesomeIcon icon={faEnvelope} className={iconClass(onInvitation)} />
                  <span className={onInvitation ? "tw-text-[var(--accent)]" : ""}>
                    Invite
                  </span>
                </Link>
              </li>
            </>
          )}

          <li className="tw-mt-2">
            <button
              onClick={handleLogout}
              className={`${baseLink} tw-w-full`}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="tw-text-[var(--muted-text)]" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
