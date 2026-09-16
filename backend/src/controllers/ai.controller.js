import { GoogleGenAI } from '@google/genai';
import Category from '../models/category.model.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Map field types to JSON Schema types
const mapFieldTypeToSchema = (fieldType, validation, options) => {
    switch (fieldType) {
        case 'number':
            return {
                type: 'number',
                description: validation?.message || 'Numeric value',
            };
        case 'boolean':
            return {
                type: 'string',
                enum: ['true', 'false'],
                description: 'Yes/No value as string',
            };
        case 'select':
            return {
                type: 'string',
                enum: options?.map((o) => o.value) || [],
                description: 'Select one of the allowed values',
            };
        case 'date':
            return {
                type: 'string',
                description: 'Date in YYYY-MM-DD format',
            };
        default:
            return {
                type: 'string',
                description: validation?.message || 'Text value',
            };
    }
};

// Build dynamic schema from category fields
const buildResponseSchema = (categoryFields) => {
    const specProperties = {};
    const requiredSpecs = [];

    categoryFields.forEach((field) => {
        if (field.fieldType === 'file') return;

        specProperties[field.name] = {
            ...mapFieldTypeToSchema(field.fieldType, field.validation, field.options),
            description: field.label + (field.unit ? ` (${field.unit})` : ''),
        };

        if (field.required) {
            requiredSpecs.push(field.name);
        }
    });

    return {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                description: 'A concise, descriptive auction title (max 100 characters)',
            },
            description: {
                type: 'string',
                description: 'A detailed HTML description of the item for the auction listing',
            },
            location: {
                type: 'string',
                description: 'Location if visible in any image, otherwise empty string',
            },
            specifications: {
                type: 'object',
                properties: specProperties,
                ...(requiredSpecs.length > 0 ? { required: requiredSpecs } : {}),
            },
            confidence: {
                type: 'object',
                description: 'Confidence scores (0-100) for each extracted field',
                properties: {
                    title: { type: 'number' },
                    description: { type: 'number' },
                    ...Object.keys(specProperties).reduce((acc, key) => {
                        acc[key] = { type: 'number' };
                        return acc;
                    }, {}),
                },
            },
            categorySuggestion: {
                type: 'object',
                description: 'If AI strongly believes a different category is more appropriate',
                properties: {
                    parentSlug: { type: 'string' },
                    subcategorySlug: { type: 'string' },
                    reason: { type: 'string' },
                    confidence: { type: 'number' },
                },
            },
        },
        required: ['title', 'description', 'specifications'],
    };
};

export const analyzeAuctionImages = async (req, res) => {
    try {
        const { parentCategory, subcategory, prompt } = req.body;
        const files = req.files?.photos || [];

        // Validation
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one image is required',
            });
        }

        if (!subcategory) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory is required',
            });
        }

        // Fetch category fields (with inheritance)
        const category = await Category.findOne({ slug: subcategory, isActive: true });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        const effectiveFields = await category.getEffectiveFields();
        const fieldsForSchema = effectiveFields.filter((f) => f.isActive !== false);

        // Build dynamic response schema
        const responseSchema = buildResponseSchema(fieldsForSchema);

        // Get all parent categories for correction suggestion
        const parentCategories = await Category.find({ level: 0, isActive: true })
            .select('name slug')
            .lean();

        const subcategories = await Category.find({
            parentCategory: category.parentCategory || null,
            level: 1,
            isActive: true,
        })
            .select('name slug')
            .lean();

        // Build the system prompt
        const systemPrompt = `You are an expert auction listing assistant for a vehicle and equipment auction platform.

Analyze the provided images and extract information to populate an auction listing.

USER-PROVIDED CONTEXT:
- Selected Category: ${parentCategory || 'Not specified'}
- Selected Subcategory: ${subcategory}
- User Prompt: ${prompt || 'Extract all visible information'}

AVAILABLE CATEGORIES (for correction suggestion only):
Parent categories: ${parentCategories.map((c) => c.slug).join(', ')}
Subcategories: ${subcategories.map((c) => c.slug).join(', ')}

INSTRUCTIONS:
1. Extract the title, description, and all specification fields from the images.
2. For specification fields, use the exact field names provided in the schema.
3. For select fields, return the option VALUE (not the label).
4. For number fields, return only the numeric value (no units).
5. For boolean fields, return "true" or "false" as a string.
6. Return null for any field you cannot determine from the images.
7. Provide a confidence score (0-100) for each field.
8. If you strongly believe the selected category is wrong based on the images, include a categorySuggestion.
9. NEVER hallucinate values. If you can't read it, return null.
10. The description should be HTML formatted with proper paragraphs.
11. Return the response in the exact JSON structure specified.`;

        // ✅ CORRECT: Every block has explicit `type`, uses snake_case `mime_type`
        const contentBlocks = [
            { type: 'text', text: systemPrompt },
            ...files.map((file) => ({
                type: 'image',
                mime_type: file.mimetype,       // <-- snake_case, NOT mimeType
                data: file.buffer.toString('base64'),
            })),
        ];

        // Call Gemini using the Interactions API
        const interaction = await ai.interactions.create({
            model: 'gemini-3.6-flash',
            input: contentBlocks,
            response_format: [
                {
                    type: 'text',
                    mime_type: 'application/json',
                    schema: responseSchema,
                },
            ],
        });

        // Parse response
        const aiData = JSON.parse(interaction.output_text);

        // Validate and clean specifications
        const cleanedSpecs = {};
        Object.entries(aiData.specifications || {}).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') return;

            const field = fieldsForSchema.find((f) => f.name === key);
            if (!field) return;

            if (field.fieldType === 'boolean') {
                cleanedSpecs[key] = String(value).toLowerCase() === 'true' ? 'true' : 'false';
            } else if (field.fieldType === 'number') {
                const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
                if (!isNaN(num)) cleanedSpecs[key] = String(num);
            } else {
                cleanedSpecs[key] = String(value);
            }
        });

        res.status(200).json({
            success: true,
            data: {
                title: aiData.title || '',
                description: aiData.description || '',
                location: aiData.location || '',
                specifications: cleanedSpecs,
                confidence: aiData.confidence || {},
                categorySuggestion: aiData.categorySuggestion || null,
                categoryFields: fieldsForSchema.map((f) => ({
                    name: f.name,
                    label: f.label,
                    fieldType: f.fieldType,
                    unit: f.unit,
                })),
            },
        });
    } catch (error) {
        console.error('AI analysis error:', error);
        res.status(500).json({
            success: false,
            message:
                error?.error?.message ||
                error?.message ||
                'Failed to analyze images',
        });
    }
};