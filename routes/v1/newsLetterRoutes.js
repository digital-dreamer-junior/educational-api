const express = require('express');
const authController = require('../../controllers/v1/authController');
const NewsLetterController = require('../../controllers/v1/newsLetterController');

const router = express.Router();

/**
 * @swagger
 * /newsletters:
 *   post:
 *     summary: Subscribe to newsletter
 *     description: Subscribe to the platform's newsletter
 *     tags: [Newsletters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to subscribe
 *                 example: user@example.com
 *     responses:
 *       201:
 *         description: Successfully subscribed to newsletter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Successfully subscribed to newsletter
 *       400:
 *         description: Invalid email or already subscribed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', NewsLetterController.createNewsLetter);

router.use(authController.protect);
router.use(authController.restrictTo('admin', 'instructor'));

/**
 * @swagger
 * /newsletters:
 *   get:
 *     summary: Get all newsletter subscribers
 *     description: Get list of all newsletter subscribers (admin and instructor only)
 *     tags: [Newsletters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of newsletter subscribers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: user@example.com
 *                       subscribedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-23T10:00:00Z"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', NewsLetterController.getAllNewsLetters);

module.exports = router;
