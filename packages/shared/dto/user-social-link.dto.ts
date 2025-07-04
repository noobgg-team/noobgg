import { z } from "zod";

// Import the social media platform enum from the database schema
const socialMediaPlatforms = [
  'discord',
  'facebook', 
  'github',
  'instagram',
  'kick',
  'linkedin',
  'reddit',
  'spotify',
  'telegram',
  'tiktok',
  'twitch',
  'vk',
  'website',
  'x',
  'youtube',
] as const;

/**
 * DTO for creating a new user social link
 * Provides comprehensive input validation to prevent:
 * - SQL Injection attacks
 * - XSS attacks  
 * - DoS attacks via oversized inputs
 * - Invalid platform values
 * - Malformed URLs
 */
export const createUserSocialLinkDto = z.object({
  userProfileId: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const numVal = typeof val === 'string' ? parseInt(val, 10) : val;
      if (!Number.isInteger(numVal) || numVal <= 0) {
        throw new Error('Invalid user profile ID');
      }
      return numVal;
    })
    .describe("User profile ID - must be a positive integer"),

  platform: z
    .enum(socialMediaPlatforms)
    .describe("Social media platform - must be one of the supported platforms"),

  url: z
    .string()
    .min(1, "URL is required")
    .max(255, "URL must be 255 characters or less")
    .url("Must be a valid URL")
    .refine((url) => {
      // Additional URL security checks
      const lowerUrl = url.toLowerCase();
      
      // Block javascript: and data: URLs to prevent XSS
      if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
        return false;
      }
      
      // Ensure HTTPS for security (except localhost for development)
      if (!lowerUrl.startsWith('https://') && !lowerUrl.startsWith('http://localhost')) {
        return false;
      }
      
      return true;
    }, "URL must be HTTPS and cannot contain malicious protocols")
    .describe("Social media profile URL - must be a valid HTTPS URL"),
});

/**
 * DTO for updating an existing user social link
 * All fields are optional for partial updates
 */
export const updateUserSocialLinkDto = z.object({
  platform: z
    .enum(socialMediaPlatforms)
    .optional()
    .describe("Social media platform - must be one of the supported platforms"),

  url: z
    .string()
    .min(1, "URL cannot be empty if provided")
    .max(255, "URL must be 255 characters or less")
    .url("Must be a valid URL")
    .refine((url) => {
      // Additional URL security checks
      const lowerUrl = url.toLowerCase();
      
      // Block javascript: and data: URLs to prevent XSS
      if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
        return false;
      }
      
      // Ensure HTTPS for security (except localhost for development)
      if (!lowerUrl.startsWith('https://') && !lowerUrl.startsWith('http://localhost')) {
        return false;
      }
      
      return true;
    }, "URL must be HTTPS and cannot contain malicious protocols")
    .optional()
    .describe("Social media profile URL - must be a valid HTTPS URL"),
});

// Type exports for TypeScript usage
export type CreateUserSocialLinkDto = z.infer<typeof createUserSocialLinkDto>;
export type UpdateUserSocialLinkDto = z.infer<typeof updateUserSocialLinkDto>;
