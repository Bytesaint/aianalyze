import React, { useState } from 'react';
import UploadArea from './components/UploadArea';
import ResultCard from './components/ResultCard';
import { Sparkles, Zap } from 'lucide-react';

function App() {
    const [fileData, setFileData] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = (data) => {
        setFileData(data);
        setResult(null);
        setError(null);
        if (data) {
            analyzeImage(data.preview);
        }
    };

    const analyzeImage = async (base64Image) => {
        setLoading(true);
        setError(null);

        try {
            // Remove data URL prefix for the API if needed, but usually APIs handle it or we strip it.
            // Gemini detection via base64 usually expects the data part. 
            // User snippet shows `content: IMAGE_BASE64`. 
            // `FileReader` result is `data:image/jpeg;base64,...`.
            // I should strip the prefix.
            const base64Content = base64Image.split(',')[1];
            const mimeType = base64Image.split(';')[0].split(':')[1];

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Content, mimeType }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Analysis failed: ${response.status} ${response.statusText} - ${errText}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <div className="background-gradient"></div>

            <header className="app-header">
                <div className="logo">
                    <Zap className="logo-icon" />
                    <h1>AI Trade Vision</h1>
                </div>
                <p className="subtitle">Powered by Gemini 3 Flash</p>
            </header>

            <main className="main-content">
                <div className="content-wrapper">
                    <section className="upload-section">
                        <UploadArea
                            onFileSelect={handleFileSelect}
                            loading={loading}
                            error={error}
                        />
                    </section>

                    <section className="result-section">
                        {result && <ResultCard result={result} />}
                        {!result && !loading && !error && (
                            <div className="placeholder-text">
                                <Sparkles size={48} className="placeholder-icon" />
                                <p>Upload a trading chart to reveal AI analysis</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} AI Trade Vision. Experimental Tool.</p>
            </footer>
        </div>
    );
}

export default App;
