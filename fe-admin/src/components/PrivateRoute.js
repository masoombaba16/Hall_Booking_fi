import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setUserData } from '../slices/userSlice';
import { useDispatch } from "react-redux";

const PrivateRoute = ({ children, requiredUserType }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const dispatch = useDispatch();
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/verify-token", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                let data = await response.json();
                console.log(data)
                if (data.user) {
                    if (data.user.userType === requiredUserType) {
                        setIsValidToken(true);
                        console.log(data);
                        dispatch(setUserData(data.user)); 
                    } else {
                        navigate("/main", { replace: true });
                    }
                } else {
                    navigate("/main", { replace: true });
                }
            } catch (error) {
                navigate("/main", { replace: true });
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, [navigate, requiredUserType, dispatch]);
    if (loading) {
        return <div>Loading...</div>;
    }
    return isValidToken ? children : null;
};
export default PrivateRoute;
