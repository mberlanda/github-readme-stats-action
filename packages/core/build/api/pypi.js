// @ts-check
import { renderPyPI } from "../cards/pypi.js";
import {
  MissingParamError,
  retrieveSecondaryMessage,
} from "../common/error.js";
import { renderError } from "../common/render.js";
import { fetchPyPI } from "../fetchers/pypi.js";

// @ts-ignore
export default async (
  {
    username,
    packages_count,
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
    const data = await fetchPyPI(username, parseInt(packages_count, 10) || 5);
    return {
      status: "success",
      content: renderPyPI(data, {
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
