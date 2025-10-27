import { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "LOGOUT":
      return { ...state, user: null, token: null, isAuthenticated: false };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authAPI.getProfile();
          dispatch({ type: "SET_USER", payload: response.data.data });
        } catch (error) {
          console.error("Failed to load user:", error);
          localStorage.removeItem("token");
          dispatch({ type: "SET_TOKEN", payload: null });
        }
      }
      dispatch({ type: "SET_LOADING", payload: false });
    };

    loadUser();
  }, []);


 const login = async (credentials) => {
  try {
    dispatch({ type: "SET_LOADING", payload: true });
    const response = await authAPI.login(credentials);

    const { user, token } = response.data.data;

    localStorage.setItem("token", token);
    dispatch({ type: "SET_TOKEN", payload: token });
    dispatch({ type: "SET_USER", payload: user });

    toast.success("Welcome back!");
    return { success: true };
  } catch (error) {
    console.error("Login failed:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Invalid email or password";
    dispatch({ type: "SET_ERROR", payload: message });
    toast.error(message);
    return { success: false, message };
  } finally {
    dispatch({ type: "SET_LOADING", payload: false });
  }
};


  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authAPI.register(userData);

      const { user, token } = response.data.data;

      localStorage.setItem("token", token);
      dispatch({ type: "SET_TOKEN", payload: token });
      dispatch({ type: "SET_USER", payload: user });

      toast.success("Account created successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      dispatch({ type: "SET_ERROR", payload: message });
      toast.error(message);
      return { success: false, message };
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      dispatch({ type: "SET_USER", payload: response.data.data });
      toast.success("Profile updated successfully");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success("Password changed successfully");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Password change failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
