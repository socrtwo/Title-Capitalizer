/*
 * Title Capitalizer - ribbon command handlers
 *
 * These functions are invoked directly from the ribbon (no task pane). They
 * apply a specific style to the current selection, then call event.completed
 * so Office knows the action finished.
 *
 * Each handler is registered with Office.actions.associate at the bottom of
 * the file with the same id used in the manifest's <FunctionName> element.
 */

Office.onReady(function () { /* nothing to do */ });

function applyStyleToSelection(styleName, event) {
    var options = { style: styleName, preserveAcronyms: true };
    var host = Office.context.host;

    var done = function () { event.completed(); };
    var fail = function (err) {
        console.error('Title Capitalizer command failed:', err);
        event.completed();
    };

    if (host === Office.HostType.Word) {
        Word.run(function (context) {
            var range = context.document.getSelection();
            range.load('text');
            return context.sync().then(function () {
                var text = range.text || '';
                if (!text.trim()) return;
                var converted = TitleCapitalizer.convert(text, 'title', options);
                range.insertText(converted, Word.InsertLocation.replace);
                return context.sync();
            });
        }).then(done).catch(fail);
    } else if (host === Office.HostType.Excel) {
        Excel.run(function (context) {
            var range = context.workbook.getSelectedRange();
            range.load('values');
            return context.sync().then(function () {
                var values = range.values;
                var changed = false;
                var newValues = values.map(function (row) {
                    return row.map(function (cell) {
                        if (typeof cell === 'string' && cell.length > 0) {
                            changed = true;
                            return TitleCapitalizer.convert(cell, 'title', options);
                        }
                        return cell;
                    });
                });
                if (changed) {
                    range.values = newValues;
                    return context.sync();
                }
            });
        }).then(done).catch(fail);
    } else if (host === Office.HostType.PowerPoint) {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (asyncResult) {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) { fail(asyncResult.error); return; }
            var text = asyncResult.value || '';
            if (!text.trim()) { done(); return; }
            var converted = TitleCapitalizer.convert(text, 'title', options);
            Office.context.document.setSelectedDataAsync(
                converted,
                { coercionType: Office.CoercionType.Text },
                function (setResult) {
                    if (setResult.status === Office.AsyncResultStatus.Failed) fail(setResult.error);
                    else done();
                }
            );
        });
    } else {
        done();
    }
}

function applyAP(event)        { applyStyleToSelection('ap', event); }
function applyAPA(event)       { applyStyleToSelection('apa', event); }
function applyChicago(event)   { applyStyleToSelection('chicago', event); }
function applyMLA(event)       { applyStyleToSelection('mla', event); }
function applyNYT(event)       { applyStyleToSelection('nyt', event); }
function applyWikipedia(event) { applyStyleToSelection('wikipedia', event); }
function applyBluebook(event)  { applyStyleToSelection('bluebook', event); }
function applyAMA(event)       { applyStyleToSelection('ama', event); }

// Register each handler so the manifest's <FunctionName> values map to
// real callbacks at runtime.
if (Office.actions && Office.actions.associate) {
    Office.actions.associate('applyAP', applyAP);
    Office.actions.associate('applyAPA', applyAPA);
    Office.actions.associate('applyChicago', applyChicago);
    Office.actions.associate('applyMLA', applyMLA);
    Office.actions.associate('applyNYT', applyNYT);
    Office.actions.associate('applyWikipedia', applyWikipedia);
    Office.actions.associate('applyBluebook', applyBluebook);
    Office.actions.associate('applyAMA', applyAMA);
}
