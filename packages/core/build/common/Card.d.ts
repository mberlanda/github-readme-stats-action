export default Card;
export class Card {
  /**
   * Creates a new card instance.
   *
   * @param {object} args Card arguments.
   * @param {number=} args.width Card width.
   * @param {number=} args.height Card height.
   * @param {number=} args.border_radius Card border radius.
   * @param {string=} args.customTitle Card custom title.
   * @param {string=} args.defaultTitle Card default title.
   * @param {string=} args.titlePrefixIcon Card title prefix icon.
   * @param {object} [args.colors={}] Card colors arguments.
   * @param {string=} args.colors.titleColor Card title color.
   * @param {string=} args.colors.textColor Card text color.
   * @param {string=} args.colors.iconColor Card icon color.
   * @param {string|string[]=} args.colors.bgColor Card background color.
   * @param {string=} args.colors.borderColor Card border color.
   */
  constructor({
    width,
    height,
    border_radius,
    colors,
    customTitle,
    defaultTitle,
    titlePrefixIcon,
  }: {
    width?: number | undefined;
    height?: number | undefined;
    border_radius?: number | undefined;
    customTitle?: string | undefined;
    defaultTitle?: string | undefined;
    titlePrefixIcon?: string | undefined;
    colors?:
      | {
          titleColor?: string | undefined;
          textColor?: string | undefined;
          iconColor?: string | undefined;
          bgColor?: (string | string[]) | undefined;
          borderColor?: string | undefined;
        }
      | undefined;
  });
  width: number;
  height: number;
  hideBorder: boolean;
  hideTitle: boolean;
  border_radius: number;
  colors: {
    titleColor?: string | undefined;
    textColor?: string | undefined;
    iconColor?: string | undefined;
    bgColor?: (string | string[]) | undefined;
    borderColor?: string | undefined;
  };
  title: string;
  css: string;
  paddingX: number;
  paddingY: number;
  titlePrefixIcon: string | undefined;
  animations: boolean;
  a11yTitle: string;
  a11yDesc: string;
  /**
   * @returns {void}
   */
  disableAnimations(): void;
  /**
   * @param {Object} props The props object.
   * @param {string} props.title Accessibility title.
   * @param {string} props.desc Accessibility description.
   * @returns {void}
   */
  setAccessibilityLabel({ title, desc }: { title: string; desc: string }): void;
  /**
   * @param {string} value The CSS to add to the card.
   * @returns {void}
   */
  setCSS(value: string): void;
  /**
   * @param {boolean} value Whether to hide the border or not.
   * @returns {void}
   */
  setHideBorder(value: boolean): void;
  /**
   * @param {boolean} value Whether to hide the title or not.
   * @returns {void}
   */
  setHideTitle(value: boolean): void;
  /**
   * @param {string} text The title to set.
   * @returns {void}
   */
  setTitle(text: string): void;
  /**
   * @returns {string} The rendered card title.
   */
  renderTitle(): string;
  /**
   * @returns {string} The rendered card gradient.
   */
  renderGradient(): string;
  /**
   * Retrieves css animations for a card.
   *
   * @returns {string} Animation css.
   */
  getAnimations: () => string;
  /**
   * @param {string} body The inner body of the card.
   * @returns {string} The rendered card.
   */
  render(body: string): string;
}
//# sourceMappingURL=Card.d.ts.map
