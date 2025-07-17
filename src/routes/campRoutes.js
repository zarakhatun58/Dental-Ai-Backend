import express from 'express';
import controller from '../controllers/campaignController.js';

const router = express.Router();

router.get('/', controller.getAllCampaigns);
router.post('/', controller.createCampaign);
router.delete('/:id', controller.deleteCampaign);
router.put('/:id/status', controller.updateCampaign);
router.post('/:id/duplicate', controller.duplicateCampaign);
router.post('/:id/regenerate', controller.regenerateMessage);
router.get('/:id/history', controller.getMessageHistory);


export default router;