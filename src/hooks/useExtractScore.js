import { useMemo } from 'react'

/**
 * Extrahiert einen Score (0-100) aus einem Analyse-Text (deutsch/englisch).
 * Gibt die Zahl als Integer zurück oder null, falls nicht gefunden.
 */
export default function useExtractScore(analysisText) {
  return useMemo(() => {
    if (!analysisText) return null;
    // RegEx für Score-Erkennung (deutsch/englisch)
    const regex = /(?:score|punkte|bewertung|startup score|rating|result|ergebnis|gesamt|total)[^\d]{0,10}(\d{1,3})(?:\s*\/\s*100|\s*out of\s*100)?/i;
    const match = analysisText.match(regex);
    if (match) {
      const score = parseInt(match[1], 10);
      if (score >= 0 && score <= 100) return score;
    }
    // Fallback: erste Zahl zwischen 0 und 100 im Text
    const fallback = analysisText.match(/\b(\d{1,3})\b/);
    if (fallback) {
      const score = parseInt(fallback[1], 10);
      if (score >= 0 && score <= 100) return score;
    }
    return null;
  }, [analysisText]);
} 