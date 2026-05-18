/*
 * Test suite for the title-case engine. Run with `npm test` (or
 * `node tests/test-titlecase.js`).
 */

const TC = require('../src/lib/titlecase.js');

let passed = 0, failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log('  ok   ' + name);
        passed++;
    } catch (e) {
        console.log('  FAIL ' + name + ': ' + e.message);
        failed++;
    }
}

function eq(actual, expected) {
    if (actual !== expected) {
        throw new Error('expected "' + expected + '", got "' + actual + '"');
    }
}

console.log('AP style');
test('basic AP', () => {
    eq(TC.toTitleCase('the quick brown fox jumps over the lazy dog', { style: 'ap' }),
       'The Quick Brown Fox Jumps Over the Lazy Dog');
});
test('AP lowercases short prepositions', () => {
    eq(TC.toTitleCase('a tale of two cities', { style: 'ap' }),
       'A Tale of Two Cities');
});
test('AP capitalizes last word', () => {
    eq(TC.toTitleCase('what are you waiting for', { style: 'ap' }),
       'What Are You Waiting For');
});
test('AP capitalizes is/are', () => {
    eq(TC.toTitleCase('this is a test', { style: 'ap' }),
       'This Is a Test');
});
test('AP capitalizes 4+ letter prepositions', () => {
    eq(TC.toTitleCase('the man from earth', { style: 'ap' }),
       'The Man From Earth');
});

console.log('APA style');
test('basic APA', () => {
    eq(TC.toTitleCase('the quick brown fox', { style: 'apa' }),
       'The Quick Brown Fox');
});
test('APA capitalizes 4+ letter words', () => {
    eq(TC.toTitleCase('a study about cats', { style: 'apa' }),
       'A Study About Cats');
});

console.log('Chicago style');
test('Chicago lowercases all prepositions', () => {
    eq(TC.toTitleCase('between earth and sky', { style: 'chicago' }),
       'Between Earth and Sky'); // first word capitalized
});
test('Chicago "between" mid-title', () => {
    eq(TC.toTitleCase('the space between earth and sky', { style: 'chicago' }),
       'The Space between Earth and Sky');
});

console.log('MLA style');
test('basic MLA', () => {
    eq(TC.toTitleCase('to kill a mockingbird', { style: 'mla' }),
       'To Kill a Mockingbird');
});

console.log('NY Times style');
test('NYT capitalizes "no"', () => {
    eq(TC.toTitleCase('a country with no name', { style: 'nyt' }),
       'A Country With No Name');
});
test('NYT capitalizes "is"', () => {
    eq(TC.toTitleCase('the door is open', { style: 'nyt' }),
       'The Door Is Open');
});

console.log('Wikipedia style');
test('basic Wikipedia', () => {
    eq(TC.toTitleCase('list of the largest cities', { style: 'wikipedia' }),
       'List of the Largest Cities');
});

console.log('Bluebook style');
test('Bluebook lowercases 4-letter prepositions', () => {
    eq(TC.toTitleCase('the man from earth', { style: 'bluebook' }),
       'The Man from Earth');
});

console.log('AMA style');
test('basic AMA', () => {
    eq(TC.toTitleCase('a guide to medical writing', { style: 'ama' }),
       'A Guide to Medical Writing');
});

console.log('Special cases');
test('preserves acronyms', () => {
    eq(TC.toTitleCase('an HTML primer for NASA engineers', { style: 'ap' }),
       'An HTML Primer for NASA Engineers');
});
test('hyphenated compound', () => {
    eq(TC.toTitleCase('a self-aware system of twenty-first century', { style: 'ap' }),
       'A Self-Aware System of Twenty-First Century');
});
test('after colon', () => {
    eq(TC.toTitleCase('hope: a new beginning', { style: 'ap' }),
       'Hope: A New Beginning');
});
test('after em-dash', () => {
    eq(TC.toTitleCase('hope — a new beginning', { style: 'ap' }),
       'Hope — A New Beginning');
});
test('after question mark', () => {
    eq(TC.toTitleCase('why bother? a treatise', { style: 'ap' }),
       'Why Bother? A Treatise');
});
test('multi-line', () => {
    eq(TC.toTitleCase('the first title\nthe second title', { style: 'ap' }),
       'The First Title\nThe Second Title');
});

console.log('Other case conversions');
test('sentence case', () => {
    eq(TC.toSentenceCase('THIS IS A TEST. another one here!'),
       'This is a test. Another one here!');
});
test('sentence case I', () => {
    eq(TC.toSentenceCase("HELLO WORLD. i AM HERE."),
       "Hello world. I am here.");
});
test('upper case', () => {
    eq(TC.toUpperCase('Hello World'), 'HELLO WORLD');
});
test('lower case', () => {
    eq(TC.toLowerCase('Hello World'), 'hello world');
});
test('first letter', () => {
    eq(TC.toFirstLetter('the quick brown fox'), 'The Quick Brown Fox');
});
test('alternating case', () => {
    eq(TC.toAlternatingCase('hello'), 'hElLo');
});
test('toggle case', () => {
    eq(TC.toToggleCase('Hello World'), 'hELLO wORLD');
});

console.log('Quote conversion');
test('straight quotes', () => {
    eq(TC.toStraightQuotes('“hello” and ‘world’'), '"hello" and \'world\'');
});
test('smart quotes', () => {
    eq(TC.toSmartQuotes('"hello" and \'world\''), '“hello” and ‘world’');
});

console.log('Integration via convert()');
test('convert title', () => {
    eq(TC.convert('the great gatsby', 'title', { style: 'mla' }),
       'The Great Gatsby');
});
test('convert title with smart quotes', () => {
    eq(TC.convert('a "great" book', 'title', { style: 'ap', smartQuotes: true }),
       'A “Great” Book');
});

console.log('\n--------');
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
