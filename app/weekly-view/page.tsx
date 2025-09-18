import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { LineChart } from '../../src/components/ui/line-chart';

export default function WeeklyView() {
  // بيانات تجريبية (ممكن تستبدلها ببيانات API لاحقاً)
  const weeklyData = [
    { label: "2024-10-01", value: 12000, color: "#3B82F6" }, // Revenue
    { label: "2024-10-01", value: 8000, color: "#EF4444" },  // Spend
    { label: "2024-10-08", value: 15000, color: "#3B82F6" },
    { label: "2024-10-08", value: 10000, color: "#EF4444" },
    { label: "2024-10-15", value: 17000, color: "#3B82F6" },
    { label: "2024-10-15", value: 9000, color: "#EF4444" },
  ];

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
          <LineChart
            title="Revenue vs Spend by Week"
            data={weeklyData}
            height={350}
            showValues={true}
          />
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
