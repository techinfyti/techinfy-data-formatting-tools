import { Link } from "react-router-dom";

// Page content for each guide in guides.js, keyed by slug.
//
// - `converter` seeds the Converter (placeholder, sample, starting settings).
// - `blocks` render in order. An "example" block shows real output: it runs
//   the same convert() the tool uses, so the text on the page can never drift
//   from what the tool actually does.
// - `faqs` are shown on the page and also emitted as FAQPage structured data.
// - `related` is a list of guide slugs or { to, label, blurb } objects.

export const GUIDE_CONTENT = {
  "excel-column-to-comma-separated-list": {
    converter: {
      placeholder: "Paste your Excel column here…",
      sampleInput: "10234\n10235\n10235\n10236\n10237",
    },
    blocks: [
      { type: "h2", text: "How to convert an Excel column to a comma separated list" },
      {
        type: "steps",
        items: [
          <><strong>Select the column.</strong> In Excel, click the first cell, hold Shift and click the last one, or click the column letter to select the whole column.</>,
          <><strong>Copy it.</strong> Press Ctrl+C (Cmd+C on a Mac).</>,
          <><strong>Paste it above.</strong> Click the Input box and press Ctrl+V (Cmd+V), or use the Paste button.</>,
          <><strong>Copy the result.</strong> Your comma separated list appears in the Output box immediately. Click Copy and paste it where you need it.</>,
        ],
      },
      { type: "p", content: "Blank cells and stray spaces are cleaned up automatically, so a column with gaps still gives you a tidy list." },
      { type: "h2", text: "Example" },
      {
        type: "example",
        intro: "A column with a repeated value, copied from Excel:",
        inputLabel: "Pasted column",
        input: "10234\n10235\n10235\n10236",
        results: [
          { label: "Comma separated list" },
          { label: "With duplicates removed and single quotes added", options: { removeDuplicates: true, addQuotes: true, quoteChar: "single" } },
        ],
      },
      { type: "h2", text: "Options worth knowing" },
      { type: "p", content: <>Open <strong>More Filters</strong> above the Input box to:</> },
      {
        type: "ul",
        items: [
          <><strong>Remove duplicate values</strong> so each item appears once.</>,
          <><strong>Add quotes</strong> (single or double) around every value, handy for text in SQL or code.</>,
          <><strong>Sort A–Z or Z–A</strong> before joining.</>,
          <><strong>Add a prefix or suffix</strong> to every value, or <strong>remove text</strong> from each one.</>,
        ],
      },
      { type: "p", content: <>Need a space after each comma? Choose <strong>Custom…</strong> in the Delimiter list and type a comma followed by a space.</> },
      { type: "h2", text: "Using an Excel formula instead" },
      {
        type: "p",
        content: (
          <>
            In Excel 2019 and Microsoft 365 you can also type <code>=TEXTJOIN(",",TRUE,A1:A10)</code>, which joins the cells A1 to A10 with commas and skips blanks. Older versions of Excel don't have TEXTJOIN, and a formula can't add quotes or remove duplicates for you, which is where pasting into this page is quicker. It works the same way for a column copied from Google Sheets or any other spreadsheet.
          </>
        ),
      },
    ],
    faqs: [
      { question: "How do I convert an Excel column to a comma separated list?", answer: "Copy the cells in Excel, paste them into the Input box on this page, and the comma separated list appears in the Output box straight away. Click Copy to use it anywhere." },
      { question: "Can I add quotes around each value?", answer: "Yes. Open More Filters, tick Add quotes and choose single or double quotes. Single quotes are handy for SQL; double quotes suit code and CSV-style data." },
      { question: "Can I put a space after each comma?", answer: "Yes. Choose Custom… in the Delimiter list and type a comma followed by a space." },
      { question: "Does it remove blank cells and duplicates?", answer: "Blank cells and extra spaces around values are removed by default. To drop repeated values as well, tick Remove duplicate values under More Filters." },
      { question: "Is my Excel data uploaded anywhere?", answer: "No. The conversion runs entirely in your browser, so nothing you paste is sent to a server. See our Privacy Policy for details." },
      { question: "How much data can I paste?", answer: "Up to 75,000 characters at a time, which covers most everyday columns. For a bigger list, convert it in a few parts." },
    ],
    related: [
      "sql-in-clause-generator",
      "add-quotes-to-list",
      "newline-to-comma",
      { to: "/excel-to-json", label: "Excel to JSON Converter", blurb: "turn a whole spreadsheet into JSON." },
    ],
  },

  "sql-in-clause-generator": {
    converter: {
      placeholder: "Paste your list of values here, one per line…",
      sampleInput: "CA\nNY\nTX\nFL",
      defaults: { quickPreset: "sql-in", showAdvanced: true },
    },
    blocks: [
      { type: "h2", text: "How to build a SQL IN clause from a list" },
      {
        type: "steps",
        items: [
          <><strong>Paste your values</strong> into the Input box, one per line. A column copied from Excel or a query result works well.</>,
          <><strong>Read the result.</strong> The SQL IN Clause preset is already selected under Quick presets, so the clause appears in the Output box straight away.</>,
          <><strong>Copy it</strong> and paste it into your query after the column name.</>,
        ],
      },
      { type: "p", content: "Each value is wrapped in single quotes and separated by commas. Blank lines and stray spaces are ignored." },
      { type: "h2", text: "Example" },
      {
        type: "example",
        input: "CA\nNY\nTX\nFL",
        inputLabel: "Pasted list",
        results: [
          { label: "SQL IN Clause preset", quickPreset: "sql-in" },
          { label: "SQL Values List preset", quickPreset: "sql-values" },
        ],
      },
      { type: "p", content: "Used in a query:" },
      { type: "code", text: "SELECT * FROM customers\nWHERE state IN ('CA', 'NY', 'TX', 'FL');" },
      { type: "h2", text: "IN clause or values list" },
      { type: "p", content: <>Choose the <strong>SQL Values List</strong> preset for just the bracketed list, without the IN keyword. That suits NOT IN, or any query where you want to type the keyword yourself.</> },
      { type: "h2", text: "Apostrophes, numbers and duplicates" },
      {
        type: "ul",
        items: [
          <><strong>Apostrophes</strong> inside a value are doubled, so O'Brien becomes 'O''Brien, which is how SQL escapes them.</>,
          <><strong>Numbers</strong> are quoted too. Many databases accept a quoted number against a number column, but if you want plain numbers, click Clear preset, keep Comma as the delimiter and put the result inside IN ( ) yourself.</>,
          <><strong>Duplicates</strong> are kept, because the presets use your lines exactly as pasted. To remove repeats first, use <Link to="/remove-duplicates-from-list">Remove Duplicates from a List</Link>, then paste the result back here.</>,
        ],
      },
    ],
    faqs: [
      { question: "How do I convert a list to a SQL IN clause?", answer: "Paste your values into the Input box, one per line. The SQL IN Clause preset is already selected, so the result appears in the Output box as IN ('a', 'b', 'c'). Click Copy and paste it into your query." },
      { question: "Does it escape single quotes in my values?", answer: "Yes. A single quote inside a value is doubled, so O'Brien becomes 'O''Brien', which is the standard way to escape it in SQL." },
      { question: "Can I use it for numbers without quotes?", answer: "The preset quotes every value. For plain numbers, click Clear preset, keep Comma as the delimiter, and put the comma separated result inside IN ( ) yourself." },
      { question: "Does it work with MySQL, PostgreSQL, SQL Server and Oracle?", answer: "The output is a comma separated list of single-quoted strings inside brackets, which is standard SQL and works in all of them." },
      { question: "How many values can I use?", answer: "Up to 75,000 characters at a time. Some databases also limit how many values an IN list can hold, so for very long lists a temporary table or a join may work better." },
      { question: "Is my data uploaded anywhere?", answer: "No. The clause is built entirely in your browser, so nothing you paste is sent to a server." },
    ],
    related: ["excel-column-to-comma-separated-list", "add-quotes-to-list", "remove-duplicates-from-list", "newline-to-comma"],
  },

  "add-quotes-to-list": {
    converter: {
      placeholder: "Paste your list here, one value per line…",
      sampleInput: "apple\nbanana\ncherry\ndate",
      defaults: { presetId: "newline", showAdvanced: true, options: { addQuotes: true, quoteChar: "single" } },
    },
    blocks: [
      { type: "h2", text: "How to add quotes to every line" },
      {
        type: "steps",
        items: [
          <><strong>Paste your list</strong> into the Input box, one value per line.</>,
          <><strong>Pick the quote style.</strong> Add quotes is already ticked under More Filters. Choose Single quotes ( ' ) or Double quotes ( " ).</>,
          <><strong>Copy the result</strong> from the Output box.</>,
        ],
      },
      { type: "p", content: <>The delimiter is set to New Line, so each quoted value stays on its own line. Change the Delimiter to <strong>Comma</strong> to get everything on one line instead.</> },
      { type: "h2", text: "Examples" },
      {
        type: "example",
        input: "apple\nbanana\ncherry",
        inputLabel: "Pasted list",
        results: [
          { label: "Single quotes, one per line", presetId: "newline", options: { addQuotes: true, quoteChar: "single" } },
          { label: "Double quotes, one per line", presetId: "newline", options: { addQuotes: true, quoteChar: "double" } },
          { label: "Single quotes, comma separated", presetId: "comma", options: { addQuotes: true, quoteChar: "single" } },
        ],
      },
      { type: "h2", text: "Good to know" },
      {
        type: "ul",
        items: [
          <><strong>Spaces are trimmed first</strong>, so " apple " becomes 'apple' rather than ' apple '.</>,
          <><strong>Quotes inside a value are doubled</strong>, the way SQL and CSV expect: O'Brien becomes 'O''Brien'.</>,
          <><strong>Blank lines are removed</strong> so you don't get empty pairs of quotes.</>,
          <>You can also <strong>add a prefix or suffix</strong>, remove duplicates or sort in More Filters.</>,
        ],
      },
    ],
    faqs: [
      { question: "How do I add quotes to each line of a list?", answer: "Paste your list into the Input box, one value per line. Add quotes is already ticked under More Filters, so every line is wrapped in quotes in the Output box." },
      { question: "How do I add single quotes instead of double quotes?", answer: "Under More Filters, with Add quotes ticked, choose Single quotes ( ' ). Choose Double quotes ( \" ) to switch back." },
      { question: "Can I add quotes and join the lines with commas?", answer: "Yes. Change the Delimiter from New Line to Comma and the quoted values are joined on a single line, like 'apple','banana','cherry'." },
      { question: "What happens to quotes that are already in my text?", answer: "A quote that matches the quote style is doubled, the way SQL and CSV expect, so O'Brien becomes 'O''Brien' when you use single quotes." },
      { question: "Is my data uploaded anywhere?", answer: "No. Everything happens in your browser, so nothing you paste is sent to a server." },
    ],
    related: ["sql-in-clause-generator", "excel-column-to-comma-separated-list", "newline-to-comma", "remove-duplicates-from-list"],
  },

  "remove-duplicates-from-list": {
    converter: {
      placeholder: "Paste your list here, one value per line…",
      sampleInput: "apple\nbanana\napple\ncherry\nbanana\ndate",
      defaults: { presetId: "newline", showAdvanced: true, options: { removeDuplicates: true } },
    },
    blocks: [
      { type: "h2", text: "How to remove duplicates from a list" },
      {
        type: "steps",
        items: [
          <><strong>Paste your list</strong> into the Input box, one value per line.</>,
          <><strong>Read the result.</strong> Remove duplicate values is already ticked under More Filters, so repeated lines disappear straight away.</>,
          <><strong>Copy the cleaned list</strong> from the Output box.</>,
        ],
      },
      { type: "p", content: "The first time each value appears is kept, and the original order is preserved. The footer under each box shows how many lines went in and how many values came out." },
      { type: "h2", text: "Example" },
      {
        type: "example",
        input: "apple\nbanana\napple\ncherry\nbanana\ndate",
        inputLabel: "Pasted list",
        results: [{ label: "Duplicates removed", presetId: "newline", options: { removeDuplicates: true } }],
      },
      { type: "h2", text: "What counts as a duplicate" },
      {
        type: "ul",
        items: [
          <><strong>Case matters.</strong> Apple and apple are treated as two different values.</>,
          <><strong>Spaces at the start or end are ignored</strong>, so " apple" and "apple" count as the same value.</>,
          <><strong>Blank lines are removed</strong> as well.</>,
        ],
      },
      { type: "h2", text: "Tidy it up at the same time" },
      { type: "p", content: <>In More Filters you can also tick <strong>Sort A–Z</strong>, add quotes, or change the Delimiter to Comma to get one comma separated line instead of one value per line.</> },
    ],
    faqs: [
      { question: "How do I remove duplicate lines from a list?", answer: "Paste your list into the Input box, one value per line. Remove duplicate values is already ticked under More Filters, so each value appears only once in the Output box." },
      { question: "Does it keep the original order?", answer: "Yes. The first occurrence of each value is kept in its original position. Tick Sort A–Z if you also want the list sorted." },
      { question: "Is it case sensitive?", answer: "Yes. Apple and apple are treated as different values. Spaces at the start or end of a value are ignored." },
      { question: "Can I remove duplicates and sort at the same time?", answer: "Yes. Tick Sort A–Z or Sort Z–A under More Filters alongside Remove duplicate values." },
      { question: "How many lines can I paste?", answer: "Up to 75,000 characters at a time, which covers most everyday lists. For a bigger list, clean it in a few parts." },
      { question: "Is my data uploaded anywhere?", answer: "No. Everything happens in your browser, so nothing you paste is sent to a server." },
    ],
    related: ["sort-list-alphabetically", "newline-to-comma", "add-quotes-to-list", "excel-column-to-comma-separated-list"],
  },

  "newline-to-comma": {
    converter: {
      placeholder: "Paste your list here, one value per line…",
      sampleInput: "alice@example.com\nbob@example.com\ncarol@example.com",
    },
    blocks: [
      { type: "h2", text: "How to convert new lines to commas" },
      {
        type: "steps",
        items: [
          <><strong>Paste your text</strong> into the Input box, with one value per line. It can come from Notepad, an email, a document or terminal output.</>,
          <><strong>Read the result.</strong> The values appear in the Output box as one comma separated line.</>,
          <><strong>Copy it</strong> and paste it where you need it.</>,
        ],
      },
      { type: "p", content: "Windows, Mac and Linux line breaks are all handled, and blank lines and stray spaces are removed." },
      { type: "h2", text: "Examples" },
      {
        type: "example",
        input: "alice@example.com\nbob@example.com\ncarol@example.com",
        inputLabel: "Pasted list",
        results: [
          { label: "Comma", presetId: "comma" },
          { label: "Semicolon, which some email programs expect between addresses", presetId: "semicolon" },
          { label: "Space, handy for command line arguments", presetId: "space" },
        ],
      },
      { type: "h2", text: "Other separators" },
      { type: "p", content: <>Pick <strong>Semicolon, Pipe, Tab</strong> or <strong>Space</strong> from the Delimiter list, or choose <strong>Custom…</strong> to join with any character or text you like.</> },
      { type: "h2", text: "Common uses" },
      {
        type: "ul",
        items: [
          "Email addresses for a To or Bcc field.",
          "IDs or keywords for a URL, a search box or an API parameter.",
          "Tags or labels that need to go on one line.",
          <>Values for a database query. For that, the <Link to="/sql-in-clause-generator">SQL IN Clause Generator</Link> adds the quotes and brackets for you.</>,
        ],
      },
    ],
    faqs: [
      { question: "How do I convert new line separated text to comma separated?", answer: "Paste your text into the Input box, one value per line. The comma separated result appears in the Output box straight away. Click Copy to use it." },
      { question: "Can I use something other than a comma?", answer: "Yes. Choose Semicolon, Pipe, Tab or Space from the Delimiter list, or choose Custom… and type any character or text." },
      { question: "Does it handle Windows line breaks?", answer: "Yes. Windows (CRLF), Mac and Linux line breaks are all treated as the end of a line." },
      { question: "Does it remove blank lines and extra spaces?", answer: "Yes. Blank lines are removed and spaces around each value are trimmed by default." },
      { question: "Is my data uploaded anywhere?", answer: "No. Everything happens in your browser, so nothing you paste is sent to a server." },
    ],
    related: ["comma-separated-to-column", "excel-column-to-comma-separated-list", "sql-in-clause-generator", "add-quotes-to-list"],
  },

  "comma-separated-to-column": {
    converter: {
      placeholder: "Paste your comma separated list here…",
      sampleInput: "red, green, blue, yellow, purple",
      defaults: { mode: "delimitedToList" },
    },
    blocks: [
      { type: "h2", text: "How to split a comma separated list into rows" },
      {
        type: "steps",
        items: [
          <><strong>Paste your list</strong> into the Input box, for example red, green, blue.</>,
          <><strong>Read the result.</strong> Each value appears on its own line in the Output box.</>,
          <><strong>Copy it.</strong> Pasting into Excel or Google Sheets puts each value in its own cell, one under the other.</>,
        ],
      },
      { type: "p", content: "Spaces after the commas are trimmed, and empty values are removed." },
      { type: "h2", text: "Example" },
      {
        type: "example",
        input: "red, green, blue,, yellow",
        inputLabel: "Pasted list",
        results: [{ label: "One value per line", mode: "delimitedToList", presetId: "comma" }],
      },
      { type: "h2", text: "Other separators" },
      { type: "p", content: <>If your values are separated by something other than a comma, choose <strong>Semicolon, Pipe, Tab</strong> or <strong>Space</strong> from the Delimiter list, or <strong>Custom…</strong> for anything else.</> },
      { type: "h2", text: "Tidy the result" },
      { type: "p", content: <>Open <strong>More Filters</strong> to remove duplicates, sort the values, or add quotes, a prefix or a suffix to each one.</> },
      { type: "p", content: <>Going the other way? <Link to="/newline-to-comma">Convert New Line to Comma</Link> turns a column back into one comma separated line.</> },
    ],
    faqs: [
      { question: "How do I convert a comma separated list to a column?", answer: "Paste your list into the Input box. Each value appears on its own line in the Output box. Copy it and paste it into a spreadsheet to put each value in its own row." },
      { question: "How is this different from Text to Columns in Excel?", answer: "Text to Columns spreads values side by side across columns. This tool puts each value on its own line, so pasting it into a spreadsheet gives you rows, one under the other." },
      { question: "Can I split on semicolons or other separators?", answer: "Yes. Choose Semicolon, Pipe, Tab or Space from the Delimiter list, or choose Custom… and type your own." },
      { question: "What about commas inside quoted text?", answer: "This tool splits on every comma, including commas inside quotes. For CSV data with quoted fields, use the CSV to JSON converter instead." },
      { question: "Is my data uploaded anywhere?", answer: "No. Everything happens in your browser, so nothing you paste is sent to a server." },
    ],
    related: ["newline-to-comma", "excel-column-to-comma-separated-list", "remove-duplicates-from-list", "sort-list-alphabetically"],
  },

  "sort-list-alphabetically": {
    converter: {
      placeholder: "Paste your list here, one value per line…",
      sampleInput: "pear\nApple\nbanana\ncherry\nfig",
      defaults: { presetId: "newline", showAdvanced: true, options: { sortOrder: "asc" } },
    },
    blocks: [
      { type: "h2", text: "How to sort a list alphabetically" },
      {
        type: "steps",
        items: [
          <><strong>Paste your list</strong> into the Input box, one value per line.</>,
          <><strong>Pick the order.</strong> Sort A–Z is already ticked under More Filters. Tick Sort Z–A instead to reverse it.</>,
          <><strong>Copy the sorted list</strong> from the Output box.</>,
        ],
      },
      { type: "h2", text: "Example" },
      {
        type: "example",
        input: "pear\nApple\nbanana\ncherry\nfig",
        inputLabel: "Pasted list",
        results: [
          { label: "Sorted A–Z", presetId: "newline", options: { sortOrder: "asc" } },
          { label: "Sorted Z–A", presetId: "newline", options: { sortOrder: "desc" } },
        ],
      },
      { type: "h2", text: "How the sorting works" },
      {
        type: "ul",
        items: [
          <><strong>Upper and lower case are sorted together</strong>, so Apple comes before banana even though it starts with a capital letter.</>,
          <><strong>Numbers are sorted as text</strong>, so 10 comes before 2. Sorting by number value isn't supported yet.</>,
          <><strong>Blank lines are removed</strong> and spaces around each value are trimmed.</>,
        ],
      },
      { type: "h2", text: "Combine with other options" },
      { type: "p", content: <>Tick <strong>Remove duplicate values</strong> to sort and clean in one go, or change the Delimiter to Comma to get the sorted values on a single line.</> },
    ],
    faqs: [
      { question: "How do I sort a list alphabetically online?", answer: "Paste your list into the Input box, one value per line. Sort A–Z is already ticked under More Filters, so the sorted list appears in the Output box. Click Copy to use it." },
      { question: "How do I sort a list from Z to A?", answer: "Open More Filters and tick Sort Z–A. The list is reversed straight away." },
      { question: "Are uppercase and lowercase sorted together?", answer: "Yes. Case is ignored when sorting, so Apple and apple sit next to each other rather than all capitals coming first." },
      { question: "Does it sort numbers correctly?", answer: "Numbers are sorted as text, so 10 comes before 2. Sorting by number value isn't supported yet." },
      { question: "Can I sort and remove duplicates at the same time?", answer: "Yes. Tick Remove duplicate values under More Filters alongside Sort A–Z or Sort Z–A." },
      { question: "Is my data uploaded anywhere?", answer: "No. Everything happens in your browser, so nothing you paste is sent to a server." },
    ],
    related: ["remove-duplicates-from-list", "newline-to-comma", "excel-column-to-comma-separated-list", "add-quotes-to-list"],
  },
};
