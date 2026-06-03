"use client";

import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  AccountUser,
  accountPlans,
  formatBalance,
  getPlanLabel,
} from "./account-data";

type AccountPanelProps = {
  user: AccountUser | null;
  loadingUser: boolean;
  loggingOut: boolean;
  onLogout: () => void;
};

export function AccountPanel({
  user,
  loadingUser,
  loggingOut,
  onLogout,
}: AccountPanelProps) {
  const planLabel = getPlanLabel(user?.plan);

  if (loadingUser) {
    return (
      <div className="account-panel-card text-sm r-muted">
        در حال دریافت اطلاعات حساب...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="account-hero-card">
        <div className="flex items-center gap-4">
          <BrandLogo size="md" />

          <div className="min-w-0 flex-1">
            <p className="text-xs r-muted">Rastino Account</p>

            <h3 className="truncate text-xl font-black">
              {user?.mobile || user?.email || "کاربر راستینو"}
            </h3>

            <p className="mt-1 text-xs r-muted">
              پلن فعلی: <span className="text-zinc-100">{planLabel}</span>
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="account-stat-card">
            <p className="text-xs r-muted">کیف پول</p>
            <p className="mt-1 text-lg font-black">
              {formatBalance(user?.balance || 0)}
            </p>
          </div>

          <div className="account-stat-card">
            <p className="text-xs r-muted">وضعیت</p>
            <p className="mt-1 text-lg font-black">فعال</p>
          </div>
        </div>
      </section>

      <section className="account-panel-card">
        <div className="mb-4">
          <p className="text-sm font-black">اطلاعات حساب</p>
          <p className="mt-1 text-xs r-muted">مشخصات ورود و حساب کاربر</p>
        </div>

        <div className="space-y-2">
          <InfoRow label="شماره موبایل" value={user?.mobile || "ثبت نشده"} />
          <InfoRow label="ایمیل" value={user?.email || "ثبت نشده"} />
          <InfoRow label="شناسه کاربر" value={user?.id || "-"} ltr />
        </div>
      </section>

      <section className="account-panel-card">
        <div className="mb-4">
          <p className="text-sm font-black">پلن‌ها</p>
          <p className="mt-1 text-xs r-muted">
            فعلاً نمایشی است؛ بعداً به پرداخت و محدودیت مصرف وصل می‌شود.
          </p>
        </div>

        <div className="space-y-3">
          {accountPlans.map((plan) => {
            const active = plan.name.toLowerCase() === planLabel.toLowerCase();

            return (
              <div
                key={plan.id}
                className={`account-plan-card ${
                  active ? "account-plan-card-active" : ""
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-black">{plan.name}</p>
                      <span className="account-plan-badge">{plan.badge}</span>
                    </div>

                    <p className="mt-1 text-xs leading-6 r-muted">
                      {plan.description}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs font-black">{plan.price}</p>
                </div>

                <div className="grid gap-2">
                  {plan.features.map((feature) => (
                    <p key={feature} className="text-xs leading-6 r-muted">
                      ✓ {feature}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <button
        onClick={onLogout}
        disabled={loggingOut}
        className="account-logout-button"
      >
        {loggingOut ? "در حال خروج..." : "خروج از حساب"}
      </button>
    </div>
  );
}

function InfoRow({
  label,
  value,
  ltr,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] px-4 py-3">
      <span className="shrink-0 text-xs r-muted">{label}</span>

      <span
        dir={ltr ? "ltr" : "rtl"}
        className="min-w-0 truncate text-sm font-bold text-zinc-100"
      >
        {value}
      </span>
    </div>
  );
}
