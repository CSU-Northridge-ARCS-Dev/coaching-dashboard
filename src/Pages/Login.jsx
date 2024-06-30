import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { usePermission } from "react-permission-role";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import ARCSImage from "../Public/ARCS.jpg";
import Footer from "../Components/Footer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const navigate = useNavigate();
  const { setUser } = usePermission();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError(false);
    setPasswordError(false);

    try {
      const auth = getAuth();
      const firestore = getFirestore();

      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Retrieve user info from Firestore
      const userDoc = doc(firestore, "Users", user.uid);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        console.log("User data:", userData);
        if (userData && userData.role) {
          // Set user context with role
          setUser({
            id: user.uid,
            roles: [userData.role],
            permissions: [],
          });

          // Navigate based on user role
          if (userData.role === "admin") {
            console.log("Navigating to admin page");
            navigate("/admin", {
              state: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
              },
            });
          } else if (userData.role === "athlete") {
            console.log("Navigating to athlete dashboard");
            navigate("/athlete", {
              state: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
              },
            });
          } else if (userData.role === "coach") {
            console.log("Navigating to coach dashboard");
            navigate("/coach", {
              state: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
              },
            });
          } else {
            console.log("Role not found in user data");
            navigate("/home");
          }
        } else {
          console.log("Role not found in user data");
          navigate("/home");
        }
      } else {
        console.log("User data not found in Firestore");
        navigate("/home");
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("Email is incorrect");
        setEmailError(true);
      } else if (error.code === "auth/wrong-password") {
        setError("Password is incorrect");
        setPasswordError(true);
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Error signing in:", error.message);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "black",
        alignItems: "center",
      }}
    >
      <Box
        component="img"
        src={ARCSImage}
        alt="ARCS"
        sx={{
          width: "100%",
          maxHeight: "310px",
          objectFit: "cover",
        }}
      />
      <Container component="main" maxWidth="xs" sx={{ mt: 4 }}>
        <Card sx={{ padding: 4, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center">
              Login
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 2 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        <FontAwesomeIcon
                          icon={showPassword ? faEye : faEyeSlash}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <CardActions sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: "black",
                    color: "white",
                    borderRadius: "20px",
                    "&:hover": {
                      backgroundColor: "gray",
                    },
                  }}
                >
                  Login
                </Button>
              </CardActions>
            </Box>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </Box>
  );
};

export default Login;
