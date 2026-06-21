/**
 * I18n translation class.
 */
export class I18n {
  /**
   * Constructor.
   *
   * @param {Object} options Options.
   * @param {string=} options.locale Locale.
   * @param {any} options.translations Translations.
   */
  constructor({
    locale,
    translations,
  }: {
    locale?: string | undefined;
    translations: any;
  });
  locale: string;
  translations: any;
  /**
   * Get translation.
   *
   * @param {string} str String to translate.
   * @returns {string} Translated string.
   */
  t(str: string): string;
}
//# sourceMappingURL=I18n.d.ts.map
