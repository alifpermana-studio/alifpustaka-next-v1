export const EDITOR_CONSTANTS = {
  STORAGE_KEY: "apus-post",
  AUTOSAVE_DELAY: 30000,
  HISTORY_DEBOUNCE: 500,
  MAX_IMAGE_SIZE: 2000000,
  ALERT_TIMEOUT: 5000,
  MAX_TITLE_LENGTH: 200,
  MAX_DESC_LENGTH: 500,
  MAX_TAGS: 10,
} as const;

export const SPECIAL_CHAR_REGEX =
  /[/+\=\@\$\|\^\~\[\]\{\}\`\#\%\*\_\<\>\,\.\"\'\(\)\?\!\:\;\/]/g;

export const EDITOR_ACTIONS = {
  DRAFTED: "drafted",
  SUBMITTED: "submitted",
  PUBLISHED: "published",
  DELETED: "deleted",
} as const;

export type EditorActionType =
  (typeof EDITOR_ACTIONS)[keyof typeof EDITOR_ACTIONS];
