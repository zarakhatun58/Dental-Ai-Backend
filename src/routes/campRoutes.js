import express from 'express';
import controller from '../controllers/campaignController.js';

const router = express.Router();

router.get('/', controller.getAllCampaigns);
router.post('/', controller.createCampaign);
router.put('/:id/status', controller.updateCampaignStatus);
router.post('/:id/duplicate', controller.duplicateCampaign);

export default router;