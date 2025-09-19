"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { LineChart } from '../../src/components/ui/line-chart';
import { fetchMarketingData } from '../../src/lib/api';

export default function WeeklyView() {
  const [weeklyPerformance, setWeeklyPerformance] = useState<any[]>([]);
  const [weeklySpendRevenue, setWeeklySpendRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const marketingData = await fetchMarketingData();
        
        const weeklyAggregated: { [key: string]: { week_start: string; spend: number; revenue: number; clicks: number; conversions: number } } = {};

        marketingData.campaigns.forEach(campaign => {
          campaign.weekly_performance?.forEach(weekData => {
            const weekKey = weekData.week_start;
            if (!weeklyAggregated[weekKey]) {
              weeklyAggregated[weekKey] = {
                week_start: weekData.week_start,
                spend: 0,
                revenue: 0,
                clicks: 0,
                conversions: 0,
              };
            }
            weeklyAggregated[weekKey].spend += weekData.spend || 0;
            weeklyAggregated[weekKey].revenue += weekData.revenue || 0;
            weeklyAggregated[weekKey].clicks += weekData.clicks || 0;
            weeklyAggregated[weekKey].conversions += weekData.conversions || 0;
          });
        });

        const processedData = Object.values(weeklyAggregated)
          .sort((a, b) => new Date(a.week_start).getTime() - new Date(b.week_start).getTime())
          .map(d => ({
            ...d,
            week: new Date(d.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          }));
        
        setWeeklyPerformance(processedData.map(d => ({ week: d.week, Clicks: d.clicks, Conversions: d.conversions })));
        setWeeklySpendRevenue(processedData.map(d => ({ week: d.week, Spend: d.spend, Revenue: d.revenue })));

      } catch (err) {
        setError("Failed to load weekly data.");
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Weekly View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {loading && <p className="text-white text-center">Loading weekly data...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!loading && !error && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 shadow-md">
                <LineChart
                  title="Weekly Clicks vs. Conversions"
                  data={weeklyPerformance}
                  xAxisDataKey="week"
                  lines={[
                    { dataKey: 'Clicks', name: 'Total Clicks', stroke: '#8884d8' },
                    { dataKey: 'Conversions', name: 'Total Conversions', stroke: '#82ca9d' },
                  ]}
                />
              </div>
              <div className="bg-gray-800 rounded-xl p-6 shadow-md">
                <LineChart
                  title="Weekly Spend vs. Revenue"
                  data={weeklySpendRevenue}
                  xAxisDataKey="week"
                  yAxisLabel="$ USD"
                  lines={[
                    { dataKey: 'Spend', name: 'Total Spend', stroke: '#ffc658' },
                    { dataKey: 'Revenue', name: 'Total Revenue', stroke: '#ff7300' },
                  ]}
                  formatTooltip={(value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}