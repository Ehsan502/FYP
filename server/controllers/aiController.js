import User from '../models/User.js';

/**
 * @desc    Calculate AI Compatibility Score between two users
 * @route   POST /api/ai/compatibility
 * @access  Private
 */
export const calculateCompatibility = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user._id || req.user.id;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target User ID is required' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Calculate Skill Complementarity
    const myNeeds = currentUser.skillsToLearn || currentUser.skillsWanted || [];
    const theirOffers = targetUser.skillsToTeach || targetUser.skillsOffered || [];
    
    const myOffers = currentUser.skillsToTeach || currentUser.skillsOffered || [];
    const theirNeeds = targetUser.skillsToLearn || targetUser.skillsWanted || [];

    const directMatch = myNeeds.filter(skill => 
      theirOffers.some(offer => offer.toLowerCase().trim() === skill.toLowerCase().trim())
    );

    const reverseMatch = myOffers.filter(skill => 
      theirNeeds.some(need => need.toLowerCase().trim() === skill.toLowerCase().trim())
    );

    // 2. Score Calculation Algorithm
    let score = 50;

    if (directMatch.length > 0) score += 25;
    if (reverseMatch.length > 0) score += 15;

    if (currentUser.experienceLevel && targetUser.experienceLevel) {
      if (currentUser.experienceLevel === targetUser.experienceLevel) {
        score += 5;
      }
    }

    if (targetUser.averageRating) {
      score += Math.min(targetUser.averageRating * 2, 10);
    }

    const finalScore = Math.min(Math.round(score), 99);

    // 3. AI Explanation Reasoning
    let breakdown = [];
    if (directMatch.length > 0) {
      breakdown.push(`They can teach you: ${directMatch.join(', ')}`);
    }
    if (reverseMatch.length > 0) {
      breakdown.push(`You can teach them: ${reverseMatch.join(', ')}`);
    }
    if (breakdown.length === 0) {
      breakdown.push('Potential cross-domain skill exchange opportunity.');
    }

    return res.status(200).json({
      success: true,
      compatibilityScore: finalScore,
      directMatches: directMatch,
      reverseMatches: reverseMatch,
      breakdown,
      aiSummary: `You have a ${finalScore}% compatibility match with ${targetUser.name} based on skill requirements, rating history, and experience alignment.`
    });

  } catch (error) {
    console.error('AI Compatibility Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error calculating compatibility score',
      error: error.message
    });
  }
};