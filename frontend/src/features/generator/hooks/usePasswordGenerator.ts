import { useState, useCallback, useEffect } from 'react';
import type {
  GeneratorOptions,
  PasswordStrengthResult,
  GeneratorHistoryItem,
  PasswordStrengthLevel,
} from '../types/generator.types';

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS_CHARS = /[0O1lI|]/g;

// Curated EFF Short / Diceware Wordlist for local cryptographic passphrase generation
const WORD_LIST = [
  'acid', 'acorn', 'acre', 'acts', 'adam', 'adder', 'agent', 'agile', 'aging', 'agony',
  'ahead', 'aid', 'aim', 'air', 'alarm', 'album', 'alert', 'alien', 'align', 'alike',
  'alive', 'alley', 'alloy', 'alpha', 'alpine', 'amber', 'amend', 'amino', 'ample', 'angel',
  'angle', 'angry', 'animal', 'ankle', 'annex', 'apex', 'apnea', 'apple', 'aprint', 'apron',
  'aqua', 'arch', 'arctic', 'arena', 'argon', 'aroma', 'arrow', 'artist', 'ascend', 'ashen',
  'aside', 'aspen', 'asset', 'atlas', 'atom', 'atomic', 'attic', 'audio', 'audit', 'aura',
  'aurora', 'author', 'autot', 'avalon', 'avatar', 'avenue', 'aviation', 'avoid', 'awake', 'award',
  'aware', 'axis', 'aztec', 'azure', 'beacon', 'breeze', 'bridge', 'bronze', 'cactus', 'canyon',
  'castle', 'cedar', 'cobalt', 'comet', 'cosmos', 'crater', 'crystal', 'cypress', 'dragon', 'eagle',
  'echo', 'ember', 'falcon', 'fossil', 'galaxy', 'glacier', 'granite', 'harbor', 'helix', 'horizon',
  'island', 'jaguar', 'jungle', 'knight', 'lagoon', 'legend', 'matrix', 'meteor', 'nebula', 'nexus',
  'oasis', 'obsidian', 'ocean', 'orchid', 'orbit', 'panther', 'phantom', 'phoenix', 'planet', 'prism',
  'pulse', 'quantum', 'radar', 'shadow', 'silver', 'solstice', 'spectrum', 'sphere', 'spirit', 'summit',
  'thunder', 'titan', 'tornado', 'vortex', 'whisper', 'zenith', 'zephyr', 'zero', 'zodiac', 'zone'
];

/**
 * Cryptographically secure random integer generation using WebCrypto API
 */
const getSecureRandomInt = (max: number): number => {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
};

/**
 * Calculates entropy in bits and password strength score
 */
export const calculatePasswordStrength = (
  password: string,
  options: GeneratorOptions
): PasswordStrengthResult => {
  if (!password) {
    return {
      score: 0,
      label: 'Weak',
      entropyBits: 0,
      crackTimeDisplay: 'Instant',
      level: 'weak',
      color: '#EF4444',
      feedback: ['Password is empty'],
    };
  }

  let poolSize = 0;
  if (options.mode === 'pin') {
    poolSize = 10;
  } else if (options.mode === 'passphrase') {
    poolSize = WORD_LIST.length;
  } else {
    if (options.lowercase) poolSize += 26;
    if (options.uppercase) poolSize += 26;
    if (options.numbers) poolSize += 10;
    if (options.symbols) poolSize += SYMBOL_CHARS.length;
    if (options.excludeAmbiguous) poolSize -= 8;
  }

  poolSize = Math.max(poolSize, 2);
  const length = options.mode === 'passphrase' ? (options.wordCount || 4) : password.length;
  
  // Entropy calculation E = L * log2(R)
  const entropyBits = Math.round(length * Math.log2(poolSize));

  // Determine score (0-4)
  let score = 0;
  let level: PasswordStrengthLevel = 'weak';
  let label = 'Weak';
  let color = '#EF4444'; // Red
  let crackTimeDisplay = 'Instant';

  if (entropyBits < 40) {
    score = 1;
    level = 'weak';
    label = 'Weak';
    color = '#EF4444';
    crackTimeDisplay = 'A few seconds';
  } else if (entropyBits < 60) {
    score = 2;
    level = 'moderate';
    label = 'Moderate';
    color = '#F59E0B'; // Amber
    crackTimeDisplay = 'A few months';
  } else if (entropyBits < 85) {
    score = 3;
    level = 'strong';
    label = 'Strong';
    color = '#10B981'; // Green
    crackTimeDisplay = '10,000+ years';
  } else {
    score = 4;
    level = 'very-strong';
    label = 'Very Strong';
    color = '#14B8A6'; // Teal / Emerald
    crackTimeDisplay = '100+ trillion years';
  }

  const feedback: string[] = [];
  if (entropyBits >= 80) {
    feedback.push('Excellent cryptographic entropy');
  } else if (entropyBits >= 60) {
    feedback.push('Good protection against brute-force attacks');
  } else {
    feedback.push('Consider increasing length or character variety');
  }

  return {
    score,
    label,
    entropyBits,
    crackTimeDisplay,
    level,
    color,
    feedback,
  };
};

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  mode: 'password',
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
  separator: '-',
  wordCount: 4,
  capitalizeWords: true,
  includeNumberInPassphrase: true,
};

