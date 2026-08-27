import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8081";

function App() {
  const savedToken = sessionStorage.getItem("token");
  const savedUser = sessionStorage.getItem("user");

  const [page, setPage] = useState(
    savedToken && savedUser ? "requests" : "register"
  );

  const [token, setToken] = useState(savedToken || "");
  const [user, setUser] = useState(
    savedUser ? JSON.parse(savedUser) : null
  );

  // Registration
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Service Requests
  const [requests, setRequests] = useState([]);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [requestCategory, setRequestCategory] = useState("General");

  const [editingId, setEditingId] = useState(null);

  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  // Ownership testing
  const [testRequestId, setTestRequestId] = useState("");
  const [testResult, setTestResult] = useState("");
  const [testError, setTestError] = useState("");

  useEffect(() => {
    if (page === "requests" && token) {
      loadRequests();
    }
  }, [page, token]);

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
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRegisterError(
          data.message || "Registration failed."
        );
        return;
      }

      setRegisterMessage(
        data.message || "Registration successful."
      );

      setRegisterUsername("");
      setRegisterEmail("");
      setRegisterPassword("");
    } catch (error) {
      console.error(error);

      setRegisterError(
        "Unable to connect to the Spring Boot server."
      );
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Email and password are required.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(
          data.message || "Login failed."
        );
        return;
      }

      if (!data.token) {
        setLoginError(
          "Login succeeded but no JWT was returned by the backend."
        );
        return;
      }

      const loggedInUser = {
        id: data.id,
        username: data.username,
        email: data.email,
      };

      setToken(data.token);
      setUser(loggedInUser);

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      setLoginPassword("");
      setPage("requests");
    } catch (error) {
      console.error(error);

      setLoginError(
        "Unable to connect to the Spring Boot server."
      );
    }
  };

  const loadRequests = async () => {
    if (!token) {
      handleLogout();
      return;
    }

    setRequestError("");

    try {
      const response = await fetch(
        `${API_URL}/api/requests`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setRequestError(
          data.message || "Unable to load service requests."
        );
        return;
      }

      setRequests(data);
    } catch (error) {
      console.error(error);

      setRequestError(
        "Unable to connect to the Service Request API."
      );
    }
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();

    setRequestMessage("");
    setRequestError("");

    if (
      !requestTitle.trim() ||
      !requestDescription.trim() ||
      !requestCategory.trim()
    ) {
      setRequestError(
        "Title, description and category are required."
      );
      return;
    }

    const requestBody = {
      title: requestTitle,
      description: requestDescription,
      category: requestCategory,
    };

    try {
      const url = editingId
        ? `${API_URL}/api/requests/${editingId}`
        : `${API_URL}/api/requests`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        setRequestError(
          data.message || "Operation failed."
        );
        return;
      }

      setRequestMessage(
        data.message ||
          (editingId
            ? "Service request updated successfully."
            : "Service request created successfully.")
      );

      clearRequestForm();
      await loadRequests();
    } catch (error) {
      console.error(error);

      setRequestError(
        "Unable to connect to the Service Request API."
      );
    }
  };

  const handleEdit = (request) => {
    setEditingId(request.id);
    setRequestTitle(request.title);
    setRequestDescription(request.description);
    setRequestCategory(request.category);

    setRequestMessage("");
    setRequestError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service request?"
    );

    if (!confirmed) {
      return;
    }

    setRequestMessage("");
    setRequestError("");

    try {
      const response = await fetch(
        `${API_URL}/api/requests/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setRequestError(
          data.message || "Delete failed."
        );
        return;
      }

      setRequestMessage(
        data.message ||
          "Service request deleted successfully."
      );

      if (editingId === id) {
        clearRequestForm();
      }

      await loadRequests();
    } catch (error) {
      console.error(error);

      setRequestError(
        "Unable to connect to the Service Request API."
      );
    }
  };

  const testRequestAccess = async () => {
    setTestResult("");
    setTestError("");

    if (!testRequestId.trim()) {
      setTestError("Enter a Service Request ID.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/requests/${testRequestId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setTestError(
          `${response.status} ${response.statusText}: ${
            data.message || "Access denied"
          }`
        );
        return;
      }

      setTestResult(
        `Access allowed: Request #${data.id} - ${data.title}`
      );
    } catch (error) {
      console.error(error);

      setTestError(
        "Unable to connect to the Service Request API."
      );
    }
  };

  const clearRequestForm = () => {
    setEditingId(null);
    setRequestTitle("");
    setRequestDescription("");
    setRequestCategory("General");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken("");
    setUser(null);
    setRequests([]);

    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");

    clearRequestForm();

    setRequestMessage("");
    setRequestError("");

    setPage("login");
  };

  const showRegister = () => {
    setPage("register");

    setLoginError("");
    setRegisterMessage("");
    setRegisterError("");
  };

  const showLogin = () => {
    setPage("login");

    setRegisterMessage("");
    setRegisterError("");
    setLoginError("");
  };

  // Protected page
  if (page === "requests") {
    if (!token || !user) {
      return null;
    }

    return (
      <div className="requests-page">
        <div className="requests-container">
          <header className="requests-header">
            <div>
              <h1>My Service Requests</h1>
              <p>
                Logged in as{" "}
                <strong>{user.username}</strong> ({user.email})
              </p>
            </div>

            <button
              type="button"
              className="logout-button header-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </header>

          <section className="request-form-card">
            <h2>
              {editingId
                ? `Edit Request #${editingId}`
                : "Create Service Request"}
            </h2>

            <form onSubmit={handleRequestSubmit}>
              <div className="form-group">
                <label htmlFor="requestTitle">
                  Title
                </label>

                <input
                  id="requestTitle"
                  type="text"
                  placeholder="Enter request title"
                  value={requestTitle}
                  onChange={(event) =>
                    setRequestTitle(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="requestDescription">
                  Description
                </label>

                <textarea
                  id="requestDescription"
                  placeholder="Describe your service request"
                  value={requestDescription}
                  onChange={(event) =>
                    setRequestDescription(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="requestCategory">
                  Category
                </label>

                <select
                  id="requestCategory"
                  value={requestCategory}
                  onChange={(event) =>
                    setRequestCategory(
                      event.target.value
                    )
                  }
                >
                  <option value="General">
                    General
                  </option>
                  <option value="Technical">
                    Technical
                  </option>
                  <option value="Maintenance">
                    Maintenance
                  </option>
                  <option value="Billing">
                    Billing
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {requestError && (
                <div className="message error">
                  {requestError}
                </div>
              )}

              {requestMessage && (
                <div className="message success">
                  {requestMessage}
                </div>
              )}

              <div className="form-actions">
                <button type="submit">
                  {editingId
                    ? "Update Request"
                    : "Create Request"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={clearRequestForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="request-list-section">
            <div className="section-heading">
              <h2>Your Requests</h2>

              <button
                type="button"
                className="refresh-button"
                onClick={loadRequests}
              >
                Refresh
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="empty-state">
                You do not have any service requests yet.
              </div>
            ) : (
              <div className="request-grid">
                {requests.map((request) => (
                  <article
                    className="request-card"
                    key={request.id}
                  >
                    <div className="request-card-header">
                      <div>
                        <span className="request-id">
                          Request #{request.id}
                        </span>

                        <h3>{request.title}</h3>
                      </div>

                      <span className="category-badge">
                        {request.category}
                      </span>
                    </div>

                    <p className="request-description">
                      {request.description}
                    </p>

                    <div className="request-meta">
                      <span>
                        <strong>Created By:</strong>{" "}
                        {request.createdBy}
                      </span>

                      <span>
                        <strong>Date:</strong>{" "}
                        {new Date(
                          request.dateCreated
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="request-actions">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(request)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          handleDelete(request.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="ownership-card">
            <h2>Security / Ownership Test</h2>

            <p>
              Enter a Service Request ID to test whether
              the currently authenticated account can
              access it.
            </p>

            <div className="ownership-controls">
              <input
                type="number"
                min="1"
                placeholder="Request ID"
                value={testRequestId}
                onChange={(event) =>
                  setTestRequestId(
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={testRequestAccess}
              >
                Test Access
              </button>
            </div>

            {testResult && (
              <div className="message success ownership-message">
                {testResult}
              </div>
            )}

            {testError && (
              <div className="message error ownership-message">
                {testError}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // Login page
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
                  setLoginPassword(
                    event.target.value
                  )
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

  // Registration page
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
                setRegisterUsername(
                  event.target.value
                )
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
                setRegisterEmail(
                  event.target.value
                )
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
                setRegisterPassword(
                  event.target.value
                )
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