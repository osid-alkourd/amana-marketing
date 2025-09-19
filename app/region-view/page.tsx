"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { HeatMap, HeatMapDataPoint } from '../../src/components/ui/heat-map';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData } from '../../src/types/marketing';

const regionCoordinates: Record<string, { x: string; y: string }> = {
  'Abu Dhabi': { x: '58%', y: '60%' },
  'Dubai': { x: '62%', y: '55%' },
  'Sharjah': { x: '63%', y: '53%' },
  'Riyadh': { x: '35%', y: '58%' },
  'Doha': { x: '50%', y: '54%' },
  'Kuwait City': { x: '40%', y: '30%' },
  'Manama': { x: '47%', y: '45%' },
};

export default function RegionView() {
  const [spendData, setSpendData] = useState<HeatMapDataPoint[]>([]);
  const [revenueData, setRevenueData] = useState<HeatMapDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const marketingData: MarketingData = await fetchMarketingData();
        
        const regionalAggregated: { [key: string]: { region: string; spend: number; revenue: number; } } = {};

        marketingData.campaigns.forEach(campaign => {
          campaign.regional_performance?.forEach(regionData => {
            const regionKey = regionData.region;
            if (!regionalAggregated[regionKey]) {
              regionalAggregated[regionKey] = {
                region: regionData.region,
                spend: 0,
                revenue: 0,
              };
            }
            regionalAggregated[regionKey].spend += regionData.spend || 0;
            regionalAggregated[regionKey].revenue += regionData.revenue || 0;
          });
        });

        const aggregatedValues = Object.values(regionalAggregated);

        const spendPoints: HeatMapDataPoint[] = aggregatedValues.map(item => ({
          label: item.region,
          value: item.spend,
          x: regionCoordinates[item.region]?.x || '0%',
          y: regionCoordinates[item.region]?.y || '0%',
        })).filter(p => p.x !== '0%');

        const revenuePoints: HeatMapDataPoint[] = aggregatedValues.map(item => ({
          label: item.region,
          value: item.revenue,
          x: regionCoordinates[item.region]?.x || '0%',
          y: regionCoordinates[item.region]?.y || '0%',
        })).filter(p => p.x !== '0%');

        setSpendData(spendPoints);
        setRevenueData(revenuePoints);

      } catch (err) {
        setError("Failed to load regional data.");
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
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Regional View
              </h1>
            </div>
          </div>
        </section>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {loading && <p className="text-white text-center">Loading regional data...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!loading && !error && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <HeatMap 
                title="Total Spend by Region"
                data={spendData}
                formatValue={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
              <HeatMap 
                title="Total Revenue by Region"
                data={revenueData}
                formatValue={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}