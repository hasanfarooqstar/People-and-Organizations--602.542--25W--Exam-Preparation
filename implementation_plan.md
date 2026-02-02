# Implementation Plan - Dynamic Quiz Import

The goal is to allow the user to import new quiz JSON files directly in the browser, which will be saved and automatically result in new buttons being added to the lecture menu without manual code edits.

## User Review Required
> [!NOTE]
> This feature uses `localStorage` to save imported quizzes. If the user clears their browser cache, the custom quizzes will be lost. This is standard web behavior but worth noting.

## Proposed Changes

### Logic ([script.js](file:///g:/My%20Drive/Hassan%20Data/Klagenfurt%20docs/People%20and%20Org/People%20and%20Organizations%20%28602.542,%2025W%29%20Exam%20Preparation/script.js))

#### [MODIFY] Refactor [startQuiz](file:///g:/My%20Drive/Hassan%20Data/Klagenfurt%20docs/People%20and%20Org/People%20and%20Organizations%20%28602.542,%2025W%29%20Exam%20Preparation/script.js#14-52)
- Update [startQuiz(key, title)](file:///g:/My%20Drive/Hassan%20Data/Klagenfurt%20docs/People%20and%20Org/People%20and%20Organizations%20%28602.542,%2025W%29%20Exam%20Preparation/script.js#14-52) to accept an optional `title` argument.
- If `title` is provided, use it. If not, fall back to the existing hardcoded `titles` map (to preserve existing functionality).

#### [NEW] `importQuiz(inputElement)`
- Function to handle file selection.
- Reads the file using `FileReader`.
- Parses filename (e.g., [January-12-2026.json](file:///g:/My%20Drive/Hassan%20Data/Klagenfurt%20docs/People%20and%20Org/People%20and%20Organizations%20%28602.542,%2025W%29%20Exam%20Preparation/January-12-2026.json)) to generate:
  - **Key**: `jan-12` (or unique ID)
  - **Title**: `January 12, 2026`
- Validates that the JSON contains an array of questions.
- Saves the new quiz to `localStorage` under a `customQuizzes` key.
- Merges the new data into the global `quizData` object.
- Re-renders the button list.

#### [NEW] `loadCustomQuizzes()`
- Runs on page load.
- Reads `customQuizzes` from `localStorage`.
- Adds them to `quizData`.
- Dynamically creates and appends `<button>` elements to the `.primary-group` container in [index.html](file:///g:/My%20Drive/Hassan%20Data/Klagenfurt%20docs/People%20and%20Org/People%20and%20Organizations%20%28602.542,%2025W%29%20Exam%20Preparation/index.html).

### UI ([index.html](file:///g:/My%20Drive/Hassan%20Data/Klagenfurt%20docs/People%20and%20Org/People%20and%20Organizations%20%28602.542,%2025W%29%20Exam%20Preparation/index.html))

#### [MODIFY] Add Import Controls
- Add a hidden `<input type="file" accept=".json" multiple>` element.
- Add a styled "Import Quizzes" button that triggers the file input.
- Add a "Clear Custom Quizzes" button (optional, but good for UX).

### Styling ([style.css](file:///g:/My%20Drive/Hassan%20Data/Klagenfurt%20docs/People%20and%20Org/People%20and%20Organizations%20%28602.542,%2025W%29%20Exam%20Preparation/style.css))
- No major changes expected, reuse existing classes (`.menu-btn`, `.btn-master`) for dynamic buttons.

## Verification Plan

### Automated
- I cannot easily write a unit test for `FileReader` in this environment, so I will rely on manual verification via the browser.

### Manual Verification
1.  **Load Page**: Open [index.html](file:///g:/My%20Drive/Hassan%20Data/Klagenfurt%20docs/People%20and%20Org/People%20and%20Organizations%20%28602.542,%2025W%29%20Exam%20Preparation/index.html) in browser.
2.  **Import**: Click "Import JSON". Select one of the existing JSON files (e.g., [December-01-2025.json](file:///g:/My%20Drive/Hassan%20Data/Klagenfurt%20docs/People%20and%20Org/People%20and%20Organizations%20%28602.542,%2025W%29%20Exam%20Preparation/December-01-2025.json)) - *Note: To test meaningfully, I will first delete the manually added button for December 01 to prove the dynamic one works, or just import it again (it will overwrite or duplicate depending on key logic).*
3.  **Verify Button**: Check if a new button appears with the correct title.
4.  **Persistence**: Refresh the page. The button should still be there.
5.  **Functionality**: Click the new button. The quiz should start with the correct title and questions.
6.  **Clear**: Click "Clear Custom Quizzes". Refresh. The button should be gone.
