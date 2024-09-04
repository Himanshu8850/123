import React, { useState, useEffect } from "react";
import "../css/Login.css"; // Import the CSS file
import { useNavigate } from "react-router-dom";
const Login = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [signed, setsigned] = useState(false);
  const toggleForm = () => {
    setIsSignup((prev) => !prev);
  };
  const [planned, setplanned] = useState([]);

  const fetchPlans = async (userId) => {
    try {
      const response = await fetch("http://localhost:8000/api/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }

      const data = await response.json();
      console.log("Plans fetched:", data);
      // Process and use the data as needed
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/Home");
    }
  }, [signed]);
  return (
    <>
      {!signed && (
        <div className="login-container">
          <div className="form-container">
            <h2>{isSignup ? "Sign Up" : "Log In"}</h2>

            {isSignup ? (
              <SignupForm setsigned={setsigned} navigate={navigate} />
            ) : (
              <LoginForm
                setsigned={setsigned}
                navigate={navigate}
                fetchPlans={fetchPlans}
              />
            )}

            <button className="toggle-button" onClick={toggleForm}>
              {isSignup
                ? "Already have an account? Log In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      )}
      {signed && planned && (
        <div>
          <h1>{planned}</h1>
          <button onClick={navigate("/Home")}>Plan a trip</button>
        </div>
      )}
    </>
  );
};

const SignupForm = ({ setsigned, navigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const createUser = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }
      localStorage.setItem("user", email);
      navigate("/Home");
      const data = await response.json();
      console.log("User created:", data);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      email,
      password,
    };
    console.log("Signup Form Submitted:", formData);
    createUser();
    setsigned(true);

    // Here you can send `formData` to your backend using fetch or any other method
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="submit-button">
        Sign Up
      </button>
    </form>
  );
};

const LoginForm = ({ setsigned, navigate, fetchPlans }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginUser = async (setsigned) => {
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      localStorage.setItem("user", email);
      setsigned(true);
      console.log("User logged in:", data);
      // Store the JWT token or session details as needed
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      email,
      password,
    };
    loginUser(setsigned);
    console.log("Login Form Submitted:", formData);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="submit-button">
        Log In
      </button>
    </form>
  );
};

export default Login;
