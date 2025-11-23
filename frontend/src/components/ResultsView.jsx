import React, { useState, useMemo, useEffect } from 'react';
import SpotlightCard from './ui/SpotlightCard';
import MagneticButton from './ui/MagneticButton';
import { Sparkles, RefreshCcw, BrainCircuit, Loader2, Calculator, Download, Printer, TrendingUp, PieChart } from 'lucide-react';
import GradeDonutChart from './GradeDonutChart';
import TrendLineChart from './TrendLineChart';

const getPointsFromTotal = (total) => {
    const marks = parseInt(total, 10);
    if (isNaN(marks)) return 0;
    if (marks >= 90) return 10;
    if (marks >= 80) return 9;
    if (marks >= 70) return 8;
    if (marks >= 60) return 7;
    if (marks >= 55) return 6;
    if (marks >= 50) return 5;
    if (marks >= 40) return 4;
    return 0;
};

const getResultFromTotal = (total) => (parseInt(total, 10) >= 40 ? 'P' : 'F');

const ResultsView = ({ data, onReset }) => {
    const [aiTip, setAiTip] = useState(null);
    const [tipLoading, setTipLoading] = useState(false);

    // What-If Mode State
    const [whatIfMode, setWhatIfMode] = useState(false);
    const [whatIfSubjects, setWhatIfSubjects] = useState(data.subjects || []);

    useEffect(() => {
        setWhatIfSubjects(data.subjects || []);
    }, [data.subjects]);

    const whatIfStats = useMemo(() => {
        let totalPoints = 0;
        let totalCredits = 0;

        whatIfSubjects.forEach(subject => {
            totalCredits += subject.credits;
            totalPoints += (subject.points * subject.credits);
        });

        const sgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
        return { sgpa, totalCredits, totalPoints };
    }, [whatIfSubjects]);

    const handleWhatIfChange = (index, newTotal) => {
        const newPoints = getPointsFromTotal(newTotal);
        const newResult = getResultFromTotal(newTotal);

        setWhatIfSubjects(prevSubjects =>
            prevSubjects.map((subject, i) => {
                if (i === index) {
                    return {
                        ...subject,
                        total: newTotal ? parseInt(newTotal, 10) : 0,
                        points: newPoints,
                        result: newResult
                    };
                }
                return subject;
            })
        );
    };

    const fetchAiTip = async () => {
        setTipLoading(true);
        try {
            const response = await fetch('http://localhost:5000/get-ai-tip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjects: data.subjects,
                    sgpa: data.sgpa,
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                setAiTip(result.tip);
            }
        } catch (error) {
            console.error('Failed to fetch AI tip', error);
        } finally {
            setTipLoading(false);
        }
    };

    const handleExportCSV = () => {
        const subjects = data.subjects || [];

        // Headers: USN, Name, subject codes, SGPA
        const headers = ["USN", "Name"];
        subjects.forEach(subject => {
            headers.push(subject.code);
        });
        headers.push("SGPA");

        // Data: USN, Name, actual marks, actual sgpa
        const rowData = [
            (data.usn || "N/A"),
            data.name || "N/A"
        ];

        subjects.forEach(subject => {
            rowData.push(subject.total ?? "—");
        });

        rowData.push(data.sgpa ? data.sgpa.toFixed(2) : "N/A");

        // Build CSV
        let csvContent = headers.join(",") + "\n" + rowData.join(",") + "\n";

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `SGPA_Report_${data.usn || 'Student'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    const displaySubjects = whatIfMode ? whatIfSubjects : (data.subjects || []);
    const currentSgpa = whatIfMode ? whatIfStats.sgpa : data.sgpa;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 print:animate-none">

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
                <SpotlightCard className={`col-span-1 md:col-span-2 flex flex-col justify-center items-center text-center space-y-2 transition-colors duration-500 ${whatIfMode ? 'border-purple-500/30 bg-purple-500/5' : 'border-electric-blue/30 bg-electric-blue/5'}`}>
                    <div className={`${whatIfMode ? 'text-purple-400' : 'text-electric-blue'} text-sm font-mono tracking-widest uppercase flex items-center gap-2`}>
                        {whatIfMode ? <><Calculator size={14} /> Simulated SGPA</> : 'Semester GPA'}
                    </div>
                    <div className="text-7xl font-bold text-white tracking-tighter">
                        {currentSgpa.toFixed(2)}
                    </div>
                    {!whatIfMode && data.percentage && (
                        <div className="text-white/40 font-mono text-xs">
                            {data.percentage}% // {data.classification}
                        </div>
                    )}
                </SpotlightCard>

                <SpotlightCard className="flex flex-col justify-center gap-6">
                    <div className="space-y-2">
                        <div className="text-electric-blue text-xs font-mono uppercase tracking-wider">Student Profile</div>
                        <div className="text-2xl font-bold text-white truncate leading-tight">{data.name || 'Unknown'}</div>
                        <div className="text-white/60 font-mono text-sm bg-white/5 inline-block px-2 py-1 rounded border border-white/10">
                            {data.usn || 'Unknown'}
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="flex items-end justify-between">
                        <div className="text-white/40 text-xs font-mono uppercase mb-1">Total Credits</div>
                        <div className="text-4xl font-bold text-white">{data.total_credits_attempted}</div>
                    </div>
                </SpotlightCard>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid">
                <SpotlightCard className="h-96 flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-white/60 text-sm font-mono uppercase">
                        <PieChart size={16} className="text-electric-blue" /> Grade Distribution
                    </div>
                    <div className="flex-1 relative">
                        <GradeDonutChart subjectData={displaySubjects} />
                    </div>
                </SpotlightCard>

                {data.prediction && data.prediction.predicted_sgpa && (
                    <SpotlightCard className="h-96 flex flex-col">
                        <div className="flex items-center gap-2 mb-4 text-white/60 text-sm font-mono uppercase">
                            <TrendingUp size={16} className="text-purple-400" /> Performance Trend
                        </div>
                        <div className="flex-1 relative">
                            <TrendLineChart predictionData={data.prediction} />
                        </div>
                    </SpotlightCard>
                )}
            </div>

            {/* Subjects Table */}
            <SpotlightCard className="p-0 overflow-hidden print:border print:border-black">
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center flex-wrap gap-4 print:hidden">
                    <div className="flex items-center gap-4">
                        <h3 className="text-white font-light">Subject Breakdown</h3>
                        <div className="text-xs text-white/40 font-mono">{data.subjects.length} SUBJECTS</div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <span className={`text-sm font-mono transition-colors ${whatIfMode ? 'text-purple-400' : 'text-white/40 group-hover:text-white'}`}>
                            WHAT-IF MODE
                        </span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={whatIfMode}
                                onChange={(e) => setWhatIfMode(e.target.checked)}
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors ${whatIfMode ? 'bg-purple-600' : 'bg-white/10'}`}></div>
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${whatIfMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                    </label>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-white/40 font-mono text-xs uppercase print:text-black">
                            <tr>
                                <th className="px-6 py-3 font-medium">Code</th>
                                <th className="px-6 py-3 font-medium">Subject</th>
                                <th className="px-6 py-3 font-medium text-center">Int</th>
                                <th className="px-6 py-3 font-medium text-center">Ext</th>
                                <th className="px-6 py-3 font-medium text-center">Total</th>
                                <th className="px-6 py-3 font-medium text-right">Credits</th>
                                <th className="px-6 py-3 font-medium text-right">Grade</th>
                                <th className="px-6 py-3 font-medium text-center">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 print:divide-gray-300">
                            {displaySubjects.map((subject, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors print:text-black">
                                    <td className="px-6 py-4 font-mono text-white/60 print:text-black">{subject.code}</td>
                                    <td className="px-6 py-4 text-white max-w-xs truncate print:text-black" title={subject.title}>{subject.title}</td>

                                    <td className="px-6 py-4 text-center text-white/60 print:text-black">
                                        {subject.internal ?? '-'}
                                    </td>

                                    <td className="px-6 py-4 text-center text-white/60 print:text-black">
                                        {subject.external ?? '-'}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        {whatIfMode && subject.credits > 0 ? (
                                            <input
                                                type="number"
                                                className="w-16 bg-purple-500/20 border border-purple-500/40 rounded px-2 py-1 text-center text-white focus:outline-none focus:border-purple-400"
                                                min="0"
                                                max="100"
                                                value={subject.total ?? ''}
                                                onChange={(e) => handleWhatIfChange(idx, e.target.value)}
                                            />
                                        ) : (
                                            <span className="text-white font-medium print:text-black">{subject.total ?? '-'}</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-right text-white/60 print:text-black">{subject.credits}</td>
                                    <td className={`px-6 py-4 text-right font-mono ${whatIfMode ? 'text-purple-400' : 'text-electric-blue'} print:text-black`}>
                                        {subject.points}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${subject.result === 'P' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            } print:border-black print:text-black`}>
                                            {subject.result}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SpotlightCard>

            {/* AI Analysis */}
            <SpotlightCard className="border-purple-500/20 bg-purple-500/5 print:hidden">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                        <BrainCircuit size={24} />
                    </div>
                    <div className="space-y-4 flex-1">
                        <div>
                            <h3 className="text-white font-medium">AI Performance Analysis</h3>
                            <p className="text-white/40 text-sm">Powered by Gemini 2.0 Flash</p>
                        </div>

                        {aiTip ? (
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-white/80 leading-relaxed text-sm">
                                {aiTip}
                            </div>
                        ) : (
                            <MagneticButton
                                onClick={fetchAiTip}
                                disabled={tipLoading}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {tipLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                Generate Analysis
                            </MagneticButton>
                        )}
                    </div>
                </div>
            </SpotlightCard>

            {/* Actions */}
            <div className="flex justify-center gap-4 print:hidden">
                <MagneticButton onClick={handleExportCSV} className="px-6 py-3 border border-white/10 hover:bg-white/5 text-white rounded flex items-center gap-2 transition-colors">
                    <Download size={18} /> Export CSV
                </MagneticButton>
                <MagneticButton onClick={handlePrint} className="px-6 py-3 border border-white/10 hover:bg-white/5 text-white rounded flex items-center gap-2 transition-colors">
                    <Printer size={18} /> Print Result
                </MagneticButton>
                <MagneticButton onClick={onReset} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded flex items-center gap-2 transition-colors">
                    <RefreshCcw size={18} /> Upload New
                </MagneticButton>
            </div>
        </div>
    );
};

export default ResultsView;
