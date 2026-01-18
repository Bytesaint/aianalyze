import React from 'react';
import { Download, TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ResultCard = ({ result }) => {
    if (!result) return null;

    const downloadJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `analysis_${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const trendIcon = result.trend?.toLowerCase().includes('up') ? <TrendingUp className="text-green" /> :
        result.trend?.toLowerCase().includes('down') ? <TrendingDown className="text-red" /> : <Activity />;

    return (
        <motion.div
            className="result-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="result-header">
                <h2>Analysis Result</h2>
                <button onClick={downloadJson} className="download-btn">
                    <Download size={18} /> Download JSON
                </button>
            </div>

            <div className="metrics-grid">
                <div className="metric-box">
                    <span className="metric-label">Prediction</span>
                    <span className={`metric-value ${result.prediction === 'CALL' ? 'text-green' : result.prediction === 'PUT' ? 'text-red' : 'text-yellow'}`}>
                        {result.prediction || "N/A"}
                    </span>
                </div>
                <div className="metric-box">
                    <span className="metric-label">Confidence</span>
                    <span className="metric-value">{result.confidence_score}%</span>
                </div>
                <div className="metric-box">
                    <span className="metric-label">Trend</span>
                    <span className="metric-value flex-center">{trendIcon} {result.trend || "N/A"}</span>
                </div>
                <div className="metric-box">
                    <span className="metric-label">Timeframe</span>
                    <span className="metric-value">{result.timeframe || "N/A"}</span>
                </div>
            </div>

            <div className="details-section">
                <h3><BarChart2 size={18} /> MACD</h3>
                <div className="detail-row">
                    <span>Value:</span> <span>{result.macd?.macd_value}</span>
                </div>
                <div className="detail-row">
                    <span>Signal:</span> <span>{result.macd?.signal_value}</span>
                </div>
                <div className="detail-row">
                    <span>Histogram:</span> <span>{result.macd?.histogram}</span>
                </div>
                <div className="detail-row">
                    <span>State:</span> <span>{result.macd?.signal_state || "N/A"}</span>
                </div>
            </div>

            <div className="details-section">
                <h3>Explanation</h3>
                <p className="explanation-text">{result.explanation}</p>
            </div>

            <details className="raw-json">
                <summary>View Raw JSON</summary>
                <pre>{JSON.stringify(result, null, 2)}</pre>
            </details>
        </motion.div>
    );
};

export default ResultCard;
