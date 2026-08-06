/**
 * Farm List auto-updater — installs inside the original Google Sheet.
 *
 * Pulls the daily feed CSVs (pushed to GitHub by the Claude pipeline) and
 * rewrites the "USD Farms" / "ETH Farms" tabs in place: values, title line,
 * DefiLlama hyperlinks and rating colors. The Looping tab is not touched.
 *
 * Install (one time):
 *   1. Open the sheet -> Extensions -> Apps Script
 *   2. Paste this file, save
 *   3. Run installTrigger() once and grant authorization
 *      (creates a daily trigger at 10:00-11:00 in the script's timezone —
 *       set the project timezone to Asia/Hong_Kong under Project Settings)
 *   4. Optional: run refreshFarmTabs() once to test immediately
 */

const FEED_BASE =
  'https://raw.githubusercontent.com/rooktc/Rook/claude/spreadsheet-data-refresh-mahsrf/farm-list/';
const FEEDS = {
  // farm tabs: 16 sheet columns (F = Risk, P = Risk Note), feed col 17 = hyperlink URL, col 18 = flags
  'USD Farms': { url: FEED_BASE + 'feed_usd.csv', cols: 16, riskCol: 6, noteCol: 16, linkCol: 7, linkUrlIdx: 16, flagsIdx: 17, apyCol: 10, farmHeader: true },
  'ETH Farms': { url: FEED_BASE + 'feed_eth.csv', cols: 16, riskCol: 6, noteCol: 16, linkCol: 7, linkUrlIdx: 16, flagsIdx: 17, apyCol: 10, farmHeader: true },
  // looping tab: 14 columns, risk col J, Max ROE formula in G
  'Looping': { url: FEED_BASE + 'feed_loop.csv', cols: 14, ratingCol: 10, roeFormulaCol: 7 },
  // verification annex: plain values, sheet is created if missing
  'Data Check': { url: FEED_BASE + 'feed_check.csv', cols: 12, plain: true, minRows: 0 },
};
const RATING_COLORS = {
  stable: '#1e7145', mixed: '#b45f06', volatile: '#c00000',
  'Low': '#1e7145', 'Med-Low': '#7f8c1e', 'Med-High': '#b45f06',
  'Med.': '#b45f06', 'Medium': '#b45f06', 'High': '#c00000',
};
// red flags = wrong/stale data; orange = caution (young pool, spike, self-reported)
const FLAG_RED = /^(MISMATCH|STALE|NOT-ACCRUING)/;

