import React, { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from "./components/MainPage";
import Login_Common from "./components/Login_Common";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import HeaderClub from "./Club/HeaderClub";
import HeaderOrganizer from "./Organizer/HeaderOrganizer";
import Guest from "./Guest";
const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const router = createBrowserRouter([
    {
      path: "/main",
      element: showLogin ? <Login_Common /> : <MainPage />,
    },
    {
      path: "",
      element: (
        <PrivateRoute requiredUserType="admin">
          <Header />
        </PrivateRoute>
      ),
    },
    {
      path: "/admin-dashboard",
      element: (
        <PrivateRoute requiredUserType="admin">
          <Header />
        </PrivateRoute>
      ),
    },
    {
      path: "/club-dashboard",
      element: (
        <PrivateRoute requiredUserType="club">
          <HeaderClub></HeaderClub>
        </PrivateRoute>
      ),
    },
    {
      path: "/organizer-dashboard",
      element: (
        <PrivateRoute requiredUserType="organizer">
          <HeaderOrganizer></HeaderOrganizer>
        </PrivateRoute>
      ),
    },
    {
      path: "guest",
      element: <Guest />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
