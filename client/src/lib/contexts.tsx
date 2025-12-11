import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User } from "@shared/schema";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    return (stored as Theme) || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

interface WalletContextType {
  walletAddress: string | null;
  user: User | null;
  isConnected: boolean;
  connectWallet: (address: string) => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem("walletAddress");
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (walletAddress) {
      fetch("/api/auth/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      })
        .then((res) => res.json())
        .then((userData) => setUser(userData))
        .catch(() => {
          setWalletAddress(null);
          localStorage.removeItem("walletAddress");
        });
    }
  }, [walletAddress]);

  const connectWallet = async (address: string) => {
    const response = await fetch("/api/auth/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ walletAddress: address }),
    });

    // if (!response.ok) {
    //   throw new Error("Failed to connect wallet");
    // }

    const userData = await response.json();
    setWalletAddress(address);
    setUser(userData);
    localStorage.setItem("walletAddress", address);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setUser(null);
    localStorage.removeItem("walletAddress");
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        user,
        isConnected: !!walletAddress,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
