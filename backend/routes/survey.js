const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const multer = require('multer');

// Configure multer for memory storage (files will be uploaded directly to Supabase)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /survey - Save survey response
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // Map camelCase fields from frontend to snake_case columns in Supabase
        const dbData = {
            team_name: data.teamName || data.team_name,
            team_members: data.teamMembers || data.team_members,
            building: data.building || null,
            floor: data.floor || null,
            restroom_gender: data.restroom_gender || null,
            door_type: data.door_type || data.door_type || null,
            width: data.width || null,
            depth: data.depth || null,
            photos: data.photos || null,
            grab_bar_type: data.grab_bar_type || data.grab_bar_type || null,
            has_basin: data.has_basin || data.has_basin || null,
            is_basin_usable: data.is_basin_usable || data.is_basin_usable || null,
            basin_height_type: data.basin_height_type || data.basin_height_type || null,
            has_accessible_restroom: data.has_accessible_restroom || data.has_accessible_restroom || null,
        };

        const { error } = await supabase.from("survey_responses").insert(dbData);

        if (error) throw error;

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving survey response:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /survey - Fetch all survey responses (for admin)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("survey_responses")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.status(200).json(data || []);
    } catch (error) {
        console.error('Error fetching survey responses:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /survey/upload - Upload photo
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        // Generate a unique filename or use original? 
        // User provided logic suggests just uploading, but let's use a timestamp prefix to avoid collisions if not handled by frontend
        const fileName = `${Date.now()}_${file.originalname}`;

        const { error: uploadError } = await supabase.storage
            .from("survey-photos")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype
            });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from("survey-photos")
            .getPublicUrl(fileName);

        res.status(200).json({ publicUrl: data.publicUrl });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
