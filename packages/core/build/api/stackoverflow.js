// @ts-check
import { renderStackOverflow } from "../cards/stackoverflow.js";
import {
  MissingParamError,
  retrieveSecondaryMessage,
} from "../common/error.js";
import { renderError } from "../common/render.js";
import { fetchStackOverflow } from "../fetchers/stackoverflow.js";

// @ts-ignore
export default async (
  {
    user_id,
    site,
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
    const data = await fetchStackOverflow(user_id, site || "stackoverflow");
    return {
      status: "success",
      content: renderStackOverflow(data, {
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
