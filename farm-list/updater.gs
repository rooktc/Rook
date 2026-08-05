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
  'USD Farms': FEED_BASE + 'feed_usd.csv',
  'ETH Farms': FEED_BASE + 'feed_eth.csv',
};
const N_COLS = 18; // A..R ; feed column 19 is the hyperlink URL
const RATING_COLORS = { stable: '#1e7145', mixed: '#b45f06', volatile: '#c00000' };

function refreshFarmTabs() {
  const ss = SpreadsheetApp.getActive();
  for (const [tabName, url] of Object.entries(FEEDS)) {
    const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      console.warn(tabName + ': feed fetch failed, HTTP ' + resp.getResponseCode());
      continue;
    }
    const rows = Utilities.parseCsv(resp.getContentText());
    if (rows.length < 3) { console.warn(tabName + ': feed empty'); continue; }
    const title = rows[0][0];
    const data = rows.slice(2); // row 0 = title, row 1 = header
    const sheet = ss.getSheetByName(tabName);
    if (!sheet) { console.warn(tabName + ': tab not found'); continue; }

    // sanity: refuse suspiciously small feeds so a bad run never wipes the tab
    if (data.length < 10) { console.warn(tabName + ': only ' + data.length + ' rows, skipped'); continue; }

    const last = sheet.getLastRow();
    if (last >= 4) sheet.getRange(4, 1, last - 3, N_COLS).clearContent();

    const values = data.map(r =>
      r.slice(0, N_COLS).map(v => {
        if (v === '') return '';
        return (!isNaN(v) && v.trim() !== '') ? Number(v) : v;
      })
    );
    sheet.getRange(4, 1, values.length, N_COLS).setValues(values);

    // extend row-4's formats down so every data row looks the same
    if (values.length > 1) {
      sheet.getRange(4, 1, 1, N_COLS).copyTo(
        sheet.getRange(5, 1, values.length - 1, N_COLS),
        SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    }

    // rating font colors (col O = 15)
    sheet.getRange(4, 15, values.length, 1).setFontColors(
      values.map(r => [RATING_COLORS[r[14]] || '#000000']));

    // DefiLlama hyperlinks (col F = 6; URL is feed col 19)
    sheet.getRange(4, 6, values.length, 1).setRichTextValues(
      data.map(r => [r[18]
        ? SpreadsheetApp.newRichTextValue().setText('DefiLlama').setLinkUrl(r[18]).build()
        : SpreadsheetApp.newRichTextValue().setText('').build()]));

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
