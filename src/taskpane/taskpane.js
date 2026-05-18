/*
 * Title Capitalizer - task pane controller
 *
 * Wires the UI to the title-case engine and to the active Office host
 * (Word, Excel, or PowerPoint). The host detection happens at Office.onReady
 * time; each host has its own routine for reading the current selection
 * and writing the converted text back.
 */

(function () {
    'use strict';

    var STYLE_DESCRIPTIONS = {
        ap: 'Associated Press. Lowercase articles, conjunctions, and prepositions of 3 letters or fewer.',
        apa: 'American Psychological Association. Capitalize words of 4 letters or more; lowercase short articles, conjunctions, and prepositions.',
        chicago: 'Chicago Manual of Style. Lowercase articles, coordinating conjunctions, and prepositions regardless of length.',
        mla: 'Modern Language Association. Lowercase articles, coordinating conjunctions, and prepositions regardless of length.',
        nyt: 'New York Times. Like AP, but capitalize "no", "nor", "not", and short verbs such as "is".',
        wikipedia: 'Wikipedia. Capitalize all words except short articles, conjunctions, and prepositions of 4 letters or fewer.',
        bluebook: 'Bluebook (legal style). Lowercase articles, conjunctions, and prepositions of 4 letters or fewer.',
        ama: 'American Medical Association. Lowercase articles, prepositions, and conjunctions of 3 letters or fewer.'
    };

    var host = null;
    var elements = {};

    Office.onReady(function (info) {
        host = info.host; // Office.HostType.Word | .Excel | .PowerPoint
        cacheElements();
        wireUI();
        updateHostHint();
        updateStyleDescription();
    });

    function cacheElements() {
        elements.styleSelect = document.getElementById('styleSelect');
        elements.styleDescription = document.getElementById('styleDescription');
        elements.preserveAcronyms = document.getElementById('preserveAcronyms');
        elements.straightQuotes = document.getElementById('straightQuotes');
        elements.smartQuotes = document.getElementById('smartQuotes');
        elements.inputText = document.getElementById('inputText');
        elements.outputText = document.getElementById('outputText');
        elements.previewBtn = document.getElementById('previewBtn');
        elements.copyBtn = document.getElementById('copyBtn');
        elements.applyBtn = document.getElementById('applyToSelection');
        elements.statusMessage = document.getElementById('statusMessage');
        elements.hostHint = document.getElementById('hostHint');
        elements.caseButtons = document.querySelectorAll('.case-btn');
    }

    function wireUI() {
        elements.styleSelect.addEventListener('change', updateStyleDescription);
        elements.previewBtn.addEventListener('click', onPreview);
        elements.copyBtn.addEventListener('click', onCopy);
        elements.applyBtn.addEventListener('click', function () {
            applyToSelection('title');
        });

        // Smart/straight quotes are mutually exclusive.
        elements.straightQuotes.addEventListener('change', function () {
            if (elements.straightQuotes.checked) elements.smartQuotes.checked = false;
        });
        elements.smartQuotes.addEventListener('change', function () {
            if (elements.smartQuotes.checked) elements.straightQuotes.checked = false;
        });

        Array.prototype.forEach.call(elements.caseButtons, function (btn) {
            btn.addEventListener('click', function () {
                applyToSelection(btn.getAttribute('data-conversion'));
            });
        });

        // Re-preview when the user types into the input box.
        elements.inputText.addEventListener('input', onPreview);
    }

    function updateStyleDescription() {
        var style = elements.styleSelect.value;
        elements.styleDescription.textContent = STYLE_DESCRIPTIONS[style] || '';
    }

    function updateHostHint() {
        var hint = '';
        if (host === Office.HostType.Word) {
            hint = 'Select text in the document, then click Apply.';
        } else if (host === Office.HostType.Excel) {
            hint = 'Select one or more cells, then click Apply.';
        } else if (host === Office.HostType.PowerPoint) {
            hint = 'Select text inside a text box, then click Apply.';
        } else {
            hint = 'Select text in the document, then click Apply.';
        }
        elements.hostHint.textContent = hint;
    }

    function getOptions() {
        return {
            style: elements.styleSelect.value,
            preserveAcronyms: elements.preserveAcronyms.checked,
            straightQuotes: elements.straightQuotes.checked,
            smartQuotes: elements.smartQuotes.checked
        };
    }

    function setStatus(message, kind) {
        elements.statusMessage.textContent = message || '';
        elements.statusMessage.className = 'status' + (kind ? ' ' + kind : '');
    }

    function onPreview() {
        var input = elements.inputText.value;
        var output = TitleCapitalizer.convert(input, 'title', getOptions());
        elements.outputText.value = output;
    }

    function onCopy() {
        var text = elements.outputText.value;
        if (!text) {
            setStatus('Nothing to copy.', 'error');
            return;
        }
        // Office add-ins on the web run in an iframe, so navigator.clipboard
        // may not be available. Fall back to the textarea select-and-copy
        // trick if needed.
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                setStatus('Copied to clipboard.', 'success');
            }, function () {
                legacyCopy(text);
            });
        } else {
            legacyCopy(text);
        }
    }

    function legacyCopy(text) {
        try {
            elements.outputText.select();
            document.execCommand('copy');
            setStatus('Copied to clipboard.', 'success');
        } catch (e) {
            setStatus('Copy failed. Select the result and copy manually.', 'error');
        }
    }

    // -------------------------------------------------------------------------
    // Apply to the active document selection
    // -------------------------------------------------------------------------

    function applyToSelection(conversion) {
        var options = getOptions();

        setStatus('Working...');

        var promise;
        if (host === Office.HostType.Word) {
            promise = applyToWord(conversion, options);
        } else if (host === Office.HostType.Excel) {
            promise = applyToExcel(conversion, options);
        } else if (host === Office.HostType.PowerPoint) {
            promise = applyToPowerPoint(conversion, options);
        } else {
            // Fallback: operate on the manual input field.
            elements.outputText.value = TitleCapitalizer.convert(
                elements.inputText.value, conversion, options
            );
            setStatus('Converted preview text.', 'success');
            return;
        }

        promise.then(function (result) {
            var count = (result && result.count) || 0;
            if (count === 0) {
                setStatus('No text selected. Please select some text first.', 'error');
            } else {
                setStatus('Converted ' + count + ' item' + (count === 1 ? '' : 's') + '.', 'success');
            }
        }).catch(function (err) {
            console.error(err);
            setStatus('Error: ' + (err && err.message ? err.message : 'Could not apply conversion.'), 'error');
        });
    }

    // ---- Word -------------------------------------------------------------

    function applyToWord(conversion, options) {
        return Word.run(function (context) {
            var range = context.document.getSelection();
            // Pull text broken up into runs so we can preserve formatting of
            // each run while still converting the text. Loading the entire
            // selection as one string would discard run-level formatting.
            var paragraphs = range.paragraphs;
            paragraphs.load('items');
            return context.sync().then(function () {
                range.load('text');
                return context.sync();
            }).then(function () {
                var text = range.text || '';
                if (!text.trim()) return { count: 0 };
                var converted = TitleCapitalizer.convert(text, conversion, options);
                // Word's range.insertText replaces selection content with new text.
                range.insertText(converted, Word.InsertLocation.replace);
                return context.sync().then(function () { return { count: 1 }; });
            });
        });
    }

    // ---- Excel ------------------------------------------------------------

    function applyToExcel(conversion, options) {
        return Excel.run(function (context) {
            var range = context.workbook.getSelectedRange();
            range.load(['values', 'rowCount', 'columnCount', 'numberFormat']);
            return context.sync().then(function () {
                var values = range.values;
                var count = 0;
                var newValues = [];
                for (var r = 0; r < values.length; r++) {
                    var row = [];
                    for (var c = 0; c < values[r].length; c++) {
                        var cell = values[r][c];
                        if (typeof cell === 'string' && cell.length > 0) {
                            row.push(TitleCapitalizer.convert(cell, conversion, options));
                            count++;
                        } else {
                            row.push(cell);
                        }
                    }
                    newValues.push(row);
                }
                if (count === 0) return { count: 0 };
                range.values = newValues;
                return context.sync().then(function () { return { count: count }; });
            });
        });
    }

    // ---- PowerPoint -------------------------------------------------------

    function applyToPowerPoint(conversion, options) {
        // PowerPoint exposes a simpler selection API via Office.context.document.
        return new Promise(function (resolve, reject) {
            Office.context.document.getSelectedDataAsync(
                Office.CoercionType.Text,
                function (asyncResult) {
                    if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                        reject(asyncResult.error);
                        return;
                    }
                    var text = asyncResult.value || '';
                    if (!text.trim()) {
                        resolve({ count: 0 });
                        return;
                    }
                    var converted = TitleCapitalizer.convert(text, conversion, options);
                    Office.context.document.setSelectedDataAsync(
                        converted,
                        { coercionType: Office.CoercionType.Text },
                        function (setResult) {
                            if (setResult.status === Office.AsyncResultStatus.Failed) {
                                reject(setResult.error);
                            } else {
                                resolve({ count: 1 });
                            }
                        }
                    );
                }
            );
        });
    }
}());
