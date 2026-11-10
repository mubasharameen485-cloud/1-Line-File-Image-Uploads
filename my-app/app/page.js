'use client';

import { useState } from 'react';
import axios from 'axios';

const BACKEND_BASE = 'http://localhost:8080';
const UPLOAD_ENDPOINT = `${BACKEND_BASE}/api/upload`;

export default function FileUploadDemo() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 1. File Select & Preview Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    setSuccess(null);

    // Agar image hai toh local preview banao
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null); // Document/PDF ke liye preview nahi
    }
  };
// src/app/page.js ke andar handleUpload function ko is se replace karein:

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Pehle koi file ya image select karein!');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // JADOO: Browser native fetch (No Axios boundary issues!)
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData, // Browser boundary khud lagayega
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || resData || 'Upload failed on server');
      }

      if (resData.success && resData.urls?.length > 0) {
        setSuccess('🎉 File successfully uploaded to Rust backend!');

        const newUrls = resData.urls.map((urlPath) => ({
          name: selectedFile.name,
          url: `${BACKEND_BASE}${urlPath}`,
          type: selectedFile.type,
        }));

        setUploadedFiles((prev) => [...newUrls, ...prev]);

        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Upload fail ho gaya!');
    } finally {
      setUploading(false);
    }
  
  
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6 font-sans">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-indigo-600">
          📁 1-Line Universal File & Image Uploads
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Don Framework (Axum Multipart + Static File Serving) + Next.js
        </p>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded-xl mb-6 text-sm font-semibold">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-xl mb-6 text-sm font-semibold">
          🛑 {error}
        </div>
      )}

      {/* Upload Box Card */}
      <div className="bg-white p-8 rounded-2xl shadow border mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Upload Any File (Images, PDFs, Docs)
        </h2>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Picker Area */}
          <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition bg-indigo-50/30">
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
                📤
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {selectedFile ? selectedFile.name : 'Click to select or drop an image/file here'}
              </span>
              <span className="text-xs text-gray-400">
                Supports PNG, JPG, WEBP, PDF, TXT (Auto-assigned unique UUID)
              </span>
            </label>
          </div>

          {/* Local Preview before Upload */}
          {previewUrl && (
            <div className="p-4 border rounded-xl bg-gray-50 flex items-center gap-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border shadow-sm"
              />
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Ready to Upload:</p>
                <p className="text-sm font-bold text-gray-800">{selectedFile?.name}</p>
                <p className="text-xs text-gray-500 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center gap-2 text-sm"
          >
            {uploading ? 'Rust Backend par upload ho raha hai...' : '⚡ Upload to Rust Server'}
          </button>
        </form>
      </div>

      {/* Uploaded Files Gallery */}
      <div className="bg-white p-8 rounded-2xl shadow border">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          🖼️ Live Uploaded Files (Direct from Rust Server)
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          Yeh files direct Rust backend ke <code>/uploads</code> static route se serve ho rahi hain:
        </p>

        {uploadedFiles.length === 0 ? (
          <div className="text-center p-8 text-gray-400 text-sm italic bg-gray-50 rounded-xl">
            Abhi tak koi file upload nahi hui. Upar se pehli photo ya file upload karein!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedFiles.map((item, index) => (
              <div
                key={index}
                className="border rounded-xl p-3 bg-gray-50 flex flex-col justify-between shadow-sm"
              >
                {/* Agar image hai toh photo dikhao */}
                {item.type?.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-36 object-cover rounded-lg mb-2 border"
                  />
                ) : (
                  <div className="w-full h-36 bg-indigo-100 rounded-lg flex items-center justify-center text-4xl mb-2">
                    📄
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-800 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 font-mono hover:underline truncate block"
                  >
                    Open Live File ↗
                  </a>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.url);
                    alert('URL copied to clipboard!');
                  }}
                  className="mt-3 w-full bg-white hover:bg-gray-100 border text-gray-700 text-xs font-bold py-1.5 rounded-lg transition"
                >
                  📋 Copy URL
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}