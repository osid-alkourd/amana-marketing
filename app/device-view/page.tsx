// app/device-view/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";
import { BarChart } from "../../src/components/ui/bar-chart";
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData } from "../../src/types/marketing";
import { DevicePerformance } from "../../src/types/marketing";
export default function DeviceViewPage() {
  const [devicePerformance, setDevicePerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const marketingData: MarketingData = await fetchMarketingData();

        const deviceAggregated: { [key: string]: DevicePerformance } = {};

        marketingData.campaigns.forEach((campaign) => {
          campaign.device_performance?.forEach((deviceData) => {
            const deviceKey = deviceData.device;
            if (!deviceAggregated[deviceKey]) {
              deviceAggregated[deviceKey] = {
                device: deviceData.device,
                revenue: 0,
                spend: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0,
                ctr: 0,
                conversion_rate: 0,
                percentage_of_traffic: 0,
              };
            }
            deviceAggregated[deviceKey].revenue += deviceData.revenue || 0;
            deviceAggregated[deviceKey].spend += deviceData.spend || 0;
          });
        });

        const aggregatedValues = Object.values(deviceAggregated);

        if (aggregatedValues.length === 0) {
          setError("No device performance data available.");
        } else {
          setDevicePerformance(aggregatedValues);
        }
      } catch (err) {
        setError("Failed to load device data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">Device View</h1>
              <p className="mt-2 text-gray-300">
                Compare campaign performance on Desktop vs Mobile
              </p>
            </div>
          </div>
        </section>

        {/* Body */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {loading && <p className="text-white text-center">Loading data...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!loading && !error && devicePerformance.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue by Device */}
              <BarChart
                title="Revenue by Device"
                data={devicePerformance.map((d) => ({
                  label: d.device,
                  value: d.revenue,
                  color: d.device === "Desktop" ? "#3B82F6" : "#10B981",
                }))}
                formatValue={(value) =>
                  `$${Number(value).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
              />

              {/* Spend by Device */}
              <BarChart
                title="Spend by Device"
                data={devicePerformance.map((d) => ({
                  label: d.device,
                  value: d.spend,
                  color: d.device === "Desktop" ? "#3B82F6" : "#10B981",
                }))}
                formatValue={(value) =>
                  `$${Number(value).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
              />
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
