import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { DataSearchForm } from "@/components/DataSearchForm";
import { DataTable } from "@/components/DataTable";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useToast } from "@/hooks/use-toast";
import { BarChart3 } from "lucide-react"; // If you're using lucide icons
import { useState } from "react";
import { Link } from "react-router-dom";


interface DataRecord {
  source: string; // Add source field
  name: string;
  key: string;
  encryptionKey: string;
  probability: number;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<DataRecord[]>([]);
  const [lastAction, setLastAction] = useState<"mask" | "delete">("mask");
  const { toast } = useToast();
  const [loadingStep, setLoadingStep] = useState<string>("search");

  // Add these state variables to your Index component:
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSearchResults, setPendingSearchResults] = useState([]);
  const [pendingAction, setPendingAction] = useState<"mask" | "delete">("mask");
  const [isProcessing, setIsProcessing] = useState(false);

  // Modify your handleSearch function to show confirmation instead of processing immediately:
  const handleSearch = async (searchData) => {
    setIsLoading(true);
    setLoadingStep("search");
    setLastAction(searchData.action);

    try {
      const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setSearchResults([]); // Clear previous results

      if (data.length > 0) {
        // Show confirmation dialog instead of processing immediately
        setPendingSearchResults(data);
        setPendingAction(searchData.action);
        setShowConfirmation(true);
      } else {
        toast({
          title: "No Results",
          description: "No matching records found.",
        });
      }

    } catch (error) {
      toast({
        title: "Search Failed",
        description: "An error occurred while searching the database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update your handleProcessRecords to set the status properly:
  const handleProcessRecords = async (records, action) => {
    setIsProcessing(true);

    // if the action is log, just put it as delete
    action = action === "log" ? "delete" : action;

    try {
      const processPromises = records.map(record =>
        fetch("http://localhost:8000/process-name", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: record.name,
            id: record.key,
            action: action,
            source: record.source,
            probability: record.probability
          }),
        })
      );

      const responses = await Promise.all(processPromises);
      const results = await Promise.all(
        responses.map(async (response) => {
          if (response.ok) {
            return await response.json();
          }
          return { success: false, message: "Request failed" };
        })
      );

      // Create records with status from API response
      const processedRecords = records.map((record, index) => ({
        source: results[index].source || record.source,
        name: results[index].name || record.name,
        key: results[index].entity_id || record.key,
        probability: results[index].probability || record.probability,
        status: results[index].success ? results[index].message : "Failed to process",
        encryptionKey: results[index].encryption_key || record.encryptionKey
      }));

      console.log("Processed records:", processedRecords);

      setSearchResults(processedRecords); // Show results with status

      const successCount = results.filter(result => result.success).length;

      toast({
        title: `${action === "mask" ? "Masking" : "Deletion"} Complete`,
        description: `Successfully processed ${successCount} of ${records.length} records.`,
      });

      if (successCount < records.length) {
        toast({
          title: "Some Records Failed",
          description: `${records.length - successCount} records could not be processed.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "An error occurred while processing the records.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
    }
  };

  // Add these handler functions:
  const handleConfirmProcess = () => {
    handleProcessRecords(pendingSearchResults, pendingAction);
  };

  const handleCancelProcess = () => {
    setShowConfirmation(false);
    setPendingSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 p-4 md:p-8">
      <LoadingOverlay currentStep={loadingStep} isVisible={isLoading} />

      {/* Add this confirmation dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleCancelProcess}
        onConfirm={handleConfirmProcess}
        data={pendingSearchResults}
        action={pendingAction}
        isProcessing={isProcessing}
      />


      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between py-8">
          {/* Logo */}
          <img
            src="/loglogo.png"
            alt="Data Privacy Portal Logo"
            className="h-20 w-auto"
          />

          {/* GDPR button */}
          {/* GDPR button */}
          <Link to="/gdpr-analysis">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-500 hover:opacity-90 text-white rounded-lg transition-all duration-200 shadow-lg">
              <BarChart3 className="h-5 w-5" />
              GDPR Analysis Dashboard
            </button>
          </Link>

        </header>

        <DataSearchForm onSearch={handleSearch} isLoading={isLoading} />

        {searchResults.length > 0 && (
          <div className="space-y-6">
            <DataTable data={searchResults} action={lastAction} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
