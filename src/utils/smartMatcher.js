const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'my', 'it', 'is', 'was', 'were', 'has', 'have', 'had', 'this', 'that', 'these', 'those',
  'some', 'near', 'from', 'left', 'found', 'lost', 'item', 'please', 'help', 'street', 'road', 'ave'
]);

/**
 * Normalizes text and extracts informative word tokens.
 */
function extractTokens(text = '') {
  if (!text) return new Set();
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

/**
 * Computes Dice Similarity Coefficient between two token sets.
 */
function computeDiceSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionCount++;
    }
  }
  return (2 * intersectionCount) / (setA.size + setB.size);
}

/**
 * Computes date proximity score based on the day difference.
 */
function computeDateProximity(dateStrA, dateStrB) {
  if (!dateStrA || !dateStrB) return 0.5;
  const timeA = new Date(dateStrA).getTime();
  const timeB = new Date(dateStrB).getTime();
  if (isNaN(timeA) || isNaN(timeB)) return 0.5;

  const diffDays = Math.abs(timeA - timeB) / (1000 * 60 * 60 * 24);
  if (diffDays <= 0.5) return 1.0;
  if (diffDays <= 1.5) return 0.85;
  if (diffDays <= 3.5) return 0.6;
  if (diffDays <= 7.0) return 0.3;
  return 0.1;
}

/**
 * Calculates a multi-factor match score between two items.
 */
export function calculateMatchScore(itemA, itemB) {
  if (itemA.type === itemB.type) {
    return { score: 0, percentage: 0, breakdown: {}, isPotentialMatch: false };
  }

  // 1. Category Score (35%)
  const catScore = itemA.category === itemB.category ? 1.0 : 0.0;

  // 2. Text Similarity on Title & Description (35%)
  const tokensA = extractTokens(`${itemA.title} ${itemA.description}`);
  const tokensB = extractTokens(`${itemB.title} ${itemB.description}`);
  const textScore = computeDiceSimilarity(tokensA, tokensB);

  // 3. Location / Address Similarity (20%)
  let locScore = 0.0;
  if (itemA.location && itemB.location) {
    const locTokensA = extractTokens(itemA.location);
    const locTokensB = extractTokens(itemB.location);
    locScore = computeDiceSimilarity(locTokensA, locTokensB);

    const textLocA = itemA.location.toLowerCase();
    const textLocB = itemB.location.toLowerCase();
    if (textLocA.includes(textLocB) || textLocB.includes(textLocA)) {
      locScore = Math.max(locScore, 0.85);
    }
  }

  // 4. Date Proximity Score (10%)
  const dateScore = computeDateProximity(itemA.date, itemB.date);

  const finalScore = (catScore * 0.35) + (textScore * 0.35) + (locScore * 0.20) + (dateScore * 0.10);
  const percentage = Math.round(finalScore * 100);

  return {
    score: finalScore,
    percentage,
    breakdown: {
      category: Math.round(catScore * 100),
      text: Math.round(textScore * 100),
      location: Math.round(locScore * 100),
      date: Math.round(dateScore * 100)
    },
    isPotentialMatch: percentage >= 35
  };
}

/**
 * Finds and ranks all potential matching items for a target report.
 */
export function findMatchesForReport(targetItem, candidates = [], minPercentage = 30) {
  if (!targetItem || !Array.isArray(candidates)) return [];

  return candidates
    .filter(item => item.id !== targetItem.id && item.type !== targetItem.type && item.status !== 'returned')
    .map(candidate => {
      const match = calculateMatchScore(targetItem, candidate);
      return {
        ...candidate,
        matchScore: match.percentage,
        matchDetails: match
      };
    })
    .filter(item => item.matchScore >= minPercentage)
    .sort((a, b) => b.matchScore - a.matchScore);
}
