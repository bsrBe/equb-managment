import { ApiError } from '../types/equb.types';

/**
 * Formats backend error messages into a user-friendly string.
 * Handles NestJS validation errors (arrays of messages) and single string messages.
 */
export const formatErrorMessage = (error: any): string => {
    // If it's a known ApiError structure
    const apiError = error as ApiError;
    
    if (apiError.response?.data?.message) {
        const message = apiError.response.data.message;
        
        // NestJS ValidationPipe often returns an array of messages
        if (Array.isArray(message)) {
            // Join with a dot and space for better readability, and capitalize first letters
            return message
                .map(msg => msg.charAt(0).toUpperCase() + msg.slice(1))
                .join('. ') + '.';
        }
        
        return message;
    }

    // Fallback for axios errors without a data message
    if (error.message) {
        if (error.message === 'Network Error') {
            return 'Unable to connect to the server. Please check your internet connection.';
        }
        return error.message;
    }

    return 'An unexpected error occurred. Please try again later.';
};
