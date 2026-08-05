#!/usr/bin/env python3
"""Dump the USD/ETH tabs of a built workbook to feed CSVs for the
Apps Script updater installed in the original Google Sheet.

Layout: row 1 = title line (goes to A1), row 2 = headers,
rows 3+ = data with an extra trailing LinkURL column.

Usage: make_feed_csvs.py <workbook.xlsx> <usd_out.csv> <eth_out.csv>
"""
import csv
import sys

import openpyxl

wb = openpyxl.load_workbook(sys.argv[1])
for tab, out in [('USD Farms', sys.argv[2]), ('ETH Farms', sys.argv[3])]:
    ws = wb[tab]
    with open(out, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow([ws.cell(1, 1).value] + [''] * 18)
        w.writerow([ws.cell(3, c).value for c in range(1, 19)] + ['LinkURL'])
        r = 4
        n = 0
        while ws.cell(r, 1).value:
            row = [ws.cell(r, c).value for c in range(1, 19)]
            link = ws.cell(r, 6).hyperlink
            row.append(link.target if link else '')
            w.writerow(['' if v is None else v for v in row])
            r += 1
            n += 1
    print(f'{tab}: {n} rows -> {out}')
