import { BookingForm } from "@/components/booking-form";
import { ResponsiveTabs } from "@/components/responsive-tabs";
import { getOptions } from "@/lib/actions/options";

export default async function Home() {
  const options = await getOptions();

  if (!options.ok) {
    throw new Error(options.message || "Failed to fetch options");
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-background px-4 py-3 md:px-6 md:py-4">
        <h1 className="text-lg font-bold md:text-2xl">
          Oud Zwembad Reserveringssysteem
        </h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* Left Pane - Booking Form (Desktop only) */}
        <aside className="hidden w-full flex-shrink-0 border-b border-border bg-background md:block md:w-[600px] md:border-b-0 md:border-r md:overflow-y-auto">
          <BookingForm options={options.data} />
        </aside>

        {/* Right Pane - Tabs */}
        <main className="flex-1 overflow-y-auto bg-muted/30 md:overflow-hidden">
          <div className="min-h-full p-3 md:h-full md:p-6">
            <ResponsiveTabs options={options.data} />
          </div>
        </main>
      </div>
    </div>
  );
}
