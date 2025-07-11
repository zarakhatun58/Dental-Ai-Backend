// controllers/campaignController.js

import pool from "../config/db.js";
import { sendNotification } from "../utils/sendNotification.js";


// GET all campaigns
export const getAllCampaigns = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM campaigns ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// POST create a new campaign
export const createCampaign = async (req, res) => {
  try {
    const { name, type, targeting, discount } = req.body;

    const [result] = await pool.query(
      `INSERT INTO campaigns (name, type, status, targeting, sent, opened, responded, booked, revenue, discount)
       VALUES (?, ?, 'scheduled', ?, 0, 0, 0, 0, '$0', ?)`,
      [name, type, targeting, discount]
    );

    const [newCampaign] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [result.insertId]);

    await sendNotification({
     userId: req.userId,
      title: "Campaign Launched",
      type: "campaign",
      context: `Campaign "${name}" targeting "${targeting}" has been launched with a ${discount} offer.`
    });

    res.status(201).json(newCampaign[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create campaign', details: err.message });
  }
};

// PUT update campaign status
export const updateCampaignStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [result] = await pool.query('UPDATE campaigns SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const [updated] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
};

// POST duplicate campaign
export const duplicateCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [id]);
    const original = rows[0];
    if (!original) return res.status(404).json({ error: 'Campaign not found' });

    const [result] = await pool.query(
      `INSERT INTO campaigns (name, type, status, targeting, sent, opened, responded, booked, revenue, discount)
       VALUES (?, ?, 'scheduled', ?, 0, 0, 0, 0, '$0', ?)`,
      [`${original.name} (Copy)`, original.type, original.targeting, original.discount]
    );

    const [newCopy] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [result.insertId]);
    res.status(201).json(newCopy[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to duplicate campaign', details: err.message });
  }
};

export default {
  getAllCampaigns,
  createCampaign,
  updateCampaignStatus,
  duplicateCampaign,
};
