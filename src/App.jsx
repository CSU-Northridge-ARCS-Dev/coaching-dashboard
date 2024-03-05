import React from "react";
import ReactDOM from "react-dom";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./Components/Footer";
import Home from "./Pages/Home";
import Navbar from "./Components/Navbar";
import "./style.css";

const App = () => {
  return (
    <div className="tw-grid tw-grid-rows-[1fr_auto] tw-grid-cols-[auto_1fr] tw-min-h-screen">
      <Navbar />
      <div className="tw-col-span-1 tw-row-span-1 tw-bg-indigo-300">
        <Home />
      </div>
      <div className="tw-col-span-2 ">
        <Footer />
      </div>
    </div>
  );
};
ReactDOM.render(<App />, document.getElementById("root"));
