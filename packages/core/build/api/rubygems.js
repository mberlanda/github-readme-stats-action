// @ts-check
import { renderRubyGems } from "../cards/rubygems.js";
import {
  MissingParamError,
  retrieveSecondaryMessage,
} from "../common/error.js";
import { renderError } from "../common/render.js";
import { fetchRubyGems } from "../fetchers/rubygems.js";

// @ts-ignore
export default async (
  {
    username,
    gems_count,
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
  },
  _pat = null,
) => {
  try {
    const data = await fetchRubyGems(username, parseInt(gems_count, 10) || 5);
    return {
      status: "success",
      content: renderRubyGems(data, {
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
