import { createContext, useContext, useEffect, useReducer } from "react";

const AppContext = createContext();

const appReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_SIDEBAR_OPEN":
      return { ...state, sidebarOpen: action.payload };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };
    default:
      return state;
  }
};

const initialState = {
  loading: false,
  sidebarOpen: false,
  theme: localStorage.getItem("theme") || "light",
  notifications: [],
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleSidebar = () => {
    dispatch({ type: "SET_SIDEBAR_OPEN", payload: !state.sidebarOpen });
  };

  const closeSidebar = () => {
    dispatch({ type: "SET_SIDEBAR_OPEN", payload: false });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  const toggleTheme = () => {
    const newTheme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    dispatch({ type: "SET_THEME", payload: newTheme });
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...notification,
    };
    dispatch({ type: "ADD_NOTIFICATION", payload: newNotification });

    // Auto remove after 5 seconds
    setTimeout(() => {
      dispatch({ type: "REMOVE_NOTIFICATION", payload: newNotification.id });
    }, 5000);
  };

  const removeNotification = (id) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
  };

  const value = {
    ...state,
    toggleSidebar,
    closeSidebar,
    toggleTheme,
    addNotification,
    removeNotification,
    setLoading: (loading) =>
      dispatch({ type: "SET_LOADING", payload: loading }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
