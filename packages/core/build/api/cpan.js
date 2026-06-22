// @ts-check
import { renderCPAN } from "../cards/cpan.js";
import {
  MissingParamError,
  retrieveSecondaryMessage,
} from "../common/error.js";
import { renderError } from "../common/render.js";
import { fetchCPAN } from "../fetchers/cpan.js";

// @ts-ignore
export default async (
  {
    username,
    distributions_count,
    custom_title,
    hide_title,
    hide_border,
    title_color,
    text_color,
    bg_color,
    border_color,
    theme,
    border_radius,
    disable_animations,
    card_width,
  },
  _pat = null,
) => {
  try {
    const data = await fetchCPAN(
      username,
      parseInt(distributions_count, 10) || 5,
    );
    return {
      status: "success",
      content: renderCPAN(data, {
        custom_title,
        hide_title: hide_title === "true",
        hide_border: hide_border === "true",
        title_color,
        text_color,
        bg_color,
        border_color,
        theme,
        border_radius,
        disable_animations: disable_animations === "true",
        card_width,
      }),
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        status: "error - temporary",
        content: renderError({
          message: err.message,
          secondaryMessage: retrieveSecondaryMessage(err),
          renderOptions: {
            title_color,
            text_color,
            bg_color,
            border_color,
            theme,
            show_repo_link: !(err instanceof MissingParamError),
          },
        }),
      };
    }
    return {
      status: "error - temporary",
      content: renderError({
        message: "An unknown error occurred",
        renderOptions: {
          title_color,
          text_color,
          bg_color,
          border_color,
          theme,
        },
      }),
    };
  }
};
