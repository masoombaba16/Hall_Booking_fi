import { useState } from 'react';
import './App.css';
import Admin from './Admin';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Otp from './external/Otp';
import ForgotChange from './external/ForgotChange';
import Booking from './components/Booking';
import Loader from './components/Loader';
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
    },
    {
      path:'/booking',
      element:<Booking/>
    },
    {
      path:'loader',
      element:<Loader/>
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
