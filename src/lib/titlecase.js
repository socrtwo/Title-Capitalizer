/*
 * Title Capitalizer - capitalization engine
 *
 * Implements the title case style guides used by the Capitalize My Title
 * service (https://capitalizemytitle.com) plus a handful of related case
 * conversion utilities. Eight style guides are supported: AP, APA, Chicago,
 * MLA, New York Times, Wikipedia, Bluebook, and AMA. Each guide has its own
 * rules about which short words to lowercase, which words to always
 * capitalize, and how to treat hyphenated compounds, the first/last word,
 * and the word following a colon, em-dash, or question mark.
 */

(function (root) {
  'use strict';

  // -------------------------------------------------------------------------
  // Word lists shared across style guides
  // -------------------------------------------------------------------------

  // Articles
  var ARTICLES = ['a', 'an', 'the'];

  // Coordinating conjunctions
  var COORDINATING_CONJUNCTIONS = ['and', 'but', 'or', 'nor', 'for', 'so', 'yet'];

  // Common short prepositions (<= 3 letters)
  var SHORT_PREPOSITIONS = [
    'as', 'at', 'by', 'in', 'of', 'off', 'on', 'out', 'per', 'to', 'up', 'via'
  ];

  // Common 4-letter prepositions
  var FOUR_LETTER_PREPOSITIONS = [
    'amid', 'atop', 'down', 'from', 'into', 'like', 'near', 'next',
    'onto', 'over', 'past', 'plus', 'save', 'than', 'till', 'unto',
    'upon', 'with'
  ];

  // 5+ letter prepositions (always capitalized in styles that only
  // lowercase short prepositions)
  var LONG_PREPOSITIONS = [
    'about', 'above', 'across', 'after', 'against', 'along', 'among',
    'around', 'before', 'behind', 'below', 'beneath', 'beside', 'between',
    'beyond', 'during', 'except', 'inside', 'outside', 'through', 'toward',
    'towards', 'under', 'underneath', 'until', 'within', 'without'
  ];

  // Subordinating conjunctions (used by some guides)
  var SUBORDINATING_CONJUNCTIONS = [
    'after', 'although', 'as', 'because', 'before', 'if', 'once', 'since',
    'than', 'that', 'though', 'till', 'unless', 'until', 'when', 'where',
    'whether', 'while'
  ];

  // -------------------------------------------------------------------------
  // Style-specific configurations
  //
  // Each style is described by a small data object. A word is lowercased if
  // it appears in `lowercaseWords` (and is not in `alwaysCapitalize`), unless
  // it is forced to capitalize because it is the first or last word of the
  // title (or, optionally, the first word after a colon/dash/question mark).
  // -------------------------------------------------------------------------

  var STYLES = {
    // Associated Press: lowercase articles, conjunctions and prepositions of
    // three letters or fewer.
    ap: {
      name: 'AP',
      lowercaseWords: union(ARTICLES, COORDINATING_CONJUNCTIONS, SHORT_PREPOSITIONS),
      maxLowercaseLength: 3,
      capitalizeFirstAfterColon: true,
      capitalizeAfterHyphen: true,
      alwaysCapitalize: ['is', 'be', 'are', 'was', 'were', 'been', 'being'],
      alwaysLowercase: []
    },

    // American Psychological Association: capitalize words of four letters
    // or more, plus all major words.
    apa: {
      name: 'APA',
      lowercaseWords: union(
        ARTICLES,
        COORDINATING_CONJUNCTIONS,
        SHORT_PREPOSITIONS,
        ['as']
      ),
      maxLowercaseLength: 3,
      capitalizeFirstAfterColon: true,
      capitalizeFirstAfterDash: true,
      capitalizeAfterHyphen: true,
      alwaysCapitalize: [],
      alwaysLowercase: []
    },

    // Chicago Manual of Style: lowercase articles, coordinating conjunctions,
    // and prepositions regardless of length. "To" is lowercased even when
    // not part of an infinitive.
    chicago: {
      name: 'Chicago',
      lowercaseWords: union(
        ARTICLES,
        COORDINATING_CONJUNCTIONS,
        SHORT_PREPOSITIONS,
        FOUR_LETTER_PREPOSITIONS,
        LONG_PREPOSITIONS,
        ['as']
      ),
      maxLowercaseLength: Infinity,
      capitalizeFirstAfterColon: true,
      capitalizeAfterHyphen: true,
      alwaysCapitalize: ['is', 'be', 'are', 'was', 'were'],
      alwaysLowercase: []
    },

    // Modern Language Association: similar to Chicago but does not lowercase
    // subordinating conjunctions.
    mla: {
      name: 'MLA',
      lowercaseWords: union(
        ARTICLES,
        COORDINATING_CONJUNCTIONS,
        SHORT_PREPOSITIONS,
        FOUR_LETTER_PREPOSITIONS,
        LONG_PREPOSITIONS
      ),
      maxLowercaseLength: Infinity,
      capitalizeFirstAfterColon: true,
      capitalizeAfterHyphen: true,
      alwaysCapitalize: ['is', 'be', 'are', 'was', 'were'],
      alwaysLowercase: []
    },

    // New York Times: similar to AP, but also capitalizes "no", "nor", and
    // "not", and a number of short verbs.
    nyt: {
      name: 'NY Times',
      lowercaseWords: subtract(
        union(ARTICLES, COORDINATING_CONJUNCTIONS, SHORT_PREPOSITIONS),
        ['nor']
      ),
      maxLowercaseLength: 3,
      capitalizeFirstAfterColon: true,
      capitalizeAfterHyphen: true,
      alwaysCapitalize: ['is', 'be', 'are', 'no', 'nor', 'not', 'it'],
      alwaysLowercase: []
    },

    // Wikipedia: capitalize the first letter of every word except for
    // articles, short conjunctions, and short prepositions of four letters
    // or fewer.
    wikipedia: {
      name: 'Wikipedia',
      lowercaseWords: union(
        ARTICLES,
        COORDINATING_CONJUNCTIONS,
        SHORT_PREPOSITIONS,
        ['from']
      ),
      maxLowercaseLength: 4,
      capitalizeFirstAfterColon: true,
      capitalizeAfterHyphen: true,
      alwaysCapitalize: [],
      alwaysLowercase: []
    },

    // Bluebook (legal style): lowercase articles, conjunctions, and
    // prepositions of four letters or fewer.
    bluebook: {
      name: 'Bluebook',
      lowercaseWords: union(
        ARTICLES,
        COORDINATING_CONJUNCTIONS,
        SHORT_PREPOSITIONS,
        FOUR_LETTER_PREPOSITIONS
      ),
      maxLowercaseLength: 4,
      capitalizeFirstAfterColon: true,
      capitalizeAfterHyphen: true,
      alwaysCapitalize: [],
      alwaysLowercase: []
    },

    // American Medical Association: lowercase articles, prepositions, and
    // conjunctions of three letters or fewer.
    ama: {
      name: 'AMA',
      lowercaseWords: union(ARTICLES, COORDINATING_CONJUNCTIONS, SHORT_PREPOSITIONS),
      maxLowercaseLength: 3,
      capitalizeFirstAfterColon: true,
      capitalizeAfterHyphen: true,
      alwaysCapitalize: [],
      alwaysLowercase: []
    }
  };

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function union() {
    var set = {};
    for (var i = 0; i < arguments.length; i++) {
      var arr = arguments[i];
      for (var j = 0; j < arr.length; j++) set[arr[j]] = true;
    }
    return Object.keys(set);
  }

  function subtract(arr, remove) {
    var removeSet = {};
    for (var i = 0; i < remove.length; i++) removeSet[remove[i]] = true;
    return arr.filter(function (w) { return !removeSet[w]; });
  }

  function indexOfList(list, word) {
    word = word.toLowerCase();
    for (var i = 0; i < list.length; i++) {
      if (list[i] === word) return i;
    }
    return -1;
  }

  // True if a token contains at least one letter (so we don't try to
  // capitalize pure punctuation or numbers).
  function hasLetter(token) {
    return /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(token);
  }

  // Capitalize the first letter of `word`, keep the rest as-is. This
  // preserves intentional internal capitals like "iPhone" or "MacBook"
  // when the user has not asked us to lowercase the rest.
  function upperFirst(word) {
    if (!word) return word;
    // Find the first alphabetical character and capitalize it.
    for (var i = 0; i < word.length; i++) {
      var ch = word.charAt(i);
      if (/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(ch)) {
        return word.slice(0, i) + ch.toUpperCase() + word.slice(i + 1);
      }
    }
    return word;
  }

  function lowerAll(word) {
    return word.toLowerCase();
  }

  // Detect a word the user has clearly typed in ALL CAPS (likely an
  // acronym such as NASA or HTML). Two letters or fewer is too short to
  // be confident, so we only flag 3+ letter all-cap tokens.
  function looksLikeAcronym(word) {
    var letters = word.replace(/[^A-Za-z]/g, '');
    if (letters.length < 2) return false;
    return letters === letters.toUpperCase() && /[A-Z]/.test(letters);
  }

  // -------------------------------------------------------------------------
  // Tokenization
  //
  // We split the title into "tokens" that are either whole words (possibly
  // containing apostrophes / internal punctuation) or runs of whitespace
  // and punctuation. The capitalizer walks word tokens and decides what to
  // do with each one based on its position and the surrounding separators.
  // -------------------------------------------------------------------------

  // A word for our purposes is a run of letters, digits, apostrophes,
  // hyphens (for compound treatment we split later), and a few accented
  // letters. Everything else is treated as a separator.
  var WORD_REGEX = /([A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9'’]*)/g;

  function tokenize(text) {
    var tokens = [];
    var lastIndex = 0;
    var match;
    WORD_REGEX.lastIndex = 0;
    while ((match = WORD_REGEX.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'sep', value: text.slice(lastIndex, match.index) });
      }
      tokens.push({ type: 'word', value: match[0] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      tokens.push({ type: 'sep', value: text.slice(lastIndex) });
    }
    return tokens;
  }

  // -------------------------------------------------------------------------
  // Core title case routine
  // -------------------------------------------------------------------------

  /**
   * Apply title case to `text` using the named style. Options:
   *   - style: 'ap' | 'apa' | 'chicago' | 'mla' | 'nyt' | 'wikipedia' |
   *            'bluebook' | 'ama' (default: 'ap')
   *   - straightQuotes: convert curly quotes to straight quotes when true
   *   - smartQuotes:    convert straight quotes to curly quotes when true
   *   - preserveAcronyms: keep ALL-CAPS words as-is (default: true)
   */
  function toTitleCase(text, options) {
    options = options || {};
    var styleName = options.style || 'ap';
    var style = STYLES[styleName] || STYLES.ap;
    var preserveAcronyms = options.preserveAcronyms !== false;

    if (typeof text !== 'string') return text;

    // Process each line separately so that multi-line titles are each
    // capitalized with first/last word rules.
    var lines = text.split(/(\r\n|\r|\n)/);

    for (var li = 0; li < lines.length; li++) {
      if (li % 2 === 1) continue; // odd indices are the line separators
      lines[li] = capitalizeLine(lines[li], style, preserveAcronyms);
    }

    var result = lines.join('');

    if (options.straightQuotes) result = toStraightQuotes(result);
    if (options.smartQuotes) result = toSmartQuotes(result);

    return result;
  }

  function capitalizeLine(line, style, preserveAcronyms) {
    if (!line || !line.length) return line;

    var tokens = tokenize(line);

    // Find indices of word tokens and the separator that *precedes* each
    // word. We use the preceding separator to detect whether a word starts
    // a new clause (after ":", "—", "?", "!", etc.).
    var wordIndices = [];
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'word') wordIndices.push(i);
    }
    if (!wordIndices.length) return line;

    var firstWordPos = wordIndices[0];
    var lastWordPos = wordIndices[wordIndices.length - 1];

    for (var w = 0; w < wordIndices.length; w++) {
      var idx = wordIndices[w];
      var token = tokens[idx];
      var prevSep = idx > 0 && tokens[idx - 1].type === 'sep' ? tokens[idx - 1].value : '';
      var isFirst = idx === firstWordPos;
      var isLast = idx === lastWordPos;

      // Detect "after a hard separator" - colon, em-dash, en-dash, question
      // or exclamation marks all start a new clause that the style guides
      // generally treat like a new sentence.
      var afterHardSeparator = /[:?!]|—|–/.test(prevSep);

      token.value = capitalizeWord(token.value, {
        style: style,
        isFirst: isFirst,
        isLast: isLast,
        afterHardSeparator: afterHardSeparator,
        preserveAcronyms: preserveAcronyms
      });
    }

    return tokens.map(function (t) { return t.value; }).join('');
  }

  function capitalizeWord(word, ctx) {
    if (!hasLetter(word)) return word;

    if (ctx.preserveAcronyms && looksLikeAcronym(word)) {
      return word; // leave intentional all-caps alone
    }

    var style = ctx.style;
    var lower = word.toLowerCase();

    // Hyphenated compound: capitalize each component independently. The
    // style guides treat each part of a hyphenated word as its own word
    // for capitalization purposes (e.g. "Self-Aware", "Twenty-First").
    if (word.indexOf('-') !== -1 && style.capitalizeAfterHyphen) {
      var parts = word.split('-');
      for (var i = 0; i < parts.length; i++) {
        // Each part follows the same rules, but only the first part can
        // legitimately be a "first/last" word in the title.
        var isFirstPart = i === 0;
        var isLastPart = i === parts.length - 1;
        parts[i] = capitalizeWord(parts[i], {
          style: style,
          isFirst: ctx.isFirst && isFirstPart,
          isLast: ctx.isLast && isLastPart,
          afterHardSeparator: ctx.afterHardSeparator && isFirstPart,
          preserveAcronyms: ctx.preserveAcronyms
        });
      }
      return parts.join('-');
    }

    // First/last word: always capitalize (unless the style explicitly
    // forces lowercase).
    if (ctx.isFirst || ctx.isLast) {
      return upperFirst(lower);
    }

    // After ":", "—", "?", etc., if the style says so, capitalize.
    if (ctx.afterHardSeparator && style.capitalizeFirstAfterColon) {
      return upperFirst(lower);
    }

    // Explicit always-capitalize list (case-insensitive).
    if (indexOfList(style.alwaysCapitalize, lower) !== -1) {
      return upperFirst(lower);
    }

    // Explicit always-lowercase list.
    if (indexOfList(style.alwaysLowercase, lower) !== -1) {
      return lower;
    }

    // Short word that this style lowercases?
    if (indexOfList(style.lowercaseWords, lower) !== -1) {
      // But still capitalize if it exceeds the maxLowercaseLength for
      // the style. e.g. "between" is in the long-preposition list but
      // most styles only lowercase prepositions <= some length.
      if (lower.length <= style.maxLowercaseLength) {
        return lower;
      }
    }

    return upperFirst(lower);
  }

  // -------------------------------------------------------------------------
  // Other case conversions
  // -------------------------------------------------------------------------

  function toSentenceCase(text) {
    if (typeof text !== 'string') return text;
    // Lowercase everything first, then capitalize the first letter of each
    // sentence and any standalone "i".
    var lower = text.toLowerCase();
    // Capitalize after start, or after . ! ? followed by whitespace.
    var result = lower.replace(/(^|[.!?]\s+|[\r\n]+\s*)([a-zà-öø-ÿ])/g, function (_, pre, ch) {
      return pre + ch.toUpperCase();
    });
    // Standalone "i" -> "I"
    result = result.replace(/\bi\b/g, 'I');
    result = result.replace(/\bi'(m|ve|ll|d)\b/g, "I'$1");
    return result;
  }

  function toUpperCase(text) {
    return typeof text === 'string' ? text.toUpperCase() : text;
  }

  function toLowerCase(text) {
    return typeof text === 'string' ? text.toLowerCase() : text;
  }

  function toFirstLetter(text) {
    if (typeof text !== 'string') return text;
    return text.toLowerCase().replace(/(^|\s)([a-zà-öø-ÿ])/g, function (_, pre, ch) {
      return pre + ch.toUpperCase();
    });
  }

  function toAlternatingCase(text) {
    if (typeof text !== 'string') return text;
    var result = '';
    var letterIndex = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(ch)) {
        result += letterIndex % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
        letterIndex++;
      } else {
        result += ch;
      }
    }
    return result;
  }

  function toToggleCase(text) {
    if (typeof text !== 'string') return text;
    var result = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var upper = ch.toUpperCase();
      var lower = ch.toLowerCase();
      if (ch === upper && ch !== lower) result += lower;
      else if (ch === lower && ch !== upper) result += upper;
      else result += ch;
    }
    return result;
  }

  // -------------------------------------------------------------------------
  // Quote conversion
  // -------------------------------------------------------------------------

  function toStraightQuotes(text) {
    return text
      .replace(/[‘’‚‛]/g, "'")
      .replace(/[“”„‟]/g, '"');
  }

  function toSmartQuotes(text) {
    var result = text;
    // Double quotes: opening if preceded by start/whitespace/( or [, closing otherwise.
    result = result.replace(/(^|[\s\(\[\{<])"/g, '$1“');
    result = result.replace(/"/g, '”');
    // Single quotes: same heuristic but careful with apostrophes inside words.
    result = result.replace(/(^|[\s\(\[\{<])'/g, '$1‘');
    result = result.replace(/'/g, '’');
    return result;
  }

  // -------------------------------------------------------------------------
  // Dispatcher: convert text by named conversion
  // -------------------------------------------------------------------------

  function convert(text, conversion, options) {
    options = options || {};
    switch (conversion) {
      case 'title':
        return toTitleCase(text, options);
      case 'sentence':
        return applyQuoteOptions(toSentenceCase(text), options);
      case 'upper':
        return applyQuoteOptions(toUpperCase(text), options);
      case 'lower':
        return applyQuoteOptions(toLowerCase(text), options);
      case 'first':
        return applyQuoteOptions(toFirstLetter(text), options);
      case 'alternating':
        return applyQuoteOptions(toAlternatingCase(text), options);
      case 'toggle':
        return applyQuoteOptions(toToggleCase(text), options);
      default:
        return toTitleCase(text, options);
    }
  }

  function applyQuoteOptions(text, options) {
    if (options.straightQuotes) text = toStraightQuotes(text);
    if (options.smartQuotes) text = toSmartQuotes(text);
    return text;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  var TitleCapitalizer = {
    STYLES: STYLES,
    convert: convert,
    toTitleCase: toTitleCase,
    toSentenceCase: toSentenceCase,
    toUpperCase: toUpperCase,
    toLowerCase: toLowerCase,
    toFirstLetter: toFirstLetter,
    toAlternatingCase: toAlternatingCase,
    toToggleCase: toToggleCase,
    toStraightQuotes: toStraightQuotes,
    toSmartQuotes: toSmartQuotes
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TitleCapitalizer;
  } else {
    root.TitleCapitalizer = TitleCapitalizer;
  }
}(typeof window !== 'undefined' ? window : this));
