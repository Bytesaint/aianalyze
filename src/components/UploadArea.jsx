import React, { useState, useCallback } from 'react';
import { Upload, File, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadArea = ({ onFileSelect, loading, error }) => {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const processFile = useCallback((file) => {
        if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
                onFileSelect({ file, preview: e.target.result });
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please upload a PNG or JPEG image.");
        }
    }, [onFileSelect]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, [processFile]);

    const handleChange = useCallback((e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    }, [processFile]);

    const clearFile = () => {
        setPreview(null);
        onFileSelect(null);
    };

    return (
        <div className="upload-container">
            <AnimatePresence>
                {!preview ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`upload-zone ${dragActive ? 'active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="file-input"
                            onChange={handleChange}
                            accept="image/png, image/jpeg"
                            disabled={loading}
                        />
                        <label htmlFor="file-upload" className="upload-label">
                            <Upload className="icon-large" />
                            <p className="upload-text">
                                Drag & Drop or <span>Choose Screenshot</span>
                            </p>
                            <p className="upload-subtext">Supports PNG, JPEG (Pocket Option / MT5)</p>
                        </label>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="preview-container"
                    >
                        <img src={preview} alt="Preview" className="preview-image" />
                        {!loading && (
                            <button onClick={clearFile} className="remove-btn" title="Remove image">
                                <X size={20} />
                            </button>
                        )}
                        {loading && (
                            <div className="loading-overlay">
                                <div className="loader"></div>
                                <p>Analyzing Chart...</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="error-message"
                >
                    {error}
                </motion.div>
            )}
        </div>
    );
};

export default UploadArea;
