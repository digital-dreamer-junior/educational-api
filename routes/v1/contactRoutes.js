const express = require('express');
const authController = require('../../controllers/v1/authController');
const contactController = require('../../controllers/v1/contactController');

const router = express.Router();

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Create a new contact message
 *     description: Send a new contact message to the platform
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the sender
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the sender
 *                 example: john@example.com
 *               message:
 *                 type: string
 *                 description: Contact message content
 *                 example: I have a question about your courses
 *     responses:
 *       201:
 *         description: Contact message created successfully
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
 *                   example: Contact message sent successfully
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', contactController.createContact);

router.use(authController.protect);
router.use(authController.restrictTo('admin', 'instructor'));

/**
 * @swagger
 * /contact:
 *   get:
 *     summary: Get all contact messages
 *     description: Retrieve all contact messages (admin and instructor only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contact messages
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
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439011
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: john@example.com
 *                       message:
 *                         type: string
 *                         example: I have a question about your courses
 *                       createdAt:
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
router.get('/', contactController.getAllContact);

/**
 * @swagger
 * /contact/{id}:
 *   delete:
 *     summary: Delete a contact message
 *     description: Delete a specific contact message (admin and instructor only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the contact message to delete
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       204:
 *         description: Contact message deleted successfully
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
 *       404:
 *         description: Contact message not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', contactController.deleteContact);

/**
 * @swagger
 * /contact/{id}:
 *   get:
 *     summary: Get a specific contact message
 *     description: Retrieve details of a specific contact message (admin and instructor only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the contact message to retrieve
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Contact message details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john@example.com
 *                     message:
 *                       type: string
 *                       example: I have a question about your courses
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-23T10:00:00Z"
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
 *       404:
 *         description: Contact message not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', contactController.getContact);

/**
 * @swagger
 * /contact/{id}/answer:
 *   post:
 *     summary: Answer a contact message
 *     description: Send an answer to a specific contact message (admin and instructor only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the contact message to answer
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answer
 *             properties:
 *               answer:
 *                 type: string
 *                 description: Answer to the contact message
 *                 example: Thank you for your message. We will get back to you soon.
 *     responses:
 *       200:
 *         description: Answer sent successfully
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
 *                   example: Answer sent successfully
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
 *       404:
 *         description: Contact message not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/answer', contactController.answer);

module.exports = router;
