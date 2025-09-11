// src/components/Admin/AdminMetrics.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../utils/axios";
import { useTranslation } from "react-i18next";
import Loading from "../Loading/Loading";
import "./AdminMetrics.module.css";

type StatsResponse = {
  totalOrders?: number;
  totalRevenue?: number;
};

const AdminMetrics: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation("common");

  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isAdmin =
    String((user as any)?.role ?? "").trim().toUpperCase() === "ADMIN" ||
    Boolean((user as any)?.isAdmin);

  const eurFmt = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [i18n.language]
  );

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axiosInstance.get<StatsResponse>("/admin/stats", {
        signal,
      });

      setTotalOrders(Number.isFinite(Number(data?.totalOrders)) ? Number(data?.totalOrders) : 0);
      setRevenue(Number.isFinite(Number(data?.totalRevenue)) ? Number(data?.totalRevenue) : 0);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.code === "ERR_CANCELED") return;
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError(
            t("admin.metrics.noAccess", { defaultValue: "No access to admin statistics." })
          );
          return;
        }
      }
      setError(t("admin.metrics.error", { defaultValue: "Failed to fetch data" }));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    fetchStats(ac.signal);
    return () => ac.abort();
  }, [isAdmin, fetchStats]);

  const handleRefresh = () => {
    if (!isAdmin) return;
    fetchStats();
  };

  // Не админ — ничего не рендерим (панель скрывает блок метрик)
  if (!isAdmin) return null;

  if (loading) {
    return <Loading textKey="loading.default" />;
  }

  return (
    <div className="admin-metrics" aria-busy={loading ? "true" : "false"}>
      <h2>{t("admin.metrics.title", { defaultValue: "Admin Statistics" })}</h2>

      {error ? (
        <p className="error" style={{ color: "#ef4444" }} aria-live="polite">
          {error}
        </p>
      ) : (
        <>
          <p>
            <strong>
              {t("admin.metrics.orders", { defaultValue: "Total Orders" })}:{" "}
            </strong>
            {totalOrders}
          </p>
          <p>
            <strong>
              {t("admin.metrics.revenue", { defaultValue: "Total Revenue" })}:{" "}
            </strong>
            {eurFmt.format(revenue)}
          </p>
        </>
      )}

      <button
        type="button"
        onClick={handleRefresh}
        style={{
          marginTop: "0.75rem",
          padding: "0.5rem 0.875rem",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
          cursor: "pointer",
        }}
        aria-label={t("admin.metrics.refresh", { defaultValue: "Refresh" })}
      >
        {t("admin.metrics.refresh", { defaultValue: "Refresh" })}
      </button>
    </div>
  );
};

export default AdminMetrics;
