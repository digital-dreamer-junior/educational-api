const express = require('express');
const enrollmentController = require('../../controllers/v1/enrollmentController');
const authController = require('../../controllers/v1/authController');

const router = express.Router();

// 🔒 Protect all routes
router.use(authController.protect);

/**
 * @swagger
 * /enrollments/{courseId}:
 *   post:
 *     summary: Enroll in a course
 *     description: Enroll the current user in a specific course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course to enroll in
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Successfully enrolled in course
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
 *                   example: Successfully enrolled in course
 *       400:
 *         description: Invalid course ID or already enrolled
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
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:courseId', enrollmentController.enrollInCourse);

/**
 * @swagger
 * /enrollments/my-enrollments:
 *   get:
 *     summary: Get user's enrollments
 *     description: Get all courses that the current user is enrolled in
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's enrollments
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
 *                     type: object
 *                     properties:
 *                       courseId:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439011
 *                       courseName:
 *                         type: string
 *                         example: Introduction to Programming
 *                       enrolledAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-23T10:00:00Z"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my-enrollments', enrollmentController.getEnrollmentsForUser);

/**
 * @swagger
 * /enrollments/{courseId}/students:
 *   get:
 *     summary: Get course students
 *     description: Get all students enrolled in a specific course (admin/instructor only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course to get students for
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: List of enrolled students
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
 *                       userId:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439012
 *                       userName:
 *                         type: string
 *                         example: John Doe
 *                       enrolledAt:
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
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:courseId/students',
  authController.restrictTo('admin', 'instructor'),
  enrollmentController.getEnrollmentsForCourse
);

/**
 * @swagger
 * /enrollments/{courseId}/unenroll:
 *   delete:
 *     summary: Unenroll from course
 *     description: Remove the current user's enrollment from a specific course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course to unenroll from
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       204:
 *         description: Successfully unenrolled from course
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Course not found or not enrolled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:courseId/unenroll', enrollmentController.unenrollFromCourse);

module.exports = router;
