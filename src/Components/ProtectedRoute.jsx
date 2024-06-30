import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children, requiredRole, redirectPath }) => {
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
            setRole(userData.role);
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
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (role !== requiredRole) {
    console.error(
      `User role ${role} does not match required role ${requiredRole}`
    );
    return <Navigate to={redirectPath} />;
  }

  return children;
};

export default ProtectedRoute;
