"use strict";
/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication and account access endpoints
 *   - name: Settings
 *     description: Account settings and profile management
 *
 * components:
 *   schemas:
 *
 *     Profile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "6b83cb77-6c56-4338-9093-54fb3bdff9fe"
 *         first_name:
 *           type: string
 *           example: "Jack"
 *         last_name:
 *           type: string
 *           example: "Mwanza"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-12-09T09:46:56.630Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-12-09T09:46:56.630Z"
 *         userId:
 *           type: string
 *           example: "d949e8e0-90a6-4030-957b-cb98ff2565a8"
 *       required:
 *         - id
 *         - first_name
 *         - last_name
 *         - userId
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "d949e8e0-90a6-4030-957b-cb98ff2565a8"
 *         email:
 *           type: string
 *           format: email
 *           example: "test@mail.com"
 *         email_verified_at:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           example: null
 *         last_login:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           example: null
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-12-09T09:46:56.630Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-12-09T09:46:56.630Z"
 *         two_factor_enabled:
 *           type: boolean
 *           example: false
 *         profile:
 *           $ref: '#/components/schemas/Profile'
 *       required:
 *         - id
 *         - email
 *         - created_at
 *         - updated_at
 *         - two_factor_enabled
 *         - profile
 *
 *     AuthTokens:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *         refresh_token:
 *           type: string
 *       required: [access_token, refresh_token]
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Something went wrong"
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Invalid Email or Password"]
 *
 *   responses:
 *     Unauthorized:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */
