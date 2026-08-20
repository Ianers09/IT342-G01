import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("register");

  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    setRegisterMessage("");
    setRegisterError("");

    if (
      !registerUsername.trim() ||
      !registerEmail.trim() ||
      !registerPassword.trim()
    ) {
      setRegisterError("All fields are required.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8081/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: registerUsername,
            email: registerEmail,
            password: registerPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setRegisterError(data.message || "Registration failed.");
        return;
      }

      setRegisterMessage(
        data.message || "Registration successful."
      );

      setRegisterUsername("");
      setRegisterEmail("");
      setRegisterPassword("");
    } catch (error) {
      console.error("Registration error:", error);

      setRegisterError(
        "Unable to connect to the Spring Boot server. Make sure the backend is running."
      );
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();

    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Email and password are required.");
      return;
    }

    /*
      API integration for login will be added
      in the separate API Integration commit.
    */

    setLoginError("");
  };

  const showRegister = () => {
    setPage("register");
    setLoginError("");
  };

  const showLogin = () => {
    setPage("login");
    setRegisterMessage("");
    setRegisterError("");
  };

  if (page === "login") {
    return (
      <div className="page">
        <div className="auth-card">
          <h1>Login</h1>

          <p className="subtitle">
            Sign in to your account to continue.
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="loginEmail">
                Email
              </label>

              <input
                id="loginEmail"
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(event) =>
                  setLoginEmail(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword">
                Password
              </label>

              <input
                id="loginPassword"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(event) =>
                  setLoginPassword(event.target.value)
                }
              />
            </div>

            {loginError && (
              <div className="message error">
                {loginError}
              </div>
            )}

            <button type="submit">
              Login
            </button>
          </form>

          <p className="footer-text">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-button"
              onClick={showRegister}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="auth-card">
        <h1>Create Account</h1>

        <p className="subtitle">
          Register your account to continue.
        </p>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="registerUsername">
              Username
            </label>

            <input
              id="registerUsername"
              type="text"
              placeholder="Enter your username"
              value={registerUsername}
              onChange={(event) =>
                setRegisterUsername(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="registerEmail">
              Email
            </label>

            <input
              id="registerEmail"
              type="email"
              placeholder="Enter your email"
              value={registerEmail}
              onChange={(event) =>
                setRegisterEmail(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="registerPassword">
              Password
            </label>

            <input
              id="registerPassword"
              type="password"
              placeholder="Enter your password"
              value={registerPassword}
              onChange={(event) =>
                setRegisterPassword(event.target.value)
              }
            />
          </div>

          {registerError && (
            <div className="message error">
              {registerError}
            </div>
          )}

          {registerMessage && (
            <div className="message success">
              {registerMessage}
            </div>
          )}

          <button type="submit">
            Register
          </button>
        </form>

        <p className="footer-text">
          Already have an account?{" "}
          <button
            type="button"
            className="text-button"
            onClick={showLogin}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default App;