import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useLocation } from "react-router-dom";

export const useAuctions = () => {
    const location = useLocation();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState({
        categories: [],
        status: 'active',
        search: '',
        priceMin: '',
        priceMax: '',
        location: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        // Add all the new car filters
        make: '',
        model: '',
        yearMin: '',
        yearMax: '',
        transmission: '',
        fuelType: '',
        condition: '',
        auctionType: '',
        allowOffers: ''
    });

    // Clean filters - remove empty values
    const cleanFilters = (currentFilters) => {
        return Object.fromEntries(
            Object.entries(currentFilters).filter(([key, value]) => {
                // Special handling for categories array
                if (key === 'categories') {
                    return Array.isArray(value) && value.length > 0;
                }
                // For other fields
                return value !== '' && value !== null && value !== undefined && value !== false;
            })
        );
    };

    // Fetch auctions with pagination and filters
    const fetchAuctions = async (page = 1, limit = 12, currentFilters = {}) => {
        const loadingState = page > 1 ? setLoadingMore : setLoading;
        loadingState(true);

        try {
            // Clean up filters
            const clean = cleanFilters(currentFilters);

            // Build query string with all filters
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                // Copy all filters except categories
                ...Object.fromEntries(
                    Object.entries(clean).filter(([key]) => key !== 'categories')
                )
            });

            // Handle categories array separately - append each category
            if (clean.categories && Array.isArray(clean.categories) && clean.categories.length > 0) {
                clean.categories.forEach(cat => {
                    params.append('categories', cat);
                });
            }

            const queryString = params.toString();
            const { data } = await axiosInstance.get(`/api/v1/auctions?${queryString}`);

            if (data.success) {
                if (page > 1) {
                    // Append new auctions for pagination
                    setAuctions(prev => [...prev, ...data.data.auctions]);
                } else {
                    // Replace auctions for first load or filter change
                    setAuctions(data.data.auctions);
                }
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching auctions:', error);
            toast.error('Failed to load auctions');
        } finally {
            loadingState(false);
        }
    };

    // Load more auctions
    const loadMoreAuctions = async () => {
        if (pagination?.currentPage < pagination?.totalPages) {
            const nextPage = pagination.currentPage + 1;
            await fetchAuctions(nextPage, 12, filters);
        }
    };

    // Update filters and refresh auctions
    const updateFilters = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        fetchAuctions(1, 12, updatedFilters);
    };

    // Handle URL parameters on initial load
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);

        // Build categories array from BOTH singular and plural params
        let categories = [];

        const categoryParam = searchParams.get('category');       // singular
        const subcategoryParam = searchParams.get('subcategory'); // singular

        if (categoryParam) categories.push(categoryParam);
        if (subcategoryParam) categories.push(subcategoryParam);

        const categoriesParam = searchParams.get('categories');   // plural (backward compat)
        if (categoriesParam) {
            categories = categories.concat(
                categoriesParam.split(',').filter(cat => cat.trim() !== '')
            );
        }

        const urlFilters = {
            categories,                                          // ← now correctly populated
            status: searchParams.get('status') || 'active',
            search: searchParams.get('search') || '',
            priceMin: searchParams.get('priceMin') || '',
            priceMax: searchParams.get('priceMax') || '',
            location: searchParams.get('location') || '',
            make: searchParams.get('make') || '',
            model: searchParams.get('model') || '',
            yearMin: searchParams.get('yearMin') || '',
            yearMax: searchParams.get('yearMax') || '',
            transmission: searchParams.get('transmission') || '',
            fuelType: searchParams.get('fuelType') || '',
            condition: searchParams.get('condition') || '',
            auctionType: searchParams.get('auctionType') || '',
            allowOffers: searchParams.get('allowOffers') || '',
            sortBy: searchParams.get('sortBy') || 'createdAt',
            sortOrder: searchParams.get('sortOrder') || 'desc'
        };

        setFilters(urlFilters);
        fetchAuctions(1, 12, urlFilters); // always fetches with correct filters
    }, [location.search]);

    return {
        auctions,
        loading,
        loadingMore,
        pagination,
        filters,
        fetchAuctions,
        loadMoreAuctions,
        updateFilters
    };
};