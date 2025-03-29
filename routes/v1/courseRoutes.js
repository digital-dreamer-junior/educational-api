const express = require('express');
const courseController = require('../../controllers/v1/courseController');
const mediaController = require('../../controllers/v1/mediaController');
const upload = require('../../utils/uploder');
const authController = require('../../controllers/v1/authController');
const factory = require('../../controllers/v1/handlerFactory');
const Section = require('../../models/sectionModel');
// const Session = require('../../models/sessionModel');
const sessionController = require('./../../controllers/v1/sessionController');

const router = express.Router();

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     description: Retrieve a list of all available courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses retrieved successfully
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
 *                     $ref: '#/components/schemas/Course'
 */
router.get('/', courseController.getAllCourses);

/**
 * @swagger
 * /courses/{slug}:
 *   get:
 *     summary: Get course by slug
 *     description: Retrieve a specific course by its slug
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Course slug
 *         example: complete-nodejs-course
 *     responses:
 *       200:
 *         description: Course retrieved successfully
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
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:slug', courseController.getCourse);

/**
 * @swagger
 * /courses/{courseId}/full:
 *   get:
 *     summary: Get course with sections and sessions
 *     description: Retrieve a course with all its sections and sessions
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *     responses:
 *       200:
 *         description: Course with sections and sessions retrieved successfully
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
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *                     sections:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Section'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:courseId/full', courseController.getCourseWithSections);

// 🔒 Protect all routes
router.use(authController.protect);

// 🔒 Restrict routes below to admin and instructors only
router.use(authController.restrictTo('admin', 'instructor'));

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     description: Create a new course (admin and instructors only)
 *     tags: [Courses]
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
 *               - description
 *               - price
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: Course title
 *                 example: Complete Node.js Course
 *               description:
 *                 type: string
 *                 description: Course description
 *                 example: Learn Node.js from scratch to advanced concepts
 *               price:
 *                 type: number
 *                 description: Course price
 *                 example: 99.99
 *               category:
 *                 type: string
 *                 description: Course category
 *                 example: Backend Development
 *     responses:
 *       201:
 *         description: Course created successfully
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
 *                     course:
 *                       $ref: '#/components/schemas/Course'
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
router.post('/', upload.none(), courseController.createCourse);

/**
 * @swagger
 * /courses/upload-course-media/{courseId}:
 *   post:
 *     summary: Upload course media
 *     description: Upload course cover image and promo video (admin and instructors only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Course cover image
 *               promoVideo:
 *                 type: string
 *                 format: binary
 *                 description: Course promo video
 *     responses:
 *       200:
 *         description: Media uploaded successfully
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
 *                     course:
 *                       $ref: '#/components/schemas/Course'
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
router.post(
  '/upload-course-media/:courseId',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'promoVideo', maxCount: 1 },
  ]),
  mediaController.uploadCourseMedia
);

/**
 * @swagger
 * /courses/{id}:
 *   patch:
 *     summary: Update course
 *     description: Update a specific course (admin and instructors only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Course title
 *                 example: Complete Node.js Course
 *               description:
 *                 type: string
 *                 description: Course description
 *                 example: Learn Node.js from scratch to advanced concepts
 *               price:
 *                 type: number
 *                 description: Course price
 *                 example: 99.99
 *               category:
 *                 type: string
 *                 description: Course category
 *                 example: Backend Development
 *     responses:
 *       200:
 *         description: Course updated successfully
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
 *                     course:
 *                       $ref: '#/components/schemas/Course'
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
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete course
 *     description: Delete a specific course (admin and instructors only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *     responses:
 *       204:
 *         description: Course deleted successfully
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
router.patch('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

/**
 * @swagger
 * /courses/category/{href}:
 *   get:
 *     summary: Get courses by category
 *     description: Retrieve all courses in a specific category
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: href
 *         required: true
 *         schema:
 *           type: string
 *         description: Category href
 *         example: backend-development
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
 *                     $ref: '#/components/schemas/Course'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/category/:href', courseController.getCoursesByCategory);

/**
 * @swagger
 * /courses/{slug}/related:
 *   get:
 *     summary: Get related courses
 *     description: Retrieve courses related to a specific course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Course slug
 *         example: complete-nodejs-course
 *     responses:
 *       200:
 *         description: Related courses retrieved successfully
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
 *                     $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:slug/related', courseController.getRelatedCourses);

// ---- SECTIONS ----

/**
 * @swagger
 * /courses/{courseId}/sections:
 *   get:
 *     summary: Get course sections
 *     description: Retrieve all sections of a specific course
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *     responses:
 *       200:
 *         description: Sections retrieved successfully
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
 *                     $ref: '#/components/schemas/Section'
 *   post:
 *     summary: Create course section
 *     description: Create a new section for a specific course (admin and instructors only)
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Section title
 *                 example: Introduction to Node.js
 *               description:
 *                 type: string
 *                 description: Section description
 *                 example: Learn the basics of Node.js
 *     responses:
 *       201:
 *         description: Section created successfully
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
 *                     section:
 *                       $ref: '#/components/schemas/Section'
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
router
  .route('/:courseId/sections')
  .get(courseController.getCourseSections, factory.getAll(Section))
  .post(courseController.createSection);

/**
 * @swagger
 * /courses/{courseId}/{id}:
 *   get:
 *     summary: Get section
 *     description: Retrieve a specific section of a course
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *         example: 64c7f1a4bcf1a2b3e8a4567e
 *     responses:
 *       200:
 *         description: Section retrieved successfully
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
 *                     section:
 *                       $ref: '#/components/schemas/Section'
 *   patch:
 *     summary: Update section
 *     description: Update a specific section (admin and instructors only)
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *         example: 64c7f1a4bcf1a2b3e8a4567e
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Section title
 *                 example: Introduction to Node.js
 *               description:
 *                 type: string
 *                 description: Section description
 *                 example: Learn the basics of Node.js
 *     responses:
 *       200:
 *         description: Section updated successfully
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
 *                     section:
 *                       $ref: '#/components/schemas/Section'
 *   delete:
 *     summary: Delete section
 *     description: Delete a specific section (admin and instructors only)
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *         example: 64c7f1a4bcf1a2b3e8a4567e
 *     responses:
 *       204:
 *         description: Section deleted successfully
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
 *         description: Section not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router
  .route('/:courseId/:id')
  .get(courseController.getSection)
  .patch(courseController.updateSection)
  .delete(courseController.deleteSection);

// ---- SESSIONS ----

/**
 * @swagger
 * /courses/{courseId}/sections/{sectionId}/sessions:
 *   get:
 *     summary: Get section sessions
 *     description: Retrieve all sessions of a specific section
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *         example: 64c7f1a4bcf1a2b3e8a4567e
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
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
 *                     $ref: '#/components/schemas/Session'
 *   post:
 *     summary: Create session
 *     description: Create a new session for a specific section (admin and instructors only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *         example: 64c7f1a4bcf1a2b3e8a4567e
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Session title
 *                 example: Node.js Installation
 *               description:
 *                 type: string
 *                 description: Session description
 *                 example: Learn how to install Node.js on your system
 *     responses:
 *       201:
 *         description: Session created successfully
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
 *                     session:
 *                       $ref: '#/components/schemas/Session'
 */
