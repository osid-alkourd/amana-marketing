"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../../src/components/ui/navbar";
import { CardMetric } from "../../src/components/ui/card-metric";
import { Footer } from "../../src/components/ui/footer";
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData, Campaign } from "../../src/types/marketing";
import { BarChart } from "../../src/components/ui/bar-chart";
import { Table } from "../../src/components/ui/table";

export default function DemographicView() {
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const marketingData = await fetchMarketingData();
        setData(marketingData);
      } catch (err) {
        setError("Failed to load demographic data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Gender Aggregation ---
  let maleClicks = 0,
    femaleClicks = 0,
    maleSpend = 0,
    femaleSpend = 0,
    maleRevenue = 0,
    femaleRevenue = 0;

  // --- Age Group Aggregation ---
  const ageGroups: Record<
    string,
    {
      spend: number;
      revenue: number;
      clicks: number;
      conversions: number;
      male: { impressions: number; clicks: number; conversions: number };
      female: { impressions: number; clicks: number; conversions: number };
    }
  > = {};

  if (data?.campaigns) {
    data.campaigns.forEach((campaign: Campaign) => {
      const maleEntry = campaign.demographic_breakdown?.find(
        (d) => d.gender?.toLowerCase() === "male"
      );
      const femaleEntry = campaign.demographic_breakdown?.find(
        (d) => d.gender?.toLowerCase() === "female"
      );

      const campaignClicks =
        (maleEntry?.performance?.clicks || 0) +
        (femaleEntry?.performance?.clicks || 0);

      const campaignConversions =
        (maleEntry?.performance?.conversions || 0) +
        (femaleEntry?.performance?.conversions || 0);

      // aggregate clicks
      maleClicks += maleEntry?.performance?.clicks || 0;
      femaleClicks += femaleEntry?.performance?.clicks || 0;

      // split spend proportional to clicks
      if (campaignClicks > 0) {
        const maleShare =
          (maleEntry?.performance?.clicks || 0) / campaignClicks;
        const femaleShare =
          (femaleEntry?.performance?.clicks || 0) / campaignClicks;

        maleSpend += (campaign.spend || 0) * maleShare;
        femaleSpend += (campaign.spend || 0) * femaleShare;
      }

      // split revenue proportional to conversions
      if (campaignConversions > 0) {
        const maleConvShare =
          (maleEntry?.performance?.conversions || 0) / campaignConversions;
        const femaleConvShare =
          (femaleEntry?.performance?.conversions || 0) / campaignConversions;

        maleRevenue += (campaign.revenue || 0) * maleConvShare;
        femaleRevenue += (campaign.revenue || 0) * femaleConvShare;
      }

      // --- Age group aggregation ---
      campaign.demographic_breakdown?.forEach((d) => {
        const age = d.age_group || "Unknown";
        const clicks = d.performance?.clicks || 0;
        const conversions = d.performance?.conversions || 0;
        const impressions = d.performance?.impressions || 0;
        const gender = d.gender?.toLowerCase();

        if (!ageGroups[age]) {
          ageGroups[age] = {
            spend: 0,
            revenue: 0,
            clicks: 0,
            conversions: 0,
            male: { impressions: 0, clicks: 0, conversions: 0 },
            female: { impressions: 0, clicks: 0, conversions: 0 },
          };
        }

        ageGroups[age].clicks += clicks;
        ageGroups[age].conversions += conversions;

        if (gender === "male") {
          ageGroups[age].male.impressions += impressions;
          ageGroups[age].male.clicks += clicks;
          ageGroups[age].male.conversions += conversions;
        } else if (gender === "female") {
          ageGroups[age].female.impressions += impressions;
          ageGroups[age].female.clicks += clicks;
          ageGroups[age].female.conversions += conversions;
        }

        // split spend proportional to campaign clicks
        if (campaign.clicks > 0) {
          ageGroups[age].spend +=
            ((campaign.spend || 0) * clicks) / campaign.clicks;
        }

        // split revenue proportional to campaign conversions
        if (campaign.conversions > 0) {
          ageGroups[age].revenue +=
            ((campaign.revenue || 0) * conversions) / campaign.conversions;
        }
      });
    });
  }

  // --- Chart datasets ---
  const spendData = Object.entries(ageGroups).map(([age, values]) => ({
    label: age,
    value:
      typeof values.spend === "number" && !isNaN(values.spend)
        ? Number(values.spend.toFixed(2))
        : 0,
  }));

  const revenueData = Object.entries(ageGroups).map(([age, values]) => ({
    label: age,
    value:
      typeof values.revenue === "number" && !isNaN(values.revenue)
        ? Number(values.revenue.toFixed(2))
        : 0,
  }));

  // --- Table datasets ---
  const maleTableData = Object.entries(ageGroups).map(([age, values]) => {
    const { impressions, clicks, conversions } = values.male;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const convRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    return {
      age,
      impressions,
      clicks,
      conversions,
      ctr: `${ctr.toFixed(2)}%`,
      convRate: `${convRate.toFixed(2)}%`,
    };
  });

  const femaleTableData = Object.entries(ageGroups).map(([age, values]) => {
    const { impressions, clicks, conversions } = values.female;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const convRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    return {
      age,
      impressions,
      clicks,
      conversions,
      ctr: `${ctr.toFixed(2)}%`,
      convRate: `${convRate.toFixed(2)}%`,
    };
  });

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Demographic View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {loading && <p className="text-white">Loading demographic data...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              {/* Gender Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <CardMetric
                  title="Total Clicks (Male)"
                  value={maleClicks.toLocaleString()}
                />
                <CardMetric
                  title="Total Spend (Male)"
                  value={`$${maleSpend.toFixed(2)}`}
                />
                <CardMetric
                  title="Total Revenue (Male)"
                  value={`$${maleRevenue.toFixed(2)}`}
                />

                <CardMetric
                  title="Total Clicks (Female)"
                  value={femaleClicks.toLocaleString()}
                />
                <CardMetric
                  title="Total Spend (Female)"
                  value={`$${femaleSpend.toFixed(2)}`}
                />
                <CardMetric
                  title="Total Revenue (Female)"
                  value={`$${femaleRevenue.toFixed(2)}`}
                />
              </div>

              {/* Spend Chart */}
              {spendData.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-md">
                  <BarChart
                    title="Total Spend by Age Group"
                    data={spendData}
                    formatValue={(val: number) =>
                      typeof val === "number"
                        ? `$${val.toLocaleString()}`
                        : "$0"
                    }
                  />
                </div>
              )}

              {/* Revenue Chart */}
              {revenueData.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 shadow-md mb-6">
                  <BarChart
                    title="Total Revenue by Age Group"
                    data={revenueData}
                    formatValue={(val: number) =>
                      typeof val === "number"
                        ? `$${val.toLocaleString()}`
                        : "$0"
                    }
                  />
                </div>
              )}

              {/* Male Table */}
              {maleTableData.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-md">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Campaign Performance by Male Age Groups
                  </h2>
                  <Table
                    columns={[
                      { key: "age", header: "Age Group" },
                      {
                        key: "impressions",
                        header: "Impressions",
                        sortable: true,
                        sortType: "number",
                        align: "right",
                      },
                      {
                        key: "clicks",
                        header: "Clicks",
                        sortable: true,
                        sortType: "number",
                        align: "right",
                      },
                      {
                        key: "conversions",
                        header: "Conversions",
                        sortable: true,
                        sortType: "number",
                        align: "right",
                      },
                      { key: "ctr", header: "CTR", align: "right" },
                      { key: "convRate", header: "Conversion Rate", align: "right" },
                    ]}
                    data={maleTableData}
                  />
                </div>
              )}

              {/* Female Table */}
              {femaleTableData.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 shadow-md">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Campaign Performance by Female Age Groups
                  </h2>
                  <Table
                    columns={[
                      { key: "age", header: "Age Group" },
                      {
                        key: "impressions",
                        header: "Impressions",
                        sortable: true,
                        sortType: "number",
                        align: "right",
                      },
                      {
                        key: "clicks",
                        header: "Clicks",
                        sortable: true,
                        sortType: "number",
                        align: "right",
                      },
                      {
                        key: "conversions",
                        header: "Conversions",
                        sortable: true,
                        sortType: "number",
                        align: "right",
                      },
                      { key: "ctr", header: "CTR", align: "right" },
                      { key: "convRate", header: "Conversion Rate", align: "right" },
                    ]}
                    data={femaleTableData}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
