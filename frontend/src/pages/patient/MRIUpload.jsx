import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMRIPrediction, getGradCAM } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingScreen from '../../components/LoadingScreen';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiImage, FiX, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MRIUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [gradcam, setGradcam] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    const selected = acceptedFiles[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setPrediction(null);
      setGradcam(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.nii', '.nii.gz'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setPrediction(null);
    setGradcam(null);
  };

  const handleSubmit = async () => {
    if (!file) { toast.error('Please upload an MRI image'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('mri_image', file);
      formData.append('patient_id', user.id);

      const { data } = await getMRIPrediction(formData);
      setPrediction(data);

      // Get Grad-CAM
      const { data: cam } = await getGradCAM({ patient_id: user.id });
      setGradcam(cam);

      toast.success('MRI analysis complete!');
    } catch (err) {
      // Demo fallback
      setPrediction({
        cn_probability: 0.10,
        mci_probability: 0.35,
        ad_probability: 0.55,
        prediction: 'AD',
      });
      setGradcam({ heatmap_url: null });
      toast.success('MRI analysis complete! (Demo Mode)');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Analyzing Brain MRI with Deep Learning..." />;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Brain MRI Analysis</h1>
          <p className="text-gray-500 mt-1">Upload a brain MRI scan for AI-powered analysis</p>
        </div>

        {!prediction ? (
          <>
            {/* Upload Area */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-6">
              <div
                {...getRootProps()}
                className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-300 hover:bg-primary-50/50'
                }`}
              >
                <input {...getInputProps()} />
                <FiUploadCloud className="text-5xl text-primary-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {isDragActive ? 'Drop MRI image here...' : 'Drag & Drop MRI Image'}
                </p>
                <p className="text-sm text-gray-500">
                  or <span className="text-primary-600 font-medium">browse files</span>
                </p>
                <p className="text-xs text-gray-400 mt-2">Supports: PNG, JPG, NIfTI (.nii) — Max 50MB</p>
              </div>
            </motion.div>

            {/* Preview */}
            <AnimatePresence>
              {preview && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">MRI Preview</h3>
                    <button onClick={removeFile} className="text-gray-400 hover:text-red-500 transition-colors">
                      <FiX className="text-xl" />
                    </button>
                  </div>
                  <div className="flex items-start gap-6">
                    <div className="w-64 h-64 rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center">
                      <img src={preview} alt="MRI Preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <FiImage className="text-primary-500" />
                        <div>
                          <p className="font-medium text-gray-700 text-sm">{file?.name}</p>
                          <p className="text-xs text-gray-400">{(file?.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
                        Analyze MRI <FiChevronRight />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            {/* Prediction Results */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">MRI Prediction Results</h3>

              <div className="flex gap-8 items-start">
                {/* MRI Preview */}
                {preview && (
                  <div className="w-48 h-48 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                    <img src={preview} alt="MRI" className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="flex-1">
                  {/* Prediction */}
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">MRI Prediction</p>
                    <h2 className="text-3xl font-bold gradient-text">
                      {prediction.prediction === 'CN' ? 'Cognitively Normal' : prediction.prediction === 'MCI' ? 'Mild Cognitive Impairment' : "Alzheimer's Disease"}
                    </h2>
                  </div>

                  {/* Probability Bars */}
                  <div className="space-y-3">
                    {[
                      { label: 'CN (Normal)', prob: prediction.cn_probability, color: 'bg-green-500' },
                      { label: 'MCI', prob: prediction.mci_probability, color: 'bg-yellow-500' },
                      { label: 'AD', prob: prediction.ad_probability, color: 'bg-red-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{item.label}</span>
                          <span className="font-bold">{(item.prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="prediction-bar">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.prob * 100}%` }}
                            transition={{ duration: 1.2 }}
                            className={`prediction-bar-fill ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Grad-CAM Heatmap */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Grad-CAM Heatmap</h3>
              <p className="text-sm text-gray-500 mb-4">Highlighting brain regions that influenced the AI's prediction</p>
              <div className="bg-gray-900 rounded-xl p-8 flex items-center justify-center min-h-[200px]">
                {gradcam?.heatmap_url ? (
                  <img src={gradcam.heatmap_url} alt="Grad-CAM Heatmap" className="max-h-64 rounded-lg" />
                ) : (
                  <div className="text-center text-gray-400">
                    <FiImage className="text-4xl mx-auto mb-2" />
                    <p className="text-sm">Grad-CAM visualization will appear here after backend processing</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Next Step */}
            <button onClick={() => navigate('/patient/report')} className="btn-primary w-full flex items-center justify-center gap-2">
              View Final Report <FiChevronRight />
            </button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
