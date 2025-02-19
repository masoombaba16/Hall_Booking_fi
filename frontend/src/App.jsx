import { useState } from 'react';
import './App.css';
import Admin from './Admin';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Otp from './external/Otp';
import ForgotChange from './external/ForgotChange';
function App() {
  // Define the router with routes
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Admin />
    },
    {
      path:'/otp',
      element:<Otp/>
    },
    {
      path:'/forgot-change',
      element:<ForgotChange/>
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
