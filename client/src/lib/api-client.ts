import type { User, Offer, Deal, Report } from "@shared/schema";

class APIClient {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const walletAddress = localStorage.getItem("walletAddress");
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    
    if (walletAddress) {
      headers["x-wallet-address"] = walletAddress;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    if (response.status === 204) {
      return undefined as T;
    }
    
    return response.json();
  }
  
  auth = {
    connect: (walletAddress: string) =>
      this.request<User>("/api/auth/connect", {
        method: "POST",
        body: JSON.stringify({ walletAddress }),
      }),
  };
  
  users = {
    me: () => this.request<User>("/api/users/me"),
    updateMe: (data: Partial<User>) =>
      this.request<User>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  };
  
  offers = {
    list: (params?: { type?: string; isActive?: boolean; userId?: string }) => {
      const query = new URLSearchParams();
      if (params?.type) query.set("type", params.type);
      if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
      if (params?.userId) query.set("userId", params.userId);
      const queryString = query.toString();
      return this.request<any[]>(`/api/offers${queryString ? `?${queryString}` : ""}`);
    },
    get: (id: string) => this.request<any>(`/api/offers/${id}`),
    create: (data: any) =>
      this.request<Offer>("/api/offers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<Offer>(`/api/offers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request<void>(`/api/offers/${id}`, {
        method: "DELETE",
      }),
  };
  
  deals = {
    list: (params?: { status?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set("status", params.status);
      const queryString = query.toString();
      return this.request<any[]>(`/api/deals${queryString ? `?${queryString}` : ""}`);
    },
    get: (id: string) => this.request<any>(`/api/deals/${id}`),
    create: (data: any) =>
      this.request<Deal>("/api/deals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<Deal>(`/api/deals/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  };
  
  reports = {
    create: (data: any) =>
      this.request<Report>("/api/reports", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };
  
  admin = {
    stats: () => this.request<{
      totalUsers: number;
      activeOffers: number;
      totalDeals: number;
      pendingReports: number;
    }>("/api/admin/stats"),
    reports: (params?: { status?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set("status", params.status);
      const queryString = query.toString();
      return this.request<any[]>(`/api/admin/reports${queryString ? `?${queryString}` : ""}`);
    },
    updateReport: (id: string, status: string) =>
      this.request<Report>(`/api/admin/reports/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    suspendUser: (id: string, isSuspended: boolean) =>
      this.request<User>(`/api/admin/users/${id}/suspend`, {
        method: "PATCH",
        body: JSON.stringify({ isSuspended }),
      }),
    verifyUser: (id: string, isVerified: boolean) =>
      this.request<User>(`/api/admin/users/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ isVerified }),
      }),
  };
}

export const apiClient = new APIClient();
