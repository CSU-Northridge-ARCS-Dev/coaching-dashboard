import React, { useState, useEffect } from "react";
import { AllowedAccess } from "react-permission-role";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  CircularProgress,
  Paper,
  Button,
} from "@mui/material";
import Navbar from "../Components/Navbar";

const CoachDashboard = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3000/getUsers");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setRows(
          data.users
            .filter((user) => user.role === "athlete")
            .map((user) => ({
              id: user.id,
              fullName: `${user.firstName} ${user.lastName}`,
              email: user.email,
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

  const handleViewClick = (athlete) => {
    navigate("/info", { state: { user: athlete } });
  };

  const handleInviteClick = (athlete) => {
    navigate("/invitation", { state: { user: athlete } });
  };

  const columns = [
    { field: "fullName", headerName: "Full Name", width: 200 },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "view",
      headerName: "Health Insights",
      width: 180,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleViewClick(params.row)}
        >
          View
        </Button>
      ),
    },
    {
      field: "invite",
      headerName: "Invite",
      width: 180,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleInviteClick(params.row)}
        >
          Message
        </Button>
      ),
    },
  ];

  return (
    <AllowedAccess
      roles={["coach"]}
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

export default CoachDashboard;
