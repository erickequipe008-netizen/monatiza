import AIPanel from "@/components/ai/AIPanel";
import PageHeader from "@/components/layout/PageHeader";

export default function AIPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <PageHeader
        title="Assistente IA"
        description="MONATIZA AI — powered by inteligência editorial"
      />
      <div className="flex-1 overflow-hidden">
        <div className="max-w-2xl mx-auto h-full">
          <AIPanel />
        </div>
      </div>
    </div>
  );
}