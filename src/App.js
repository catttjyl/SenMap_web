import './App.css';
import React from 'react';
import Basemap from "./scenes/map"
import { Box } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Box>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Basemap />} />
        </Routes>
      </BrowserRouter>
    </Box>
  );
}

export default App;