router
  .route('/:courseId/sections/:sectionId/sessions')
  .post(sessionController.createSession)
  .get(sessionController.getAllSessions);

/**
 * @swagger
 * /courses/{courseId}/sections/{sectionId}/sessions/{id}:
 *   get:
 *     summary: Get session
 *     description: Retrieve a specific session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *         example: 64c7f1a4bcf1a2b3e8a4567e
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: 64c7f1a4bcf1a2b3e8a4567f
 *     responses:
 *       200:
 *         description: Session retrieved successfully
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
 *                     session:
 *                       $ref: '#/components/schemas/Session'
 *   patch:
 *     summary: Update session
 *     description: Update a specific session (admin and instructors only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *         example: 64c7f1a4bcf1a2b3e8a4567e
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: 64c7f1a4bcf1a2b3e8a4567f
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Session title
 *                 example: Node.js Installation
 *               description:
 *                 type: string
 *                 description: Session description
 *                 example: Learn how to install Node.js on your system
 *     responses:
 *       200:
 *         description: Session updated successfully
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
 *                     session:
 *                       $ref: '#/components/schemas/Session'
 *   delete:
 *     summary: Delete session
 *     description: Delete a specific session (admin and instructors only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *         example: 64c7f1a4bcf1a2b3e8a4567e
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: 64c7f1a4bcf1a2b3e8a4567f
 *     responses:
 *       204:
 *         description: Session deleted successfully
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
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router
  .route('/:courseId/sections/:sectionId/sessions/:id')
  .get(sessionController.getSession)
  .patch(sessionController.updateSession)
  .delete(sessionController.deleteSession);

/**
 * @swagger
 * /courses/{courseId}/sections/{sectionId}/sessions/{sessionId}/upload:
 *   post:
 *     summary: Upload session video
 *     description: Upload video for a specific session (admin and instructors only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *         example: 64c7f1a4bcf1a2b3e8a4567e
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: 64c7f1a4bcf1a2b3e8a4567f
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sessionVideo:
 *                 type: string
 *                 format: binary
 *                 description: Session video file
 *     responses:
 *       200:
 *         description: Video uploaded successfully
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
 *                     session:
 *                       $ref: '#/components/schemas/Session'
 */
router.post(
  '/:courseId/sections/:sectionId/sessions/:sessionId/upload',
  upload.single('sessionVideo'),
  sessionController.uploadSessionVideo
);

/**
 * @swagger
 * /courses/{courseId}/sections/{sectionId}/sessions/{sessionId}/delete-video:
 *   delete:
 *     summary: Delete session video
 *     description: Delete video of a specific session (admin and instructors only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *         example: 64c7f1a4bcf1a2b3e8a4567e
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: 64c7f1a4bcf1a2b3e8a4567f
 *     responses:
 *       200:
 *         description: Video deleted successfully
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
 *                     session:
 *                       $ref: '#/components/schemas/Session'
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
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:courseId/sections/:sectionId/sessions/:sessionId/delete-video',
  sessionController.deleteSessionVideo
);

module.exports = router;