function refreshFarmTabs() {
  const ss = SpreadsheetApp.getActive();
  for (const [tabName, cfg] of Object.entries(FEEDS)) {
    const resp = UrlFetchApp.fetch(cfg.url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      console.warn(tabName + ': feed fetch failed, HTTP ' + resp.getResponseCode());
      continue;
    }
    const rows = Utilities.parseCsv(resp.getContentText());
    if (rows.length < 3) { console.warn(tabName + ': feed empty'); continue; }
    const title = rows[0][0];
    const data = rows.slice(2); // row 0 = title, row 1 = header
    let sheet = ss.getSheetByName(tabName);
    if (!sheet && cfg.plain) sheet = ss.insertSheet(tabName);
    if (!sheet) { console.warn(tabName + ': tab not found'); continue; }

    // sanity: refuse suspiciously small feeds so a bad run never wipes the tab
    const minRows = cfg.minRows !== undefined ? cfg.minRows : 10;
    if (data.length < minRows) { console.warn(tabName + ': only ' + data.length + ' rows, skipped'); continue; }

    if (cfg.plain) {
      sheet.clearContents();
      sheet.getRange(1, 1).setValue(title).setFontWeight('bold');
      sheet.getRange(2, 1, 1, cfg.cols).setValues([rows[1].slice(0, cfg.cols)]).setFontWeight('bold');
      if (data.length) {
        sheet.getRange(3, 1, data.length, cfg.cols).setValues(
          data.map(r => r.slice(0, cfg.cols).map(v =>
            (v !== '' && !isNaN(v) && String(v).trim() !== '') ? Number(v) : v)));
      }
      sheet.setFrozenRows(2);
      console.log(tabName + ': ' + data.length + ' rows updated');
      continue;
    }

    const nCols = cfg.cols;
    const last = sheet.getLastRow();
    if (last >= 4) sheet.getRange(4, 1, last - 3, nCols).clearContent();

    const values = data.map(r =>
      r.slice(0, nCols).map(v => {
        if (v === '') return '';
        return (!isNaN(v) && v.trim() !== '') ? Number(v) : v;
      })
    );
    sheet.getRange(4, 1, values.length, nCols).setValues(values);

    // extend row-4's formats down so every data row looks the same
    if (values.length > 1) {
      sheet.getRange(4, 1, 1, nCols).copyTo(
        sheet.getRange(5, 1, values.length - 1, nCols),
        SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    }

    // rating / risk font colors
    if (cfg.ratingCol) {
      sheet.getRange(4, cfg.ratingCol, values.length, 1).setFontColors(
        values.map(r => [RATING_COLORS[r[cfg.ratingCol - 1]] || '#000000']));
    }
    if (cfg.riskCol) {
      const riskRange = sheet.getRange(4, cfg.riskCol, values.length, 1);
      riskRange.setFontColors(values.map(r => [RATING_COLORS[r[cfg.riskCol - 1]] || '#000000']));
      riskRange.setFontWeight('bold').setHorizontalAlignment('center');
    }

    // farm tabs: rewrite the header rows for the 16-col Risk Note layout (idempotent)
    if (cfg.farmHeader) {
      // the A1:P1 title merge spans every column, so frozen columns
      // (which cannot cross a merge) must go; frozen rows are kept
      if (sheet.getFrozenColumns() > 0) sheet.setFrozenColumns(0);
      // clear leftovers from the old 19-column layout
      const maxCols = sheet.getMaxColumns();
      if (maxCols > 16) {
        sheet.getRange(1, 17, Math.max(sheet.getLastRow(), 3), maxCols - 16).breakApart().clear();
      }
      sheet.getRange(3, 1, 1, nCols).setValues([rows[1].slice(0, nCols)])
        .setFontWeight('bold').setFontColor('#ffffff').setBackground('#1f3552')
        .setHorizontalAlignment('center').setVerticalAlignment('middle');
      sheet.getRange('A2:S2').breakApart().clear();
      const bands = [
        ['J2:L2', 'Total APY (%)', '#b45f06'],
        ['M2:O2', 'Current APY Breakdown (%)', '#44546a'],
      ];
      for (const [rng, label, bg] of bands) {
        const range = sheet.getRange(rng);
        range.merge().setValue(label).setBackground(bg).setFontColor('#ffffff')
          .setFontWeight('bold').setFontSize(9)
          .setHorizontalAlignment('center').setVerticalAlignment('middle');
      }
      sheet.getRange('A1:S1').breakApart();
      sheet.getRange('A1:P1').merge();
      sheet.setColumnWidth(16, 420);
    }

    // risk note column: small grey text, clipped
    if (cfg.noteCol) {
      sheet.getRange(4, cfg.noteCol, values.length, 1)
        .setFontSize(8).setFontColor('#666666')
        .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    }

    // farm tabs: DefiLlama hyperlinks
    if (cfg.linkCol) {
      sheet.getRange(4, cfg.linkCol, values.length, 1).setRichTextValues(
        data.map(r => [r[cfg.linkUrlIdx]
          ? SpreadsheetApp.newRichTextValue().setText('DefiLlama').setLinkUrl(r[cfg.linkUrlIdx]).build()
          : SpreadsheetApp.newRichTextValue().setText('').build()]));
    }

    // looping tab: restore the Max ROE formula in G
    if (cfg.roeFormulaCol) {
      sheet.getRange(4, cfg.roeFormulaCol, values.length, 1).setFormulasR1C1(
        values.map(() => ['=(R[0]C[1]+R[0]C[2])*(R[0]C[-1]-1)+R[0]C[1]']));
    }

    // verification flags: tint the APY cell (red = data wrong/stale, orange = caution)
    if (cfg.flagsIdx !== undefined && cfg.apyCol) {
      sheet.getRange(4, cfg.apyCol, values.length, 1).setBackgrounds(
        data.map(r => {
          const fl = r[cfg.flagsIdx] || '';
          if (!fl) return [null];
          return [fl.split('; ').some(x => FLAG_RED.test(x)) ? '#f4cccc' : '#fce5cd'];
        }));
      sheet.getRange(4, cfg.apyCol, values.length, 1).setNotes(
        data.map(r => [r[cfg.flagsIdx] || null]));
    }

    sheet.getRange(1, 1).setValue(title);
    console.log(tabName + ': ' + values.length + ' rows updated');
  }
}

function installTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'refreshFarmTabs')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('refreshFarmTabs').timeBased().everyDays(1).atHour(10).create();
}
