import { useState } from 'react';
import './App.css';
import Admin from './Admin';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

function App() {
  // Define the router with routes
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Admin />
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
