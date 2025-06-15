import Campaign from "../models/Campaign.js";

// ✅ Create campaign
export const createCampaign = async (req, res) => {
  try {
    const { title, message, audience, scheduledDate } = req.body;

    const campaign = new Campaign({ title, message, audience, scheduledDate });
    await campaign.save();

    res.status(201).json({ message: "Campaign created", campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all campaigns
export const getAllCampaigns = async (_req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update campaign
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndUpdate(id, req.body, { new: true });

    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    res.status(200).json({ message: "Campaign updated", campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete campaign
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    res.status(200).json({ message: "Campaign deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
