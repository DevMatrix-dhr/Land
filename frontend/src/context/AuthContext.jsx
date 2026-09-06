import { createContext, useContext, useState } from "react";
import { USERS, ROLE_PERMISSIONS } from "../mock/seedData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState(USERS);

  function login(username, password) {
    const found = allUsers.find((u) => u.username === username && u.password === password);
    if (found) {
      setUser(found);
      return { success: true, user: found };
    }
    return { success: false, error: "User not found or invalid credentials." };
  }

  function registerUser(userData) {
    if (allUsers.find(u => u.username === userData.username)) {
      return { success: false, error: "Username already exists." };
    }
    
    const newUser = {
      user_id: `u-${Date.now()}`,
      username: userData.username,
      password: userData.password,
      full_name: userData.full_name,
      role: "citizen", // Default to citizen until admin assigns a staff role
      district: userData.district || "Unassigned",
      tehsil: userData.tehsil || "Unassigned",
    };
    
    setAllUsers(prev => [...prev, newUser]);
    return { success: true, user: newUser };
  }

  function updateUserRole(userId, newRole) {
    setAllUsers(prev => prev.map(u => 
      u.user_id === userId ? { ...u, role: newRole } : u
    ));
    // If the currently logged in user's role is updated
    if (user && user.user_id === userId) {
      setUser(prev => ({ ...prev, role: newRole }));
    }
  }

  function logout() {
    setUser(null);
  }

  function hasPermission(perm) {
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role];
    return perms ? !!perms[perm] : false;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      registerUser, 
      updateUserRole, 
      allUsers, 
      hasPermission, 
      ROLE_PERMISSIONS 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
