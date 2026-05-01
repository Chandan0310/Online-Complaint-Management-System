/**
 * @file validationPatterns.js
 * @description Centralised regular-expression patterns and error messages used
 *              for client-side form validation across the OCMS application.
 *              Every form field that accepts user input should reference one of
 *              these constants so that validation rules stay consistent.
 */

/* ------------------------------------------------------------------ */
/*  College ID  –  e.g. "23mcce11", "24bcs001"                        */
/*  Format: 2-digit year + 3-5 letter dept code + 2-3 digit roll no.  */
/* ------------------------------------------------------------------ */
export const COLLEGE_ID_REGEX = /^\d{2}[a-zA-Z]{3,5}\d{2,3}$/;
export const COLLEGE_ID_PATTERN = "\\d{2}[a-zA-Z]{3,5}\\d{2,3}";
export const COLLEGE_ID_MSG =
  "Enter a valid College ID (e.g. 23mcce11 — 2-digit year, 3-5 letter dept code, 2-3 digit roll no.)";

/* ------------------------------------------------------------------ */
/*  Full Name  –  alphabetic with spaces, apostrophes, periods         */
/*  Length: 2–50 characters                                            */
/* ------------------------------------------------------------------ */
export const NAME_REGEX = /^[A-Za-z][A-Za-z\s'.]{1,49}$/;
export const NAME_PATTERN = "[A-Za-z][A-Za-z\\s'.]{1,49}";
export const NAME_MSG =
  "Name must be 2-50 characters and contain only letters, spaces, apostrophes, or periods.";

/* ------------------------------------------------------------------ */
/*  University Email  –  must end with @uohyd.ac.in                    */
/* ------------------------------------------------------------------ */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@uohyd\.ac\.in$/;
export const EMAIL_PATTERN = "[a-zA-Z0-9._%+\\-]+@uohyd\\.ac\\.in";
export const EMAIL_MSG =
  "Enter a valid University of Hyderabad email (e.g. name@uohyd.ac.in).";

/* ------------------------------------------------------------------ */
/*  Phone Number  –  10-digit Indian mobile starting with 6-9          */
/* ------------------------------------------------------------------ */
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const PHONE_PATTERN = "[6-9]\\d{9}";
export const PHONE_MSG =
  "Enter a valid 10-digit Indian mobile number starting with 6-9.";

/* ------------------------------------------------------------------ */
/*  Password  –  min 8 chars, 1 uppercase, 1 lowercase, 1 digit,      */
/*               1 special character                                   */
/* ------------------------------------------------------------------ */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
export const PASSWORD_PATTERN =
  "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}";
export const PASSWORD_MSG =
  "Min 8 characters with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character (@$!%*?&#).";

/* ------------------------------------------------------------------ */
/*  Building / Location Name  –  letters, digits, spaces, hyphens,     */
/*  parentheses, periods.  Length: 3–100 characters                    */
/* ------------------------------------------------------------------ */
export const BUILDING_NAME_REGEX = /^[A-Za-z][A-Za-z0-9\s\-().]{2,99}$/;
export const BUILDING_NAME_PATTERN = "[A-Za-z][A-Za-z0-9\\s\\-().]{2,99}";
export const BUILDING_NAME_MSG =
  "Building name must be 3-100 characters, starting with a letter.";

/* ------------------------------------------------------------------ */
/*  Complaint Title  –  5–100 characters (any printable content)       */
/* ------------------------------------------------------------------ */
export const COMPLAINT_TITLE_REGEX = /^.{5,100}$/;
export const COMPLAINT_TITLE_PATTERN = ".{5,100}";
export const COMPLAINT_TITLE_MSG =
  "Title must be between 5 and 100 characters.";

/* ------------------------------------------------------------------ */
/*  Complaint Description  –  minimum 20 characters                    */
/* ------------------------------------------------------------------ */
export const DESCRIPTION_MIN_LENGTH = 20;
export const DESCRIPTION_MSG =
  "Description must be at least 20 characters long.";
