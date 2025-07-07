import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [user, loading, error] = useAuthState(getAuth());
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const firestore = getFirestore();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userDoc = doc(firestore, "Users", user.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            console.log("Fetched user role: ", userData.role);
            setRole(userData.role);
          } else {
            console.error("User document does not exist.");
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
        } finally {
          setRoleLoading(false);
        }
      } else {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user, firestore]);

  if (loading || roleLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error("Error: ", error.message);
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    console.warn("No user found, redirecting to login");
    return <Navigate to="/" />;
  }

  if (roleLoading || role === null) {
    return <div>Loading role...</div>; 
  }

  if (role !== requiredRole) {
    console.warn(`User role ${role} does not match required role ${requiredRole}`);
    const redirectPath = {
      admin: "/admin",
      athlete: "/athlete",
      coach: "/coach",
    }[role] || "/";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
