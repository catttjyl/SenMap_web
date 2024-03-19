import './App.css';
import React from 'react';
import Basemap from "./scenes/map"
import { Box } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from 'scenes/welcome';

function App() {
  const href = window.location.href;
  console.log(window.location);
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Basemap />} />
          <Route patth="welcome" element={<Welcome />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
