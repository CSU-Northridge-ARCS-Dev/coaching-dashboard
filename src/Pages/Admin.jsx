import React, { useState, useEffect } from "react";
import { AllowedAccess } from "react-permission-role";
import { DataGrid } from "@mui/x-data-grid";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import Navbar from "../Components/Navbar";

const Admin = () => {
  const [email, setEmail] = useState("");
  const [updatingRole, setUpdatingRole] = useState(false);
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleRoleUpdate = async (e) => {
    e.preventDefault();
    setUpdatingRole(true);
    setMessage("");

    try {
      //const response = await fetch("http://localhost:3000/updateRole", {
      //const response = await fetch("/updateRole", {
      const response = await fetch("/api/updateRole", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newRole: "coach" }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(`Role updated successfully: ${data.message}`);
      } else {
        throw new Error("Failed to update role.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setMessage(error.message);
    } finally {
      setUpdatingRole(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        //const response = await fetch("http://localhost:3000/getUsers");
        //const response = await fetch("/getUsers");
        const response = await fetch("/api/getUsers");

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setRows(
          data.users.map((user, index) => ({
            id: user.id,
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
          }))
        );
      } catch (error) {
        console.error("Error fetching users:", error);
        setMessage("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: "fullName", headerName: "Full Name", width: 200 },
    { field: "email", headerName: "Email", width: 250 },
    { field: "role", headerName: "Role", width: 130 },
  ];

  return (
    <AllowedAccess
      roles={["admin"]}
      renderAuthFailed={
        <p style={{ color: "white" }}>
          You are not authorized to access this page.
        </p>
      }
    >
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-min-h-screen tw-bg-black">
        <Navbar />
        <div className="tw-flex-1 tw-ml-64 tw-p-4 tw-text-white">
          <Container>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              style={{ color: "white" }}
            >
              Admin Panel
            </Typography>
            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              sx={{ mt: 4 }}
              style={{ color: "white" }}
            >
              Roster
            </Typography>
            <Paper
              elevation={3}
              sx={{ p: 2, backgroundColor: "#1F2A40", color: "white" }}
            >
              {loading ? (
                <CircularProgress />
              ) : (
                <div style={{ height: 400, width: "100%", color: "white" }}>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    disableSelectionOnClick
                    sx={{
                      "& .MuiDataGrid-root": {
                        borderColor: "white",
                      },
                      "& .MuiDataGrid-cell": {
                        color: "white",
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#1F2A40",
                      },
                      "& .MuiDataGrid-columnHeaderTitle": {
                        color: "black",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white",
                      },
                      "& .MuiCheckbox-root": {
                        color: "white",
                      },
                      "& .MuiDataGrid-footerContainer": {
                        color: "white",
                      },
                      "& .MuiTablePagination-root": {
                        color: "white",
                      },
                      "& .MuiTablePagination-selectIcon": {
                        color: "white",
                      },
                      "& .MuiDataGrid-columnSeparator": {
                        color: "white",
                      },
                      "& .MuiDataGrid-toolbarContainer": {
                        color: "white",
                      },
                    }}
                  />
                </div>
              )}
            </Paper>
          </Container>
        </div>
      </div>
    </AllowedAccess>
  );
};

export default Admin;
