import { useCallback } from "react";

function usePostRedirect() {
  // true once the browser is navigating; false if the link couldn't be used
  const redirectInPost = useCallback((fullUrl: string): boolean => {
    try {
      const url = new URL(fullUrl);
      const baseUrl = `${url.origin}${url.pathname}`;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = baseUrl;
      form.target = "_self";

      url.searchParams.forEach((value, key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      return true;
    } catch (error) {
      console.error("Failed to redirect:", error);
      return false;
    }
  }, []);

  return redirectInPost;
}

export function usePayHereRedirect() {
  const postRedirect = usePostRedirect();

  const redirectToPayHereViaPost = useCallback(
    (fullUrl: string): boolean => postRedirect(fullUrl),
    [postRedirect]
  );

  return redirectToPayHereViaPost;
}
