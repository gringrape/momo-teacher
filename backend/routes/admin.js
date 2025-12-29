const express = require('express');
const router = express.Router();
const { adminSupabase } = require('../adminSupabaseClient');

// Helper to handle async route errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ============================================
// Schools API
// ============================================

// GET /api/admin/schools-in-progress
router.get('/schools-in-progress', asyncHandler(async (req, res) => {
    const { data, error } = await adminSupabase
        .from("schools_in_progress")
        .select("*")
        .order("approved_at", { ascending: false });
    if (error) throw error;
    res.json(data);
}));

// GET /api/admin/school-progress
router.get('/school-progress', asyncHandler(async (req, res) => {
    const { data, error } = await adminSupabase.from("school_progress").select("*");
    if (error) throw error;
    res.json(data);
}));

// ============================================
// Survey Data API
// ============================================

// GET /api/admin/survey-counts
router.get('/survey-counts', asyncHandler(async (req, res) => {
    const { data, error } = await adminSupabase
        .from("survey_data")
        .select("school_id, category");
    if (error) throw error;

    const counts = {};
    data.forEach(item => {
        if (!counts[item.school_id]) {
            counts[item.school_id] = {};
        }
        counts[item.school_id][item.category] = (counts[item.school_id][item.category] || 0) + 1;
    });
    res.json(counts);
}));

// GET /api/admin/survey-data/:schoolId
router.get('/survey-data/:schoolId', asyncHandler(async (req, res) => {
    const { schoolId } = req.params;
    const { category } = req.query;

    let query = adminSupabase
        .from("survey_data")
        .select("*")
        .eq("school_id", schoolId)
        .order("submitted_at", { ascending: false });

    if (category) {
        query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
}));

// GET /api/admin/approved-toilet-surveys
router.get('/approved-toilet-surveys', asyncHandler(async (req, res) => {
    const { data, error } = await adminSupabase
        .from("survey_data")
        .select(`
            id,
            school_id,
            data,
            photo_urls,
            submitted_at,
            schools_in_progress (school_name)
        `)
        .eq("category", "toilet")
        .eq("status", "approved")
        .order("submitted_at", { ascending: false });
    if (error) throw error;
    res.json(data);
}));

// GET /api/admin/toilet-surveys-results
router.get('/toilet-surveys-results', asyncHandler(async (req, res) => {
    const { data, error } = await adminSupabase
        .from("survey_data")
        .select(`
            id,
            school_id,
            data,
            photo_urls,
            submitted_at,
            status,
            schools_in_progress (
                school_name
            )
        `)
        .eq("category", "toilet")
        .eq("status", "approved");
    if (error) throw error;
    res.json(data);
}));

// DELETE /api/admin/survey-data/:id
router.delete('/survey-data/:id', asyncHandler(async (req, res) => {
    const { error } = await adminSupabase.from("survey_data").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
}));

// PUT /api/admin/survey-data/:id/status
router.put('/survey-data/:id/status', asyncHandler(async (req, res) => {
    const { status, reviewNote, reviewedBy } = req.body;
    const { error } = await adminSupabase
        .from("survey_data")
        .update({
            status,
            review_note: reviewNote,
            reviewed_at: new Date().toISOString(),
            reviewed_by: reviewedBy,
        })
        .eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
}));

// ============================================
// Evaluations API
// ============================================

// GET /api/admin/evaluations/completed
router.get('/evaluations/completed', asyncHandler(async (req, res) => {
    const { data, error } = await adminSupabase
        .from("evaluations")
        .select(`
            id,
            evaluator_name,
            overall_comment,
            rating,
            completed_at,
            session_id,
            evaluation_sessions (
                id,
                evaluator_group,
                school_id,
                toilet_survey_id,
                schools_in_progress (
                    school_name
                )
            )
        `)
        .eq("is_completed", true)
        .order("completed_at", { ascending: false });
    if (error) throw error;
    res.json(data);
}));

// GET /api/admin/evaluation-sessions
router.get('/evaluation-sessions', asyncHandler(async (req, res) => {
    const { data, error } = await adminSupabase
        .from("evaluation_sessions")
        .select(`
            *,
            evaluations (
                id,
                evaluator_name,
                rating,
                overall_comment,
                is_completed
            )
        `)
        .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
}));

// GET /api/admin/evaluation-criteria
router.get('/evaluation-criteria', asyncHandler(async (req, res) => {
    const { data, error } = await adminSupabase
        .from("evaluation_criteria")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
    if (error) throw error;
    res.json(data);
}));

// POST /api/admin/evaluation-sessions (create)
router.post('/evaluation-sessions', asyncHandler(async (req, res) => {
    const { surveyId, schoolId, group, userId } = req.body;
    const { data, error } = await adminSupabase
        .from("evaluation_sessions")
        .insert({
            toilet_survey_id: surveyId,
            school_id: schoolId,
            evaluator_group: group,
            created_by: userId,
        })
        .select()
        .single();
    if (error) throw error;
    res.json(data);
}));

// DELETE /api/admin/evaluation-sessions/:id
router.delete('/evaluation-sessions/:id', asyncHandler(async (req, res) => {
    const { error } = await adminSupabase
        .from("evaluation_sessions")
        .delete()
        .eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
}));

// ============================================
// Applications API
// ============================================

// POST /api/admin/applications
router.post('/applications', asyncHandler(async (req, res) => {
    const { error } = await adminSupabase.from("applications").insert(req.body);
    if (error) throw error;
    res.json({ success: true });
}));

// ============================================
// Announcements API
// ============================================

// GET /api/admin/announcements/:id
router.get('/announcements/:id', asyncHandler(async (req, res) => {
    const { data, error } = await adminSupabase
        .from("announcements")
        .select("*")
        .eq("id", req.params.id)
        .eq("is_active", true)
        .maybeSingle();
    if (error) throw error;
    res.json(data);
}));

// ============================================
// Accessibility Guides API
// ============================================

// GET /api/admin/accessibility-guides
router.get('/accessibility-guides', asyncHandler(async (req, res) => {
    const { data, error } = await adminSupabase
        .from("accessibility_guides")
        .select(`
            *,
            schools_in_progress (
                school_name,
                contact_phone,
                contact_email
            )
        `)
        .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
}));

// POST /api/admin/accessibility-guides
router.post('/accessibility-guides', asyncHandler(async (req, res) => {
    const { schoolId } = req.body;
    const { data, error } = await adminSupabase
        .from("accessibility_guides")
        .insert({ school_id: schoolId })
        .select(`
            *,
            schools_in_progress (
                school_name,
                contact_phone,
                contact_email
            )
        `)
        .single();
    if (error) throw error;
    res.json(data);
}));

// PUT /api/admin/accessibility-guides/:id
router.put('/accessibility-guides/:id', asyncHandler(async (req, res) => {
    const { error } = await adminSupabase
        .from("accessibility_guides")
        .update(req.body)
        .eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
}));

// PUT /api/admin/accessibility-guides/:id/publish
router.put('/accessibility-guides/:id/publish', asyncHandler(async (req, res) => {
    const { publish } = req.body;
    const { error } = await adminSupabase
        .from("accessibility_guides")
        .update({
            is_published: publish,
            published_at: publish ? new Date().toISOString() : null,
        })
        .eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
}));

module.exports = router;
