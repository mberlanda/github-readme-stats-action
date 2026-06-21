// @ts-check
import { renderLangHistory } from "../cards/lang-history.js";
import {
  MissingParamError,
  retrieveSecondaryMessage,
} from "../common/error.js";
import { parseArray, parseBoolean } from "../common/ops.js";
import { renderError } from "../common/render.js";
import { fetchLangHistory } from "../fetchers/lang-history.js";

// @ts-ignore
export default async (
  {
    username,
    hide,
    hide_title,
    hide_border,
    title_color,
    text_color,
    bg_color,
    theme,
    langs_count,
    exclude_repo,
    role,
    include_forks,
    custom_title,
    border_radius,
    border_color,
    disable_animations,
  },
  pat = null,
) => {
  try {
    const repoNodes = await fetchLangHistory(
      username,
      parseArray(exclude_repo),
      parseArray(role),
      pat,
      parseBoolean(include_forks),
    );

    return {
      status: "success",
      content: renderLangHistory(repoNodes, {
        custom_title,
        hide_title: parseBoolean(hide_title),
        hide_border: parseBoolean(hide_border),
        title_color,
        text_color,
        bg_color,
        border_color,
        theme,
        langs_count,
        hide: parseArray(hide),
        border_radius,
        disable_animations: parseBoolean(disable_animations),
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
