import React from "react";
import ReactDOM from "react-dom";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import "./style.css";

const App = () => {
  return <Home />;
};
ReactDOM.render(<App />, document.getElementById("root"));
