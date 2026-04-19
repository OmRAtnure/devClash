import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import ProfileRecommendation from '../models/ProfileRecommendation';

const router = Router();

// ─── Helper: Calculate profile completeness score ────────────────────────────
function calculateProfileScore(user: any) {
  const profile = user.profile || {};
  const breakdown: { category: string; score: number; maxScore: number; tips: string[] }[] = [];

  // 1. Basic Info (20 pts)
  let basicScore = 0;
  const basicTips: string[] = [];
  if (user.name && user.name.trim().length > 2) basicScore += 5; else basicTips.push('Add your full name');
  if (profile.headline && profile.headline.length > 10) basicScore += 5; else basicTips.push('Write a compelling headline (e.g., "Full Stack Developer | React & Node.js")');
  if (profile.location) basicScore += 5; else basicTips.push('Add your location to appear in local searches');
  if (profile.profilePhoto) basicScore += 5; else basicTips.push('Upload a professional profile photo — profiles with photos get 21x more views');
  breakdown.push({ category: 'Basic Info', score: basicScore, maxScore: 20, tips: basicTips });

  // 2. About/Summary (15 pts)
  let aboutScore = 0;
  const aboutTips: string[] = [];
  if (profile.summary) {
    if (profile.summary.length >= 200) aboutScore += 15;
    else if (profile.summary.length >= 100) { aboutScore += 10; aboutTips.push('Expand your summary to 200+ chars for best results'); }
    else { aboutScore += 5; aboutTips.push('Your summary is too short — aim for 200+ characters describing your career story'); }
  } else {
    aboutTips.push('Add a professional summary — this is the first thing recruiters read');
  }
  breakdown.push({ category: 'About', score: aboutScore, maxScore: 15, tips: aboutTips });

  // 3. Experience (20 pts)
  let expScore = 0;
  const expTips: string[] = [];
  const experiences = profile.experience || [];
  if (experiences.length >= 2) expScore += 10;
  else if (experiences.length === 1) { expScore += 5; expTips.push('Add more work experience entries'); }
  else expTips.push('Add at least one work experience — even internships count');
  const hasDescriptions = experiences.some((e: any) => e.description && e.description.length > 50);
  if (hasDescriptions) expScore += 5; else if (experiences.length > 0) expTips.push('Add detailed descriptions to your experience entries');
  const hasExpSkills = experiences.some((e: any) => e.skills && e.skills.length > 0);
  if (hasExpSkills) expScore += 5; else if (experiences.length > 0) expTips.push('Tag skills to your experience entries');
  breakdown.push({ category: 'Experience', score: expScore, maxScore: 20, tips: expTips });

  // 4. Education (10 pts)
  let eduScore = 0;
  const eduTips: string[] = [];
  const education = profile.education || [];
  if (education.length >= 1) eduScore += 7; else eduTips.push('Add your education background');
  if (education.some((e: any) => e.fieldOfStudy)) eduScore += 3; else if (education.length > 0) eduTips.push('Add your field of study');
  breakdown.push({ category: 'Education', score: eduScore, maxScore: 10, tips: eduTips });

  // 5. Skills (15 pts)
  let skillScore = 0;
  const skillTips: string[] = [];
  const skills = profile.skills || [];
  if (skills.length >= 5) skillScore += 15;
  else if (skills.length >= 3) { skillScore += 10; skillTips.push(`Add ${5 - skills.length} more skills to reach the recommended 5+`); }
  else if (skills.length >= 1) { skillScore += 5; skillTips.push('Add more skills — profiles with 5+ skills appear in more searches'); }
  else skillTips.push('Add your top 5 skills to get discovered by recruiters');
  breakdown.push({ category: 'Skills', score: skillScore, maxScore: 15, tips: skillTips });

  // 6. Projects & Certifications (10 pts)
  let projScore = 0;
  const projTips: string[] = [];
  if ((profile.projects || []).length >= 1) projScore += 5; else projTips.push('Showcase at least one project');
  if ((profile.certifications || []).length >= 1) projScore += 5; else projTips.push('Add certifications to stand out');
  breakdown.push({ category: 'Projects & Certs', score: projScore, maxScore: 10, tips: projTips });

  // 7. Contact & Links (10 pts)
  let linkScore = 0;
  const linkTips: string[] = [];
  if (profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) linkScore += 5; else linkTips.push('Add links to LinkedIn, GitHub, or portfolio');
  if (profile.phone || profile.website) linkScore += 5; else linkTips.push('Add a phone number or website for easy contact');
  breakdown.push({ category: 'Links & Contact', score: linkScore, maxScore: 10, tips: linkTips });

  const totalScore = breakdown.reduce((sum, b) => sum + b.score, 0);

  return { totalScore, breakdown };
}

