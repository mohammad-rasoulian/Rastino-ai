"use client";

import { useEffect, useState } from "react";
import { AdminHero } from "./AdminHero";
import { AdminTabs } from "./AdminTabs";
import type {
  AdminChat,
  AdminPlan,
  AdminPromptTemplate,
  AdminSecurity,
  AdminSystem,
  AdminTab,
  AdminUser,
  Overview,
} from "./admin-types";
import { SiteContentManager } from "./SiteContentManager";
import { ChatsView } from "./views/ChatsView";
import { OverviewView } from "./views/OverviewView";
import { PlansView } from "./views/PlansView";
import { ModelsView } from "./views/ModelsView";
import { PromptsView } from "./views/PromptsView";
import { SecurityCenterView } from "./views/SecurityCenterView";
import { SettingsView } from "./views/SettingsView";
import { SystemHealthView } from "./views/SystemHealthView";
import { UsersView } from "./views/UsersView";

export function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [chats, setChats] = useState<AdminChat[]>([]);
  const [system, setSystem] = useState<AdminSystem | null>(null);
  const [security, setSecurity] = useState<AdminSecurity | null>(null);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [prompts, setPrompts] = useState<AdminPromptTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  async function loadTab(nextTab: AdminTab) {
    if (nextTab === "content" || nextTab === "settings") return;

    setLoading(true);
    setError("");

    try {
      if (nextTab === "overview") {
        const data = await fetchAdminData<{ overview?: Overview }>(
          "/api/admin/overview"
        );

        setOverview(data.overview || null);
      }

      if (nextTab === "users") {
        const data = await fetchAdminData<{ users?: AdminUser[] }>(
          "/api/admin/users"
        );

        setUsers(data.users || []);
      }

      if (nextTab === "chats") {
        const data = await fetchAdminData<{ chats?: AdminChat[] }>(
          "/api/admin/chats"
        );

        setChats(data.chats || []);
      }

      if (nextTab === "system") {
        const data = await fetchAdminData<{ system?: AdminSystem }>(
          "/api/admin/system"
        );

        setSystem(data.system || null);
      }

      if (nextTab === "security") {
        const data = await fetchAdminData<{ security?: AdminSecurity }>(
          "/api/admin/security"
        );

        setSecurity(data.security || null);
      }

      if (nextTab === "plans") {
        const data = await fetchAdminData<{ plans?: AdminPlan[] }>(
          "/api/admin/plans"
        );

        setPlans(data.plans || []);
      }

      if (nextTab === "prompts") {
        const data = await fetchAdminData<{ prompts?: AdminPromptTemplate[] }>(
          "/api/admin/prompts"
        );

        setPrompts(data.prompts || []);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "خطا در بارگذاری پنل مدیریت.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <AdminHero />

      <AdminTabs activeTab={tab} onTabChange={setTab} />

      {loading && (
        <div className="admin-card text-sm r-muted">در حال بارگذاری...</div>
      )}

      {!loading && error && (
        <div className="admin-card">
          <p className="text-sm font-black text-red-300">خطا</p>
          <p className="mt-2 text-sm leading-7 r-muted">{error}</p>

          <button
            onClick={() => loadTab(tab)}
            className="auth-secondary-button mt-4 h-11 rounded-2xl px-4 text-sm font-black"
          >
            تلاش دوباره
          </button>
        </div>
      )}

      {!loading && !error && tab === "overview" && overview && (
        <OverviewView overview={overview} />
      )}

      {!loading && !error && tab === "users" && (
        <UsersView users={users} onUserUpdated={() => loadTab("users")} />
      )}

      {!loading && !error && tab === "chats" && <ChatsView chats={chats} />}

      {!loading && !error && tab === "content" && <SiteContentManager />}

      {!loading && !error && tab === "system" && system && (
        <SystemHealthView system={system} />
      )}

      {!loading && !error && tab === "security" && security && (
        <SecurityCenterView security={security} />
      )}

      {!loading && !error && tab === "plans" && (
        <PlansView plans={plans} onPlanUpdated={() => loadTab("plans")} />
      )}

      {!loading && !error && tab === "prompts" && (
        <PromptsView
          prompts={prompts}
          onPromptUpdated={() => loadTab("prompts")}
        />
      )}

      {!loading && !error && tab === "models" && <ModelsView />}

      {!loading && !error && tab === "settings" && <SettingsView />}
    </div>
  );
}

async function fetchAdminData<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "دسترسی یا دریافت اطلاعات ناموفق بود.");
  }

  return data as T;
}
