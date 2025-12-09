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
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "a1b2c3d4"
 *         first_name:
 *           type: string
 *           example: "Jane"
 *         last_name:
 *           type: string
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "jane@example.com"
 *         email_verified:
 *           type: boolean
 *           example: false
 *       required: [id, first_name, last_name, email]
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
