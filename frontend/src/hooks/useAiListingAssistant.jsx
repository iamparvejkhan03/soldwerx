import { useState, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

export const useAiListingAssistant = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [aiError, setAiError] = useState(null);

    const analyzeImages = useCallback(async (files, parentCategory, subcategory, prompt = '') => {
        if (!files || files.length === 0) {
            toast.error('Please upload at least one image');
            return null;
        }

        if (!subcategory) {
            toast.error('Please select a subcategory first');
            return null;
        }

        try {
            setIsAnalyzing(true);
            setAiError(null);
            setAiResult(null);

            const formData = new FormData();

            files.forEach((file) => {
                formData.append('photos', file);
            });

            formData.append('parentCategory', parentCategory || '');
            formData.append('subcategory', subcategory);
            formData.append('prompt', prompt || '');

            const { data } = await axiosInstance.post(
                '/api/v1/ai/analyze-auction',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }
            );

            if (data.success) {
                setAiResult(data.data);
                return data.data;
            }
        } catch (error) {
            const message = error?.response?.data?.message || 'AI analysis failed';
            setAiError(message);
            toast.error(message);
            return null;
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const clearResult = useCallback(() => {
        setAiResult(null);
        setAiError(null);
    }, []);

    return { isAnalyzing, aiResult, aiError, analyzeImages, clearResult };
};