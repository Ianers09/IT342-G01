import { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
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
            username: username,
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setMessage(data.message || "Registration successful.");

      setUsername("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        "Unable to connect to the Spring Boot server. Make sure the backend is running."
      );
    }
  };

  return (
    <div className="page">
      <div className="auth-card">
        <h1>Create Account</h1>

        <p className="subtitle">
          Register your account to continue.
        </p>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </div>

          {error && (
            <div className="message error">
              {error}
            </div>
          )}

          {message && (
            <div className="message success">
              {message}
            </div>
          )}

          <button type="submit">
            Register
          </button>
        </form>

        <p className="footer-text">
          Already have an account?{" "}
          <span className="link-text">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;