export type PlatformKind = "telegram" | "web";

export interface TelegramUser {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

/** What Telegram hands the Mini App on launch. Only set on the Telegram platform. */
export interface TelegramLaunch {
  initDataRaw?: string;
  /** Parsed initData (user, auth date, hash, ...). */
  initData?: { user?: TelegramUser };
  user?: TelegramUser;
  /** Telegram client: "ios" | "android" | "tdesktop" | "macos" | "weba" | ... */
  clientPlatform?: string;
  /** Full launch params as returned by the SDK — forwarded as-is to /api/user. */
  raw: unknown;
}

export type ColorScheme = "light" | "dark";

export interface StoryParams {
  text: string;
  widget_link: { url: string; name: string };
}

export interface ShareInput {
  url: string;
  text?: string;
}

/** "copied" = no share sheet available, the link was copied instead. */
export type ShareResult = "shared" | "copied" | "dismissed";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText: string;
  destructive?: boolean;
}

/**
 * Everything that differs between running inside Telegram and running in a
 * plain browser / installed PWA. Components use this instead of touching the
 * Telegram SDK or window.Telegram directly.
 */
export interface Platform {
  /** null while detection is still running. */
  kind: PlatformKind | null;
  launch: TelegramLaunch | null;
  /** A phone — the native Telegram iOS/Android app, or a mobile browser. */
  isMobileDevice: boolean;
  capabilities: {
    /** Telegram story sharing. */
    stories: boolean;
  };
  openLink(url: string): void;
  /** t.me links — stays inside the Telegram client when possible. */
  openTelegramLink(url: string): void;
  shareStory(mediaUrl: string, params: StoryParams): void;
  /** Share a link: Telegram's share sheet, the native share sheet, or copy. */
  share(input: ShareInput): Promise<ShareResult>;
  confirm(options: ConfirmOptions): Promise<boolean>;
  /**
   * Host light/dark mode (Telegram only — colors always come from our own
   * palette). null on web, where the OS preference applies.
   */
  getColorScheme(): ColorScheme | null;
  /** Calls back on host light/dark changes. Returns an unsubscribe fn, or null when unsupported. */
  onColorSchemeChange(onChange: (scheme: ColorScheme) => void): (() => void) | null;
}
