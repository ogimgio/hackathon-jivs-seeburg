import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
// Using custom table styling since table component is not available
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft, BarChart3, Database, Loader2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();

    // Common database names - you can modify this list
    const databases = [
        "AdventureWorks2019",
        "ECC60jkl_HACK",
        "jde920_demo",
        "ORACLE_EBS_HACK"
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
                {/* Back Button */}
                <div className="flex items-center justify-start">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                {/* Header */}
                <header className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        GDPR Analysis Dashboard
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Analyze database compliance with GDPR regulations and generate detailed reports
                    </p>
                </header>

                {/* Database Selection and Controls */}
                <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Database className="h-4 w-4 text-emerald-500" />
                            </div>
                            Database Selection
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Choose a database to analyze for GDPR compliance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                                    <SelectTrigger className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500">
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
                                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
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
                                    className="flex items-center gap-2 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
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
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Chart Section */}
                {chartUrl && (
                    <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                                </div>
                                Data Aging Analysis Chart
                            </CardTitle>
                            <CardDescription className="text-slate-500">
                                Visual representation of the monthly increase in records older than 10 years for <strong>{selectedDatabase}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <img
                                    src={chartUrl}
                                    alt="Monthly data aging chart showing records older than 10 years"

                                    className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm"
                                    style={{ maxHeight: '500px' }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Analysis Results Table */}
                {analysisData.length > 0 && (
                    <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <Shield className="h-4 w-4 text-emerald-500" />
                                </div>
                                GDPR Analysis Results
                            </CardTitle>
                            <CardDescription className="text-slate-500">
                                Detailed analysis results for {selectedDatabase} ({analysisData.length} records found)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border border-slate-200 overflow-x-auto bg-white shadow-sm">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left p-4 font-semibold text-slate-900">Table</th>
                                            <th className="text-left p-4 font-semibold text-slate-900">Column</th>
                                            <th className="text-left p-4 font-semibold text-slate-900">Data Type</th>
                                            <th className="text-left p-4 font-semibold text-slate-900">GDPR Category</th>
                                            <th className="text-left p-4 font-semibold text-slate-900">Risk Level</th>
                                            <th className="text-left p-4 font-semibold text-slate-900">Compliance Status</th>
                                            <th className="text-left p-4 font-semibold text-slate-900">Recommendation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysisData.map((record, index) => (
                                            <tr key={index} className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors">
                                                <td className="p-4 font-medium text-slate-900">
                                                    {record.table_name}
                                                </td>
                                                <td className="p-4 text-slate-700">{record.column_name}</td>
                                                <td className="p-4">
                                                    <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded border">
                                                        {record.data_type}
                                                    </code>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                                                        {record.gdpr_category}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={getRiskBadgeVariant(record.risk_level)}>
                                                        {record.risk_level}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={getComplianceBadgeVariant(record.compliance_status)}>
                                                        {record.compliance_status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 max-w-xs truncate text-slate-600" title={record.recommendation}>
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
                    <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                                <Database className="h-8 w-8 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Analysis Data</h3>
                            <p className="text-slate-500 text-center mb-6 max-w-md">
                                Click "Analyze GDPR" to start the analysis for the selected database and discover compliance insights.
                            </p>
                            <Button
                                onClick={handleAnalyzeGDPR}
                                disabled={!selectedDatabase || isLoadingAnalysis}
                                className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-500 hover:opacity-90 text-white shadow-lg"
                            >
                                {isLoadingAnalysis ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Shield className="h-4 w-4 mr-2" />
                                )}
                                Start Analysis
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default GDPRAnalysisPage;