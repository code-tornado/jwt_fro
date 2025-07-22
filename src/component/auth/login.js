import axios from "axios";
import { useState } from "react";
import { useSetTokenAction } from "../../hooks/redux";

// Define the Login function.
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const setToken = useSetTokenAction();

  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    axios
      .post(
        "/token/",
        { username, password },
        {
          headers: { "Content-Type": "application/json" },
        },
        { withCredentials: true }
      )
      .then(({ data }) => {
        setError("");
        setToken({
          accessToken: data.access,
          refreshToken: data.refresh,
        });
      })
      .catch(() => {
        setError("Username or password is not correct!");
      });
  };

  return (
    <div className="Auth-form-container">
      <form className="Auth-form" onSubmit={submit}>
        <div className="Auth-form-content">
          <h3 className="Auth-form-title">Sign In</h3>

          {error && <div className="login-error">{error}</div>}

          <div className="form-group mt-3">
            <label>Username</label>
            <input
              className="form-control mt-1"
              placeholder="Enter Username"
              name="username"
              type="text"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <label>Password</label>
            <input
              name="password"
              type="password"
              className="form-control mt-1"
              placeholder="Enter password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="d-grid gap-2 mt-4">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
