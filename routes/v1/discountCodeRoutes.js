const express = require('express');
const authController = require('../../controllers/v1/authController');
const discountCodeController = require('../../controllers/v1/discountCodeController');

const router = express.Router();

router.use(authController.protect);

/**
 * @swagger
 * /discount-codes/apply:
 *   post:
 *     summary: Apply discount code
 *     description: Apply a discount code to a purchase
 *     tags: [Discount Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - courseId
 *             properties:
 *               code:
 *                 type: string
 *                 description: Discount code to apply
 *                 example: SUMMER2024
 *               courseId:
 *                 type: string
 *                 description: ID of the course to apply discount to
 *                 example: 64c7f1a4bcf1a2b3e8a4567d
 *     responses:
 *       200:
 *         description: Discount applied successfully
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
 *                     discount:
 *                       type: number
 *                       description: Applied discount amount
 *                       example: 20
 *                     finalPrice:
 *                       type: number
 *                       description: Final price after discount
 *                       example: 80
 *       400:
 *         description: Invalid discount code or course
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
 */
router.post('/apply', discountCodeController.applyDiscountCode);

router.use(authController.restrictTo('admin'));

/**
 * @swagger
 * /discount-codes:
 *   post:
 *     summary: Create discount code (Admin)
 *     description: Create a new discount code (admin only)
 *     tags: [Discount Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount
 *               - validFrom
 *               - validTo
 *             properties:
 *               code:
 *                 type: string
 *                 description: Unique discount code
 *                 example: SUMMER2024
 *               discount:
 *                 type: number
 *                 description: Discount percentage
 *                 example: 20
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of validity
 *                 example: "2024-06-01T00:00:00Z"
 *               validTo:
 *                 type: string
 *                 format: date-time
 *                 description: End date of validity
 *                 example: "2024-08-31T23:59:59Z"
 *               maxUses:
 *                 type: integer
 *                 description: Maximum number of times the code can be used
 *                 example: 100
 *               minPurchaseAmount:
 *                 type: number
 *                 description: Minimum purchase amount required
 *                 example: 50
 *     responses:
 *       201:
 *         description: Discount code created successfully
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
 *                     discountCode:
 *                       $ref: '#/components/schemas/DiscountCode'
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
 *   get:
 *     summary: Get all discount codes (Admin)
 *     description: Get all discount codes in the system (admin only)
 *     tags: [Discount Codes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all discount codes
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
 *                     $ref: '#/components/schemas/DiscountCode'
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
  .route('/')
  .post(discountCodeController.createDiscountCode)
  .get(discountCodeController.getAllDiscountCodes);

/**
 * @swagger
 * /discount-codes/{id}:
 *   delete:
 *     summary: Delete discount code (Admin)
 *     description: Delete a specific discount code (admin only)
 *     tags: [Discount Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Discount code ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *     responses:
 *       204:
 *         description: Discount code deleted successfully
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
 *         description: Discount code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   patch:
 *     summary: Update discount code (Admin)
 *     description: Update a specific discount code (admin only)
 *     tags: [Discount Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Discount code ID
 *         example: 64c7f1a4bcf1a2b3e8a4567d
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               discount:
 *                 type: number
 *                 description: Updated discount percentage
 *                 example: 25
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 description: Updated start date
 *                 example: "2024-07-01T00:00:00Z"
 *               validTo:
 *                 type: string
 *                 format: date-time
 *                 description: Updated end date
 *                 example: "2024-09-30T23:59:59Z"
 *               maxUses:
 *                 type: integer
 *                 description: Updated maximum uses
 *                 example: 150
 *               minPurchaseAmount:
 *                 type: number
 *                 description: Updated minimum purchase amount
 *                 example: 75
 *     responses:
 *       200:
 *         description: Discount code updated successfully
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
 *                     discountCode:
 *                       $ref: '#/components/schemas/DiscountCode'
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
 *         description: Discount code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router
  .route('/:id')
  .delete(discountCodeController.deleteDiscountCode)
  .patch(discountCodeController.updateDiscountCodes);

/**
 * @swagger
 * /discount-codes/all:
 *   post:
 *     summary: Set general discount (Admin)
 *     description: Set a general discount for all courses (admin only)
 *     tags: [Discount Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - discount
 *               - validFrom
 *               - validTo
 *             properties:
 *               discount:
 *                 type: number
 *                 description: Discount percentage
 *                 example: 15
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of validity
 *                 example: "2024-06-01T00:00:00Z"
 *               validTo:
 *                 type: string
 *                 format: date-time
 *                 description: End date of validity
 *                 example: "2024-08-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: General discount set successfully
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
 *                   example: General discount applied successfully
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
router.route('/all').post(discountCodeController.setGeneralDiscount);

module.exports = router;
