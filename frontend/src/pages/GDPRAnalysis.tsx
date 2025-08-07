import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
// Using custom table styling since table component is not available
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BarChart3, Database, Loader2, Shield } from "lucide-react";

interface GDPRAnalysisRecord {
    table_name: string;
    column_name: string;
    data_type: string;
    gdpr_category: string;
    risk_level: string;
    compliance_status: string;
    recommendation: string;
    [key: string]: any;
}

const GDPRAnalysisPage = () => {
    const [selectedDatabase, setSelectedDatabase] = useState<string>("");
    const [analysisData, setAnalysisData] = useState<GDPRAnalysisRecord[]>([]);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [isLoadingChart, setIsLoadingChart] = useState(false);
    const [chartUrl, setChartUrl] = useState<string>("");
    const [error, setError] = useState<string>("");

    // Common database names - you can modify this list
    const databases = [
        "AdventureWorks2019",
        "Northwind",
        "SampleDB",
        "TestDB",
        "ProductionDB"
    ];

    const handleAnalyzeGDPR = async () => {
        if (!selectedDatabase) {
            setError("Please select a database first");
            return;
        }

        setIsLoadingAnalysis(true);
        setError("");

        try {
            const response = await fetch(`http://localhost:8000/analyze-gdpr/${selectedDatabase}`);

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.statusText}`);
            }

            const result = await response.json();
            setAnalysisData(result.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to analyze GDPR compliance");
            setAnalysisData([]);
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    const handleGenerateChart = async () => {
        if (!selectedDatabase) {
            setError("Please select a database first");
            return;
        }

        setIsLoadingChart(true);
        setError("");

        try {
            const response = await fetch(`http://localhost:8000/generate-chart/${selectedDatabase}`);

            if (!response.ok) {
                throw new Error(`Chart generation failed: ${response.statusText}`);
            }

            // Create blob URL for the image
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setChartUrl(imageUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate chart");
        } finally {
            setIsLoadingChart(false);
        }
    };

    const getRiskBadgeVariant = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'default';
            case 'low':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getComplianceBadgeVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'compliant':
                return 'default';
            case 'non-compliant':
                return 'destructive';
            case 'partially compliant':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="text-center py-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        GDPR Analysis Dashboard
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Analyze database compliance with GDPR regulations and generate detailed reports
                    </p>
                </header>

                {/* Database Selection and Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Database Selection
                        </CardTitle>
                        <CardDescription>
                            Choose a database to analyze for GDPR compliance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a database" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {databases.map((db) => (
                                            <SelectItem key={db} value={db}>
                                                {db}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleAnalyzeGDPR}
                                    disabled={!selectedDatabase || isLoadingAnalysis}
                                    className="flex items-center gap-2"
                                >
                                    {isLoadingAnalysis ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Shield className="h-4 w-4" />
                                    )}
                                    Analyze GDPR
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleGenerateChart}
                                    disabled={!selectedDatabase || isLoadingChart}
                                    className="flex items-center gap-2"
                                >
                                    {isLoadingChart ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <BarChart3 className="h-4 w-4" />
                                    )}
                                    Generate Chart
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Chart Section */}
                {chartUrl && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                GDPR Compliance Chart
                            </CardTitle>
                            <CardDescription>
                                Visual representation of GDPR compliance analysis for {selectedDatabase}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <img
                                    src={chartUrl}
                                    alt="GDPR Compliance Chart"
                                    className="max-w-full h-auto rounded-lg border"
                                    style={{ maxHeight: '500px' }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Analysis Results Table */}
                {analysisData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                GDPR Analysis Results
                            </CardTitle>
                            <CardDescription>
                                Detailed analysis results for {selectedDatabase} ({analysisData.length} records found)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr className="border-b">
                                            <th className="text-left p-3 font-medium">Table</th>
                                            <th className="text-left p-3 font-medium">Column</th>
                                            <th className="text-left p-3 font-medium">Data Type</th>
                                            <th className="text-left p-3 font-medium">GDPR Category</th>
                                            <th className="text-left p-3 font-medium">Risk Level</th>
                                            <th className="text-left p-3 font-medium">Compliance Status</th>
                                            <th className="text-left p-3 font-medium">Recommendation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysisData.map((record, index) => (
                                            <tr key={index} className="border-b hover:bg-muted/30">
                                                <td className="p-3 font-medium">
                                                    {record.table_name}
                                                </td>
                                                <td className="p-3">{record.column_name}</td>
                                                <td className="p-3">
                                                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                                        {record.data_type}
                                                    </code>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="outline">
                                                        {record.gdpr_category}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={getRiskBadgeVariant(record.risk_level)}>
                                                        {record.risk_level}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={getComplianceBadgeVariant(record.compliance_status)}>
                                                        {record.compliance_status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 max-w-xs truncate" title={record.recommendation}>
                                                    {record.recommendation}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!isLoadingAnalysis && analysisData.length === 0 && selectedDatabase && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Database className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Analysis Data</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Click "Analyze GDPR" to start the analysis for the selected database.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default GDPRAnalysisPage;