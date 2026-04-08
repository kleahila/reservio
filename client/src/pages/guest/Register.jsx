import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Toast from "../../components/Toast";
import {
  validateEmail,
  validateRequired,
  validatePassword,
  emailExists,
} from "../../utils/validation";
import { users } from "../../data/users";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ message: "", type: "info" });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(form.fullName)) {
      newErrors.fullName = "Full name is required";
    }

    if (!validateRequired(form.email)) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (emailExists(form.email, users)) {
      newErrors.email = "This email is already registered";
    }

    if (!validateRequired(form.password)) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(form.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validateForm()) {
      setToast({
        message: "Please fix the errors below",
        type: "error",
      });
      return;
    }

    // Success - show message and redirect to login
    setToast({
      message: "Account created successfully! Redirecting to login...",
      type: "success",
    });

    setTimeout(() => {
      navigate("/guest/login");
    }, 2000);
  };

  return (
    <>
      <Card title="Create Your Account" className="max-w-md mx-auto">
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              value={form.fullName}
              onChange={(event) => handleChange("fullName", event.target.value)}
              className={`w-full rounded border px-3 py-2 outline-none transition focus:border-brand-accent ${
                errors.fullName
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-300"
              }`}
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className={`w-full rounded border px-3 py-2 outline-none transition focus:border-brand-accent ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-300"
              }`}
              placeholder="john@example.com"
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
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              className={`w-full rounded border px-3 py-2 outline-none transition focus:border-brand-accent ${
                errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-300"
              }`}
              placeholder="At least 6 characters"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Register Button */}
          <Button onClick={handleRegister} className="w-full">
            Create Account
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <a
              href="/guest/login"
              className="font-medium text-brand-primary hover:text-brand-accent"
            >
              Sign in
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

export default Register;