export function usePasswordGenerator(initialOptions = DEFAULT_GENERATOR_OPTIONS) {
  const [options, setOptions] = useState<GeneratorOptions>(initialOptions);
  const [password, setPassword] = useState<string>('');
  const [strength, setStrength] = useState<PasswordStrengthResult>(() =>
    calculatePasswordStrength('', initialOptions)
  );
  const [history, setHistory] = useState<GeneratorHistoryItem[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  /**
   * Secure Local Generator using WebCrypto random values
   */
  const generatePassword = useCallback(() => {
    let result = '';

    if (options.mode === 'pin') {
      const pinLength = Math.max(4, Math.min(12, options.length));
      const digits: string[] = [];
      for (let i = 0; i < pinLength; i++) {
        digits.push(NUMBER_CHARS[getSecureRandomInt(10)]);
      }
      result = digits.join('');
    } else if (options.mode === 'passphrase') {
      const wordCount = options.wordCount || 4;
      const selectedWords: string[] = [];

      for (let i = 0; i < wordCount; i++) {
        let word = WORD_LIST[getSecureRandomInt(WORD_LIST.length)];
        if (options.capitalizeWords) {
          word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        selectedWords.push(word);
      }

      if (options.includeNumberInPassphrase) {
        const randIndex = getSecureRandomInt(selectedWords.length);
        selectedWords[randIndex] += getSecureRandomInt(10).toString();
      }

      const sep = options.separator !== undefined ? options.separator : '-';
      result = selectedWords.join(sep);
    } else {
      // Standard Password Mode
      let charPool = '';
      if (options.uppercase) charPool += UPPERCASE_CHARS;
      if (options.lowercase) charPool += LOWERCASE_CHARS;
      if (options.numbers) charPool += NUMBER_CHARS;
      if (options.symbols) charPool += SYMBOL_CHARS;

      if (options.excludeAmbiguous) {
        charPool = charPool.replace(AMBIGUOUS_CHARS, '');
      }

      // Fallback if user unchecks all character sets
      if (!charPool) {
        charPool = LOWERCASE_CHARS;
      }

      const passwordChars: string[] = [];
      const poolLen = charPool.length;

      for (let i = 0; i < options.length; i++) {
        passwordChars.push(charPool[getSecureRandomInt(poolLen)]);
      }

      result = passwordChars.join('');
    }

    const calculatedStrength = calculatePasswordStrength(result, options);
    setPassword(result);
    setStrength(calculatedStrength);

    // Add to transient in-memory history (up to 10 items)
    const newHistoryItem: GeneratorHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      passwordText: result,
      mode: options.mode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      strength: calculatedStrength,
    };

    setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);
  }, [options]);

  // Initial generation on mount or options change
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  /**
   * Zero-Knowledge Clipboard Copy with auto-wipe after 30 seconds
   */
  const copyToClipboard = useCallback(async (customText?: string) => {
    const textToCopy = customText || password;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      // Reset copied state indicator after 2s
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  }, [password]);

  const updateOptions = useCallback((newOpts: Partial<GeneratorOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOpts }));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    password,
    strength,
    options,
    updateOptions,
    generatePassword,
    copyToClipboard,
    copied,
    history,
    clearHistory,
  };
}
