const express = require('express');
const notificationController = require('../../controllers/v1/notificationController');
const authController = require('../../controllers/v1/authController');

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo('admin', 'instructor'));

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create notification
 *     description: Create a new notification (admin and instructor only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - recipients
 *             properties:
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: New Course Available
 *               message:
 *                 type: string
 *                 description: Notification message
 *                 example: A new course has been added to our platform
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to receive the notification
 *                 example: ["64c7f1a4bcf1a2b3e8a4567d", "64c7f1a4bcf1a2b3e8a4567e"]
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error]
 *                 description: Notification type
 *                 example: info
 *     responses:
 *       201:
 *         description: Notification created successfully
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
 *                     notification:
 *                       $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
router.route('/').post(notificationController.createNotification);

/**
 * @swagger
 * /notifications/received:
 *   get:
 *     summary: Get received notifications
 *     description: Get all notifications received by the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of received notifications
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
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
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
router.get('/received', notificationController.getReceivedNotifications);

/**
 * @swagger
 * /notifications/sent:
 *   get:
 *     summary: Get sent notifications
 *     description: Get all notifications sent by the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sent notifications
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
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
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
router.get('/sent', notificationController.getSentNotifications);

/**
 * @swagger
 * /notifications/{notificationId}:
 *   get:
 *     summary: Get notification by ID
 *     description: Get details of a specific notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *     responses:
 *       200:
 *         description: Notification details
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
 *                     notification:
 *                       $ref: '#/components/schemas/Notification'
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
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete notification
 *     description: Delete a specific notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *     responses:
 *       204:
 *         description: Notification deleted successfully
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
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:notificationId', notificationController.getNotification);
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