// ─── Helper: Build prompt for Groq ──────────────────────────────────────────
function buildProfilePrompt(user: any, scoreData: any) {
  const profile = user.profile || {};
  const weakAreas = scoreData.breakdown
    .filter((b: any) => b.score < b.maxScore)
    .map((b: any) => `${b.category}: ${b.score}/${b.maxScore}`)
    .join(', ');

  return `You are a professional career advisor and LinkedIn profile optimization expert. Analyze this user's profile and provide specific, actionable recommendations to improve their professional presence.

USER PROFILE:
- Name: ${user.name || 'Not set'}
- Headline: ${profile.headline || 'Not set'}
- Summary: ${profile.summary || 'Not set'}
- Location: ${profile.location || 'Not set'}
- Skills: ${(profile.skills || []).map((s: any) => s.name).join(', ') || 'None'}
- Experience entries: ${(profile.experience || []).length}
- Education entries: ${(profile.education || []).length}
- Projects: ${(profile.projects || []).length}
- Certifications: ${(profile.certifications || []).length}
- Has profile photo: ${!!profile.profilePhoto}
- Has LinkedIn URL: ${!!profile.linkedinUrl}
- Has GitHub URL: ${!!profile.githubUrl}
- Profile Score: ${scoreData.totalScore}/100
- Weak Areas: ${weakAreas || 'None'}

INSTRUCTIONS:
Provide exactly 5 recommendations as a JSON array. Each recommendation must have:
- "type": one of "headline", "summary", "skills", "experience", "education", "projects", "certifications", "links", "general"
- "text": A specific, actionable recommendation (2-3 sentences max)
- "confidence": "high", "medium", or "low" based on impact
- "priority": number 1-5 (1 = most important)

Focus on the weakest areas first. Be specific — if suggesting a headline, write an example. If suggesting skills, name specific ones relevant to their profile.

RESPOND WITH ONLY THE JSON ARRAY, no markdown formatting, no explanation.`;
}

// ─── POST /api/ai/profile-scan — Full AI profile analysis ───────────────────
router.post('/profile-scan', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ message: 'User not found.' }); return; }

    const scoreData = calculateProfileScore(user);

    // Check for cached recommendations (not expired)
    const cached = await ProfileRecommendation.findOne({
      userId: req.userId,
      expiresAt: { $gt: new Date() },
    }).sort({ generatedAt: -1 });

    if (cached && !req.body.forceRefresh) {
      res.json({
        success: true,
        source: 'cached',
        profileScore: cached.profileScore,
        scoreBreakdown: cached.scoreBreakdown,
        recommendations: cached.recommendations,
      });
      return;
    }

    // Try Groq AI
    let aiRecommendations: any[] = [];
    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey && groqKey !== 'your_groq_api_key_here') {
      try {
        const prompt = buildProfilePrompt(user, scoreData);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'You are a professional career advisor. Always respond with valid JSON arrays only.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) {
            // Try to parse — handle potential markdown wrapping
            const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            aiRecommendations = JSON.parse(jsonStr);
          }
        }
      } catch (aiErr) {
        console.error('[ai] Groq API error, falling back to rule-based:', aiErr);
      }
    }

    // Fallback to rule-based recommendations if no AI
    if (aiRecommendations.length === 0) {
      let priority = 1;
      for (const section of scoreData.breakdown) {
        for (const tip of section.tips) {
          aiRecommendations.push({
            type: section.category.toLowerCase().replace(/[^a-z]/g, '_'),
            text: tip,
            confidence: section.score === 0 ? 'high' : section.score < section.maxScore / 2 ? 'medium' : 'low',
            priority: priority++,
          });
        }
      }
    }

    // Save to MongoDB
    const saved = await ProfileRecommendation.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        recommendations: aiRecommendations.map((r: any) => ({ ...r, applied: false })),
        profileScore: scoreData.totalScore,
        scoreBreakdown: scoreData.breakdown,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      source: groqKey && groqKey !== 'your_groq_api_key_here' ? 'ai' : 'rules',
      profileScore: saved.profileScore,
      scoreBreakdown: saved.scoreBreakdown,
      recommendations: saved.recommendations,
    });
  } catch (err) {
    console.error('[ai:profile-scan]', err);
    res.status(500).json({ message: 'Failed to analyze profile.' });
  }
});

// ─── GET /api/ai/recommendations — Fetch cached recommendations ─────────────
router.get('/recommendations', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rec = await ProfileRecommendation.findOne({ userId: req.userId }).sort({ generatedAt: -1 });
    if (!rec) {
      res.json({ success: true, profileScore: 0, scoreBreakdown: [], recommendations: [] });
      return;
    }
    res.json({
      success: true,
      profileScore: rec.profileScore,
      scoreBreakdown: rec.scoreBreakdown,
      recommendations: rec.recommendations,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recommendations.' });
  }
});

// ─── PATCH /api/ai/recommendations/:id/dismiss — Mark recommendation applied ─
router.patch('/recommendations/:id/dismiss', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await ProfileRecommendation.updateOne(
      { userId: req.userId, 'recommendations._id': req.params.id },
      { $set: { 'recommendations.$.applied': true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error dismissing recommendation.' });
  }
});

export default router;
