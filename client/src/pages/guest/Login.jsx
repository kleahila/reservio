import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Toast from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("anna@example.com");
  const [password, setPassword] = useState("demo123");
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    if (field === "email") setEmail(value);
    else setPassword(value);

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogin = () => {
    // Reset errors
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToast({
        message: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const ok = login(email, password);

      if (ok) {
        setToast({
          message: "Logged in successfully!",
          type: "success",
        });
        setIsLoading(false);

        // Redirect to dashboard after success
        setTimeout(() => {
          navigate("/guest/dashboard");
        }, 1500);
      } else {
        setToast({
          message: "Invalid email or password",
          type: "error",
        });
        setErrors({
          email: "Invalid credentials",
          password: "Invalid credentials",
        });
        setIsLoading(false);
      }
    }, 800);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <>
      <Card title="Guest Login" className="max-w-md mx-auto">
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => handleChange("email", event.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className={`w-full rounded border px-3 py-2 outline-none transition focus:border-brand-accent disabled:bg-slate-100 ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-300"
              }`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => handleChange("password", event.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className={`w-full rounded border px-3 py-2 outline-none transition focus:border-brand-accent disabled:bg-slate-100 ${
                errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-300"
              }`}
              placeholder="••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Demo Hint */}
          <div className="rounded-md bg-blue-50 p-3 text-xs text-slate-600">
            <p className="font-medium">Demo credentials:</p>
            <p>Email: anna@example.com</p>
            <p>Password: demo123</p>
          </div>

          {/* Login Button */}
          <Button onClick={handleLogin} disabled={isLoading} className="w-full">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Register Link */}
          <p className="text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <a
              href="/guest/register"
              className="font-medium text-brand-primary hover:text-brand-accent"
            >
              Create one
            </a>
          </p>
        </div>
      </Card>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
    </>
  );
}

export default Login;
