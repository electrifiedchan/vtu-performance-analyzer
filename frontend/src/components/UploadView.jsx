import React, { useState } from 'react';
import SpotlightCard from './ui/SpotlightCard';
import MagneticButton from './ui/MagneticButton';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';

const UploadView = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [pastSgpas, setPastSgpas] = useState({ sem1: '', sem2: '', sem3: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            setError(null);
        } else {
            setFile(null);
            setError('Please upload a valid PDF file.');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        const sgpaList = Object.values(pastSgpas).filter(val => val !== '').join(',');
        if (sgpaList) {
            formData.append('past_sgpas', sgpaList);
        }

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                onUploadSuccess(data);
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (err) {
            setError(err.message || 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <SpotlightCard className="text-center space-y-8 border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="space-y-2">
                    <h2 className="text-2xl font-light text-white">Upload Marks Card</h2>
                    <p className="text-white/40 text-sm">Upload your VTU PDF results for instant analysis</p>
                </div>

                <div className="relative group cursor-pointer">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className={`border-2 border-dashed rounded-xl p-12 transition-all duration-300 ${file ? 'border-electric-blue bg-electric-blue/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                        <div className="flex flex-col items-center gap-4">
                            <div className={`p-4 rounded-full ${file ? 'bg-electric-blue/20 text-electric-blue' : 'bg-white/5 text-white/40'}`}>
                                {file ? <FileText size={32} /> : <Upload size={32} />}
                            </div>
                            <div className="space-y-1">
                                <p className="text-white font-medium">
                                    {file ? file.name : 'Click or Drag PDF here'}
                                </p>
                                <p className="text-white/40 text-xs">
                                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Supported format: PDF'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 text-left">
                    <label className="text-xs font-mono text-white/40 uppercase tracking-wider">Previous Semesters (Optional)</label>
                    <div className="grid grid-cols-3 gap-4">
                        {['sem1', 'sem2', 'sem3'].map((sem, i) => (
                            <div key={sem} className="space-y-1">
                                <input
                                    type="number"
                                    placeholder={`Sem ${i + 1}`}
                                    value={pastSgpas[sem]}
                                    onChange={(e) => setPastSgpas({ ...pastSgpas, [sem]: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue transition-colors placeholder:text-white/20 text-center"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded border border-red-400/20">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <MagneticButton
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className={`w-full py-4 font-bold rounded flex items-center justify-center gap-2 transition-all ${!file || loading
                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                            : 'bg-electric-blue text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.3)]'
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" /> Processing...
                        </>
                    ) : (
                        'ANALYZE RESULTS'
                    )}
                </MagneticButton>
            </SpotlightCard>
        </div>
    );
};

export default UploadView;
